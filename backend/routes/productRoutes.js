const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");

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

// 👑 ADMIN: CREAR PRODUCTO
router.post("/", verificarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, precio, imagen, categoria } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({
        message: "Faltan datos del producto"
      });
    }

    if (Number(precio) <= 0) {
      return res.status(400).json({
        message: "El precio debe ser mayor a 0"
      });
    }

    const nuevoProducto = new Product({
      nombre,
      precio: Number(precio),
      imagen,
      categoria
    });

    await nuevoProducto.save();

    res.status(201).json({
      message: "Producto creado correctamente",
      producto: nuevoProducto
    });

  } catch (error) {
    console.error("Error al crear producto:", error);

    res.status(500).json({
      message: "Error al crear el producto"
    });
  }
});

// 👑 ADMIN: EDITAR PRODUCTO
router.put("/:id", verificarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, precio, imagen, categoria } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({
        message: "Faltan datos del producto"
      });
    }

    if (Number(precio) <= 0) {
      return res.status(400).json({
        message: "El precio debe ser mayor a 0"
      });
    }

    const producto = await Product.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    producto.nombre = nombre;
    producto.precio = Number(precio);
    producto.imagen = imagen;
    producto.categoria = categoria;

    await producto.save();

    res.json({
      message: "Producto actualizado correctamente",
      producto
    });

  } catch (error) {
    console.error("Error al editar producto:", error);

    res.status(500).json({
      message: "Error al editar el producto"
    });
  }
});

// 👑 ADMIN: ELIMINAR PRODUCTO
router.delete("/:id", verificarToken, esAdmin, async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    res.json({
      message: "Producto eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar producto:", error);

    res.status(500).json({
      message: "Error al eliminar el producto"
    });
  }
});

module.exports = router;
