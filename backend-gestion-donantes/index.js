require('dotenv').config(); 

const express = require('express');
const cors = require('cors');


const db = require('./src/config/db'); 
const authRoutes = require('./src/routes/authRoutes'); 

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

// CONEXIÓN DE LAS RUTAS
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});