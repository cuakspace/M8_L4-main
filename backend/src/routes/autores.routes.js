const { Router } = require("express");

const {
  listarAutores,
  crearAutor,
  actualizarAutor,
  eliminarAutor,
} = require("../controllers/autores.controller");

const router = Router();

router.get("/", listarAutores);
router.post("/", crearAutor);
router.put("/:id", actualizarAutor);
router.delete("/:id", eliminarAutor);

module.exports = router;