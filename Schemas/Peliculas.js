var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    year: Number,
    movie_count: Number,
    modification_date: String,
    movies: String
});

var MovieModel = mongoose.model('Movies', schema);
module.exports = MovieModel;
