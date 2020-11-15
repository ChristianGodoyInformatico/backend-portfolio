'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

	test: function(req, res){
		return res.status(200).send({
			message: 'Hola que tal desde topics'
		});
	},


	save: function(req, res){
		// RECOGER PARAMETROS POR POST
		var params = req.body;

		// VALIDAR DATOS
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);

		}catch(err){

			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_title && validate_content){
			// CREAR OBJETO A GUARDAR
			var topic = new Topic();

			// ASIGNAR VALORES
			topic.title = params.title;
			topic.content = params.content;
			topic.user = req.user.sub;

			// GUARDAR EL TOPIC
			topic.save((err, topicStored) => {

				if(err || !topicStored){

					return res.status(404).send({
						status: 'error',
						message: 'El tema no se ha guardado'
					});

				}

				// DEVOLVER RESPUESTA
				return res.status(200).send({
					status: 'success',
					topic: topicStored
				});

			});	

		}else{

			return res.status(200).send({
				message: 'Los datos no son validos'
			});

		}

	},


	getTopics: function(req, res){

		// CARGAR LA LIBRERIA DE PAGINACION EN LA CLASE (modelo de topic)

		// RECOGER LA PAGINA ACTUAL
		if(!req.params.page || req.params.page == 0 || req.params.page == '0' || req.params.page == null || req.params.page == undefined){
			var page = 1;
		}else{
			var page = parseInt(req.params.page);
		}

		// INDICAR LAS OPCIONES DE PAGINACION
		var options = {
			sort: { date: -1 },
			populate: 'user',
			limit: 5,
			page: page
		}

		// FIND PAGINADO
		Topic.paginate({}, options, (err, topics) => {

			if(err){

				return res.status(500).send({
					status: 'error',
					message: 'Error al hacer la consulta'
				});

			}

			if(!topics){

				return res.status(500).send({
					status: 'error',
					message: 'No existen publicaciones'
				});

			}

			// DEVOLVER RESULTADO (TOPICS, TOTAL DE TOPIC, TOTAL DE PAGINAS)
			return res.status(200).send({
				status: 'success',
				topics: topics.docs,
				totalDocs: topics.totalDocs,
				totalPages: topics.totalPages
			});

		});

	},


	getTopicsByUser: function(req, res){

		// CONSEGUIR EL ID DEL USUARIO
		var userId = req.params.user;

		// FIND CON UNA CONDICION DE USUARIO
		Topic.find({
			user: userId
		})
		.sort([['date', 'descending']])
		.exec((err, topics) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topics){
				return res.status(500).send({
					status: 'error',
					message: 'No hay temas para mostrar'
				});
			}

			// DEVOLVER RESPUESTA
			return res.status(200).send({
				status: 'success',
				topics
			});

		});

	},


	getTopic: function(req, res){

		// SACAR EL ID DEL TOPIC DE LA URL
		var topicId = req.params.id;

		// FIND POR EL ID DEL TOPIC
		Topic.findById(topicId)
		.populate('user')
		.populate('comments.user')
		.exec((err, topic) => {

			if(err){

				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});

			}

			if(!topic){

				return res.status(404).send({
					status: 'error',
					message: 'No existe el tema'
				});

			}


			// DEVOLVER RESULTADO
			return res.status(200).send({
				status: 'success',
				topic
			});

		});		

	},


	update: function(req, res){
		// RECOGER EL ID DEL TOPIC DE LA URL
		var topicId = req.params.id;

		// RECOGER LOS DATOS QUE LLEGAN DESDE POST
		var params = req.body;

		// VALIDAR DATOS
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);

		}catch(err){

			return res.status(200).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_title && validate_content){
			// MONTAR UN JSON CON LOS DATOS MODIFICABLES
			var update = {
				title: params.title,
				content: params.content
			};

			// FIND AND UPDATE DEL TOPIC POR ID Y POR ID DE USUARIO
			Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdated) => {
				
				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'
					});
				}

				if(!topicUpdated){
					return res.status(404).send({
						status: 'error',
						message: 'No se ha actualizado el tema'
					});
				}

				// DEVOLVER RESPUESTA
				return res.status(200).send({
					status: 'success',
					topic: topicUpdated
				});

			});

		}else{
			return res.status(200).send({
				status: 'error',
				message: 'La validacion de los datos no es correcta'
			});
		}

	},


	delete: function(req, res){
		// SACAR EL ID DEL TOPIC DE LA URL
		var topicId = req.params.id;

		// FIND AND DELETE POR TOPICID Y POR USERID
		Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topicRemoved){
				return res.status(404).send({
					status: 'error',
					message: 'No se ha borrado el tema'
				});
			}

			// DEVOLVER RESPUESTA
			return res.status(200).send({
				status: 'success',
				topic: topicRemoved
			});

		});

	},


	search: function(req, res){

		// SACAR STRING A BUSCAR DE LA URL
		var searchString = req.params.search;

		// FIND OR
		Topic.find({ "$or": [
			{ "title": { "$regex": searchString, "$options": "i" } },
			{ "content": { "$regex": searchString, "$options": "i" } },
		]})
		.populate('user')
		.sort([['date', 'descending']])
		.exec((err, topics) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				})
			}

			if(!topics){
				return res.status(404).send({
					status: 'error',
					message: 'No hay temas disponibles'
				})
			}

			// DEVOLVER RESPUESTA
			return res.status(200).send({
				status: 'success',
				topics
			});

		});

		

	}


};

module.exports = controller;

