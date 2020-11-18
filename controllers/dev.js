'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var Dev = require('../models/dev');
var jwt = require('../services/jwt');

var saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

var controller = {

	probando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo probando en el controller dev'
		});
	},


	save: function(req, res){
		var params = req.body;

		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_detail = !validator.isEmpty(params.detail);
		}catch(err){

			return res.status(400).send({
				message: 'Faltan datos por enviar'
			});

		}

		if(validate_title && validate_detail){

			var dev = new Dev();

			dev.title = params.title;
			dev.detail = params.detail;
			dev.repo = params.repo;

			dev.save((err, devStored) => {

				if(err || !devStored){

					res.status(404).send({
						status: 'error',
						message: 'El desarrollo no se ha guardado'
					});

				}

				return res.status(200).send({
					status: 'success',
					dev: devStored
				});

			});

		}else{

			return res.status(400).send({
				status: 'error',
				message: 'Los datos ingresados no son validos'
			});

		}

	},


	getDevs: function(req, res){

		Dev.find().exec((err, devs) => {
			if(err || !devs){
				return res.status(404).send({
					status: 'error',
					message: 'Ocurrio un error al intentar obtener los proyectos desarrollados de la BD'
				});
			}

			return res.status(200).send({
				status: 'success',
				devs
			});

		});

	},


	getDev: function(req, res){

		var devId = req.params.id;

		Dev.findById(devId)
		.populate('images')
		.exec((err, dev) => {

			if(err || !dev){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el proyecto seleccionado'
				});
			}

			return res.status(200).send({
				status: 'success',
				dev
			});

		});	

	}



};

module.exports = controller;