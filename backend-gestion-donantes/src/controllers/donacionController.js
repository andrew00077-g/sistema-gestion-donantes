const db = require('../config/db');

// Registrar una nueva donación y actualizar el inventario si es aprobada
exports.registrarDonacion = async (req, res) => {
    const { id_donante, cantidad_ml, estado_sangre, observaciones } = req.body;
    const id_usuario_admin = req.usuario.id; // Obtenido del token JWT

    if (!id_donante) {
        return res.status(400).json({ msg: 'El donante es obligatorio.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Conseguir el id_admin real usando el id_usuario autenticado
        const [admin] = await connection.query('SELECT id_admin FROM administradores WHERE id_usuario = ?', [id_usuario_admin]);
        if (admin.length === 0) {
            connection.release();
            return res.status(403).json({ msg: 'No tienes un perfil administrativo autorizado.' });
        }
        const id_admin = admin[0].id_admin;

        // 2. Obtener el tipo de sangre del donante para saber qué actualizar en el inventario
        const [donante] = await connection.query('SELECT tipo_sangre FROM donantes WHERE id_donante = ?', [id_donante]);
        if (donante.length === 0) {
            connection.release();
            return res.status(404).json({ msg: 'El donante especificado no existe.' });
        }
        const tipo_sangre = donante[0].tipo_sangre;

        // 3. Insertar la donación en la base de datos
        await connection.query(
            `INSERT INTO donaciones (id_donante, id_admin, cantidad_ml, estado_sangre, observaciones) 
             VALUES (?, ?, ?, ?, ?)`,
            [id_donante, id_admin, cantidad_ml || 450, estado_sangre || 'EN_EVALUACION', observaciones || null]
        );

        // 4. SI LA SANGRE ESTÁ APROBADA: Afectamos el stock en el inventario
        if (estado_sangre === 'APROBADA') {
            // Buscamos si ya existe ese tipo de sangre en el inventario
            const [invExiste] = await connection.query('SELECT id_inventario FROM inventario WHERE tipo_sangre = ?', [tipo_sangre]);

            if (invExiste.length > 0) {
                // Si existe, le sumamos 1 unidad
                await connection.query(
                    'UPDATE inventario SET cantidad_unidades = cantidad_unidades + 1 WHERE tipo_sangre = ?',
                    [tipo_sangre]
                );
            } else {
                // Si no existe (caso raro/inicial), creamos el registro con 1 unidad
                await connection.query(
                    'INSERT INTO inventario (tipo_sangre, cantidad_unidades) VALUES (?, 1)',
                    [tipo_sangre]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ msg: 'Donación registrada con éxito en el historial.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error en registro de donación:", error);
        res.status(500).json({ msg: 'Error de servidor al procesar la donación.' });
    } finally {
        connection.release();
    }
};

// Obtener el inventario de sangre completo (Stock de unidades)
exports.obtenerInventario = async (req, res) => {
    try {
        const [stock] = await db.query('SELECT * FROM inventario ORDER BY tipo_sangre ASC');
        res.json(stock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el inventario del banco.' });
    }
};