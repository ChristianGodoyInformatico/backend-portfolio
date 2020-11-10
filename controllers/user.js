'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');


var saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

var controller = {

	probando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo probando'
		});
	},

	testeando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo testeando'
		});
	},

	save: function(req, res){
		// RECOGER LOS PARAMETOS DE LA PETICION
		var params = req.body;

		// VALIDAR LOS DATOS
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){

			return res.status(400).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_name && validate_surname && validate_email && validate_password){
			// CREAR OBJETO DE USUARIO
			var user = new User();

			// ASIGNAR VALORES AL OBJETO(USUARIO)
			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email.toLowerCase();
			user.role = 'ROLE_USER';
			user.image = null;

			// COMPROBAR SI EL USUARIO EXISTE
			User.findOne({email: user.email}, (err, issetUser) => {
				if(err){
					return res.status(500).send({
						message: 'Error al comprobar que existe duplicidad (email)'
					});
				}

				if(!issetUser){
					// SI NO EXISTE, 


					//CIFRAR LA CONTRASEÑA
					bcrypt.hash(params.password, salt, (err, hash) => {
						user.password = hash;

						// GUARDAR AL USUARIO
						user.save((err, userStored) => {
							if(err){
								return res.status(500).send({
									message: 'Error al guardar al usuario'
								});
							}

							if(!userStored){
								return res.status(400).send({
									message: 'El usuario no ha guardado'
								});
							}

							// DEVOLVER RESPUESTA
							return res.status(200).send({
								status: 'success',
								user: userStored
							});

						}); // cierre del save
					}); // cierre del bcrypt

					
				}else{
					return res.status(500).send({
						message: 'Error al comprobar que existe el usuario en la BD'
					});
				}

			});

			
		}else{
			return res.status(200).send({
				message: 'La validacion de los datos del usuario es incorrecta'
			});
		}
	
		
	},

	login: function(req, res){
		// RECOGER LOS PARAMETROS DE LA PETICION
		var params = req.body;

		// VALIDAR LOS DATOS
		try{
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){

			return res.status(400).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(!validate_email && !validate_password){
			return res.status(200).send({
				message: 'Los datos son incorrectos, envialos bien nuevamente'
			});
		}

		// BUSCAR USUARIOS QUE COINCIDAN CON EL EMAIL
		User.findOne({email: params.email.toLowerCase()}, (err, user) => {
			
			if(err){
				return res.status(500).send({
					message: 'Error al intentar identificarse'
				});
			}

			if(!user){
				return res.status(404).send({
					message: 'El usuario no existe'
				});
			}

			// SI LO ENCUENTRA,
			// COMPROBAR LA CONTRASEÑA (COINCIDENCIA DE EMAIL Y PASSWORD / BCRYPT)
			bcrypt.compare(params.password, user.password, (err, check) => {
				// SI ES CORRECTO,
				if(check){
					// GENERAR TOKEN Y JWT
					if(params.gettoken){

						// DEVOLVER LOS DATOS
						return res.status(200).send({
							token: jwt.createToken(user)
						});

					}else{

						// LIMPIAR EL OBJETO (QUIETAR PROPIEDAD DE UN OBJETO COMO LA CONTRASEÑA)
						user.password = undefined;

						// DEVOLVER LOS DATOS
						return res.status(200).send({
							status: 'success',
							user
						});

					}

					
				}else{
					return res.status(200).send({
						message: 'Las credenciales no son correctas'
					});
				}

			});

		});
		

	},

	update: function(req, res){
		// Recoger los datos del usuario *****
		var params = req.body;

		// Validar los datos *****
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		}catch(err){
			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});
		}
		// Eliminar propiedades innecesarias *****
		delete params.password;

		var userId = req.user.sub;
		//console.log(userId);

		// COMPROBAR SI EL EMAIL ES UNICO
		if(req.user.email != params.email){

			User.findOne({email: params.email.toLowerCase()}, (err, user) => {
			
				if(err){
					return res.status(500).send({
						message: 'Error al intentar identificarse'
					});
				}

				if(user && user.email == params.email){
					return res.status(200).send({
						message: 'El email no puede ser modificado'
					});
				}else{

					// Buscar y actualizar documento *****
					User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdated) => {

						if(err){
							return res.status(500).send({
								status: 'error',
								message: 'Error al actualizar usuario'
							});
						}

						if(!userUpdated){
							return res.status(200).send({
								status: 'error',
								message: 'No se ha actualizado el usuario'
							});
						}

						// Devolver respuesta
						return res.status(200).send({
							status: 'success',
							user: userUpdated
						});

					});

				}

			});

		}

		
	},


	uploadAvatar: function(req, res){
		// CONFIGURAR EL MODULO MULTIPARTY (MIDDLEWARE) routes/user.js

		// RECOGER EL FICHERO DE LA PETICION
		var file_name = 'Avatar no subido...';

		if(!req.files){

			return res.status(404).send({
				status: 'error',
				message: file_name
			});

		}

		// CONSEGUIR EL NOMBRE Y LA EXTENSION DEL ARCHIVO SUBIDO
		var file_path = req.files.file0.path;
		var file_split = file_path.split('\\');

		// NOMBRE DEL ARCHIVO
		file_name = file_split[2];

		// EXTENSION DEL ARCHIVO
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];


		// COMPORBAR EXTENSION DEL ARCHIVO (SOLO IMAGENES), SI NO ES VALIDA BORRAR FICHERO SUBIDO
		if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
			fs.unlink(file_path, (err) => {

				return res.status(200).send({
					status: 'error',
					message: 'La extension del archivo no es valida'
				});

			});
		
		}else{
			// SACAR EL ID DEL USUARIO IDENTIFICADO
			var userId = req.user.sub;

			// BUSCAR Y ACTUALIZAR DOCUMENTO(USUARIO)
			User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdated) => {
				
				if(err){
					// Devolver respuesta
					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar la imagen del usuario'
					});
				}

				if(!userUpdated){
					// Devolver respuesta
					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar la imagen del usuario'
					});
				}

				// Devolver respuesta
				return res.status(200).send({
					status: 'success',
					user: userUpdated
				});

			});

		}

	},


	avatar: function(req, res){
		var fileName = req.params.fileName;
		var pathFile = './uploads/users/'+fileName;

		fs.exists(pathFile, (exists) => {

			if(exists){
				return res.sendFile(path.resolve(pathFile));
			}else{
				return res.status(404).send({
					message: 'La imagen no existe'
				});
			}

		});

	},


	getUsers: function(req, res){

		User.find().exec((err, users) => {
			if(err || !users){
				return res.status(404).send({
					status: 'error',
					message: 'No hay usuarios que mostrar'
				});
			}

			return res.status(200).send({
				status: 'success',
				users
			});

		});

	},

	
	getUser: function(req, res){
		var userId = req.params.userId;

		User.findById(userId).exec((err, user) => {

			if(err || !user){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el usuario'
				});
			}

			return res.status(200).send({
				status: 'success',
				user
			});

		});

	}


};

module.exports = controller;