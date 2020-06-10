//Inicializacion servidor de express
/**
 * ESTRUCTURA DEL SERVIDOR
 * 1. requires
 * 2. Inicializar variables
 * 3. Escuchar peticiones - escuchar servidor
 * 4. enrutamiento para escuchar en navegador con status 200
 * 5. conexion mongoose y node
 */

//Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

// conexion a base de datos (utilizar libreria de mongoose)
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    //si sucede algun error o el parametro trae algun error entonces lanzar error - throw detiene el proceso
    if(err) throw err;

    //si sucede un error no se ejecuta el console.log
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

//rutas
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje:'Peticion realizada correctamente'
    })
});

//Escuchar peticiones
app.listen(3000,  ()=> {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});