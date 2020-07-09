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
var bodyparser = require('body-parser');

// Inicializar variables
var app = express();

//MIDDLEWARE - se ejecutaran siempre los app.use
// Body parser - transformacion de JSON utilizar para crear - obtener urlenconded
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())


// imports rutas
var appRoutes = require('./routes/app.routes');
var usuarioRoutes = require('./routes/usuario.route');
var loginRoutes = require('./routes/login.route');
var hospitalRoutes = require('./routes/hospital.route');
var medicoRoutes = require('./routes/medico.route');
var busquedaRoutes = require('./routes/busqueda.route');
var uploadRoutes = require('./routes/upload.route');

//--------------------------------------------------

// conexion a base de datos (utilizar libreria de mongoose)
//mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
mongoose.connect('mongodb://localhost:27017/hospitalDB',{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, (err, res) => {
    //si sucede algun error o el parametro trae algun error entonces lanzar error - throw detiene el proceso
    if(err) throw err;

    //si sucede un error no se ejecuta el console.log
    console.log('2. Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

//Rutas - MIDDLEWARES - se ejecutan antes 
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);

app.use('/', appRoutes); // ULTIMA RUTA

//Escuchar peticiones
app.listen(3000,  ()=> {
    console.log('1. Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
