const express = require('express');
const router = express.Router();

const citaController = require('../controllers/citaController');
const alertaController = require('../controllers/alertaController');
const donacionController = require('../controllers/donacionController'); // 🌟 NUEVO

const { verificarToken } = require('../middleware/authMiddleware'); 

// Rutas de Citas
router.post('/citas', verificarToken, citaController.crearCita);
router.get('/citas', verificarToken, citaController.obtenerCitas);
router.put('/citas/:id', verificarToken, citaController.actualizarEstadoCita);

// Rutas de Alertas
router.post('/alertas', verificarToken, alertaController.emitirAlerta);
router.get('/alertas', verificarToken, alertaController.obtenerAlertas);

// Rutas de Donaciones e Inventario
router.post('/donaciones', verificarToken, donacionController.registrarDonacion);
router.get('/inventario', verificarToken, donacionController.obtenerInventario);

module.exports = router;