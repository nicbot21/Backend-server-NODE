var express = require('express');
var bcrypt = require('bcryptjs'); // para verificar si hacen match
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//levantar variable de express
var app = express();
// importar el modelo de usuario (importar schema)
var Usuario = require('../models/usuario.service');


//-----------------------------------------------------
//-------------- LOGIN --------------------------------
//-----------------------------------------------------
app.post('/', (request, response) => {
    var body = request.body;

    //verificar si existe el usuario con el correio
    Usuario.findOne({
        email: body.email
    }, (error, usuarioDB) => {

        //ERROR
        if(error){
            //error 500 porque debe retornar usuario y si no lo trae hay falla en servidor
            return response.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario',
                errors: error
            });
        }else if(!usuarioDB){
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: {message: 'Credenciales incorrectas'}
            });
        }

        //verificar si existe la contraseña de acceso - usar bcrypt y verificar match
        // compareSync compara -- body.password con usuarioDB.password
        //if si no hacen match
        if( !bcrypt.compareSync(body.password, usuarioDB.password)){
            return response.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectas - password',
                errors: {message: 'Credenciales incorrectas'}
            });
        }

        
        //Crear un token !!
        usuarioDB.password = 'exclusive';
        var token = jwt.sign({ usuario: usuarioDB}, SEED , { expiresIn: 14400} ); //4 horas

        //SI, SI HACEN MATCH ENTONCES..
        response.status(200).json({
            ok:true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

        //recibir el cuerpo de ingreso - correo y contraseña
        response.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            body: body

        });

    });




});

module.exports = app;