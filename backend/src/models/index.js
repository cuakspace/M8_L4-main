const Autor = require("./Autor");
const Libro = require("./Libro");

Autor.hasMany(Libro, {
  foreignKey: "autorId",
  as: "libros",
  onDelete: "CASCADE",
});

Libro.belongsTo(Autor, {
  foreignKey: "autorId",
  as: "autor",
});

module.exports = {
  Autor,
  Libro,
};