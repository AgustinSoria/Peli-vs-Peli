var controlador = require('./controlador/controlador');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/generos', controlador.mostrarGeneros);
app.get('/directores', controlador.mostrarDirectores);
app.get('/actores', controlador.mostrarActores);


app.get('/competencias/:id/peliculas', controlador.randomizarPeliculas);

app.post('/competencias/:id/voto', controlador.votar);
app.get('/competencias/:id/resultados', controlador.mostrarResultados);

app.get('/competencias/:id', controlador.cargarNombre);

app.get('/competencias', controlador.buscarCompetencias);

app.post('/competencias', controlador.crearNuevaCompetencia);
app.put('/competencias/:id', controlador.editarCompetencia);

app.delete('/competencias/:id/votos', controlador.eliminarVotos);
app.delete('/competencias/:id', controlador.eliminarCompetencia);

var puerto = 8080;

app.listen(puerto, function () {
    console.log("Escuchando en el puerto " + puerto);
});
