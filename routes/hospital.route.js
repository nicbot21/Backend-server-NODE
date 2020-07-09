//----------------------------------------------------------
//------------------------ REQUIRES ------------------------
//----------------------------------------------------------
var express = require('express');
var bcrypt = require('bcryptjs');


//importar autenticador
var middlewareAutheticaion = require('../middlewares/authentication');
var app = express();

//imporar modelo de hospital
var Hospital = require('../models/hospital.service');
const {
    request
} = require('./login.route');
const medicoService = require('../models/medico.service');

//--------------------------------------------------------------------------------------------------------------------
//------------------------ RUTAS -------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------
//----------- OBTENER TODOS LOS HOSPITALES -----------------
//----------------------------------------------------------
//lLA RUTA ESTA ESTABLECIDA EN APP.JS
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0; //declarar variable obteniendo del query el desde que numero se obtendra los registros

    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((error, hospitalesCompletos) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar el hospital',
                    errors: error
                });
            }

            Hospital.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    totalHospitales: conteo,
                    hospitales: hospitalesCompletos
                })

            });

        });
});




//----------------------------------------------------------
//----------------- ACTUALIZAR HOSPITAL ---------------------
//----------------------------------------------------------

app.put('/:id', middlewareAutheticaion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (error, hospitalAct) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital con el id: ' + id + '.',
                errors: error
            });
        } else if (!hospitalAct) {
            return response.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id: ' + id + ', no existe.',
                errors: {
                    message: 'No existe un usario con ese ID'
                }
            });
        }

        //modificacion de hospital
        hospitalAct.nombre = body.nombre;
        //hospitalAct.img = body.img;
        hospitalAct.usuario = request.usuario._id;


        //guardar usuario
        hospitalAct.save((error, hospitalSave) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el Hospital.',
                    errors: error
                });
            }
            response.status(200).json({
                ok: true,
                hospital: hospitalSave
            });

        });
    });

});






//----------------------------------------------------------
//----------------- CREAR UN NUEVO HOSPITAL ----------------
//----------------------------------------------------------

app.post('/', middlewareAutheticaion.verificaToken, (request, response) => {

    var body = request.body;

    //crear hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        //img: body.img,
        usuario: request.usuario._id,
    });

    //guardar hospital
    hospital.save((error, hospitalGuardado) => {

        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});





//----------------------------------------------------------
//----------- ELIMINAR UN HOSPITAL POR ID ------------------
//----------------------------------------------------------
app.delete('/:deleteHospital', middlewareAutheticaion.verificaToken, (request, response) => {

    //instanciar variable para obtener id de request
    var id = request.params.id;

    //buscar id para eliminar
    Hospital.findByIdAndRemove(id, (error, hospitalDelete) => {

        if (error) {
            response.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el Hospital',
                errors: error
            });
        }
        if (!hospitalDelete) {
            response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + '"' + id + '"' + '  no se encuentra en la base de datos',
                errors: {
                    message: 'No existe el hospital con ese id'
                }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalDelete
        });

    });
});






//----------------------------------------------------------
//------------------------ EXPORTAR ------------------------
//----------------------------------------------------------

module.exports = app;