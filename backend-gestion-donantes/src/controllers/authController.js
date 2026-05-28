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
            await connection.rollback();
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
            credenciales: 'Email: admin@banco.com | Password: admin123.' 
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error en crearPrimerAdmin:", error);
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

        let nombreMostrar = "Usuario";
        let ciUser = "";
        let telUser = "";

        if (usuario.rol === 'ADMIN' || usuario.rol === 'MEDICO') {
            const [personalData] = await db.query('SELECT nombres, apellidos, ci, telefono FROM personal WHERE id_usuario = ?', [usuario.id_usuario]);
            if (personalData.length > 0) {
                nombreMostrar = `${personalData[0].nombres} ${personalData[0].apellidos}`.trim();
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
        console.error("Error en loginUsuario:", error);
        res.status(500).json({ msg: 'Error en el inicio de sesión.' });
    }
};

// ==========================================
// 3. REGISTRAR USUARIO (CRUD PERSONAL)
// ==========================================
exports.registrarUsuario = async (req, res) => {
    const { email, password, rol, ci, nombres, apellidos, cargo, codigo_medico, telefono } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios (Email y Contraseña).' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar duplicados de correo electrónico
        const [existeEmail] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            await connection.rollback(); // 👈 Corregido: Rollback antes de salir
            return res.status(400).json({ msg: 'Este correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoRol = rol || 'MEDICO';

        if (nuevoRol === 'ADMIN' || nuevoRol === 'MEDICO') {
            if (!ci) {
                await connection.rollback();
                return res.status(400).json({ msg: 'La Cédula de Identidad (CI) es obligatoria para el personal interno.' });
            }
            const [existeCI] = await connection.query('SELECT * FROM personal WHERE ci = ?', [ci]);
            if (existeCI.length > 0) {
                await connection.rollback(); // 👈 Corregido
                return res.status(400).json({ msg: 'Esta Cédula de Identidad (CI) ya está asignada a otro empleado.' });
            }
        }

        // Insertar en la tabla de accesos de usuario
        const [resultadoUsuario] = await connection.query(
            'INSERT INTO usuarios (email, password_hash, rol, estado) VALUES (?, ?, ?, "ACTIVO")',
            [email, passwordHash, nuevoRol]
        );

        const idUsuarioGenerado = resultadoUsuario.insertId;

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
        console.error("Error crítico en registrarUsuario:", error);
        res.status(500).json({ msg: 'Error interno al registrar al usuario en la base de datos.' });
    } finally {
        connection.release(); // 👈 Ahora se libera de forma segura al final del ciclo
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
            html: `<h2>Banco de Sangre</h2><p>Tu contraseña temporal es: <b>${contrasenaTemporal}</b></p>`
        };

        await transporador.sendMail(opcionesCorreo);
        res.json({ msg: 'Se ha enviado una contraseña temporal a tu correo electrónico con éxito.' });

    } catch (error) {
        console.error("Error en recuperación de clave:", error);
        res.status(500).json({ msg: 'Error de servidor al procesar la solicitud de recuperación.' });
    }
};

