//----------------------------------------------------------
//------------------------ REQUIRES ------------------------
//----------------------------------------------------------

var express = require('express');
//var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');


//importar autenticador
var middlewareAutheticaion = require('../middlewares/authentication');
var app = express();

// importar modelo de hospital (servicio)
var Medico = require('../models/medico.service');
const {
    request
} = require('./login.route');

//--------------------------------------------------------------------------------------------------------------------
//------------------------ RUTAS -------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------


//----------- OBTENER TODOS LOS MEDICOS -----------------
//lLA RUTA ESTA ESTABLECIDA EN APP.JS



app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0; //declarar variable obteniendo del query el desde que numero se obtendra los registros

    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde) //paginar desde -- se debe mandar parametro ...?desde=5
        .limit(4)
        .populate('usuario', 'email nombre')
        .populate('hospital')
        .exec((error, medicosCompletos) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Erro al cargar el medico',
                    errors: error
                });
            }

            Medico.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    totalMedicos: conteo,
                    medico: medicosCompletos
                });
            });

        });
});


//----------------- ACTUALIZAR MEDICO ---------------------
app.put('/:id', middlewareAutheticaion.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (error, medicoAct) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al cargar el medico',
                errrors: error
            });
        } else if (!medicoAct) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ',  no existe.',
                errrors: error
            });
        }

        //modificacion de usuario
        medicoAct.nombre = body.nombre;
        //medicoAct.img = body.img;
        medicoAct.usuario = request.usuario._id;
        medicoAct.hospital = body.hospital;

        //guardar usuario

        medicoAct.save((error, medicoSave) => {
            if (error) {
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errrors: error
                });
            }
            return response.status(200).json({
                ok: true,
                medico: medicoSave
            });

        });


    });
});


//----------------- CREAR UN NUEVO MEDICO ----------------
app.post('/', middlewareAutheticaion.verificaToken, (request, response) => {

    var body = request.body;

    //crear el medico
    var medico = new Medico({

        nombre: body.nombre,
        //img: body.img,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    //guardar medico
    medico.save((error, medicoSave) => {

        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'error al crear el medico',
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoSave
        });
    });

});


//----------- ELIMINAR UN MEDICO POR ID ------------------
app.delete('/:deleteMedic', middlewareAutheticaion.verificaToken, (request, response) => {

    //instanciar variable de requerimiento de elimincacion
    var id = request.params.deleteMedic;

    Medico.findByIdAndRemove(id, (error, medicoDelete) => {
        if (error) {
            response.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el medico',
                errors: error
            });
        } else if (!medicoDelete) {
            response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + '  no se encuentra en la base de datos',
                errors: {
                    mesagge: 'No existe el medico con ese id'
                }
            });

        } else {
            response.status(200).json({
                ok: true,
                medico: medicoDelete
            });
        }
    });
});


//----------------------------------------------------------
//------------------------ EXPORTAR ------------------------
//----------------------------------------------------------
module.exports = app;