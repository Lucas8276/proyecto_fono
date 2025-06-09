const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL en Render');

    // Ejemplo de consulta
    return client.query('SELECT * FROM fono');
  })
  .then(res => {
    console.log(res.rows);
  })
  .catch(err => {
    console.error('❌ Error en la conexión o consulta:', err.stack);
  })
  .finally(() => {
    client.end(); // Siempre cerrar la conexión
  });
