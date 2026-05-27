const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// Ruta secreta temporal para crear al primer administrador (No requiere token)
router.get('/init-admin', authController.crearPrimerAdmin);

// Ruta pública para que cualquiera intente iniciar sesión
router.post('/login', authController.loginUsuario);

// Ruta protegida: Solo si estás logueado Y eres ADMIN puedes registrar nuevos usuarios
router.post('/registrar', verificarToken, esAdmin, authController.registrarUsuario);

router.post('/recuperar', authController.recuperarContrasena);

router.put('/actualizar-perfil', verificarToken, authController.actualizarPerfil);


module.exports = router;