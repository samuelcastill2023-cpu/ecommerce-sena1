const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { enviarCorreo, plantilla } = require("../utils/enviarCorreo");
const verificarToken = require("../middleware/verificarToken");
const esGestor = require("../middleware/esGestor");

const metodosPago = ["Nequi", "Daviplata", "PSE", "Tarjeta débito/crédito", "Contra entrega"];
const bancosPSE = ["Bancolombia", "Davivienda", "Banco de Bogotá"];

// 🚚 Envío: $10.000, gratis desde $150.000
const COSTO_ENVIO = 10000;
const ENVIO_GRATIS_DESDE = 150000;

// 🛒 CREAR PEDIDO
router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      productos,
      metodoPago,
      detallePago
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

    if (!metodosPago.includes(metodoPago)) {
      return res.status(400).json({
        message: "El método de pago no es válido"
      });
    }

    // 💳 Referencia del pago (nunca se guarda la tarjeta completa)
    let referenciaPago = "";

    if (metodoPago === "Tarjeta débito/crédito" || metodoPago === "Nequi" || metodoPago === "Daviplata") {
      if (!/^\d{4}$/.test(detallePago)) {
        return res.status(400).json({
          message: "Los datos del pago no son válidos"
        });
      }

      referenciaPago = metodoPago === "Tarjeta débito/crédito"
        ? "Tarjeta terminada en " + detallePago
        : metodoPago + " terminado en " + detallePago;
    }

    if (metodoPago === "PSE") {
      if (!bancosPSE.includes(detallePago)) {
        return res.status(400).json({
          message: "El banco no es válido"
        });
      }

      referenciaPago = "PSE - " + detallePago;
    }

    if (metodoPago === "Contra entrega") {
      referenciaPago = "Pago al recibir el pedido";
    }

    // 🔢 Crear número de pedido
    const numeroPedido = "EC-" + Date.now();

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

    const productosPedido = [];
    let subtotal = 0;

    for (const item of productos) {
      const producto = await Product.findById(item._id);

      if (!producto) {
        return res.status(400).json({
          message: "Un producto del carrito ya no existe, vacía el carrito"
        });
      }

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

      subtotal = subtotal + producto.precio * cantidad;
    }

    const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
    const total = subtotal + envio;

    // Crear pedido
    const nuevoPedido = new Order({
      numeroPedido,
      usuario,
      productos: productosPedido,
      subtotal,
      envio,
      total,
      metodoPago,
      referenciaPago
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
        "<p>Subtotal: $" + subtotal.toLocaleString("es-CO") + "<br>Envío: " + (envio === 0 ? "Gratis" : "$" + envio.toLocaleString("es-CO")) + "</p>" +
        "<p style='font-size:17px;'><strong>Total: $" + total.toLocaleString("es-CO") + "</strong></p>" +
        "<p>Método de pago: " + referenciaPago + "<br>Envío a: " + usuario.address + ", " + usuario.city + "</p>"
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

// 🏪 GESTOR: VER TODOS LOS PEDIDOS
router.get("/", verificarToken, esGestor, async (req, res) => {
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

// 🏪 GESTOR: CAMBIAR ESTADO DE UN PEDIDO
router.put("/:id/estado", verificarToken, esGestor, async (req, res) => {
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