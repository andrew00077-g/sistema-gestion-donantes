const express = require('express');
const router = express.Router();
const donanteController = require('../controllers/donanteController');
const { registrarCita } = require('../controllers/citaController'); // O el nombre de tu controlador
// DESTRUCTURACIÓN: Extraemos solo las funciones que necesitamos del objeto exportado
const { verificarToken } = require('../middleware/authMiddleware'); 

router.get('/', verificarToken, donanteController.obtenerDonantes);

// Ruta protegida usando la función correcta
router.post('/registrar', verificarToken, donanteController.registrarDonante);
router.put('/:id', verificarToken, donanteController.actualizarEstadoClinico);

module.exports = router;