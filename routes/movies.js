'use strict';
var express = require('express');
var router = express.Router();
const fs = require('fs');

const response = {
    status: '',
    message: '',
    data: ''
};

router.get('/:year', function(req, res) {
    let year = req.params.year;
    try {
        if (fs.existsSync('jsons/movies-'+year+'.json')) {
            let rawdata = fs.readFileSync('jsons/movies-'+year+'.json');  
            response.data = JSON.parse(rawdata); 
            response.message = 'Se obtuvieron las peliculas con exito.';
            response.status = 'Success';
        } else {
            response.message = 'No se encontro el recurso.';
            response.status = 'Error';
            response.data = '';
        }
      } catch(err) {
        response.message = 'Ocurrio un error con el servidor.';
        response.status = 'Error';
        response.data = '';
      }
      res.send(response);
});

router.post('/save', function(req, res) {
    let year = req.body.year
    try {
        fs.writeFileSync('jsons/movies-'+year+'.json', req.body.data); 
        response.message = 'Se agregaron las peliculas al archivo.';
        response.status = 'Success';
      } catch(err) {
        console.error(err);
        response.message = 'Ocurrio un error con el servidor: '+err;
        response.status = 'Error';
      }
      res.send(response);
});

module.exports = router;
