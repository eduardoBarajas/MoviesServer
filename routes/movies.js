'use strict';
var mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
const ModeloPeliculas = require('../Schemas/Peliculas');
const fs = require('fs');

const response = {
    status: '',
    message: '',
    year: null,
    modification_date: null,
    movie_count: null,
    movies: null
};

router.get('/:year', function(req, res) {
    var found = false;    
    ModeloPeliculas.find( {}, function(err, movies) {
        if (err) {
          setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
          res.send(response);
        }
        movies.forEach( movie => {
            if (movie.year == req.params.year) {
                setResponse("Success", { message: 'Se encontraron peliculas con exito.', year: movie.year, modification_date: movie.modification_date, count: movie.movie_count, movies: JSON.parse(movie.movies) });
                found = !found;
            }
        });
        if (!found) {
            setResponse("Error", {message: 'No se encontraron peliculas de este año.'});
        }
        res.send(response);
    });
});

router.post('/save', function(req, res) {
    ModeloPeliculas.find( {}, function(err, peliculas) {
      if (err) {
        setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
        res.send(response);
      }
      var found = false;
      peliculas.forEach( movie => {
        if (movie.year == req.body.year)
            found = true;
      });
      if (!found) {
        var nuevas_peliculas = new ModeloPeliculas({ year: req.body.year, movie_count: req.body.count, modification_date: req.body.date, movies: req.body.movies });
        nuevas_peliculas.save(function (err, peliculas) {
            if (err) {
                setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });
            } else {
                setResponse("Success", { message: 'Se agregaron las peliculas con exito.' });
            }
            res.send(response);
        });
      } else {
        ModeloPeliculas.updateOne({ year: req.body.year }, { movie_count: req.body.count, modification_date: req.body.date, movies: req.body.movies }, function(err) {
           if (err) {
                setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });
            } else {
                setResponse("Success", { message: 'Se actualizaron las peliculas con exito.' });
            }
            res.send(response);
        });
      }
    });
});

function setResponse(status, data) {
    if (status == "Error" || data.year == undefined) {
        response.year = undefined;
        response.modification_date = undefined;
        response.movie_count = undefined;
        response.movies = undefined;
    } else {
        response.year = data.year;
        response.modification_date = data.modification_date;
        response.movie_count = data.count;
        response.movies = data.movies;
    }
    response.message = data.message;
    response.status = status;
}

module.exports = router;
