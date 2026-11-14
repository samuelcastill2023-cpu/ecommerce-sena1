const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// 🛍️ OBTENER TODOS LOS PRODUCTOS
router.get("/", async (req, res) => {
  try {
    const productos = await Product.find();

    res.json(productos);

  } catch (error) {
    console.error("Error al obtener productos:", error);

    res.status(500).json({
      message: "Error al obtener los productos"
    });
  }
});

module.exports = router;
