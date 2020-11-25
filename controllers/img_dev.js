'use strict'

var validator = require('validator');
var Dev = require('../models/dev');
var fs = require('fs');
var path = require('path');

var controller = {

	probando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo probando en el controller img_dev'
		});
	},


	add: function(req, res){


		var file_name = 'Imagen no subida...';

		// RECOGER EL FICHERO DE LA PETICION
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

			// SACAR EL ID DEL PROYECTO
			var devId = req.params.devId;

			Dev.findById(devId).exec((err, dev) => {

				if(err){
					return res.status(400).send({
						status: 'error',
						message: 'Error al realizar la peticion'
					});
				}

				if(!dev){
					return res.status(404).send({
						status: 'error',
						message: 'El proyecto no existe'
					});
				}

				var image_dev = {
					image: file_name
				};

				// EN LA PROPIEDAD COMMENTS DEL OBJETO RESULTANTE HACER UN PUSH
				dev.images.push(image_dev);

				// GUARDAR EL TOPIC COMPLETO
				dev.save((err) => {

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error al guardar la imagen del proyecto'
						});
					}

					// DEVOLVER UNA RESPUESTA
					return res.status(200).send({
						status: 'success',
						dev
					});

				});


			});

		}


	},


	getImages: function(req, res){
		var fileName = req.params.fileName;
		var pathFile = './uploads/projects/'+fileName;

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

	deleteImages: function(req, res){

		var devId = req.params.id;

		Dev.findById(devId)
			.exec((err, devImg) => {

			for(var i = 0; i < devImg.images.length; i++){
				var imagen = devImg.images[i].image;
				console.log(devImg.images[i].image);
				
				var pathFile = './uploads/projects/'+imagen;
				
				fs.unlink(pathFile, (err) => {

					if(err){
						console.log('la imagen: '+imagen+' NO fue eliminada');
					}else{
						console.log('la imagen: '+imagen+' fue eliminada con exito');
					}

				});

				
			}

			return res.status(200).send({
				status: 'success',
				dev_img: devImg
			});

		});

	},

	deleteImage: function(req, res){
		var devId = req.params.devId;
		var imageId = req.params.imageId;

		Dev.findById(devId, (err, dev) => {

			if(err){

				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});

			}

			if(!dev){

				return res.status(404).send({
					status: 'error',
					message: 'No existe el proyecto'
				});

			}

			// SELECCIONANDO EL DOCUMENTO QUE SE ELIMINARÁ
			var imagenObj = dev.images.id(imageId);

			if(imagenObj){

				var image_name = imagenObj.image;
				
				var pathFile = './uploads/projects/'+image_name;
				
				// BORRAR EL ARCHIVO DE LA IMAGEN	
				fs.unlink(pathFile, (err) => {

					if(err){
						console.log('la imagen: '+image_name+' NO fue eliminada');
					}else{
						console.log('la imagen: '+image_name+' fue eliminada con exito');
					}

				});

				// BORRAR EL OBJETO DE LA IMAGEN
				imagenObj.remove();

				// GUARDAR EL NUEVO ESTADO DEL PROYECTO
				dev.save((err) => {

					if(err){

						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});

					}

					Dev.findById(devId).exec((err, dev) =>{

						if(err){

								return res.status(500).send({
									status: 'error',
									message: 'Error en la peticion'
								});

							}

						if(!dev){

							return res.status(404).send({
								status: 'error',
								message: 'No existe el tema'
							});

						}


						// DEVOLVER RESULTADO
						return res.status(200).send({
							status: 'success',
							dev
						});

					});

				});


			}else{

				return res.status(404).send({
					status: 'error',
					message: 'No existe la imagen'
				});

			}

		});

	}


};

module.exports = controller;