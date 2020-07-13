var express = require('express');
var bcrypt = require('bcryptjs'); // para verificar si hacen match
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
//levantar variable de express
var app = express();
// importar el modelo de usuario (importar schema)
var Usuario = require('../models/usuario.service');


const {
    OAuth2Client
} = require('google-auth-library');
const { MongooseDocument } = require('mongoose');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


//-------------------------------------------------------------------------------------
//-------------- LOGIN - AUTENTICACION GOOGLE -----------------------------------------
//-------------------------------------------------------------------------------------
app.post('/google', (request, response) => {
    //obteniendo el token
    var token = request.body.token || 'Error con el token!!!!';
    var client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, 'redirect');
    async function verify() {
        try{
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });

            var payload = ticket.getPayload();
            var userid = payload['sub'];

            Usuario.findOne({ email: payload.email }, (error, usuario) => {

                if(error){
                    return response.status(500).json({
                        ok:true,
                        mensaje: 'Error al buscar el usuario - login',
                        errors: error
                    });
                }

                //console.log('verificar:  ', payload, 'usuario paylaod: ', usuario)

                if(usuario){ //si existe usuario
                    if(usuario.google === false){
                        return response.status(400).json({
                            ok:true,
                            mensaje: 'Debe usar su autenticacion normal'
                        });
                    }else{ // entonces si pasa por autenticacion de google
                        usuario.password = 'exclusive';
                        var token = jwt.sign({usuario: usuario}, SEED, {expiresIn: 14400}); //4 horas
                
                        //SI HACEN MATCH ENTONCES..
                        response.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }

                }else { // si el usuario no existe se debe crearlo

                    var nuevoUsuario = new Usuario();
                    nuevoUsuario.nombre = payload.name;
                    nuevoUsuario.email = payload.email;
                    nuevoUsuario.password = 'exclusive google';
                    nuevoUsuario.img = payload.picture;
                    //role por defecto
                    nuevoUsuario.google = true;

                    //guardar nuevo usuario

                    nuevoUsuario.save( (error, usuarioSave) => {
                        if(error){
                            return response.status(500).json({
                                ok:true,
                                mensaje: 'Error al guardar usuario en Base de datos',
                                errors: error
                            });
                        }

                        var token = jwt.sign({usuario: usuarioSave}, SEED, {expiresIn: 14400}); //4 horas
                
                        //SI HACEN MATCH ENTONCES..
                        response.status(200).json({
                            ok: true,
                            usuario: usuarioSave,
                            token: token,
                            id: usuarioSave._id
                        });



                        /*response.status(200).json({
                            ok: true,
                            payload: payload
                        });*/
                        
                    });

                }

            });



           
        }catch(e){
            return response.status(404).json({
                ok: true,
                mesaje: 'Token invalido',
                errors: e
            });
        }

      }
      verify().catch(console.error);



});

//-------------------------------------------------------------------------------------
//-------------- LOGIN - AUTENTICACION NORMAL -----------------------------------------
//-------------------------------------------------------------------------------------
app.post('/', (request, response) => {
    var body = request.body;

    //verificar si existe el usuario con el correio
    Usuario.findOne({
        email: body.email
    }, (error, usuarioDB) => {

        //ERROR
        if (error) {
            //error 500 porque debe retornar usuario y si no lo trae hay falla en servidor
            return response.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario',
                errors: error
            });
        } else if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: {
                    message: 'Credenciales incorrectas'
                }
            });
        }

        //verificar si existe la contraseña de acceso - usar bcrypt y verificar match
        // compareSync compara -- body.password con usuarioDB.password
        //if si no hacen match
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: {
                    message: 'Credenciales incorrectas'
                }
            });
        }


        //Crear un token !!
        usuarioDB.password = 'exclusive';
        var token = jwt.sign({
            usuario: usuarioDB
        }, SEED, {
            expiresIn: 14400
        }); //4 horas

        //SI HACEN MATCH ENTONCES..
        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

        //recibir el cuerpo de ingreso - correo y contraseña
        /* response.status(200).json({
             ok: true,
             mensaje: 'Login post correcto',
             body: body

         });*/

    });




});

module.exports = app;