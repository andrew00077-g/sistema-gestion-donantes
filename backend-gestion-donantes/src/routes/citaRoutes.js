const express = require('express');
const router = express.Router();
const { obtenerCitas, registrarCita, actualizarEstadoCita } = require('../controllers/citaController');
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, obtenerCitas);
router.post('/registrar', verificarToken, registrarCita);
router.put('/:id', verificarToken, actualizarEstadoCita);

module.exports = router;