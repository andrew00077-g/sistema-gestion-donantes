const db = require('../config/db'); // Conexión a tu MySQL Pool
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.crearPrimerAdmin = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si ya existe algún usuario
        const [usuarios] = await connection.query('SELECT * FROM usuarios LIMIT 1');
        if (usuarios.length > 0) {
            connection.release();
            return res.status(400).json({ msg: 'El sistema ya fue inicializado anteriormente.' });
        }

        // Crear contraseña encriptada segura para el primer admin
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        // Insertar en la tabla principal de usuarios
        const [resultadoUsuario] = await connection.query(
            "INSERT INTO usuarios (email, password_hash, rol, estado) VALUES ('admin@banco.com', ?, 'ADMIN', 'ACTIVO')",
            [passwordHash]
        );

        const idUsuarioGenerado = resultadoUsuario.insertId;

        // Insertar perfil por defecto en la tabla de administradores
        await connection.query(
            "INSERT INTO administradores (id_usuario, nombres, apellidos, cargo) VALUES (?, 'Andrew', 'Administrador', 'Director General')",
            [idUsuarioGenerado]
        );

        await connection.commit();
        res.status(201).json({ 
            msg: '¡Admin inicial creado con éxito!', 
            credenciales: 'Email: admin@banco.com | Password: admin123. ¡Inicia sesión con estos datos y cámbialos luego!' 
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ msg: 'Error al inicializar el administrador.' });
    } finally {
        connection.release();
    }
};

// =========================================================================
// 2. LOGIN DE USUARIOS (Con búsqueda dinámica de nombre integrada)
// =========================================================================
exports.loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, llena todos los campos.' });
    }

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(400).json({ msg: 'El usuario no existe.' });
        }

        const usuario = usuarios[0];

        if (usuario.estado === 'INACTIVO') {
            return res.status(403).json({ msg: 'Este usuario está inactivo.' });
        }

        // Validar contraseña encriptada
        const isMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta.' });
        }

        // Crear Token (JWT)
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol },
            process.env.JWT_SECRET || 'clave_secreta_temporal',
            { expiresIn: '8h' }
        );

        // BUSCAR NOMBRE DINÁMICO SEGÚN EL ROL
        let nombreMostrar = "Usuario";

        if (usuario.rol === 'ADMIN') {
            const [adminData] = await db.query('SELECT nombres FROM administradores WHERE id_usuario = ?', [usuario.id_usuario]);
            if (adminData.length > 0) {
                nombreMostrar = adminData[0].nombres;
            }
        } else if (usuario.rol === 'DONANTE') {
            const [donanteData] = await db.query('SELECT nombres FROM donantes WHERE id_usuario = ?', [usuario.id_usuario]);
            if (donanteData.length > 0) {
                nombreMostrar = donanteData[0].nombres;
            }
        }

        // Enviar respuesta estructurada al Frontend
        res.json({
            token,
            usuario: {
                id: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol,
                nombre: nombreMostrar 
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el inicio de sesión.' });
    }
};

exports.registrarUsuario = async (req, res) => {
    const { email, password, rol, nombres, apellidos, cargo, codigo_medico } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar duplicados
        const [existe] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            connection.release();
            return res.status(400).json({ msg: 'Este correo ya está registrado.' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoRol = rol || 'MEDICO';

        // Insertar en la tabla de accesos de usuario
        const [resultadoUsuario] = await connection.query(
            'INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
            [email, passwordHash, nuevoRol]
        );

        const idUsuarioGenerado = resultadoUsuario.insertId;

        // Si el rol que se está creando es ADMIN, guardamos sus datos en la tabla correspondiente
        if (nuevoRol === 'ADMIN') {
            await connection.query(
                `INSERT INTO administradores (id_usuario, nombres, apellidos, cargo, codigo_medico) 
                 VALUES (?, ?, ?, ?, ?)`,
                [idUsuarioGenerado, nombres || 'Admin', apellidos || 'Sistema', cargo || null, codigo_medico || null]
            );
        }

        await connection.commit();
        res.status(201).json({ msg: `Usuario con rol [${nuevoRol}] registrado exitosamente.` });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar al usuario.' });
    } finally {
        connection.release();
    }
};