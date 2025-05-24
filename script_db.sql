CREATE DATABASE fono;

CREATE TABLE fonoaudiologo (
    id_fono SERIAL PRIMARY KEY,
    nombre_fono VARCHAR(100),
    email VARCHAR(100),
    contraseña VARCHAR(100)
);

-- Tabla de pacientes (sin juegos)
CREATE TABLE paciente (
    id_paciente SERIAL PRIMARY KEY,
    paciente_nombre VARCHAR(100),
    paciente_dni VARCHAR(100) UNIQUE,
    paciente_edad INTEGER
);

-- Tabla de juegos asociados a pacientes
CREATE TABLE juegos (
    id_juego SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    paciente_juego VARCHAR(100),
    paciente_resultado VARCHAR(100)
);

