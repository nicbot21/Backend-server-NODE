//--------------------------------------------------------
//REQUIRES AND IMPORTS
//--------------------------------------------------------

var express = require('express');
var app = express();
var fileupload = require('express-fileupload');
var fs = require('fs');

//modelos de colecciones
var Usuario = require('../models/usuario.service');
var Hospital = require('../models/hospital.service');
var Medico = require('../models/medico.service');
//--------------------------------------------------------
//middleware
//--------------------------------------------------------
app.use(fileupload());


//--------------------------------------------------------
//--------------------------------------------------------
//--------------------------------------------------------

//rutas
app.put('/:tipoTabla/:id', (request, response, next) => {

    //tipo de usuario, medico o hospital
    var tipoTabla = request.params.tipoTabla;
    var id = request.params.id;

    // tipos de coleccion (tablas en mongo)
    var coleccionesValidas = ['usuarios', 'hospitales', 'medicos'];

    if (coleccionesValidas.indexOf(tipoTabla) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ninguna imagen',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado ninguna imagen',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });
    }

    // 1.     Obtener nombre del archivo
    var archivo = request.files.imagen;
    // 2.     extraer extension del archivo por punto
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // 3.     validacion de extensiones aceptadas
    var extensionesValids = ['png', 'jpg', 'gif', 'jpeg'];
    //console.log('verificar salida de extension2:', extensionArchivo);
    //console.log('verificar salida de extension:', extensionesValids.indexOf(extensionArchivo));

    //lo que hace index of es comparar lo que hay en parentesis con lo que hay en extensionesValidas y sacara toda
    //la cadena y comaparara con las 4 posiciones si saca 0,1,2,3 o sea mayor a 0 estara bien pero si saca -1 no permitira subir esa imagen
    // porque no es igual a una de las extensiones validas que estan en 0,1,2,3
    // 4.    Validar archivos y mandar la extension necesaria
    if (extensionesValids.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {
                message: 'las extenciones validas son ' + extensionesValids.join(', ')
            }
        });
    }

    // 5. Crear Nombre de archivo personalizado
    //alt + 96
    //armar el nombre con: idUsuarios-numerorandom(milisengundos de la fecha).extensionArchivo
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // 6. Mover el archivo del temporal a un path especifico
    var pathArchivo = `./uploads/${ tipoTabla }/${nombreArchivo}`;

    //mv => mover
    archivo.mv(pathArchivo, error => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }

        //metodo para actualizar registro de la bd
        subirPorTipo(tipoTabla, id, nombreArchivo, response);

        /*response.status(200).json({
            ok: true,
            mensaje: 'Archivo movido correctamente',
            nombreArchivo: nombreArchivo,

        });*/

    });




});

// sacar formato json con response
function subirPorTipo(tipoTabla, id, nombreArchivo, response) {

    //lograr insertar en la tabla de usua, hospi, medic -- importar modelos

    if (tipoTabla === 'usuarios') {

        Usuario.findById(id, (error, usuario) => {

           /* if (error) {
                return response.status(500).json({
                    ok: true,
                    mensaje: 'Error al insertar en la base de datos el archivo al usuario',
                    errors: error
                });
            }*/
            
            var pathViejo = './uploads/usuarios/' + usuario.img;
            console.log('Path viejo:', pathViejo);

            
            //validar de que existe el pathViejo y poder borrarlo
            //si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            //
            usuario.img = nombreArchivo;

            console.log('Path nuevo:', usuario.img)
            usuario.save((error, usuarioActualizado) => {

                /*if (error) {
                    response.status(500).json({
                        ok: true,
                        mensaje: 'error al actualizar path de archivo',
                        errors: error

                    });

                } */

                
                return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualziada',
                        usuario: usuarioActualizado,

                    });
                

            });


        });

    }

    if (tipoTabla === 'medicos') {

    }

    if (tipoTabla === 'hospitales') {

    }

}

module.exports = app;