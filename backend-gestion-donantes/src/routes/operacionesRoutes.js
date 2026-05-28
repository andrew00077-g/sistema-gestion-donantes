const express = require('express');
const router = express.Router();

const citaController = require('../controllers/citaController');
const alertaController = require('../controllers/alertaController');
const donacionController = require('../controllers/donacionController'); 

const { verificarToken } = require('../middleware/authMiddleware'); 


//  RUTAS DE CITAS MÉDICAS

// Registrar una nueva cita programada
router.post('/citas', verificarToken, citaController.registrarCita);

// Obtener el listado de todas las citas del sistema
router.get('/citas', verificarToken, citaController.obtenerCitas);

// Actualizar el estado de una cita (PENDIENTE, COMPLETADA, CANCELADA, AUSENTE)
router.put('/citas/:id', verificarToken, citaController.actualizarEstadoCita);



//  RUTAS DE ALERTAS (SISTEMA DE NOTIFICACIONES)

// Emitir alertas de emergencia (Ej: Solicitud de donantes O-)
router.post('/alertas', verificarToken, alertaController.emitirAlerta);

// Obtener historial de alertas lanzadas
router.get('/alertas', verificarToken, alertaController.obtenerAlertas);



//  RUTAS DE DONACIONES E INVENTARIO

// Registrar la extracción física de 450ml a un donante APTO
router.post('/donaciones', verificarToken, donacionController.registrarDonacion);

// Consultar el stock disponible de bolsas de sangre por factor Rh
router.get('/inventario', verificarToken, donacionController.obtenerInventario);

module.exports = router;