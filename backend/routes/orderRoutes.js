const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");

// 🛒 CREAR PEDIDO
router.post("/", verificarToken, async (req, res) => {
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
router.get("/usuario/:email", verificarToken, async (req, res) => {
  try {
    const email = req.params.email;

    // 🚫 Solo puedes ver tus propios pedidos
    const usuarioSesion = await User.findById(req.usuario.id);

    if (!usuarioSesion || usuarioSesion.email !== email) {
      return res.status(403).json({
        message: "No tienes permiso para ver estos pedidos"
      });
    }

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

// 👑 ADMIN: VER TODOS LOS PEDIDOS
router.get("/", verificarToken, esAdmin, async (req, res) => {
  try {
    const pedidos = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(pedidos);

  } catch (error) {
    console.error("Error al obtener pedidos:", error);

    res.status(500).json({
      message: "Error al obtener los pedidos"
    });
  }
});

// 👑 ADMIN: CAMBIAR ESTADO DE UN PEDIDO
router.put("/:id/estado", verificarToken, esAdmin, async (req, res) => {
  try {
    const { estado } = req.body;

    const estadosValidos = [
      "Pedido recibido",
      "En preparación",
      "Enviado",
      "Entregado",
      "Cancelado"
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado no válido"
      });
    }

    const pedido = await Order.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        message: "Pedido no encontrado"
      });
    }

    pedido.estado = estado;

    await pedido.save();

    res.json({
      message: "Estado actualizado correctamente",
      pedido
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);

    res.status(500).json({
      message: "Error al cambiar el estado"
    });
  }
});

module.exports = router;