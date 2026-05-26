const db = require('../config/db');

// Crear una nueva cita para un donante
exports.crearCita = async (req, res) => {
    const { id_donante, fecha_hora, notas } = req.body;

    if (!id_donante || !fecha_hora) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios para programar la cita.' });
    }

    try {
        await db.query(
            'INSERT INTO citas (id_donante, fecha_hora, notas) VALUES (?, ?, ?)',
            [id_donante, fecha_hora, notas || null]
        );
        res.status(201).json({ msg: 'Cita programada exitosamente en el sistema.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la cita en el servidor.' });
    }
};

// Obtener todas las citas con los datos del donante asociados
exports.obtenerCitas = async (req, res) => {
    try {
        const [citas] = await db.query(`
            SELECT c.*, d.nombres, d.apellidos, d.tipo_sangre 
            FROM citas c
            JOIN donantes d ON c.id_donante = d.id_donante
            ORDER BY c.fecha_hora ASC
        `);
        res.json(citas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el listado de citas.' });
    }
};

// Actualizar el estado de la cita (PENDIENTE, COMPLETADA, CANCELADA, AUSENTE)
exports.actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        await db.query('UPDATE citas SET estado = ? WHERE id_cita = ?', [estado, id]);
        res.json({ msg: `Estado de la cita actualizado a ${estado}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al modificar el estado de la cita.' });
    }
};