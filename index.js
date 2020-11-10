'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/porta_CGV', { useNewUrlParser: true })
		.then(() => {
			console.log('La conexion a la base de datos de mongo se ha realizado de forma correcta');
		
			// CREAR EL SERVIDOR
			app.listen(port, () => {
				console.log('El servidor http://localhost:3999 se encuentra funcionando');
			});

		})
		.catch(error => console.log(error));

