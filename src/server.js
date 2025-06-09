const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa el paquete cors
const { Client } = require('pg');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();

app.use(cors()); // Usa cors para permitir solicitudes desde cualquier origen
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Permite recibir JSON en el body


// Configura express-session (requerido por passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Inicializa passport
app.use(passport.initialize());
app.use(passport.session());

// Serialización del usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


// Configura estrategia de Google
passport.use(new GoogleStrategy({
 clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const nombre_fono = profile.displayName;

  try {
    const result = await client.query('SELECT id_fono FROM fonoaudiologo WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      profile.id_fono = result.rows[0].id_fono;
    } else {
      const insert = await client.query(
  'INSERT INTO fonoaudiologo (nombre_fono, email, contraseña) VALUES ($1, $2, $3) RETURNING id_fono',
  [nombre_fono, email, 'google-oauth']
);

      profile.id_fono = insert.rows[0].id_fono;
    }

    return done(null, profile);
  } catch (error) {
    console.error('Error en Google login:', error);
    return done(error, null);
  }
}));

// Configura los detalles de conexión
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


client.connect()
    .then(() => console.log('Conectado a PostgreSQL'))
    .catch(err => console.error('Error de conexión', err.stack));

// Ruta para manejar el envío del formulario
app.post('/submit', (req, res) => {
    const { nombre, dni, edad, id_fono } = req.body; // ← incluir id_fono
    const query = 'INSERT INTO paciente (paciente_nombre, paciente_dni, paciente_edad, id_fono) VALUES ($1, $2, $3, $4) RETURNING id_paciente';
    const values = [nombre, dni, edad, id_fono];

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
    const idFono = req.query.id_fono; // Lo que envía el frontend

    if (!idFono) {
        return res.status(400).json({ error: 'Falta el parámetro id_fono' });
    }

    const query = `
        SELECT DISTINCT paciente_nombre, paciente_dni, paciente_edad
        FROM paciente
        WHERE id_fono = $1
    `;

    client.query(query, [idFono], (err, result) => {
        if (err) {
            console.error('Error ejecutando la consulta para obtener pacientes', err.stack);
            res.status(500).json({ error: 'Error al obtener los pacientes' });
        } else {
            res.status(200).json(result.rows);
        }
    });
});



app.post('/register', async (req, res) => {
  const { nombre_fono, email, password } = req.body;

  try {
    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await client.query(
      'INSERT INTO fonoaudiologo (nombre_fono, email, contraseña) VALUES ($1, $2, $3) RETURNING *',
      [nombre_fono, email, hashedPassword]
    );

    res.json({ success: true });
  } catch (error) {
    if (error.code === '23505') {
      return res.json({ success: false, message: 'El email ya está registrado.' });
    }
    console.error('Error en el registro:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
   const result = await client.query(
  'SELECT id_fono, nombre_fono, contraseña FROM fonoaudiologo WHERE email = $1',
  [email]
);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Verifica la contraseña con el hash almacenado
      const passwordMatch = await bcrypt.compare(password, user.contraseña);

      if (passwordMatch) {
        return res.json({ 
          success: true,
          id_fono: user.id_fono, 
          nombre_fono: user.nombre_fono ?? ''
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Credenciales incorrectas (contraseña no coincide)' 
        });
      }
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas (email no existe)' 
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor' 
    });
  }
});


app.post('/juegos', (req, res) => {
  const { id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto } = req.body;

  const query = `
    INSERT INTO juegos (id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto) 
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto];

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
    client.query('SELECT paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto FROM juegos WHERE id_paciente = $1', [id_paciente], (err, result) => {
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
app.get('/buscar-paciente', async (req, res) => {
  const query = req.query.query;

  try {
    const result = await client.query(
      `SELECT id_paciente, paciente_nombre, paciente_edad, paciente_dni 
       FROM paciente 
       WHERE paciente_dni ILIKE $1 OR paciente_nombre ILIKE $2`,
      [`%${query}%`, `%${query}%`] // ❗ Comodines % para búsqueda parcial
    );

    if (result.rows.length > 0) {
      res.json(result.rows); // Devuelve array de pacientes
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar el paciente' });
  }
});
// Ruta para iniciar login con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback (donde Google redirige al usuario)
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback (donde Google redirige al usuario)
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  async (req, res) => {
    try {
      const id_fono = req.user.id_fono; // viene del profile.id_fono
      const nombre_fono = req.user.displayName;
      const email = req.user.emails[0].value;

      // Nota: si querés, puedes evitar insertar aquí porque ya lo hiciste en la estrategia

      res.redirect(`http://127.0.0.1:5501/public/fonoaudiologo/html/google-login-success.html?id_fono=${encodeURIComponent(id_fono)}&nombre_fono=${encodeURIComponent(nombre_fono)}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error en callback Google:', error);
      res.status(500).send('Error en el servidor');
    }
  }
);
app.get('/paciente', async (req, res) => {
  const id_paciente = req.query.id_paciente;

  if (!id_paciente) {
    return res.status(400).json({ error: 'id_paciente requerido' });
  }

  try {
    const result = await client.query(
      'SELECT paciente_nombre, paciente_edad FROM paciente WHERE id_paciente = $1',
      [id_paciente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener paciente por ID', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

