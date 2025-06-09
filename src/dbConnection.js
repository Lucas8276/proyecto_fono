// dbConnection.js
require('dotenv').config();
const { Client } = require('pg');

function getClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

async function testConnection() {
  const client = getClient();
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL correctamente');
    const res = await client.query('SELECT NOW()'); // Consulta simple para testear
    console.log('Hora del servidor:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Error en la conexión:', err.stack);
  } finally {
    await client.end();
  }
}

module.exports = { getClient, testConnection };
