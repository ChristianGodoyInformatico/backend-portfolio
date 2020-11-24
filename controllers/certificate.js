'use strict'

var validator = require('validator');
var path = require('path');
var fs = require('fs');
var Certificate = require('../models/certificate');

var controller = {

	prueba2: function(req, res){
		return res.status(200).send({
			message: 'Hola que tal desde certificate'
		});
	},

	save: function(req, res){
		// RECOGER PARAMETROS
		var params = req.body;

		// VALIDAR LOS DATOS
		try{
			var validate_title = !validator.isEmpty(params.title);
		}catch(err){

			return res.status(400).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_title){

			var certificate = new Certificate();

			// ASIGNAR VALORES AL OBJETO(USUARIO)
			certificate.title = params.title;
			certificate.description = params.description;
			certificate.pdf = null;

			// GUARDAR EL TOPIC
			certificate.save((err, certificateStored) => {

				if(err || !certificateStored){

					return res.status(404).send({
						status: 'error',
						message: 'El certificado no se ha guardado'
					});

				}

				// DEVOLVER RESPUESTA
				return res.status(200).send({
					status: 'success',
					certificate: certificateStored
				});

			});	

		}else{
			return res.status(200).send({
				status: 'error',
				message: 'La validacion del titulo ha fallado'
			});
		}

	},



	uploadPdf: function(req, res){
		// CONFIGURAR EL MODULO MULTIPARTY (MIDDLEWARE) routes/user.js

		// RECOGER EL FICHERO DE LA PETICION
		var file_name = 'PDF no subido...';

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
		if(file_ext != 'pdf'){
			fs.unlink(file_path, (err) => {

				return res.status(200).send({
					status: 'error',
					message: 'La extension del archivo no es valida'
				});

			});
		
		}else{
			// RECOGER EL ID DEL CERTIFICADO DE LA URL
			var certificateId = req.params.certificateId;

			// BUSCAR Y ACTUALIZAR DOCUMENTO(USUARIO)
			Certificate.findOneAndUpdate({_id: certificateId}, {pdf: file_name}, {new:true}, (err, certificateUpdated) => {
				
				if(err){
					// Devolver respuesta
					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar el PDF del certificado'
					});
				}

				if(!certificateUpdated){
					// Devolver respuesta
					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar el PDF del certificado'
					});
				}

				// Devolver respuesta
				return res.status(200).send({
					status: 'success',
					certificate: certificateUpdated
				});

			});

		}

	},


	certificatePdf: function(req, res){
		var fileName = req.params.fileName;
		var pathFile = './uploads/certificates/'+fileName;

		fs.exists(pathFile, (exists) => {

			if(exists){
				return res.sendFile(path.resolve(pathFile));
			}else{
				return res.status(404).send({
					message: 'EL certificado no existe'
				});
			}

		});

	},


	getCertificate: function(req, res){

		var certificadoId = req.params.id;

		Certificate.findById(certificadoId).exec((err, certificate) => {

			if(err || !certificate){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el certificado'
				});
			}

			return res.status(200).send({
				status: 'success',
				certificate
			});

		});	

	},


	getCertificates: function(req, res){

		Certificate.find().exec((err, certificates) => {
			if(err || !certificates){
				return res.status(404).send({
					status: 'error',
					message: 'No hay certificados que mostrar'
				});
			}

			return res.status(200).send({
				status: 'success',
				certificates
			});

		});

	},

	delete: function(req, res){

		// SACAR EL ID DEL CERTIFICADO DE LA URL
		var certificateId = req.params.id;

		// FIND AND DELETE POR CERTIFICATEID
		Certificate.findOneAndDelete({_id: certificateId}, (err, certificateRemoved) => {

			var fileName = certificateRemoved.pdf;
			var pathFile = './uploads/certificates/'+fileName;

			fs.exists(pathFile, (exists) => {

				if(exists){
					
					fs.unlink(pathFile, (err) => {

						return res.status(200).send({cert: certFile});

					});

				}else{
					return res.status(404).send({
						message: 'EL certificado no existe'
					});
				}

			});

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!certificateRemoved){
				return res.status(404).send({
					status: 'error',
					message: 'No se ha borrado el certificado'
				});
			}

			if(certificateRemoved){

				// DEVOLVER RESPUESTA
				return res.status(200).send({
					status: 'success',
					certificate: certificateRemoved
				});

			}
			

		});

	},

	update: function(req, res){

		// RECOGER EL ID DEL CERTIFICADO DE LA URL
		var certificateId = req.params.id;

		// RECOGER LOS DATOS QUE LLEGAN DESDE POST
		var params = req.body;

		// VALIDAR DATOS
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_description = !validator.isEmpty(params.description);

		}catch(err){

			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_title && validate_description){
			// MONTAR UN JSON CON LOS DATOS MODIFICABLES
			var update = {
				title: params.title,
				description: params.description
			};

			// FIND AND UPDATE DEL CERTIFICADO POR ID
			Certificate.findOneAndUpdate({_id: certificateId}, update, {new:true}, (err, certificateUpdated) => {
				
				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});
				}

				if(!certificateUpdated){
					return res.status(404).send({
						status: 'error',
						message: 'No se ha actualizado el certificado'
					});
				}

				// DEVOLVER RESPUESTA
				return res.status(200).send({
					status: 'success',
					certificate: certificateUpdated
				});

			});

		}else{
			return res.status(200).send({
				status: 'error',
				message: 'La validacion de los datos no es correcta'
			});
		}

	}


};

module.exports = controller;