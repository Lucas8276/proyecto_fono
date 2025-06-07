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
     id_fono INTEGER NOT NULL,  -- Relación obligatoria con un fonoaudiólogo
    CONSTRAINT fk_fono
        FOREIGN KEY (id_fono)
        REFERENCES fonoaudiologo(id_fono)
        ON DELETE RESTRICT  -- Evita eliminar un fonoaudiólogo con pacientes asignados
);

-- Tabla de juegos asociados a pacientes
CREATE TABLE juegos (
    id_juego SERIAL PRIMARY KEY,
    id_paciente INTEGER REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    paciente_juego VARCHAR(100),
    paciente_resultado VARCHAR(100),
    paciente_acierto INTEGER,
    paciente_desacierto INTEGER
);


