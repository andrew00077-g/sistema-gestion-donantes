const express = require('express');
const router = express.Router();


const citaController = require('../controllers/citaController');
const alertaController = require('../controllers/alertaController');


const { verificarToken } = require('../middleware/authMiddleware'); 

// Rutas de Citas
router.post('/citas', verificarToken, citaController.crearCita);
router.get('/citas', verificarToken, citaController.obtenerCitas);
router.put('/citas/:id', verificarToken, citaController.actualizarEstadoCita);

// Rutas de Alertas
router.post('/alertas', verificarToken, alertaController.emitirAlerta);
router.get('/alertas', verificarToken, alertaController.obtenerAlertas);

module.exports = router;