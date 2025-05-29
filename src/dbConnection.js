const { Client } = require('pg');

// Configura los detalles de conexión
const client = new Client({
    user: 'postgres', // Reemplaza con tu usuario de PostgreSQL
    host: 'localhost', // Reemplaza con tu host de PostgreSQL
    database: 'fono', // Reemplaza con el nombre de tu base de datos
    password: 'admin', // Reemplaza con tu contraseña de PostgreSQL
    port: 5432, // Puerto por defecto de PostgreSQL
});

// Conecta a la base de datos
client.connect()
    .then(() => console.log('Conectado a PostgreSQL'))
    .catch(err => console.error('Error de conexión', err.stack));

// Ejemplo de consulta
client.query('SELECT * FROM fono', (err, res) => {
    if (err) {
        console.error('Error ejecutando la consulta', err.stack);
    } else {
        console.log(res.rows);
    }
    client.end(); // Cierra la conexión
});