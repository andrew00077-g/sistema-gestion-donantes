const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. REGISTRAR DONANTE (Mantiene tu lógica transaccional intacta)
exports.registrarDonante = async (req, res) => {
    const { nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico, email } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar si el donante ya existe por C.I.
        const [existeCI] = await connection.query('SELECT id_donante FROM donantes WHERE ci = ?', [ci]);
        if (existeCI.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'El Carnet de Identidad ya se encuentra registrado en el sistema.' });
        }

        // Verificar si el correo ya está en uso
        const [existeEmail] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existeEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado con otra cuenta.' });
        }

        // Encriptar contraseña (Password inicial = C.I.)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(ci, salt);

        // Insertar en la tabla usuarios
        const [resultadoUsuario] = await connection.query(
            'INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)',
            [email, passwordEncriptada, 'DONANTE']
        );

        const id_usuario_generado = resultadoUsuario.insertId;

        // Insertar en la tabla donantes
        await connection.query(
            `INSERT INTO donantes 
            (id_usuario, nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
            [id_usuario_generado, nombres, apellidos, ci, fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico]
        );

        await connection.commit();
        res.status(201).json({ 
            msg: 'Ficha clínica guardada y cuenta de aplicación móvil activada con éxito.',
            id_usuario: id_usuario_generado
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error en la transacción de donante:", error);
        res.status(500).json({ msg: 'Error interno en el servidor al registrar la ficha clínica.' });
    } finally {
        connection.release();
    }
};

// 2. OBTENER DONANTES (Tu consulta limpia para la tabla)
exports.obtenerDonantes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                id_donante, id_usuario, nombres, apellidos, ci, 
                fecha_nacimiento, genero, tipo_sangre, telefono, peso_kg, estado_medico 
            FROM donantes
            ORDER BY id_donante DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener el padrón de donantes:", error);
        res.status(500).json({ msg: 'Error interno del servidor al consultar la base de datos.' });
    }
};

// 3. ACTUALIZAR DONANTE COMPLETO / ESTADO CLINICO (¡Solución Definitiva!)
// Esta única función procesa los cambios rápidos de estado AND los cambios generales de la ficha médica.
exports.actualizarEstadoClinico = async (req, res) => {
    const { id } = req.params;
    
    // Capturamos tanto el cambio rápido (estado_clinico) como una edición completa de la ficha
    const { nombres, apellidos, ci, telefono, genero, estado_clinico, estado_medico } = req.body;

    try {
        // 1. Primero recuperamos los datos actuales por si el frontend solo envió el estado
        const [donanteActual] = await db.query('SELECT * FROM donantes WHERE id_donante = ?', [id]);
        
        if (donanteActual.length === 0) {
            return res.status(404).json({ msg: 'El donante especificado no existe.' });
        }

        // 2. Fusionamos datos: Si no vienen en el body (petición rápida), usamos los que ya tenía la BD
        const nombresFinal = nombres || donanteActual[0].nombres;
        const apellidosFinal = apellidos || donanteActual[0].apellidos;
        const ciFinal = ci || donanteActual[0].ci;
        const telefonoFinal = telefono || donanteActual[0].telefono;
        const generoFinal = genero || donanteActual[0].genero;
        
        // Resolvemos el dilema de nombres: prioriza lo que venga del botón rápido o del formulario de la ficha
        const estadoFinal = estado_clinico || estado_medico || donanteActual[0].estado_medico;

        // 3. Ejecutamos un query directo sobre el pool (evita bloqueos de transacciones mal cerradas)
        await db.query(
            `UPDATE donantes SET 
                nombres = ?, 
                apellidos = ?, 
                ci = ?, 
                telefono = ?, 
                genero = ?, 
                estado_medico = ? 
             WHERE id_donante = ?`,
            [nombresFinal, apellidosFinal, ciFinal, telefonoFinal, generoFinal, estadoFinal, id]
        );

        return res.status(200).json({ msg: 'Expediente clínico actualizado con éxito en el servidor.' });
    } catch (error) {
        console.error(" Error crítico al actualizar el donante:", error);
        return res.status(500).json({ msg: 'Error interno del servidor al procesar la actualización.' });
    }
};