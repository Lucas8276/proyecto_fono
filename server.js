const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa el paquete cors
const { Client } = require('pg');

const app = express();
app.use(cors()); // Usa cors para permitir solicitudes desde cualquier origen
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Permite recibir JSON en el body

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
    const { nombre, dni, edad } = req.body;
    const query = 'INSERT INTO paciente (paciente_nombre, paciente_dni, paciente_edad) VALUES ($1, $2, $3) RETURNING id_paciente';
    const values = [nombre, dni, edad];
    client.query(query, values, (err, result) => {
        if (err) {
            console.error('Error ejecutando la consulta', err.stack);
            res.status(500).send('Error al guardar los datos');
        } else {
            res.status(200).json({ id_paciente: result.rows[0].id_paciente });
        }
    });
});

// Ruta para obtener todos los pacientes
app.get('/paciente-id', (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res.status(400).json({ error: 'DNI requerido' });
  }
  client.query('SELECT id_paciente FROM paciente WHERE paciente_dni = $1', [dni], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al consultar el paciente' });
    } else if (result.rows.length === 0) {
      res.json({});
    } else {
      res.json(result.rows[0]);
    }
  });
});

app.get('/pacientes', (req, res) => {
    client.query('SELECT DISTINCT paciente_nombre, paciente_dni, paciente_edad FROM paciente', (err, result) => {
        if (err) {
            console.error('Error ejecutando la consulta para obtener pacientes', err.stack);
            res.status(500).json({ error: 'Error al obtener los pacientes' });
        } else {
            res.status(200).json(result.rows);
        }
    });
});

app.post('/register', (req, res) => {
  const { nombre_fono, email, password } = req.body;
  client.query(
    'INSERT INTO fonoaudiologo (nombre_fono, email, contraseña) VALUES ($1, $2, $3) RETURNING *',
    [nombre_fono, email, password],
    (error, results) => {
      if (error) {
        if (error.code === '23505') {
          return res.json({ success: false, message: 'El email ya está registrado.' });
        }
        console.error('Error en el registro:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor.' });
      }
      res.json({ success: true });
    }
  );
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  client.query(
    'SELECT * FROM fonoaudiologo WHERE email = $1 AND contraseña = $2',
    [email, password],
    (error, results) => {
      if (error) {
        console.error('Error en la consulta de login:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor.' });
      }
      if (results.rows.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Credenciales incorrectas.' });
      }
    }
  );
});
app.post('/juegos', (req, res) => {
    const { id_paciente, paciente_juego, paciente_resultado } = req.body;
    const query = 'INSERT INTO juegos (id_paciente, paciente_juego, paciente_resultado) VALUES ($1, $2, $3)';
    const values = [id_paciente, paciente_juego, paciente_resultado];
    client.query(query, values, (err) => {
        if (err) {
            console.error('Error guardando el resultado del juego', err.stack);
            res.status(500).send('Error al guardar el resultado del juego');
        } else {
            res.status(200).send('Resultado guardado exitosamente');
        }
    });
});

// Nueva ruta para obtener juegos por paciente
app.get('/juegos-por-paciente', (req, res) => {
    const id_paciente = req.query.id_paciente;
    if (!id_paciente) {
        return res.status(400).json({ error: 'id_paciente requerido' });
    }
    client.query('SELECT paciente_juego, paciente_resultado FROM juegos WHERE id_paciente = $1', [id_paciente], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al consultar los juegos' });
        } else {
            res.json(result.rows);
        }
    });
});
// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});