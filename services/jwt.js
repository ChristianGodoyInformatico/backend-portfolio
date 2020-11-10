'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user){

	var payload = {
		sub: user._id,
		created: user.created,
		name: user.name,
		surname: user.surname,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix
	};

	return jwt.encode(payload, 'esta_es_la_clave_secreta-999888');
}

