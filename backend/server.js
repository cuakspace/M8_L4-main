require("dotenv").config();

const express = require("express");
const path = require("path");
const { sequelize } = require("./src/config/database");

require("./src/models");

const autoresRoutes = require("./src/routes/autores.routes");
const librosRoutes = require("./src/routes/libros.routes");

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../frontend/public");

app.use(express.json());
app.use(express.static(publicPath));

app.use("/autores", autoresRoutes);
app.use("/libros", librosRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" });
});

app.use((error, _req, res, _next) => {
  if (error.status === 400 || error.name === "MulterError") {
    return res.status(400).json({ ok: false, mensaje: error.message });
  }

  console.error(error);
  return res.status(500).json({
    ok: false,
    mensaje: "Ocurrió un error interno en el servidor",
  });
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Servidor disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible conectar con la base de datos:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
