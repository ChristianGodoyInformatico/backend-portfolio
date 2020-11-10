'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "esta_es_la_clave_secreta-999888";


exports.authenticated = function(req, res, next){

	// COMPROBAR SI LLEGA AUTORIZACION
	if(!req.headers.authorization){
		return res.status(403).send({
			message: 'La peticion no tiene la cabecera de autorizacion'
		});
	}

	// LIMPIAR EL TOKEN Y LIMPIAR COMILLAS (EN EL CASO DE QUE TRAIGA)
	var token = req.headers.authorization.replace(/['"]+/g, '');

	try{
		// DECODIFICAR TOKEN
		var payload = jwt.decode(token, secret);

		// COMPROBAR SI EL TOKEN HA EXPIRADO
		if(payload.exp <= moment().unix()){
			return res.status(404).send({
				message: 'El token ha expirado'
			});
		}

	}catch(ex){
		return res.status(404).send({
			message: 'El token no es valido'
		});
	}

	// ADJUNTAR USUARIO IDENTIFICADO A LA REQUEST
	req.user = payload;

	//PASAR A LA ACCION (UTILIZANDO EL next() )
	next();
};