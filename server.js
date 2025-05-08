const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa el paquete cors
const { Client } = require('pg');

const app = express();
app.use(cors()); // Usa cors para permitir solicitudes desde cualquier origen
app.use(bodyParser.urlencoded({ extended: true }));

// Configura los detalles de conexión
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'fono',
    password: 'admin',
    port: 5432,
});

client.connect()
    .then(() => console.log('Conectado a PostgreSQL'))
    .catch(err => console.error('Error de conexión', err.stack));

// Ruta para manejar el envío del formulario
app.post('/submit', (req, res) => {
    const { nombre, dni, edad, paciente_juego, paciente_resultado } = req.body;

    const query = 'INSERT INTO paciente (paciente_nombre, paciente_edad, paciente_juego, paciente_resultado) VALUES ($1, $2, $3, $4)';
    const values = [nombre, edad, paciente_juego, paciente_resultado];

    client.query(query, values, (err) => {
        if (err) {
            console.error('Error ejecutando la consulta', err.stack);
            res.status(500).send('Error al guardar los datos');
        } else {
            res.status(200).send('Datos guardados exitosamente');
        }
    });
});

// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});