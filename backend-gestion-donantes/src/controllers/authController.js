const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
// Configuración del transporte de correo electrónico 
const transporador = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


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

exports.recuperarContrasena = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'El correo electrónico es requerido.' });
    }

    try {
        // 1. Verificar si el usuario existe en el sistema
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(404).json({ msg: 'No existe ningún usuario registrado con este correo.' });
        }

        const usuario = usuarios[0];

        // 2. Generar una contraseña temporal aleatoria de 8 caracteres
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
        let contrasenaTemporal = '';
        for (let i = 0; i < 8; i++) {
            contrasenaTemporal += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        // 3. Encriptar la contraseña temporal usando bcrypt
        const salt = await bcrypt.genSalt(10);
        const nuevaClaveEncriptada = await bcrypt.hash(contrasenaTemporal, salt);

        // 4. Actualizar la clave usando la columna real 'password_hash' e 'id_usuario'
        await db.query(
            'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', 
            [nuevaClaveEncriptada, usuario.id_usuario]
        );

        // 5. Configurar el cuerpo del correo con diseño profesional
        const opcionesCorreo = {
            from: `"Banco de Sangre" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: ' Restablecimiento de Credenciales - Banco de Sangre',
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #dc2626; text-align: center; font-weight: 900;">Banco de Sangre Referencia</h2>
                    <p style="color: #475569; font-size: 14px;">Hola, se ha solicitado un restablecimiento de contraseña para tu perfil en el sistema.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #cbd5e1;">
                        <span style="font-size: 12px; font-weight: bold; color: #64748b; display: block; margin-bottom: 5px;">TU CONTRASEÑA TEMPORAL</span>
                        <code style="font-size: 20px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">${contrasenaTemporal}</code>
                    </div>
                    <p style="color: #e11d48; font-size: 11px; font-weight: bold; text-align: center;">Por seguridad, inicia sesión con esta clave y cámbiala lo antes posible en los ajustes de tu cuenta.</p>
                </div>
            `
        };

        // 6. Enviar el correo electrónico de forma asíncrona
        await transporador.sendMail(opcionesCorreo);

        res.json({ msg: 'Se ha enviado una contraseña temporal a tu correo electrónico con éxito.' });

    } catch (error) {
        console.error("Error en recuperación de clave:", error);
        res.status(500).json({ msg: 'Error de servidor al procesar la solicitud de recuperación.' });
    }
};