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

// ==========================================
// 1. INICIALIZAR PRIMER ADMINISTRADOR
// ==========================================
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

        // Apunta a la tabla 'personal' con la estructura nueva
        await connection.query(
            `INSERT INTO personal (id_usuario, ci, nombres, apellidos, cargo, codigo_medico, telefono) 
             VALUES (?, '0000000', 'Andrew', 'Administrador', 'Director General', 'DIR-001', '70000000')`,
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

// ==========================================
// 2. LOGUEAR USUARIO (LOGIN)
// ==========================================
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

        // BUSCAR NOMBRE DINÁMICO Y DATOS EXTRAS SEGÚN EL ROL
        let nombreMostrar = "Usuario";
        let ciUser = "";
        let telUser = "";

        // Sincronizado: ADMIN y MEDICO buscan la información en la tabla 'personal'
        if (usuario.rol === 'ADMIN' || usuario.rol === 'MEDICO') {
            const [personalData] = await db.query('SELECT nombres, ci, telefono FROM personal WHERE id_usuario = ?', [usuario.id_usuario]);
            if (personalData.length > 0) {
                nombreMostrar = personalData[0].nombres;
                ciUser = personalData[0].ci;
                telUser = personalData[0].telefono;
            }
        } else if (usuario.rol === 'DONANTE') {
            const [donanteData] = await db.query('SELECT nombres, ci, telefono FROM donantes WHERE id_usuario = ?', [usuario.id_usuario]);
            if (donanteData.length > 0) {
                nombreMostrar = donanteData[0].nombres;
                ciUser = donanteData[0].ci;
                telUser = donanteData[0].telefono;
            }
        }

        // Enviar respuesta estructurada al Frontend con los datos completos
        res.json({
            token,
            usuario: {
                id: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol,
                nombre: nombreMostrar,
                ci: ciUser,
                telefono: telUser
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el inicio de sesión.' });
    }
};

// ==========================================
// 3. REGISTRAR USUARIO (CRUD PERSONAL)
// ==========================================
exports.registrarUsuario = async (req, res) => {
    const { email, password, rol, ci, nombres, apellidos, cargo, codigo_medico, telefono } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar duplicados de correo electrónico
        const [existeEmail] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            connection.release();
            return res.status(400).json({ msg: 'Este correo ya está registrado.' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoRol = rol || 'MEDICO';

        // Sincronizado: Validar duplicados de CI en la tabla 'personal' antes de proceder
        if (nuevoRol === 'ADMIN' || nuevoRol === 'MEDICO') {
            if (!ci) {
                connection.release();
                return res.status(400).json({ msg: 'La Cédula de Identidad (CI) es obligatoria para el personal interno.' });
            }
            const [existeCI] = await connection.query('SELECT * FROM personal WHERE ci = ?', [ci]);
            if (existeCI.length > 0) {
                connection.release();
                return res.status(400).json({ msg: 'Esta Cédula de Identidad (CI) ya está asignada a otro empleado.' });
            }
        }

        // Insertar en la tabla de accesos de usuario
        const [resultadoUsuario] = await connection.query(
            'INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
            [email, passwordHash, nuevoRol]
        );

        const idUsuarioGenerado = resultadoUsuario.insertId;

        // Tanto ADMIN como MEDICO guardan su perfil unificado en la tabla 'personal'
        if (nuevoRol === 'ADMIN' || nuevoRol === 'MEDICO') {
            await connection.query(
                `INSERT INTO personal (id_usuario, ci, nombres, apellidos, cargo, codigo_medico, telefono) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    idUsuarioGenerado, 
                    ci, 
                    nombres || 'Personal', 
                    apellidos || 'Salud', 
                    cargo || null, 
                    codigo_medico || null, 
                    telefono || null
                ]
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

// ==========================================
// 4. RECUPERAR CONTRASEÑA
// ==========================================
exports.recuperarContrasena = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'El correo electrónico es requerido.' });
    }

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(404).json({ msg: 'No existe ningún usuario registrado con este correo.' });
        }

        const usuario = usuarios[0];

        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
        let contrasenaTemporal = '';
        for (let i = 0; i < 8; i++) {
            contrasenaTemporal += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        const salt = await bcrypt.genSalt(10);
        const nuevaClaveEncriptada = await bcrypt.hash(contrasenaTemporal, salt);

        await db.query(
            'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', 
            [nuevaClaveEncriptada, usuario.id_usuario]
        );

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

        await transporador.sendMail(opcionesCorreo);
        res.json({ msg: 'Se ha enviado una contraseña temporal a tu correo electrónico con éxito.' });

    } catch (error) {
        console.error("Error en recuperación de clave:", error);
        res.status(500).json({ msg: 'Error de servidor al procesar la solicitud de recuperación.' });
    }
};

// ==========================================
// 🌟 NUEVO ENPOINT: ACTUALIZAR PERFIL (SELF-SERVICE)
// ==========================================
exports.actualizarPerfil = async (req, res) => {
    const { email, passwordActual, nuevaPassword } = req.body;
    
    // El id del usuario logueado proviene de tu middleware de autenticación (JWT)
    const idUsuario = req.usuario?.id; 

    if (!idUsuario) {
        return res.status(401).json({ msg: 'No autorizado, token no válido o ausente.' });
    }

    if (!email) {
        return res.status(400).json({ msg: 'El correo electrónico es un campo requerido.' });
    }

    try {
        // 1. Traer los datos vigentes del usuario actual
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [idUsuario]);
        if (usuarios.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const usuario = usuarios[0];

        // 2. Validar que el nuevo correo no esté tomado por OTRA persona
        if (email !== usuario.email) {
            const [correoDuplicado] = await db.query('SELECT * FROM usuarios WHERE email = ? AND id_usuario != ?', [email, idUsuario]);
            if (correoDuplicado.length > 0) {
                return res.status(400).json({ msg: 'El correo electrónico ingresado ya está en uso por otra cuenta.' });
            }
        }

        // 3. Evaluar si se está pidiendo un cambio de contraseña
        let queryPasswordUpdate = '';
        let queryParams = [email];

        if (passwordActual || nuevaPassword) {
            if (!passwordActual || !nuevaPassword) {
                return res.status(400).json({ msg: 'Para cambiar tu contraseña debes ingresar la clave actual y la nueva.' });
            }

            if (nuevaPassword.length < 6) {
                return res.status(400).json({ msg: 'La nueva contraseña debe tener un mínimo de 6 caracteres.' });
            }

            // Validar si la contraseña actual digitada coincide con la de la Base de Datos
            const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
            if (!isMatch) {
                return res.status(400).json({ msg: 'La contraseña actual ingresada es incorrecta.' });
            }

            // Encriptar la nueva clave de seguridad
            const salt = await bcrypt.genSalt(10);
            const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, salt);
            
            queryPasswordUpdate = ', password_hash = ?';
            queryParams.push(nuevaPasswordHash);
        }

        // Append del parámetro final ID del usuario
        queryParams.push(idUsuario);

        // 4. Ejecutar la actualización en la base de datos
        await db.query(
            `UPDATE usuarios SET email = ? ${queryPasswordUpdate} WHERE id_usuario = ?`,
            queryParams
        );

        res.json({ msg: 'Tu perfil ha sido actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar el perfil del usuario:', error);
        res.status(500).json({ msg: 'Error interno en el servidor al intentar guardar tus ajustes.' });
    }
};