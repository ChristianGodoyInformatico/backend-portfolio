'use strict'

var express = require('express');
var CertificateController = require('../controllers/certificate');

var router = express.Router();

// librerias para subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/certificates' });

// RUTAS
router.get('/prueba2', CertificateController.prueba2);
router.post('/nuevo-certificado', md_upload, CertificateController.save);
router.put('/certificado/:certificadoId', md_upload, CertificateController.uploadPdf);
router.get('/pdf/:fileName', CertificateController.certificatePdf);
router.get('/certificado/:certificadoId', CertificateController.getCertificate);

module.exports = router;