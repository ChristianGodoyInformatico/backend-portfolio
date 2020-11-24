'use strict'

var express = require('express');
var CertificateController = require('../controllers/certificate');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

// librerias para subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/certificates' });

// RUTAS
router.get('/prueba2', CertificateController.prueba2);
router.post('/new-certificate', md_auth.authenticated, CertificateController.save);
router.post('/certificate/:certificateId', [md_auth.authenticated, md_upload], CertificateController.uploadPdf);
router.get('/pdf/:fileName', CertificateController.certificatePdf);
router.get('/certificate/:id', CertificateController.getCertificate);
router.get('/certificates', CertificateController.getCertificates);
router.delete('/certificate/:id', md_auth.authenticated, CertificateController.delete);
router.put('/certificate/:id', md_auth.authenticated, CertificateController.update);


module.exports = router;