var express = require('express');
var app = express();
var fs = require('fs');


//rutas
app.get('/:tipoTabla/:img', (request, response, next) => {

    var tipoTabla = request.params.tipoTabla;
    var img = request.params.img;

    var path = `./uploads/${ tipoTabla }/${ img }`;

    fs.exists( path, existe => {

        if(!existe){
           /* response.status(400).json({
                ok:false,
                mensaje: 'No existe la imagen'
            })*/
            path = './assets/guest.png';
        }

        //mandar imagen
        //response.sendfile(path);
        response.sendfile( path, (error) => {
            if(error) throw error;
            console.log('Se envío la imagen correctamente');
        });
    });

    /*response.status(200).json({
        ok: true,
        mensaje:'Peticion realizada correctamente'
    })*/
});

module.exports = app;