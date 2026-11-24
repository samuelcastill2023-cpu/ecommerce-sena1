// 🏪 Verificar que sea gestor de tienda o administrador
const esGestor = (req, res, next) => {
  if (req.usuario.rol !== "gestor" && req.usuario.rol !== "admin") {
    return res.status(403).json({
      message: "Solo el gestor de tienda o un administrador puede hacer esto"
    });
  }

  next();
};

module.exports = esGestor;
