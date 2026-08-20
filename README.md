# Biblioteca Comunitaria El Saber

CRUD de libros con Express, Sequelize, PostgreSQL y portadas administradas con
Multer. Los datos de los libros se almacenan en la base de datos; no se utiliza
`catalogo.json`.

## Estructura

```text
biblioteca-sequelize/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/libros.controller.js
│   │   ├── middlewares/portada.middleware.js
│   │   ├── models/Libro.js
│   │   └── routes/libros.routes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   └── public/
│       ├── assets/css/styles.css
│       ├── assets/js/main.js
│       ├── uploads/
│       └── index.html
└── README.md
```

## Instalación

1. En PostgreSQL crea la base de datos:

   ```sql
   CREATE DATABASE libros_db;
   ```

2. Entra a `backend` e instala las dependencias:

   ```bash
   cd backend
   npm install
   ```

3. Copia `.env.example` con el nombre `.env` y completa tus datos de PostgreSQL.

4. Inicia el proyecto:

   ```bash
   npm run dev
   ```

5. Abre <http://localhost:3000> para usar el frontend.

Sequelize crea automáticamente la tabla `libros` al iniciar el servidor. El
campo `id` no se declara en el modelo: Sequelize agrega una clave primaria
autoincremental de forma predeterminada.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| POST | `/libros` | Crear un libro |
| GET | `/libros` | Listar todos los libros |
| PUT | `/libros/:id` | Actualizar un libro |
| DELETE | `/libros/:id` | Eliminar un libro |

POST y PUT usan `multipart/form-data` para poder enviar los datos y la imagen.
Ejemplo para crear un libro:

```bash
curl -X POST http://localhost:3000/libros \
  -F 'titulo=Rayuela' \
  -F 'autor=Julio Cortázar' \
  -F 'year=1963' \
  -F 'portada=@/ruta/rayuela.jpg'
```

La aplicación responde JSON, pero no usa archivos JSON para guardar datos. Los
datos del libro y la ruta de la portada se guardan en PostgreSQL mediante
Sequelize. Multer guarda el archivo de imagen en `frontend/uploads`, siguiendo
el funcionamiento del ejemplo entregado. Se aceptan imágenes JPG, PNG y WEBP de
hasta 2 MB.
