// Importamos la conexión a la base de datos (con soporte de promesas)
const db = require('../config/db'); 

// 1. OBTENER CITAS
const obtenerCitas = async (req, res) => {
    const query = `
        SELECT c.*, d.nombres, d.apellidos, d.tipo_sangre, d.ci 
        FROM citas c 
        LEFT JOIN donantes d ON c.id_donante = d.id_donante 
        ORDER BY c.fecha_hora DESC`;
    
    try {
        // En la versión de promesas, desestructuramos [rows] directamente
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error SQL en obtenerCitas:", err);
        return res.status(500).json({ msg: "Error al obtener citas" });
    }
};

// 2. REGISTRAR CITA
const registrarCita = async (req, res) => {
    const { id_donante, fecha_hora, notas } = req.body;

    if (!id_donante || !fecha_hora) {
        return res.status(400).json({ msg: "Faltan campos obligatorios (id_donante, fecha_hora)" });
    }

    const query = `INSERT INTO citas (id_donante, fecha_hora, notas, estado) VALUES (?, ?, ?, 'PENDIENTE')`;

    try {
        const [result] = await db.query(query, [id_donante, fecha_hora, notas]);
        res.status(201).json({ msg: "Cita programada con éxito", id_cita: result.insertId });
    } catch (err) {
        console.error("Error SQL en registrarCita:", err);
        return res.status(500).json({ msg: "Error al registrar la cita en la base de datos" });
    }
};

// 3. ACTUALIZAR ESTADO DE CITA
const actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ msg: "El estado es requerido" });
    }

    const query = `UPDATE citas SET estado = ? WHERE id_cita = ?`;

    try {
        const [result] = await db.query(query, [estado, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: "No se encontró la cita especificada" });
        }

        res.json({ msg: "Estado de la cita actualizado correctamente" });
    } catch (err) {
        console.error("Error SQL en actualizarEstadoCita:", err);
        return res.status(500).json({ msg: "Error al actualizar el estado" });
    }
};

// EXPORTACIÓN COMPLETA
module.exports = {
    obtenerCitas,
    registrarCita,
    actualizarEstadoCita
};