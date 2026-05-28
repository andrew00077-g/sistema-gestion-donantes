const db = require('../config/db'); // Tu archivo de conexión a la BD

const obtenerCitas = (req, res) => {
    const query = `
        SELECT c.*, d.nombres, d.apellidos, d.tipo_sangre, d.ci 
        FROM citas c 
        JOIN donantes d ON c.id_donante = d.id_donante 
        ORDER BY c.fecha_hora DESC`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ msg: "Error al obtener citas" });
        res.json(results);
    });
};

const registrarCita = (req, res) => {
    const { id_donante, fecha_hora, notas } = req.body;
    const query = "INSERT INTO citas (id_donante, fecha_hora, notas) VALUES (?, ?, ?)";
    
    db.query(query, [id_donante, fecha_hora, notas], (err, result) => {
        if (err) return res.status(500).json({ msg: "Error al registrar la cita" });
        res.status(201).json({ msg: "Cita programada con éxito", id: result.insertId });
    });
};

const actualizarEstadoCita = (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const query = "UPDATE citas SET estado = ? WHERE id_cita = ?";
    
    db.query(query, [estado, id], (err) => {
        if (err) return res.status(500).json({ msg: "Error al actualizar estado" });
        res.json({ msg: "Estado de cita actualizado" });
    });
};

module.exports = { obtenerCitas, registrarCita, actualizarEstadoCita };

module.exports = {
    
    registrarCita, 
    obtenerCitas,
    actualizarEstadoCita
};