'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Modelo de Imagenes de un desarrollo
var Images_devSchema = Schema({
	title: String,
	image: String
});

var Images_dev = mongoose.model('Images_dev', Images_devSchema);

// Modelo de un desarrollo
var DevSchema = Schema({
	title: String,
	detail: String,
	repo: String,
	images: [Images_devSchema],
	video: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dev', DevSchema);