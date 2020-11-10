'use strict'

var express = require('express');
var DevController = require('../controllers/dev');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

// RUTAS DE PRUEBA
router.get('/prob', DevController.probando);

// RUTAS DE DESARROLLOS
router.post('/dev', DevController.save);
router.get('/proyectos', DevController.getDevs);

module.exports = router;