// ==========================================
// 5. ACTUALIZAR PERFIL 
// ==========================================
exports.actualizarPerfil = async (req, res) => {
    const { email, nombres, apellidos, ci, telefono, passwordActual, nuevaPassword } = req.body;
    const idUsuario = req.usuario?.id; 

    if (!idUsuario) {
        return res.status(401).json({ msg: 'No autorizado, token no válido o ausente.' });
    }

    if (!email || !nombres || !apellidos || !ci) {
        return res.status(400).json({ msg: 'Los campos Email, Nombres, Apellidos y CI son obligatorios.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [usuarios] = await connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [idUsuario]);
        if (usuarios.length === 0) {
            await connection.rollback();
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        const usuario = usuarios[0];

        if (email !== usuario.email) {
            const [correoDuplicado] = await connection.query('SELECT * FROM usuarios WHERE email = ? AND id_usuario != ?', [email, idUsuario]);
            if (correoDuplicado.length > 0) {
                await connection.rollback();
                return res.status(400).json({ msg: 'El correo electrónico ya está tomado por otra cuenta.' });
            }
        }

        if (usuario.rol === 'ADMIN' || usuario.rol === 'MEDICO') {
            const [ciDuplicado] = await connection.query('SELECT * FROM personal WHERE ci = ? AND id_usuario != ?', [ci, idUsuario]);
            if (ciDuplicado.length > 0) {
                await connection.rollback();
                return res.status(400).json({ msg: 'La Cédula de Identidad ingresada ya pertenece a otro personal.' });
            }
        }

        let queryPasswordUpdate = '';
        let queryParamsUsuario = [email];

        if (passwordActual || nuevaPassword) {
            if (!passwordActual || !nuevaPassword) {
                await connection.rollback();
                return res.status(400).json({ msg: 'Para modificar tu contraseña debes proveer la clave actual y la nueva.' });
            }
            if (nuevaPassword.length < 6) {
                await connection.rollback();
                return res.status(400).json({ msg: 'La nueva contraseña debe poseer al menos 6 caracteres.' });
            }

            const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
            if (!isMatch) {
                await connection.rollback();
                return res.status(400).json({ msg: 'La contraseña actual ingresada es incorrecta.' });
            }

            const salt = await bcrypt.genSalt(10);
            const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, salt);
            
            queryPasswordUpdate = ', password_hash = ?';
            queryParamsUsuario.push(nuevaPasswordHash);
        }

        queryParamsUsuario.push(idUsuario);
        await connection.query(
            `UPDATE usuarios SET email = ? ${queryPasswordUpdate} WHERE id_usuario = ?`,
            queryParamsUsuario
        );

        if (usuario.rol === 'ADMIN' || usuario.rol === 'MEDICO') {
            await connection.query(
                `UPDATE personal SET nombres = ?, apellidos = ?, ci = ?, telefono = ? WHERE id_usuario = ?`,
                [nombres, apellidos, ci, telefono || null, idUsuario]
            );
        }

        await connection.commit();
        res.json({ msg: 'Tu perfil e identidad han sido actualizados con éxito.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ msg: 'Error interno de servidor al guardar los cambios del perfil.' });
    } finally {
        connection.release();
    }
};

// ==========================================
// 6. OBTENER TODO EL PERSONAL (SOLO ADMIN)
// ==========================================
exports.obtenerPersonal = async (req, res) => {
    try {
        const [personal] = await db.query(`
            SELECT u.id_usuario, u.email, u.rol, u.estado, 
                   p.ci, p.nombres, p.apellidos, p.cargo, p.codigo_medico, p.telefono
            FROM usuarios u
            INNER JOIN personal p ON u.id_usuario = p.id_usuario
            WHERE u.rol != 'DONANTE'
            ORDER BY p.apellidos ASC
        `);
        
        return res.json(personal);
    } catch (error) {
        console.error('Error al obtener el personal:', error);
        return res.status(500).json({ msg: 'Error del servidor al cargar la lista de personal.' });
    }
};

// ==========================================
// 7. ALTERNAR ESTADO DE USUARIO
// ==========================================
exports.cambiarEstadoUsuario = async (req, res) => {
    // ⚠️ REVISIÓN: Asegúrate de que en tus rutas se llame /:id para coincidir con req.params.id
    const { id } = req.params; 
    const { nuevoEstado } = req.body;

    if (!['ACTIVO', 'INACTIVO'].includes(nuevoEstado)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }

    try {
        if (!id) {
            return res.status(400).json({ msg: 'ID de usuario no proporcionado.' });
        }

        if (req.usuario && parseInt(id) === req.usuario.id) {
            return res.status(400).json({ msg: 'Acción inválida. No puedes desactivar tu propia cuenta.' });
        }

        await db.query('UPDATE usuarios SET estado = ? WHERE id_usuario = ?', [nuevoEstado, id]);
        return res.json({ msg: `Estado del usuario modificado a [${nuevoEstado}] correctamente.` });
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        return res.status(500).json({ msg: 'Error de servidor al modificar el estado.' });
    }
};

// ==========================================
// 🌟 NUEVO: ADMINISTRADOR EDITA A UN EMPLEADO
// ==========================================
exports.adminActualizarPersonal = async (req, res) => {
    const { id } = req.params; // El ID del usuario a editar
    const { email, nombres, apellidos, ci, telefono, cargo, codigo_medico } = req.body;

    if (!email || !nombres || !apellidos || !ci) {
        return res.status(400).json({ msg: 'Email, Nombres, Apellidos y CI son campos obligatorios.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Validar que el correo no esté duplicado con OTRO usuario
        const [correoDuplicado] = await connection.query(
            'SELECT * FROM usuarios WHERE email = ? AND id_usuario != ?', 
            [email, id]
        );
        if (correoDuplicado.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'El correo electrónico ya pertenece a otra cuenta.' });
        }

        // 2. Validar que el CI no esté duplicado con OTRO empleado
        const [ciDuplicado] = await connection.query(
            'SELECT * FROM personal WHERE ci = ? AND id_usuario != ?', 
            [ci, id]
        );
        if (ciDuplicado.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'La Cédula de Identidad ya pertenece a otro empleado.' });
        }

        // 3. Actualizar tabla usuarios
        await connection.query(
            'UPDATE usuarios SET email = ? WHERE id_usuario = ?',
            [email, id]
        );

        // 4. Actualizar tabla personal
        await connection.query(
            `UPDATE personal 
             SET nombres = ?, apellidos = ?, ci = ?, telefono = ?, cargo = ?, codigo_medico = ? 
             WHERE id_usuario = ?`,
            [nombres, apellidos, ci, telefono || null, cargo || null, codigo_medico || null, id]
        );

        await connection.commit();
        res.json({ msg: 'Información del personal actualizada por el administrador con éxito.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al editar personal desde admin:', error);
        res.status(500).json({ msg: 'Error interno al actualizar los datos del empleado.' });
    } finally {
        connection.release();
    }
};