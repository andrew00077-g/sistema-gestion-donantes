require('dotenv').config(); // Línea 1 obligatoria para leer el .env

const express = require('express');
const cors = require('cors');

// IMPORTACIÓN DE CONFIGURACIONES Y RUTAS
const db = require('./src/config/db'); 
const authRoutes = require('./src/routes/authRoutes'); 
const donanteRoutes = require('./src/routes/donanteRoutes'); // <-- 1. Importamos las nuevas rutas de donantes

const app = express();

app.use(cors()); 
app.use(express.json()); 

// RUTA DE PRUEBA GENERAL
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API de Gestion de Donantes funcionando',
        estado: 'Online',
        version: '1.0'
    });
});

// CONEXIÓN DE LAS RUTAS DEL SISTEMA
app.use('/api/auth', authRoutes);
app.use('/api/donantes', donanteRoutes); // <-- 2. Activamos el endpoint para el registro clínico de donantes

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});