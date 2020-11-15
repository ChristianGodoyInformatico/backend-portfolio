'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CertificateSchema = Schema({
	title : String,
	description: String,
	pdf: String
});

module.exports = mongoose.model('Certificate', CertificateSchema);
