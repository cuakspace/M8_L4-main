const { ValidationError } = require("sequelize");
const { Autor, Libro } = require("../models");
const { eliminarPortada } = require("../helpers/portadas");

const incluirAutor = {
  model: Autor,
  as: "autor",
  attributes: ["id", "nombre"],
};

const idValido = (id) => Number.isInteger(id) && id > 0;

function obtenerDatos(req) {
  const autorId = req.body.autorId
    ? Number(req.body.autorId)
    : null;

  return {
    titulo: req.body.titulo?.trim(),
    year: Number(req.body.year),
    autorId,
  };
}

function datosValidos({ titulo, year, autorId }) {
  return (
    titulo &&
    Number.isInteger(year) &&
    (autorId === null || idValido(autorId))
  );
}

async function buscarAutor(autorId) {
  if (autorId) return Autor.findByPk(autorId);

  const [anonimo] = await Autor.findOrCreate({
    where: { nombre: "Anónimo" },
  });

  return anonimo;
}

async function listarLibros(_req, res, next) {
  try {
    const libros = await Libro.findAll({
      include: incluirAutor,
      order: [["id", "ASC"]],
    });

    return res.json({ ok: true, data: libros });
  } catch (error) {
    return next(error);
  }
}

async function guardarLibro(req, res, next) {
  const editando = Boolean(req.params.id);
  const id = editando ? Number(req.params.id) : null;
  const datos = obtenerDatos(req);

  const solicitudInvalida =
    !datosValidos(datos) ||
    (editando && !idValido(id)) ||
    (!editando && !req.file);

  if (solicitudInvalida) {
    await eliminarPortada(req.file?.filename);

    return res.status(400).json({
      ok: false,
      mensaje: "Los datos del libro son inválidos",
    });
  }

  try {
    const [libro, autor] = await Promise.all([
      editando ? Libro.findByPk(id) : null,
      buscarAutor(datos.autorId),
    ]);

    if (editando && !libro) {
      await eliminarPortada(req.file?.filename);

      return res.status(404).json({
        ok: false,
        mensaje: "Libro no encontrado",
      });
    }

    if (!autor) {
      await eliminarPortada(req.file?.filename);

      return res.status(404).json({
        ok: false,
        mensaje: "Autor no encontrado",
      });
    }

    const portadaAnterior = libro?.portada;

    const valores = {
      ...datos,
      autorId: autor.id,
      portada: req.file
        ? `/uploads/${req.file.filename}`
        : portadaAnterior,
    };

    const resultado = editando
      ? await libro.update(valores)
      : await Libro.create(valores);

    if (editando && req.file) {
      eliminarPortada(portadaAnterior).catch(console.error);
    }

    return res.status(editando ? 200 : 201).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    await eliminarPortada(req.file?.filename);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        ok: false,
        mensaje: "Los datos del libro son inválidos",
      });
    }

    return next(error);
  }
}

async function eliminarLibro(req, res, next) {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      ok: false,
      mensaje: "ID inválido",
    });
  }

  try {
    const libro = await Libro.findByPk(id);

    if (!libro) {
      return res.status(404).json({
        ok: false,
        mensaje: "Libro no encontrado",
      });
    }

    await libro.destroy();
    eliminarPortada(libro.portada).catch(console.error);

    return res.json({ ok: true, data: libro });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarLibros,
  crearLibro: guardarLibro,
  actualizarLibro: guardarLibro,
  eliminarLibro,
};