require('dotenv').config(); // Línea 1 obligatoria para leer el .env

const express = require('express');
const cors = require('cors');

// 1. IMPORTACIÓN DE CONFIGURACIONES Y RUTAS
const db = require('./src/config/db'); 
const authRoutes = require('./src/routes/authRoutes'); 
const donanteRoutes = require('./src/routes/donanteRoutes'); 
const operacionesRoutes = require('./src/routes/operacionesRoutes'); // Importación de alertas y citas

// 2. INICIALIZACIÓN DE EXPRESS
const app = express();

// 3. MIDDLEWARES GLOBALES
app.use(cors()); 
app.use(express.json()); 

// 4. RUTA DE PRUEBA GENERAL
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API de Gestion de Donantes funcionando',
        estado: 'Online',
        version: '1.0'
    });
});

// 5. CONEXIÓN DE LAS RUTAS DEL SISTEMA (Todas agrupadas y ordenadas)
app.use('/api/auth', authRoutes);
app.use('/api/donantes', donanteRoutes); 
app.use('/api/operaciones', operacionesRoutes); 

// 6. ENCENDIDO DEL SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});