var conexion = require('../conexionBaseDatos.js');

function buscarCompetencias(req, res) {
    var sqlQuery = `select * from competencia`;
    conexion.query(sqlQuery, function (error, resultado) {
        if (error) {
            console.log(error);
            return res.status(404).send("Hubo un error con tu consulta");
        }
        res.send(JSON.stringify(resultado));
    })
}

function randomizarPeliculas(req, res) {


    let idCompetencia = req.params.id;
    let sql = `SELECT nombre, genero_id, director_id, actor_id FROM competencia WHERE id = ${idCompetencia};`

    conexion.query(sql, function (error, resultado) {

        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        let genero = resultado[0].genero_id
        let director = resultado[0].director_id
        let actor = resultado[0].actor_id


        // el DISTINCT me elije dos distintos
        let sql =
            `   SELECT DISTINCT p.titulo, p.id, p.poster, p.genero_id FROM 
            pelicula p LEFT JOIN actor_pelicula ap ON p.id = ap.pelicula_id LEFT JOIN director_pelicula dp ON p.id = dp.pelicula_id 
            WHERE 1 = 1 
        `
        let generoSql = !genero ? " " : ` AND p.genero_id = ${genero}`
        let directorSql = !director ? " " : ` AND dp.director_id = ${director}`
        let peliculaSql = !actor ? " " : `AND ap.actor_id = ${actor}`
        let orderLimitSql = ` ORDER BY rand() limit 2;`

        let mysql = sql + generoSql + directorSql + peliculaSql + orderLimitSql;


        conexion.query(mysql, function (error, peliculas) {
            if (error) {
                console.log("Error,la competencia no existe", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            let response = {
                'peliculas': peliculas,
                'competencia': resultado[0].nombre
            }
            res.send(JSON.stringify(response));
        });
    });
}


function votar(req, res) {

    let competencia = req.params.id;
    let pelicula = req.body.idPelicula;
    let sql = `INSERT INTO voto (competencia_id, pelicula_id) values (${competencia}, ${pelicula});`

    // console.log('competencia, pelicula, sql', competencia, pelicula, sql);

    conexion.query(sql, function (error, resultado) {
        if (error) {
            console.log("Error en el envio de la votacion", error.message);
            return res.status(500).send("Hubo un error en la votacion");
        }
        let response = {
            'peliculas': resultado
        }
        res.send(JSON.stringify(response));
    });

}

function mostrarResultados(req, res) {

    let idCompetencia = req.params.id
    let sql = `SELECT * FROM competencia WHERE id=${idCompetencia};`

    conexion.query(sql, function (error, resultado) {

        if (error) {
            console.log("Error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }
        if (resultado.length === 0) {
            console.log("No existen preguntas votadas");
            return res.status(404).send("No se encontro ninguna pregunta votada")
        }
        let competencia = resultado[0].nombre;

        let sql =
            `   SELECT voto.pelicula_id, p.titulo, p.poster, COUNT(pelicula_id) as votos 
                FROM pelicula p JOIN voto ON p.id=voto.pelicula_id JOIN competencia c ON c.id = voto.competencia_id
                WHERE c.nombre = "${competencia}" GROUP BY voto.pelicula_id
                ORDER BY COUNT(pelicula_id) DESC LIMIT 3;
            `
        conexion.query(sql, function (error, resultado) {
            if (error) {
                console.log("Error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }


            let response = { //competencia y resultadoS
                "competencia": competencia,
                "resultados": resultado //dos años en darme cuenta que era resultadoS, pelotudo!
            }
            res.send(JSON.stringify(response));
        });
    })
};




function mostrarGeneros(req, res) {


    var sqlQuery = `select * from genero`;


    conexion.query(sqlQuery, function (error, resultado) {

        if (error) {
            console.log(error);
            return res.status(404).send("Hubo un error con tu consulta");
        }

        var response = resultado;
        res.send(JSON.stringify(response));

    })
}

function mostrarDirectores(req, res) {


    var sqlQuery = `select * from director`;


    conexion.query(sqlQuery, function (error, resultado) {

        if (error) {
            console.log(error);
            return res.status(404).send("Hubo un error con tu consulta");
        }

        var response = resultado;
        res.send(JSON.stringify(response));

    })
}

function mostrarActores(req, res) {


    var sqlQuery = `select * from actor`;


    conexion.query(sqlQuery, function (error, resultado) {

        if (error) {
            console.log(error);
            return res.status(404).send("Hubo un error con tu consulta");
        }

        var response = resultado;
        res.send(JSON.stringify(response));

    })
}


//COMPLETAR UNA VEZ QUE ESTEN LAS LISTAS DISPONIBLES DE GENERO,  DIRECTOR, ACTOR.

function crearNuevaCompetencia(req, res) {

    let nombre = req.body.nombre;
    // console.log('body', req.body);
    let genero = req.body.genero === "0" ? "DEFAULT" : req.body.genero;

    let director = req.body.director === "0" ? "DEFAULT" : req.body.director;
    // console.log('director', director);

    let actor = req.body.actor === "0" ? "DEFAULT" : req.body.actor;
    let sql =
        `   SELECT * FROM 
            pelicula p LEFT JOIN actor_pelicula ap ON p.id = ap.pelicula_id LEFT JOIN director_pelicula dp ON p.id = dp.pelicula_id 
            WHERE 1 = 1 
        `
    let generoSql = genero === "DEFAULT" ? " " : ` AND p.genero_id = ${genero}`
    let directorSql = director === "DEFAULT" ? " " : ` AND dp.director_id = ${director}`
    let actorSql = actor === "DEFAULT" ? " " : ` AND ap.actor_id = ${actor}`


    let mysql = sql + generoSql + directorSql + actorSql;

    conexion.query(mysql, function (error, resultado) {
        console.log('resultado', resultado);
       if (resultado === undefined || resultado.length <2 ){
       
            console.log(error);
            return res.status(422).send("No existen dos o más peliculas que cumplan con todos los filtros");

        } else {

            let sql = `INSERT INTO competencia (nombre, genero_id, director_id, actor_id)
                values ('${nombre}', ${genero}, ${director}, ${actor});`

            conexion.query(sql, function (error, resultado) {
                if (error) {
                    console.log("Error en la creacion de la nueva competencia", error.message);
                    return res.status(500).send("Hubo un error en la creacion de la nueva competencia");
                }

                res.send(JSON.stringify(resultado));

            });
        }
    });
}

function eliminarVotos(req, res) {

    let idCompetencia = req.params.id;
    let sql = `DELETE FROM voto WHERE competencia_id = ${idCompetencia}`

    conexion.query(sql, function (error, resultado) {
        if (error) {
            console.log("Hubo un error en el reinicio de los votos", error.message);
            return res.status(404).send("Hubo un error en la reiniciacion");
        }

        res.send(JSON.stringify(resultado));
    });
}

function eliminarCompetencia(req, res) {

    let idCompetencia = req.params.id;
    let sql = `DELETE FROM voto WHERE competencia_id = ${idCompetencia}`

    conexion.query(sql, function (error, resultado) {
        if (error) {
            console.log("Hubo un error en el reinicio de los votos", error.message);
            return res.status(404).send("Hubo un error en la reiniciacion");
        }
        let sql = `DELETE FROM competencia WHERE id = ${idCompetencia}`

        conexion.query(sql, function (error, resultado) {
            if (error) {
                console.log("Hubo un error en el reinicio de los votos", error.message);
                return res.status(404).send("Hubo un error en la reiniciacion");
            }
            res.send(JSON.stringify(resultado));
        });
    });
}

function editarCompetencia(req, res) {

    let idCompetencia = req.params.id;
    let nombreEditado = req.body.nombre;
    let sql = `UPDATE competencia set nombre = "${nombreEditado}" WHERE competencia.id = ${idCompetencia}`

    conexion.query(sql, function (error, resultado) {
        if (error) {
            console.log("Hubo un error para editar el nombre de la competencia", error.message);
            return res.status(404).send("Hubo un error en la reiniciacion");
        }
        res.send(JSON.stringify(resultado));
    });
}

function cargarNombre(req, res) {
    let nombreCompetencia = req.params.id;
    var sql =

        `   SELECT c.nombre , g.nombre genero, d.nombre director, a.nombre actor FROM 
        competencia c LEFT JOIN genero g ON genero_id = g.id LEFT JOIN director d ON director_id = d.id 
        LEFT JOIN actor a ON actor_id = a.id WHERE c.id = ${nombreCompetencia};
    `

    conexion.query(sql, function (error, resultado) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        //Atributos (.nombre .genero_nombre .director_nombre .actor_nombre)
        var response = {
            'nombre': resultado[0].nombre,
            'genero_nombre': resultado[0].genero,
            'director_nombre': resultado[0].director,
            'actor_nombre': resultado[0].actor
        }
        res.send(JSON.stringify(response));
    });
}



module.exports = {
    buscarCompetencias: buscarCompetencias,
    randomizarPeliculas: randomizarPeliculas,
    votar: votar,
    mostrarResultados: mostrarResultados,
    mostrarGeneros: mostrarGeneros,
    mostrarDirectores: mostrarDirectores,
    mostrarActores: mostrarActores,
    crearNuevaCompetencia: crearNuevaCompetencia,
    eliminarVotos: eliminarVotos,
    eliminarCompetencia: eliminarCompetencia,
    editarCompetencia: editarCompetencia,
    cargarNombre: cargarNombre,
};