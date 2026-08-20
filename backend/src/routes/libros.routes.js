const { Router } = require("express");
const {
  listarLibros,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
} = require("../controllers/libros.controller");
const upload = require("../middlewares/portada.middleware");

const router = Router();

router.get("/", listarLibros);
router.post("/", upload.single("portada"), crearLibro);
router.put("/:id", upload.single("portada"), actualizarLibro);
router.delete("/:id", eliminarLibro);

module.exports = router;
