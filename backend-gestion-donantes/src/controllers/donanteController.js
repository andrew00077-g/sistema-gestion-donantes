const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarDonante = async (req, res) => {
    const { nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico, email } = req.body;

    // 1. Obtener una conexión del pool para manejar la transacción manualmente
    const connection = await db.getConnection();

    try {
        // Iniciamos la transacción de seguridad
        await connection.beginTransaction();

        // 2. Verificar si el donante ya existe por C.I.
        const [existeCI] = await connection.query('SELECT id_donante FROM donantes WHERE ci = ?', [ci]);
        if (existeCI.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'El Carnet de Identidad ya se encuentra registrado en el sistema.' });
        }

        // 3. Verificar si el correo ya está en uso en la tabla de usuarios
        const [existeEmail] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado con otra cuenta.' });
        }

        // 4. Encriptar la contraseña (Regla de ingeniería: Password inicial = C.I.)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(ci, salt);

        // 5. ¡CORREGIDO!: Insertar usando 'password_hash' en lugar de 'password'
        const [resultadoUsuario] = await connection.query(
            'INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
            [email, passwordEncriptada, 'DONANTE']
        );

        const id_usuario_generado = resultadoUsuario.insertId;

        // 6. Insertar en la tabla `donantes` ligando el id_usuario
        await connection.query(
            `INSERT INTO donantes 
            (id_usuario, nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
            [id_usuario_generado, nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico]
        );

        // Si todo salió bien, guardamos los cambios de manera definitiva
        await connection.commit();

        res.status(201).json({ 
            msg: 'Ficha clínica guardada y cuenta de aplicación móvil activada con éxito.',
            id_usuario: id_usuario_generado
        });

    } catch (error) {
        // Si ocurre cualquier error, cancelamos todo el proceso para no corromper la BD
        await connection.rollback();
        console.error("Error en la transacción de donante:", error);
        res.status(500).json({ msg: 'Error interno en el servidor al registrar la ficha clínica.' });
    } finally {
        // Liberamos la conexión de vuelta al pool
        connection.release();
    }
};