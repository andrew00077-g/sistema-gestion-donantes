const db = require('../config/db');

exports.emitirAlerta = async (req, res) => {
    const { tipo_sangre_requerido, titulo, mensaje, nivel_urgencia } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ msg: 'No se encontró información de autenticación válida.' });
    }

    const id_usuario_autenticado = req.user.id_usuario || req.user.id; 

    if (!id_usuario_autenticado) {
        return res.status(400).json({ msg: 'El token de sesión no contiene un ID de usuario válido.' });
    }

    try {
        const [empleado] = await db.query(
            'SELECT id_personal FROM personal WHERE id_usuario = ?', 
            [id_usuario_autenticado]
        );

        if (empleado.length === 0) {
            return res.status(403).json({ msg: 'El usuario actual no pertenece al personal autorizado del Banco de Sangre.' });
        }

        const id_personal_real = empleado[0].id_personal;

        await db.query(
            `INSERT INTO alertas_emergencia 
            (id_personal, tipo_sangre_requerido, titulo, mensaje, nivel_urgencia) 
            VALUES (?, ?, ?, ?, ?)`,
            [id_personal_real, tipo_sangre_requerido, titulo, mensaje, nivel_urgencia]
        );

        return res.status(201).json({ msg: 'Alerta despachada y registrada en el historial del personal con éxito.' });

    } catch (error) {
        console.error("Error al procesar la emisión de la alerta:", error);
        return res.status(500).json({ msg: 'Error interno del servidor al registrar la alerta de emergencia.' });
    }
};

exports.obtenerAlertas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.id_alerta,
                a.tipo_sangre_requerido,
                a.titulo,
                a.mensaje,
                a.nivel_urgencia,
                a.fecha_emision,
                a.estado,
                CONCAT(p.nombres, ' ', p.apellidos) AS admin_nombre
            FROM alertas_emergencia a
            JOIN personal p ON a.id_personal = p.id_personal
            ORDER BY a.fecha_emision DESC
        `);

        return res.status(200).json(rows);

    } catch (error) {
        console.error("Error al obtener el historial de alertas:", error);
        return res.status(500).json({ msg: 'Error interno del servidor al consultar el historial.' });
    }
};