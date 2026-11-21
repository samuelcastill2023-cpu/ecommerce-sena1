const Config = require("../models/Config");

// 📧 Enviar correo con Brevo
const enviarCorreo = async (para, asunto, html) => {
  try {
    const config = await Config.findOne();

    if (!config || !config.brevoApiKey || !config.remitenteEmail) {
      console.log("Correo no enviado: falta configurar Brevo en el panel admin");
      return;
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: config.remitenteNombre,
          email: config.remitenteEmail
        },
        to: [{ email: para }],
        subject: asunto,
        htmlContent: html
      })
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Brevo respondió con error:", data.message);
    }

  } catch (error) {
    console.error("Error al enviar correo:", error.message);
  }
};

// 🎨 Plantilla de los correos
const plantilla = (titulo, contenido) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background: #111111; color: white; padding: 18px 24px; font-size: 22px; font-weight: bold;">
        eMarketPro
      </div>
      <div style="padding: 24px; color: #333; font-size: 15px; line-height: 1.5;">
        <h2 style="margin-top: 0; color: #111111;">${titulo}</h2>
        ${contenido}
      </div>
      <div style="background: #f5f5f5; color: #777; padding: 12px 24px; font-size: 12px;">
        Este correo fue enviado automáticamente por eMarketPro · Proyecto SENA ADSO
      </div>
    </div>
  `;
};

module.exports = { enviarCorreo, plantilla };
