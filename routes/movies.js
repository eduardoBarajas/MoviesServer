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

const list_of_fields = ['anio', 'links_videos', 'tags', 'poster', 'href', 'nombre',
        'titulo_original', 'sinopsis', 'reparto', 'generos', 'duracion'];

/*
    con la ruta que esta a continuacion se realiza una busqueda por anio para que regrese todas las peliculas de ese anio.
*/
router.get('/:year', function(req, res) {
    ModeloPeliculas.find( { year: req.params.year }, function(err, movies) {
        if (err) {
          setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
          res.send(response);
        }
        if (!movies) {
            setResponse("Error", {message: 'No se encontraron peliculas de este año.'});
        } else {
            setResponse("Success", { message: 'Se encontraron peliculas con exito.', year: req.params.year, modification_date: req.body.modification_date, count: movies.length, movies: movies });
        }
        res.send(response);
    });
});

router.post('/save', function(req, res) {
    var movie_list = convertJsonToList(JSON.parse(req.body.movies), req.body.count);
    movie_list.forEach( mov => {
        ModeloPeliculas.findOne( { year: mov['anio'], name: mov['nombre'] }, function(err, movie) {
            if (err) {
                setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
                res.send(response);
            }
            if (!movie) {
                // si no se encuentra en la base de datos entonces de procede a crear una nueva instancia.
                var new_movie = new ModeloPeliculas({ year: mov['anio'], movie_links: mov['links_videos'], tags: mov['tags'],
                    poster: mov['poster'], href: mov['href'], name: mov['nombre'], original_name: mov['titulo_original'],
                    synopsis: mov['sinopsis'], cast: mov['reparto'], genres: mov['generos'], lenght: mov['duracion'], modification_date: req.body.date });
                new_movie.save();
            } else {
                // si se encuentra la pelicula, entonces se determina que datos pueden ser modificados.
                if (mov['tags'] != '') 
                    movie.tags = mov['tags'];
                if (mov['poster'] != '') 
                    movie.poster = mov['poster'];
                if (mov['reparto'] != '') 
                    movie.cast = mov['reparto'];
                if (mov['generos'] != '') 
                    movie.genres = mov['generos'];
                movie.modification_date = req.body.date;
                mov['links_videos'].forEach( link => {
                    if (!movie.movie_links.includes(link))
                        movie.movie_links.push(link);
                });
                movie.save();
            }
        });
    });
    setResponse("Success", { message: 'Se realizo la modificacion a las peliculas con exito.' });
    res.send(response);
});

router.put('/update_links', function(req, res) {
    ModeloPeliculas.findOne( { year: req.body.year, name: req.body.name }, function(err, movie) {
        if (err) {
            setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
            res.send(response);
        }
        if (!movie) {
            setResponse("Error", {message: 'No se pudieron actualizar los links.'});
        } else {
            movie.modification_date = req.body.date;
            movie.movie_links = JSON.parse(req.body.links);
            movie.save();
            setResponse("Success", {message: 'Se actualizaron los links de la pelicula con exito.'});
        }
        res.send(response);
    });
});


/*
    La funcion convertJsonToList convierte un objecto del tipo json a una lista de diccionarios.
*/
function convertJsonToList(movies, size) {
    var list = [];
    for (let x = 0; x < size; x++) {
        let movie = {};
        list_of_fields.forEach( field => {
            movie[field] = movies[x][field];
        });
        list.push(movie);
    }
    return list;
}

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
