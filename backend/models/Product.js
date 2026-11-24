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
    },

    descripcion: {
      type: String,
      default: ""
    },

    genero: {
      type: String,
      enum: ["Hombre", "Mujer", "Unisex"],
      default: "Unisex"
    },

    tallas: {
      type: [String],
      default: []
    },

    colores: {
      type: [String],
      default: []
    },

    stock: {
      type: Number,
      default: 20,
      min: 0
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);
