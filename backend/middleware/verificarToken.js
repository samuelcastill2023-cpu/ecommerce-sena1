const jwt = require("jsonwebtoken");

// 🎫 Verificar token
const verificarToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Debes iniciar sesión"
    });
  }

  const token = header.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = datos;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Tu sesión expiró, inicia sesión de nuevo"
    });
  }
};

module.exports = verificarToken;
