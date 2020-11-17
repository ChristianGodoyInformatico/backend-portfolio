'use strict'

var express = require('express');
var CertificateController = require('../controllers/certificate');

var router = express.Router();

// librerias para subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/certificates' });

// RUTAS
router.get('/prueba2', CertificateController.prueba2);
router.post('/new-certificate', CertificateController.save);
router.post('/certificate/:certificateId', md_upload, CertificateController.uploadPdf);
router.get('/pdf/:fileName', CertificateController.certificatePdf);
router.get('/certificate/:id', CertificateController.getCertificate);
router.get('/certificates', CertificateController.getCertificates);

module.exports = router;