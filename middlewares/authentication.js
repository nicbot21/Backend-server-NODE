//REQUIRES
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


//--------------------------------------------------------------------------------------
// --------------------- VERIFICAR TOKEN ----------------------------------------------
//--------------------------------------------------------------------------------------
exports.verificaToken = function( request, response, next){

    var token = request.query.token;

    jwt.verify(token, SEED, (error, decoded)=>{

            if(error){
                // status 401 - No esta autorizado
                return response.status(401).json({
                    ok:false,
                    mensjae: 'Token incorrecto',
                    errors: error
                });
            }

            request.usuario = decoded.usuario;
            //request.hospital = decoded.hospital;
            
            //si no hay error entonces aplica next para que siga
            // con las funciones siguientes hacia abajo
            next();

            //prueba
            /*response.status(200).json({
                ok:true,
                decoded: decoded
            });*/

    });
}


