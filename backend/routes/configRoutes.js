const express = require("express");
const router = express.Router();

const Config = require("../models/Config");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");
const User = require("../models/User");
const { enviarCorreo, plantilla } = require("../utils/enviarCorreo");

// 👑 ADMIN: VER LA CONFIGURACIÓN DEL CORREO
// 🔒 La clave de la API nunca se envía al navegador
router.get("/correo", verificarToken, esAdmin, async (req, res) => {
  try {
    const config = await Config.findOne();

    res.json({
      remitenteEmail: config ? config.remitenteEmail : "",
      remitenteNombre: config ? config.remitenteNombre : "eMarketPro",
      apiKeyConfigurada: config ? config.brevoApiKey !== "" : false
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener la configuración"
    });
  }
});

// 👑 ADMIN: GUARDAR LA CONFIGURACIÓN DEL CORREO
router.put("/correo", verificarToken, esAdmin, async (req, res) => {
  try {
    const { brevoApiKey, remitenteEmail, remitenteNombre } = req.body;

    if (!remitenteEmail || !remitenteNombre) {
      return res.status(400).json({
        message: "Escribe el correo y el nombre del remitente"
      });
    }

    let config = await Config.findOne();

    // Si todavía no existe, se crea
    if (!config) {
      config = new Config();
    }

    config.remitenteEmail = remitenteEmail;
    config.remitenteNombre = remitenteNombre;

    // La clave solo se cambia si escriben una nueva
    if (brevoApiKey) {
      config.brevoApiKey = brevoApiKey;
    }

    await config.save();

    res.json({
      message: "Configuración guardada correctamente",
      apiKeyConfigurada: config.brevoApiKey !== ""
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al guardar la configuración"
    });
  }
});

// 👑 ADMIN: ENVIAR UN CORREO DE PRUEBA AL ADMINISTRADOR
router.post("/correo/prueba", verificarToken, esAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.usuario.id);

    await enviarCorreo(
      admin.email,
      "Correo de prueba - eMarketPro",
      plantilla(
        "¡El correo funciona! ✅",
        "<p>Si estás leyendo esto, la configuración de Brevo está correcta.</p>"
      )
    );

    res.json({
      message: "Correo de prueba enviado a " + admin.email + " (revisa también spam)"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al enviar el correo de prueba"
    });
  }
});

module.exports = router;
