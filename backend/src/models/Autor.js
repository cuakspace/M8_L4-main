const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Autor = sequelize.define(
  "Autor",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: "autores",
    timestamps: false,
  }
);

module.exports = Autor;