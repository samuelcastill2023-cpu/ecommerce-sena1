const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    numeroPedido: {
      type: String,
      required: true,
      unique: true
    },

    usuario: {
      name: {
        type: String,
        required: true
      },

      email: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      }
    },

    productos: [
      {
        nombre: {
          type: String,
          required: true
        },

        precio: {
          type: Number,
          required: true
        },

        imagen: {
          type: String
        }
      }
    ],

    total: {
      type: Number,
      required: true
    },

    metodoPago: {
      type: String,
      required: true
    },

    estado: {
      type: String,
      default: "Pedido recibido"
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", OrderSchema);