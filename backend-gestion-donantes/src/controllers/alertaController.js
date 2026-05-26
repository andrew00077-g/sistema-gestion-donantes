const db = require('../config/db');

// Emitir alerta de emergencia masiva
exports.emitirAlerta = async (req, res) => {
    const { tipo_sangre_requerido, titulo, mensaje, nivel_urgencia } = req.body;
    const id_usuario_admin = req.usuario.id; // Extraído de tu middleware de autenticación (JWT)

    if (!tipo_sangre_requerido || !titulo || !mensaje) {
        return res.status(400).json({ msg: 'Por favor, llena los campos clave de la alerta.' });
    }

    try {
        // Buscamos el id_admin real usando el id_usuario autenticado
        const [admin] = await db.query('SELECT id_admin FROM administradores WHERE id_usuario = ?', [id_usuario_admin]);
        
        if (admin.length === 0) {
            return res.status(403).json({ msg: 'Acción denegada. No tienes un perfil administrativo asignado.' });
        }

        const id_admin = admin[0].id_admin;

        await db.query(
            'INSERT INTO alertas_emergencia (id_admin, tipo_sangre_requerido, titulo, mensaje, nivel_urgencia) VALUES (?, ?, ?, ?, ?)',
            [id_admin, tipo_sangre_requerido, titulo, mensaje, nivel_urgencia || 'ALTA']
        );

        res.status(201).json({ msg: '¡Alerta de emergencia difundida en el sistema exitosamente!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al procesar la emisión de la alerta.' });
    }
};

// Listar todas las alertas vigentes
exports.obtenerAlertas = async (req, res) => {
    try {
        const [alertas] = await db.query(`
            SELECT a.*, adm.nombres AS admin_nombre 
            FROM alertas_emergencia a
            JOIN administradores adm ON a.id_admin = adm.id_admin
            ORDER BY a.fecha_emision DESC
        `);
        res.json(alertas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al recopilar el historial de alertas.' });
    }
};