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
router.post('/project', md_auth.authenticated, DevController.save);
router.get('/projects', DevController.getDevs);
router.get('/project/:id', DevController.getDev);
router.delete('/project/:id', md_auth.authenticated, DevController.delete);
router.put('/project/:id', md_auth.authenticated, DevController.update);

module.exports = router;