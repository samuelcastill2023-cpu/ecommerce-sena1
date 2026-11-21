const mongoose = require("mongoose");

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
