const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true
    },

    precio: {
      type: Number,
      required: true,
      min: 0 // 🚫 No se permiten precios negativos
    },

    imagen: {
      type: String
    },

    categoria: {
      type: String,
      required: true
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);
