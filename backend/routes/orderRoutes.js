const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// 🛒 CREAR PEDIDO
router.post("/", async (req, res) => {
  try {
    const {
      numeroPedido,
      usuario,
      productos,
      total,
      metodoPago
    } = req.body;

    // Validar datos principales
    if (
      !numeroPedido ||
      !usuario ||
      !productos ||
      productos.length === 0 ||
      !total ||
      !metodoPago
    ) {
      return res.status(400).json({
        message: "Faltan datos para crear el pedido"
      });
    }

    // Verificar que el número de pedido no exista
    const pedidoExistente = await Order.findOne({
      numeroPedido
    });

    if (pedidoExistente) {
      return res.status(400).json({
        message: "El número de pedido ya existe"
      });
    }

    // Crear pedido
    const nuevoPedido = new Order({
      numeroPedido,
      usuario,
      productos,
      total,
      metodoPago
    });

    // Guardar en MongoDB
    await nuevoPedido.save();

    res.status(201).json({
      message: "Pedido registrado correctamente",
      pedido: nuevoPedido
    });

  } catch (error) {
    console.error("Error al crear pedido:", error);

    res.status(500).json({
      message: "Error al registrar el pedido"
    });
  }
});

// 📦 OBTENER PEDIDOS DE UN USUARIO
router.get("/usuario/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const pedidos = await Order.find({
      "usuario.email": email
    }).sort({ createdAt: -1 });

    res.status(200).json(pedidos);

  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    res.status(500).json({
      message: "Error al obtener los pedidos"
    });
  }
});

module.exports = router;