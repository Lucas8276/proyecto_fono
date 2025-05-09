CREATE TABLE fonoaudiologo (
    id_fono SERIAL PRIMARY KEY,
    nombre_fono VARCHAR(100),
    email VARCHAR(100),
    contraseña VARCHAR(100)
);

CREATE TABLE paciente (
    id_paciente SERIAL PRIMARY KEY,
    paciente_nombre VARCHAR(100),
    paciente_dni VARCHAR(100),
    paciente_edad INTEGER,
    paciente_juego VARCHAR(100),
    paciente_resultado VARCHAR(100)
);