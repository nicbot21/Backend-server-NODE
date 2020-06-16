//--------------------------------------------------------------------------------------
//Requires
//--------------------------------------------------------------------------------------
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// dentro de mongoose me permite definir funciones "Schemas"
var Schema = mongoose.Schema;
//--------------------------------------------------------------------------------------
// CONTROL DE ROLES PARA USUARIOS
//--------------------------------------------------------------------------------------
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} NO! es un rol permitido'
};

//--------------------------------------------------------------------------------------
// es una funcion que recibe un objeto de js con la conf del schema definido
var usuarioSchema = new Schema({

    nombre: {type: String, required : [true, 'El nombre es necesario brother']},
    email: {type: String, unique : true, required : [true, 'El correo es necesario brother']},
    password: {type: String, required : [true, 'la contraseña es necesaria brother']},
    img: {type: String, required : false},
    role: {type: String, required : true, default : 'USER_ROLE', enum: rolesValidos},
});

//--------------------------------------------------------------------------------------

//utilizando el valdiador de mongoose -- se coloca path si son mas campos con "unique"
usuarioSchema.plugin( uniqueValidator, {message: '{PATH} debe ser único'} );

// utilizar schema fuera del archivo
module.exports = mongoose.model('Usuario', usuarioSchema);


//--------------------------------------------------------------------------------------
// ------ ACTUALZIAR UN NUEVO USUARIO ------------------------
//--------------------------------------------------------------------------------------




//--------------------------------------------------------------------------------------
// ------ CREAR UN NUEVO USUARIO -----------------------------
//--------------------------------------------------------------------------------------

