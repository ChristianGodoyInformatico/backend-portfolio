'use strict'

// REQUIRES
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

// EJECUTAR EXPRESS
var app = express();

// CARGAR ARCHIVOS DE RUTAS
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');
var dev_routes = require('./routes/dev');
var img_dev_routes = require('./routes/img_dev');
var certificate_routes = require('./routes/certificate');

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// REESCRIBIR RUTAS
app.use('/', express.static('client', {redirect: false}));
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);
app.use('/api', dev_routes);
app.use('/api', img_dev_routes);
app.use('/api', certificate_routes);

app.get('*', function(req, res, next){
	res.sendFile(path.resolve('client/index.html'));
});

// EXPORTAR EL MODULO
module.exports = app;
