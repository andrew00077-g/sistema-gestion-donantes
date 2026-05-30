const express = require('express');
const router = express.Router();
const donanteController = require('../controllers/donanteController');
const { registrarCita } = require('../controllers/citaController'); 
const { verificarToken } = require('../middleware/authMiddleware'); 

router.get('/', verificarToken, donanteController.obtenerDonantes);

// Nueva ruta para el mapa de geocerca real (Administrativo)
router.get('/buscar-disponibles', verificarToken, donanteController.buscarDonantesDisponibles);

// Ruta protegida usando la función correcta
router.post('/registrar', verificarToken, donanteController.registrarDonante);
router.put('/:id', verificarToken, donanteController.actualizarEstadoClinico);

module.exports = router;