const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { enviarCorreo, plantilla } = require("../utils/enviarCorreo");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");

// 🛒 CREAR PEDIDO
router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      productos,
      metodoPago
    } = req.body;

    // Validar datos principales
    if (
      !productos ||
      productos.length === 0 ||
      !metodoPago
    ) {
      return res.status(400).json({
        message: "Faltan datos para crear el pedido"
      });
    }

    // 🔢 El número de pedido lo crea el servidor
    const numeroPedido = "EC-" + Date.now();

    // 👤 Los datos del cliente salen de la BD (del token), no del navegador
    const user = await User.findById(req.usuario.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    const usuario = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city
    };

    // 💰 Los precios salen de la BD, no del navegador
    const productosPedido = [];
    let total = 0;

    for (const item of productos) {
      const producto = await Product.findById(item._id);

      if (!producto) {
        return res.status(400).json({
          message: "Un producto del carrito ya no existe, vacía el carrito"
        });
      }

      // 🔢 Cantidad de este producto (si no llega, es 1)
      const cantidad = Number(item.cantidad) || 1;

      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({
          message: "La cantidad no es válida"
        });
      }

      productosPedido.push({
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen || "",
        cantidad
      });

      total = total + producto.precio * cantidad;
    }

    // Crear pedido
    const nuevoPedido = new Order({
      numeroPedido,
      usuario,
      productos: productosPedido,
      total,
      metodoPago
    });

    // Guardar en MongoDB
    await nuevoPedido.save();

    // 📧 Correo de confirmación del pedido
    let filas = "";

    for (const item of productosPedido) {
      filas +=
        "<tr>" +
        "<td style='padding:6px 0;'>" + item.nombre + " x" + item.cantidad + "</td>" +
        "<td style='padding:6px 0; text-align:right;'>$" +
        (item.precio * item.cantidad).toLocaleString("es-CO") +
        "</td>" +
        "</tr>";
    }

    await enviarCorreo(
      usuario.email,
      "Pedido " + numeroPedido + " confirmado - eMarketPro",
      plantilla(
        "¡Gracias por tu compra, " + usuario.name + "!",
        "<p>Recibimos tu pedido <strong>" + numeroPedido + "</strong>.</p>" +
        "<table style='width:100%; border-collapse:collapse;'>" + filas + "</table>" +
        "<p style='font-size:17px;'><strong>Total: $" + total.toLocaleString("es-CO") + "</strong></p>" +
        "<p>Método de pago: " + metodoPago + "<br>Envío a: " + usuario.address + ", " + usuario.city + "</p>"
      )
    );

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