'use strict'

var express = require('express');
var ImgDevController = require('../controllers/img_dev');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/projects' });

// RUTAS DE PRUEBA
router.get('/probando-img', ImgDevController.probando);
router.post('/project-img/:devId', [md_upload, md_auth.authenticated], ImgDevController.add);
router.get('/image/:fileName', ImgDevController.getImages);
router.delete('/project-images/:id',md_auth.authenticated, ImgDevController.delete);

// RUTAS DE DESARROLLOS


module.exports = router;