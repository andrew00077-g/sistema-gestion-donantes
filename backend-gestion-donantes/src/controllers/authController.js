const db = require('../config/db'); // Ajusta si tu archivo de conexión a MySQL se llama diferente
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. INICIALIZAR EL PRIMER ADMIN (Para no usar la BD a mano)
exports.crearPrimerAdmin = async (req, res) => {
    try {
        // Verificar si ya existe algún usuario en la base de datos
        const [usuarios] = await db.query('SELECT * FROM usuarios LIMIT 1');
        
        if (usuarios.length > 0) {
            return res.status(400).json({ msg: 'El sistema ya fue inicializado anteriormente.' });
        }

        // Crear contraseña encriptada segura para el primer admin
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt); // Contraseña inicial por defecto

        await db.query(
            "INSERT INTO usuarios (email, password_hash, rol, estado) VALUES ('admin@banco.com', ?, 'ADMIN', 'ACTIVO')",
            [passwordHash]
        );

        res.status(201).json({ 
            msg: '¡Admin inicial creado con éxito!', 
            credenciales: 'Email: admin@banco.com | Password: admin123. ¡Inicia sesión con estos datos y cámbialos luego!' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al inicializar el administrador.' });
    }
};

// 2. LOGIN DE USUARIOS
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

        res.json({
            token,
            usuario: { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el inicio de sesión.' });
    }
};

// 3. REGISTRAR NUEVO USUARIO (Protegido: Solo lo usa el Admin)
exports.registrarUsuario = async (req, res) => {
    const { email, password, rol } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios.' });
    }

    try {
        const [existe] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ msg: 'Este correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoRol = rol || 'DONANTE';

        await db.query(
            'INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
            [email, passwordHash, nuevoRol]
        );

        res.status(201).json({ msg: `Usuario con rol ${nuevoRol} creado exitosamente.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar al usuario.' });
    }
};