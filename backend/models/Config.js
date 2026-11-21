const mongoose = require("mongoose");

// ⚙️ Configuración de la tienda (por ahora, solo la del correo)
// Se guarda un único documento en la colección "configs"
const ConfigSchema = new mongoose.Schema(
  {
    brevoApiKey: {
      type: String,
      default: ""
    },

    remitenteEmail: {
      type: String,
      default: ""
    },

    remitenteNombre: {
      type: String,
      default: "eMarketPro"
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Config", ConfigSchema);
