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
    modificationDate: null,
    movieCount: null,
    movies: null
};

const list_of_fields = ['year', 'movieLinks', 'tags', 'poster', 'href', 'name',
        'originalName', 'synopsis', 'cast', 'genres', 'length'];
/*
    con la ruta que esta a continuacion se realiza una busqueda por anio para que regrese todas las peliculas de ese anio.
*/
router.get('/:year', function(req, res) {
    ModeloPeliculas.find( { year: req.params.year }, function(err, movies) {
        if (err) {
          setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
          res.send(response);
        }
        if (!movies || movies.length < 1) {
            setResponse("Error", {message: 'No se encontraron peliculas de este año.'});
        } else {
            setResponse("Success", { message: 'Se encontraron peliculas con exito.', year: req.params.year, modification_date: req.body.modification_date, count: movies.length, movies: movies });
        }
        res.send(response);
    });
});

router.get('/links/name/:name/year/:year', function(req, res) {
    ModeloPeliculas.findOne( { name: decodeURIComponent(req.params.name), year: req.params.year }, function(err, movie) {
        if (err) {
          setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
          res.send(response);
        }
        if (!movie) {
            setResponse("Error", {message: 'No se encontraron peliculas de este año.'});
            res.send(response);
        } else {
           res.send({status: 'Success', message: 'Links Obtenidos Con Exito.', links: movie.movieLinks});
        }
    });
});

router.get('/links/all', function(req, res) {
    ModeloPeliculas.find( {}, function(err, movies) {
        if (err) {
            setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
            res.send(response);
        }
        if (movies.length < 1) {
            setResponse("Error", {message: 'No se encontraron peliculas.'});
        } else {
            let links = [];
            movies.forEach( movie => {
                let links_relation = {name: '', year: 0, links_movie: []};
                links_relation.name = movie.name;
                links_relation.year = movie.year;
                movie.movieLinks.forEach( link => {
                    links_relation.links_movie.push(link);
                });
                links.push(links_relation);
            });
            let linksResponse = { status: 'Success', message: 'Se encontraron los links', moviesLinks: links };
            res.send(linksResponse);
        }
    });
});

router.put('/links/update_links', function(req, res) {
    ModeloPeliculas.findOne( { year: req.body.year, name: req.body.name }, function(err, movie) {
        if (err) {
            setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
            res.send(response);
        }
        if (!movie) {
            setResponse("Error", {message: 'No se encontro esa pelicula.'});
        } else {
            console.log(movie.name);
            console.log(movie.year);
            // se obtienen los arreglos que se utilizaran para modificar los links de la pelicula
            let requestAddLinks = JSON.parse(req.body.linksUp);
            let requestDeleteLinks = JSON.parse(req.body.linksDown);
            // se usa el ordenamiento bubble sort para ordenar los indices de los elementos eliminar.
            for (let i = 0; i < requestDeleteLinks.length; i++) {
                for (let j = 0; j < requestDeleteLinks.length - i - 1; j++) {
                    if (requestDeleteLinks[j] > requestDeleteLinks[j+1]) {
                        let temp = requestDeleteLinks[j+1];
                        requestDeleteLinks[j+1] = requestDeleteLinks[j];
                        requestDeleteLinks[j] = temp;
                    }
                } 
            }
            // Se ua la variable countErased para llevar la cuenta de cuantos se han eliminado y poder mover el indice del arreglo al sacar un elemento.
            let countErased = 0;
            requestDeleteLinks.forEach( index => {
                let i = index - countErased;
                if (movie.movieLinks.indexOf(i) != null) {
                    console.log('removed: '+movie.movieLinks.splice(i, 1));
                }
                countErased += 1;
            });
            requestAddLinks.forEach( link => {
                if (!movie.movieLinks.includes(link)) {
                    console.log('Added: '+link);
                    movie.movieLinks.push(link);
                }
            }); 
            movie.modificationDate = req.body.date;
            movie.save();
            setResponse("Success", {message: 'Se actualizaron los links de la pelicula con exito.'});
        }
        res.send(response);
    });
});

router.post('/save', function(req, res) {
    var movie_list = convertJsonToList(JSON.parse(req.body.movies), req.body.count);
    const peliculas = new Set();
    movie_list.forEach( mov => {
	if (!peliculas.has(mov['name'])) {
	  peliculas.add(mov['name']);
	  ModeloPeliculas.findOne( { year: mov['year'], name: mov['name'] }, function(err, movie) {
            if (err) {
                setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
                res.send(response);
            }
            if (!movie) {
		// si no se encuentra en la base de datos entonces de procede a crear una nueva instancia.
                var new_movie = new ModeloPeliculas({ year: mov['year'], movieLinks: mov['movieLinks'], tags: mov['tags'],
                    poster: mov['poster'], href: mov['href'], name: mov['name'], originalName: mov['originalName'],
                    synopsis: mov['synopsis'], cast: mov['cast'], genres: mov['genres'], length: mov['length'], modificationDate: req.body.date });
                new_movie.save();
            } else {
                // si se encuentra la pelicula, entonces se determina que datos pueden ser modificados.
                if (mov['tags'] != '') 
                    movie.tags = mov['tags'];
                if (mov['poster'] != '') 
                    movie.poster = mov['poster'];
                if (mov['cast'] != '') 
                    movie.cast = mov['cast'];
                if (mov['genres'] != '') 
                    movie.genres = mov['genres'];
                movie.modificationDate = req.body.date;
                try{
                    mov['movieLinks'].forEach( link => {
                        if (!movie.movieLinks.includes(link))
                            movie.movieLinks.push(link);
                    });
                } catch(exceoption) { // si entra aqui es por que estaba vacio el campo de los links
                }
                movie.save();
            }
        });
	}
    });
    setResponse("Success", { message: 'Se realizo la modificacion a las peliculas con exito.' });
    res.send(response);
});

router.delete('/delete_links', function(req, res) {
    ModeloPeliculas.findOne( { year: req.body.year, name: req.body.name }, function(err, movie) {
        if (err) {
            setResponse("Error", { message: 'Ocurrio un error con el servidor:' + JSON.stringify(err) });        
            res.send(response);
        }
        if (!movie) {
            setResponse("Error", {message: 'No se pudieron eliminar los links.'});
        } else {
            movie.modificationDate = req.body.date;
            movie.movieLinks = [];
            movie.save();
            setResponse("Success", {message: 'Se eliminaron los links de la pelicula con exito.'});
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
            try{
                movie[field] = movies[x][field];
            } catch(exception) {
                movie[field] = "";
            }
        });
        list.push(movie);
    }
    return list;
}

function setResponse(status, data) {
    if (status == "Error" || data.year == undefined) {
        response.year = undefined;
        response.modificationDate = undefined;
        response.movieCount = undefined;
        response.movies = undefined;
    } else {
        response.year = data.year;
        response.modificationDate = data.modificationDate;
        response.movieCount = data.count;
        response.movies = data.movies;
    }
    response.message = data.message;
    response.status = status;
}

module.exports = router;
