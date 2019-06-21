var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    year: Number,
    movieLinks: [String],
    tags: String,
    poster: String,
    href: String,
    name: String,
    originalName: String,
    synopsis: String,
    cast: String,
    genres: String,
    length: String,
    modificationDate: String
});

var MovieModel = mongoose.model('Movies', schema);
module.exports = MovieModel;
