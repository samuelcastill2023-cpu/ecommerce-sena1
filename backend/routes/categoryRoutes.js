const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const Product = require("../models/Product");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");
const categoriasIniciales = require("../data/categorias.json");

// 🏷️ OBTENER TODAS LAS CATEGORÍAS
router.get("/", async (req, res) => {
  try {
    const categorias = await Category.find().sort({ createdAt: 1 });

    res.json(categorias);

  } catch (error) {
    console.error("Error al obtener categorías:", error);

    res.status(500).json({
      message: "Error al obtener las categorías"
    });
  }
});

// 👑 ADMIN: CARGAR LAS CATEGORÍAS INICIALES (data/categorias.json)
router.post("/cargar-iniciales", verificarToken, esAdmin, async (req, res) => {
  try {
    // Solo se cargan si no hay categorías, para no duplicarlas
    const cantidad = await Category.countDocuments();

    if (cantidad > 0) {
      return res.status(400).json({
        message: "Ya existen categorías"
      });
    }

    const categorias = await Category.insertMany(categoriasIniciales);

    res.status(201).json({
      message: "Categorías cargadas correctamente",
      categorias
    });

  } catch (error) {
    console.error("Error al cargar categorías:", error);

    res.status(500).json({
      message: "Error al cargar las categorías"
    });
  }
});

// 👑 ADMIN: CREAR CATEGORÍA
router.post("/", verificarToken, esAdmin, async (req, res) => {
  try {
    const nombre = (req.body.nombre || "").trim();

    if (!nombre) {
      return res.status(400).json({
        message: "Escribe el nombre de la categoría"
      });
    }

    const existe = await Category.findOne({ nombre });

    if (existe) {
      return res.status(400).json({
        message: "La categoría ya existe"
      });
    }

    const nuevaCategoria = new Category({ nombre });

    await nuevaCategoria.save();

    res.status(201).json({
      message: "Categoría creada correctamente",
      categoria: nuevaCategoria
    });

  } catch (error) {
    console.error("Error al crear categoría:", error);

    res.status(500).json({
      message: "Error al crear la categoría"
    });
  }
});

// 👑 ADMIN: EDITAR CATEGORÍA (y sus productos)
router.put("/:id", verificarToken, esAdmin, async (req, res) => {
  try {
    const nombre = (req.body.nombre || "").trim();

    if (!nombre) {
      return res.status(400).json({
        message: "Escribe el nombre de la categoría"
      });
    }

    const categoria = await Category.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    const existe = await Category.findOne({ nombre });

    if (existe && existe._id.toString() !== categoria._id.toString()) {
      return res.status(400).json({
        message: "Ya existe otra categoría con ese nombre"
      });
    }

    const nombreAnterior = categoria.nombre;

    categoria.nombre = nombre;

    await categoria.save();

    // 🔄 Los productos de la categoría pasan al nombre nuevo
    await Product.updateMany(
      { categoria: nombreAnterior },
      { categoria: nombre }
    );

    res.json({
      message: "Categoría actualizada correctamente",
      categoria
    });

  } catch (error) {
    console.error("Error al editar categoría:", error);

    res.status(500).json({
      message: "Error al editar la categoría"
    });
  }
});

// 👑 ADMIN: ELIMINAR CATEGORÍA
router.delete("/:id", verificarToken, esAdmin, async (req, res) => {
  try {
    const categoria = await Category.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        message: "Categoría no encontrada"
      });
    }

    // 🚫 No se puede borrar si tiene productos
    const productos = await Product.countDocuments({
      categoria: categoria.nombre
    });

    if (productos > 0) {
      return res.status(400).json({
        message: "No se puede eliminar: la categoría tiene productos"
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      message: "Categoría eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar categoría:", error);

    res.status(500).json({
      message: "Error al eliminar la categoría"
    });
  }
});

module.exports = router;
