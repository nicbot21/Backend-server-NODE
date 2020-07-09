//requires
var express = require('express');
var bcrypt = require('bcryptjs'); //-> se usa donde uno desea encriptar los datos
var jwt = require('jsonwebtoken');

//importar autenticador
var middlewareAutheticaion = require('../middlewares/authentication');

var app = express();



// importar el modelo de usuario (importar schema)
var Usuario = require('../models/usuario.service');
const {
    request
} = require('./login.route');


//---------------------------------------------------------

//------------------ RUTAS -----------------------------------------------------------


/**
 * Metodo para obtener todos los usuarios - method = GET
 * Se necesita de : usuario.service.js para obtener el listado de los usuarios
 * @param request, response, next
 */
app.get('/', (request, response, next) => {


    var desde = request.query.desde || 0; //declarar variable obteniendo del query el desde que numero se obtendra los registros

    desde = Number(desde);
    //Usar modelo ----- secoloca esto para especificar lso campos que se desean y luego
    // iria exec() para ejecutar la funcion de flecha
    // llaves amarillas dentro de find permite hacer consultas en base de datos
    Usuario.find({}, 'nombre email img role ')
        .skip(desde) // decir que me salte el numero desde si coloca 5 en request que salte los primeros 5 y luego con limit cargue lso siguientes 5
        .limit(5) // colocar limite de 5 registros para mostrar y poder PAGINAR
        .exec((error, usuariosCompletos) => {
            if (error) {
                //status - 500 - Internal server error
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar usuarios',
                    errors: error
                });
            }

            Usuario.count({}, (error, conteo) => {

                if (error) {
                    response.status(402).json({
                        ok: false,
                        mensaje: 'Error al contar los usuarios',
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    totalUsuarios: conteo,
                    usuarios: usuariosCompletos
                });
            });


        });

    /* response.status(200).json({
         ok: true,
         mensaje:'Peticion GET de usuarios!'
     });*/
});

// ------------------------------------------------------------------





//--------------------------------------------------------------------------------------
// ----- ACTUALIZAR USUARIO -----------------------------
//--------------------------------------------------------------------------------------

app.put('/:id', middlewareAutheticaion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    /* Usuario.findById(id, 'nombre email img role')
    // o tambien ...findById({id: body.id}, 'nombre email img role')
     .exec((error, usuario) => {*/ //1.  para obtener lso campos que quiero que muestre!!!
    Usuario.findById(id, (error, usuario) => {

        if (error) {
            //error 500 porque debe retornar usuario y si no lo trae hay falla en servidor
            return response.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario',
                errors: error
            });
        } else if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ' + id + ' no existe',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        // modificacion de usuario - asigna lo que venga del body a usuario
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //ahora guardar el usuario actualizado
        usuario.save((error, usuarioGuardado) => {

            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                });
            }

            //2. aqui puedo cambiar el password para que no se identifique con la opcion
            // de mostrar todos los datos incluyendo password
            // esto NO SE GUARDA  en el save solo es dentro del callback del save, SOLO MUESTRA
            usuarioGuardado.password = 'exclusive';


            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });



    });

    /*response.status(200).json({
        ok:true,
        id: id
    });*/

});


//--------------------------------------------------------------------------------------
// ----- CREAR UN NUEVO USUARIO -----------------------------
//--------------------------------------------------------------------------------------
/**
 * Metodo para crear un nuevo usuario
 * verificacion de token:  se ejecutara cuando sea que se solicite esa peticion
 */
app.post('/', middlewareAutheticaion.verificaToken, (request, response) => {

    // UTILIZAREMOS DOY PARSER NODE - MIDDLEWARE
    var body = request.body;

    // creacion de usuario usuando mongoose
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //10 para que de 10 saltos
        img: body.img,
        role: body.role

    });

    //ahora guardarlo
    usuario.save((error, usuarioGuardado) => {

        if (error) {
            // Client error 400 - Bad request
            response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            });
        }

        // 201 - recurso creado
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: request.usuario
        });
    });
});


//--------------------------------------------------------------------------------------
// ----- ELIMINAR UN USUARIO  POR ID -----------------------------
//--------------------------------------------------------------------------------------
app.delete('/:deleteUser', middlewareAutheticaion.verificaToken, (request, response) => {

    var id = request.params.deleteUser;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {

        if (error) {

            response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        } else if (!usuarioBorrado) {
            response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no se encuentra',
                errors: {
                    message: 'No existe usuario con ese id'
                }
            });
        }


        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});





module.exports = app;