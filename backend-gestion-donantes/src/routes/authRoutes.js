const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// ==========================================
// RUTAS PÚBLICAS O DE INICIALIZACIÓN
// ==========================================

// Ruta secreta temporal para crear al primer administrador (No requiere token)
router.get('/init-admin', authController.crearPrimerAdmin);

// Ruta pública para iniciar sesión
router.post('/login', authController.loginUsuario);

// Ruta pública para solicitar contraseña temporal
router.post('/recuperar', authController.recuperarContrasena);


// ==========================================
// RUTAS PROTEGIDAS (Cualquier usuario autenticado)
// ==========================================

// Actualizar datos del propio perfil logueado
router.put('/actualizar-perfil', verificarToken, authController.actualizarPerfil);


// ==========================================
// 🌟 NUEVAS RUTAS DE ADMINISTRACIÓN (Solo ADMIN)
// ==========================================

// 1. Registrar nuevos usuarios (Médicos / Admins)
router.post('/registrar', verificarToken, esAdmin, authController.registrarUsuario);

// 2. Obtener la lista completa del personal de salud
router.get('/personal', verificarToken, esAdmin, authController.obtenerPersonal);

// 3. Alternar estado (Activar/Desactivar cuenta de personal)
// ⚠️ Nota: Usamos ':id' para que coincida exactamente con el 'req.params.id' de tu controlador
router.patch('/personal/estado/:id', verificarToken, esAdmin, authController.cambiarEstadoUsuario);

// 4. Administrador edita los datos de un miembro del personal
router.put('/personal/editar/:id', verificarToken, esAdmin, authController.adminActualizarPersonal);

module.exports = router;