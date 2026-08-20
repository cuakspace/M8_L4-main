const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Libro = sequelize.define(
  "Libro",
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    portada: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    autorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "autor_id",
      references: {
        model: "autores",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "libros",
    timestamps: false,
  }
);

module.exports = Libro;