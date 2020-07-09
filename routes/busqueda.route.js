// ------------------------------------------------------ REALIZAR BUSQUEDAS TOTALES DE COLLECCIONES EN MONGO
var express = require('express');
var app = express();


// importacion de modelos
// importacion de hospital 
var Hospital = require('../models/hospital.service');
// importacion de medicos 
var Medico = require('../models/medico.service');
// importacion de Usuarios 
var Usuario = require('../models/usuario.service');


//================================================================================
//====     BUSQUEDA POR COLECCIONES - MEDICOS - HOSPITALES - USUARIOS       ======
//================================================================================
app.get('/coleccion/:tabla/:busqueda', (request, response, next) => {

    var tabla = request.params.tabla;
    var busqueda = request.params.busqueda;
    var regexB = new RegExp(busqueda, 'i');
    var regexT = new RegExp(tabla, 'i');
    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuario(busqueda, regexB);
            break;

        case 'hospitales':
            promesa = buscarHospiales(busqueda, regexB);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regexB);
            break;

        default: 
        return response.status(400).json({
            ok:false,
            mensaje : 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
            error: { message: 'Coleccion o tabla no valida'}
        })
    }

    promesa.then( data => {
        response.status(200).json({
            ok: true,
            [tabla]: data // al colocar las llaves le digo a JS que no s la palabra "tabla" que quiero sino el resultado de ese campo

        });
    })


});





//================================================================================
//==========   BUSQUEDA GENERAL ==================================================
//================================================================================
//rutas
//busqueda en una coleccion y en varias colecciones de las que hay en mongo - pro el momento hay 3
app.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda; // aqui se obtiene lo que esta dentro de ":busqueda" --> ej: localhost:3000/busqueda/todo/norte
    //expresion regular para que se pueda utilizar la variable busqueda y la busqueda sea insensible con la palabra que se coloca sea mayuscula o la palabra incompleta
    var regex = new RegExp(busqueda, 'i'); //--> i de insensible a minusculas y mayusculas - funcion de javascript


    // permite mandar un arreglo de promesas y si todas responden correctamente va elthen sino un catch
    Promise.all([
        buscarHospiales(busqueda, regex), // promesas
        buscarMedicos(busqueda, regex), // promesas
        buscarUsuario(busqueda, regex)
    ]).then(respuestas => {
        response.status(200).json({
            ok: true,
            hospitales: respuestas[0], // trae todos loshospitalhospitales de la primer promesa
            medicos: respuestas[1], // trae todos los medicos de la segunda promesa
            usuarios: respuestas[2]
        })
    });



});




//BUSQUEDA HOSPITALES --- transformar respuesta de busqueda en una promesa - FUNCIONES ASINCRONAS 
function buscarHospiales(busqueda, regex) {
    //uso de metodos de promesas
    return new Promise((resolve, reject) => {
        Hospital.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .exec((error, hospitalesNames) => {
                if (error) {
                    reject('Error al cargar hospitales', error);
                } else {
                    // si no hay ningun error se manda la data de los hospitales
                    resolve(hospitalesNames);
                }
            })
    });


}

//BUSQUEDA MEDICOS 
function buscarMedicos(busqueda, regex) {
    //uso de metodos de promesas
    return new Promise((resolve, reject) => {
        Medico.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((error, medicosNames) => {
                if (error) {
                    reject('Error al cargar medicos', error);
                } else {
                    // si no hay ningun error se manda la data de los hospitales
                    resolve(medicosNames);
                }
            })
    });


}


function buscarUsuario(busqueda, regex) {
    //uso de metodos de promesas
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{
                'nombre': regex
            }, {
                'email': regex
            }])
            .exec((error, usuarios) => {
                if (error) {
                    reject('Error al cargar usuarios', error);
                } else {
                    resolve(usuarios);
                }
            })
    });


}

module.exports = app;