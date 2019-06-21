var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    year: Number,
    movie_links: [String],
    tags: String,
    poster: String,
    href: String,
    name: String,
    original_name: String,
    synopsis: String,
    cast: String,
    genres: String,
    lenght: String,
    modification_date: String
});

var MovieModel = mongoose.model('Movies', schema);
module.exports = MovieModel;