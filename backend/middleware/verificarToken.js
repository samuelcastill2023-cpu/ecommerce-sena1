const jwt = require("jsonwebtoken");

// 🎫 Revisar que la petición traiga un token válido
const verificarToken = (req, res, next) => {
  // El token llega así: "Bearer eyJhbGciOi..."
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Debes iniciar sesión"
    });
  }

  const token = header.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar el id y el rol para usarlos en la ruta
    req.usuario = datos;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Tu sesión expiró, inicia sesión de nuevo"
    });
  }
};

module.exports = verificarToken;
