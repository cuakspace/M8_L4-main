const {
  UniqueConstraintError,
  ValidationError,
} = require("sequelize");

const { Autor, Libro } = require("../models");
const { eliminarPortada } = require("../helpers/portadas");

const idValido = (id) => Number.isInteger(id) && id > 0;

async function listarAutores(_req, res, next) {
  try {
    const autores = await Autor.findAll({
      include: {
        model: Libro,
        as: "libros",
        attributes: ["id", "titulo"],
      },
      order: [["id", "ASC"]],
    });

    return res.json({
      ok: true,
      data: autores,
    });
  } catch (error) {
    return next(error);
  }
}

async function guardarAutor(req, res, next) {
  const editando = Boolean(req.params.id);
  const id = editando ? Number(req.params.id) : null;
  const nombre = req.body.nombre?.trim();

  if (!nombre || (editando && !idValido(id))) {
    return res.status(400).json({
      ok: false,
      mensaje: "El ID o el nombre del autor son inválidos",
    });
  }

  try {
    const autor = editando
      ? await Autor.findByPk(id)
      : null;

    if (editando && !autor) {
      return res.status(404).json({
        ok: false,
        mensaje: "Autor no encontrado",
      });
    }

    const resultado = editando
      ? await autor.update({ nombre })
      : await Autor.create({ nombre });

    return res.status(editando ? 200 : 201).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        ok: false,
        mensaje: "El autor ya está registrado",
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        ok: false,
        mensaje: "El nombre del autor es inválido",
      });
    }

    return next(error);
  }
}

async function eliminarAutor(req, res, next) {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      ok: false,
      mensaje: "ID inválido",
    });
  }

  try {
    const autor = await Autor.findByPk(id, {
      include: {
        model: Libro,
        as: "libros",
        attributes: ["portada"],
      },
    });

    if (!autor) {
      return res.status(404).json({
        ok: false,
        mensaje: "Autor no encontrado",
      });
    }

    const portadas = autor.libros.map(
      ({ portada }) => portada
    );

    await autor.destroy();

    await Promise.allSettled(
      portadas.map(eliminarPortada)
    );

    return res.json({
      ok: true,
      data: autor,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarAutores,
  crearAutor: guardarAutor,
  actualizarAutor: guardarAutor,
  eliminarAutor,
};