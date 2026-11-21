const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true // 🚫 No se repiten categorías
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", CategorySchema);
