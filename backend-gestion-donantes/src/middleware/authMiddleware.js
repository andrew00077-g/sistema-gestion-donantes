const jwt = require('jsonwebtoken');

// Verifica si el usuario inició sesión (tiene un token válido)
const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada.' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_temporal');
        req.usuario = verificado; // Guarda los datos del usuario en la petición
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido.' });
    }
};

// Verifica si el usuario es estrictamente ADMIN
const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ msg: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
};

module.exports = { verificarToken, esAdmin };