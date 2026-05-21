const express = require('express');
const router = express.Router();
const donanteController = require('../controllers/donanteController');

// DESTRUCTURACIÓN: Extraemos solo las funciones que necesitamos del objeto exportado
const { verificarToken } = require('../middleware/authMiddleware'); 

// Ruta protegida usando la función correcta
router.post('/registrar', verificarToken, donanteController.registrarDonante);

module.exports = router;