const express = require('express');
const cors = require('cors');


const app = express();


app.use(cors()); 
app.use(express.json()); 


app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API de Gestion de Donantes funcionando',
        estado: 'Online',
        version: '1.0'
    });
});


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);

});