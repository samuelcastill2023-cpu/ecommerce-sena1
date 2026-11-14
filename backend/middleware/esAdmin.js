// 👑 Revisar que el usuario sea administrador
// (se usa después de verificarToken)
const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({
      message: "Solo un administrador puede hacer esto"
    });
  }

  next();
};

module.exports = esAdmin;
