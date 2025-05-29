# Proyecto Fonoaudiología

Este proyecto contiene una aplicación web interactiva para ejercicios de fonoaudiología con diferentes actividades como ruletas de personajes, objetos y lugares.

## Requisitos previos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 o superior)
- Navegador web moderno (Chrome, Firefox, Edge)

## Instalación

Sigue estos pasos para inicializar el proyecto en tu máquina:

### 1. Clonar o descargar el repositorio

```bash
# Si usas Git
git clone [URL_DEL_REPOSITORIO]

# O simplemente descarga y descomprime el proyecto
```

### 2. Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias como Express, CORS y pg (PostgreSQL).

### 3. Configurar la base de datos

1. Asegúrate de tener PostgreSQL instalado y en ejecución
2. Crea una base de datos llamada 'fono'
3. Ejecuta el script SQL para crear las tablas necesarias:

```bash
psql -U postgres -d fono -f script_db.sql
```

4. Si es necesario, modifica las credenciales de la base de datos en el archivo `server.js`:

```javascript
const client = new Client({
    user: 'postgres',      // Cambia según tu configuración
    host: 'localhost',     // Cambia según tu configuración
    database: 'fono',      // Nombre de la base de datos
    password: 'admin',     // Cambia según tu configuración
    port: 5432,            // Puerto predeterminado de PostgreSQL
});
```

### 4. Iniciar el servidor

Ejecuta el siguiente comando para iniciar el servidor:

```bash
node server.js
```

El servidor debería estar ejecutándose en http://localhost:3000 (o el puerto configurado).

### 5. Acceder a la aplicación

Abre tu navegador web y navega a:

- Página principal: `index.html`
- Actividad de Semántica: `semantica_v2.html`
- Actividad de Fonología: `fonologia.html`
- Actividad de Fonética: `fonetica.html`
- Actividad de Pragmática: `pragmatica.html`

## Estructura del proyecto

- `*.html` - Archivos de las diferentes actividades
- `server.js` - Servidor Express para la API
- `dbConnection.js` - Configuración de conexión a la base de datos
- `script_db.sql` - Script para crear las tablas en la base de datos
- `images/` - Carpeta con imágenes utilizadas en las actividades

## Dependencias principales

- [Bootstrap 5.3.2](https://getbootstrap.com/) - Framework CSS para el diseño
- [Express](https://expressjs.com/) - Framework para el servidor web
- [pg](https://node-postgres.com/) - Cliente PostgreSQL para Node.js
- [CORS](https://www.npmjs.com/package/cors) - Middleware para habilitar CORS

## Notas adicionales

- Para ejecutar el proyecto sin servidor, simplemente abre los archivos HTML directamente en tu navegador.
- Si necesitas modificar estilos, estos se encuentran dentro de las etiquetas `<style>` en cada archivo HTML.
- Las imágenes utilizadas en las ruletas se encuentran en la carpeta `images/`.

## Solución de problemas

- Si tienes problemas de conexión con la base de datos, verifica que PostgreSQL esté en ejecución y que las credenciales sean correctas.
- Si las imágenes no se cargan, verifica que la estructura de carpetas sea correcta y que los archivos existan en las rutas especificadas.
- Para problemas con el servidor, revisa la consola donde se ejecuta Node.js para ver posibles errores.