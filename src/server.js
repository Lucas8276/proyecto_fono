const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const { getClient } = require('./dbConnection');


const app = express();


app.use(express.static(path.join(__dirname, '../public')));
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const { getClient } = require('./dbConnection');


const saltRounds = 10;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const nombre_fono = profile.displayName;
  try {
    // Usa el cliente global conectado
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

// Creamos un cliente y lo conectamos una vez
const client = getClient();

client.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error de conexión', err.stack));

// --- Rutas ---

app.post('/submit', async (req, res) => {
  const { nombre, dni, edad, id_fono } = req.body;
  const query = 'INSERT INTO paciente (paciente_nombre, paciente_dni, paciente_edad, id_fono) VALUES ($1, $2, $3, $4) RETURNING id_paciente';
  const values = [nombre, dni, edad, id_fono];
  try {
    const result = await client.query(query, values);
    res.status(200).json({ id_paciente: result.rows[0].id_paciente });
  } catch (err) {
    console.error('Error ejecutando la consulta', err.stack);
    res.status(500).send('Error al guardar los datos');
  }
});

app.get('/paciente-id', async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.status(400).json({ error: 'DNI requerido' });
  try {
    const result = await client.query('SELECT id_paciente FROM paciente WHERE paciente_dni = $1', [dni]);
    if (result.rows.length === 0) return res.json({});
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar el paciente' });
  }
});

app.get('/pacientes', async (req, res) => {
  const idFono = req.query.id_fono;
  if (!idFono) return res.status(400).json({ error: 'Falta el parámetro id_fono' });
  const query = `
    SELECT DISTINCT paciente_nombre, paciente_dni, paciente_edad
    FROM paciente
    WHERE id_fono = $1
  `;
  try {
    const result = await client.query(query, [idFono]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error ejecutando la consulta para obtener pacientes', err.stack);
    res.status(500).json({ error: 'Error al obtener los pacientes' });
  }
});

app.post('/register', async (req, res) => {
  const { nombre_fono, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await client.query(
      'INSERT INTO fonoaudiologo (nombre_fono, email, contraseña) VALUES ($1, $2, $3) RETURNING *',
      [nombre_fono, email, hashedPassword]
    );
    res.json({ success: true });
  } catch (error) {
    if (error.code === '23505') {
      return res.json({ success: false, message: 'El email ya está registrado.' });
    }
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
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
      const passwordMatch = await bcrypt.compare(password, user.contraseña);
      if (passwordMatch) {
        return res.json({ success: true, id_fono: user.id_fono, nombre_fono: user.nombre_fono ?? '' });
      } else {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas (contraseña no coincide)' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas (email no existe)' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/juegos', async (req, res) => {
  const { id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto } = req.body;
  const query = `
    INSERT INTO juegos (id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto) 
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [id_paciente, paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto];
  try {
    await client.query(query, values);
    res.status(200).send('Resultado guardado exitosamente');
  } catch (err) {
    console.error('Error guardando el resultado del juego', err.stack);
    res.status(500).send('Error al guardar el resultado del juego');
  }
});

app.get('/juegos-por-paciente', async (req, res) => {
  const id_paciente = req.query.id_paciente;
  if (!id_paciente) return res.status(400).json({ error: 'id_paciente requerido' });
  try {
    const result = await client.query(
      'SELECT paciente_juego, paciente_resultado, paciente_acierto, paciente_desacierto FROM juegos WHERE id_paciente = $1',
      [id_paciente]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar los juegos' });
  }
});

app.get('/buscar-paciente', async (req, res) => {
  const query = req.query.query;
  try {
    const result = await client.query(
      `SELECT id_paciente, paciente_nombre, paciente_edad, paciente_dni 
       FROM paciente 
       WHERE paciente_dni ILIKE $1 OR paciente_nombre ILIKE $2`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(result.rows.length > 0 ? result.rows : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar el paciente' });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    try {
      const id_fono = req.user.id_fono;
      const nombre_fono = req.user.displayName;
      const email = req.user.emails[0].value;

      res.redirect(`http://127.0.0.1:5501/public/fonoaudiologo/html/google-login-success.html?id_fono=${encodeURIComponent(id_fono)}&nombre_fono=${encodeURIComponent(nombre_fono)}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error en callback Google:', error);
      res.status(500).send('Error en el servidor');
    }
  }
);

app.get('/paciente', async (req, res) => {
  const id_paciente = req.query.id_paciente;
  if (!id_paciente) return res.status(400).json({ error: 'id_paciente requerido' });

  try {
    const result = await client.query('SELECT paciente_nombre, paciente_edad FROM paciente WHERE id_paciente = $1', [id_paciente]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener paciente por ID', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
