const fs = require("fs/promises");
const path = require("path");

const uploadsPath = path.join(__dirname, "../../../frontend/public/uploads");

async function eliminarPortada(portada) {
  if (!portada) return;

  const filePath = path.join(uploadsPath, path.basename(portada));

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

module.exports = { eliminarPortada };