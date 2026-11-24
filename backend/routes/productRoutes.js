const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Category = require("../models/Category");
const verificarToken = require("../middleware/verificarToken");
const esGestor = require("../middleware/esGestor");

const generos = ["Hombre", "Mujer", "Unisex"];

// ✂️ Convertir "S, M, L" en ["S", "M", "L"]
const separarLista = (texto) => {
  if (!texto) return [];

  return String(texto)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
};
const productosIniciales = require("../data/productos.json");

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

// 🏪 GESTOR: CARGAR PRODUCTOS INICIALES
router.post("/cargar-iniciales", verificarToken, esGestor, async (req, res) => {
  try {
    const cantidad = await Product.countDocuments();

    if (cantidad > 0) {
      return res.status(400).json({
        message: "La tienda ya tiene productos"
      });
    }

    const productos = await Product.insertMany(productosIniciales);

    res.status(201).json({
      message: "Productos cargados correctamente",
      productos
    });

  } catch (error) {
    console.error("Error al cargar productos:", error);

    res.status(500).json({
      message: "Error al cargar los productos"
    });
  }
});

// 🔍 VER UN PRODUCTO
router.get("/:id", async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    res.json(producto);

  } catch (error) {
    console.error("Error al obtener producto:", error);

    res.status(404).json({
      message: "Producto no encontrado"
    });
  }
});

// 🏪 GESTOR: CREAR PRODUCTO
router.post("/", verificarToken, esGestor, async (req, res) => {
  try {
    const { nombre, precio, imagen, categoria, descripcion, genero, tallas, colores, stock } = req.body;

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

    if (stock === undefined || stock === "" || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
      return res.status(400).json({
        message: "El stock debe ser un número entero mayor o igual a 0"
      });
    }

    if (genero && !generos.includes(genero)) {
      return res.status(400).json({
        message: "El género no es válido"
      });
    }

    const categoriaExiste = await Category.findOne({ nombre: categoria });

    if (!categoriaExiste) {
      return res.status(400).json({
        message: "La categoría no existe"
      });
    }

    const nuevoProducto = new Product({
      nombre,
      precio: Number(precio),
      imagen,
      categoria,
      descripcion,
      genero: genero || "Unisex",
      tallas: separarLista(tallas),
      colores: separarLista(colores),
      stock: Number(stock)
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

// 🏪 GESTOR: EDITAR PRODUCTO
router.put("/:id", verificarToken, esGestor, async (req, res) => {
  try {
    const { nombre, precio, imagen, categoria, descripcion, genero, tallas, colores, stock } = req.body;

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

    if (stock === undefined || stock === "" || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
      return res.status(400).json({
        message: "El stock debe ser un número entero mayor o igual a 0"
      });
    }

    if (genero && !generos.includes(genero)) {
      return res.status(400).json({
        message: "El género no es válido"
      });
    }

    const categoriaExiste = await Category.findOne({ nombre: categoria });

    if (!categoriaExiste) {
      return res.status(400).json({
        message: "La categoría no existe"
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
    producto.descripcion = descripcion;
    producto.genero = genero || "Unisex";
    producto.tallas = separarLista(tallas);
    producto.colores = separarLista(colores);
    producto.stock = Number(stock);

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

// 🏪 GESTOR: ELIMINAR PRODUCTO
router.delete("/:id", verificarToken, esGestor, async (req, res) => {
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
