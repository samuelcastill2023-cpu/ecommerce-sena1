const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verificarToken = require("../middleware/verificarToken");
const esAdmin = require("../middleware/esAdmin");
const crypto = require("crypto");
const { enviarCorreo, plantilla } = require("../utils/enviarCorreo");

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://visionary-starship-b15a52.netlify.app";

// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      birthdate
    } = req.body;

    // Validar que lleguen todos los datos
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !city ||
      !birthdate
    ) {
      return res.status(400).json({
        message: "Faltan datos obligatorios"
      });
    }

    // 📧 Validar formato del correo
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(email)) {
      return res.status(400).json({
        message: "El correo no es válido"
      });
    }

    // 🔒 Validar largo de la contraseña
    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe"
      });
    }

    // 🔒 Cifrar la contraseña antes de guardarla
    const passwordCifrada = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: passwordCifrada,
      phone,
      address,
      city,
      birthdate
    });

    await newUser.save();

    // 📧 Correo de bienvenida
    await enviarCorreo(
      email,
      "¡Bienvenido a eMarketPro!",
      plantilla(
        "¡Hola, " + name + "! 👋",
        "<p>Tu cuenta fue creada correctamente. Ya puedes iniciar sesión y empezar a comprar.</p>" +
        '<p><a href="' + FRONTEND_URL + '/productos" style="background:#111111;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">Ver productos</a></p>'
      )
    );

    res.status(201).json({
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al registrar usuario"
    });
  }
});


// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // 🔒 Comparar la contraseña escrita con la cifrada
    const passwordCorrecta = await bcrypt.compare(password, user.password);

    if (!passwordCorrecta) {
      return res.status(401).json({
        message: "Contraseña incorrecta"
      });
    }

    user.password = undefined;

    // 🎫 Crear el token con el id y el rol del usuario
    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Autenticación correcta",
      token,
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error en el login"
    });
  }
});


// 👤 OBTENER PERFIL
router.get("/profile/:email", verificarToken, async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // 🚫 Solo puedes ver o cambiar tu propia cuenta
    if (user._id.toString() !== req.usuario.id) {
      return res.status(403).json({
        message: "No tienes permiso para esta cuenta"
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener el perfil"
    });
  }
});


// ✏️ ACTUALIZAR PERFIL
router.put("/profile/:email", verificarToken, async (req, res) => {
  try {
    const { email } = req.params;

    const {
      name,
      newEmail,
      phone,
      address,
      city
    } = req.body;

    // Buscar usuario actual
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // 🚫 Solo puedes ver o cambiar tu propia cuenta
    if (user._id.toString() !== req.usuario.id) {
      return res.status(403).json({
        message: "No tienes permiso para esta cuenta"
      });
    }

    // 📧 Comprobar si el nuevo correo ya pertenece a OTRO usuario
    if (newEmail && newEmail !== email) {

      const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!formatoCorreo.test(newEmail)) {
        return res.status(400).json({
          message: "El correo no es válido"
        });
      }

      const emailExists = await User.findOne({
        email: newEmail
      });

      if (emailExists) {
        return res.status(400).json({
          message: "El correo electrónico ya está registrado"
        });
      }

      user.email = newEmail;
    }

    // Actualizar información personal
    user.name = name;
    user.phone = phone;
    user.address = address;
    user.city = city;

    await user.save();

    res.json({
      message: "Perfil actualizado correctamente",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al actualizar el perfil"
    });
  }
});


// 🔐 CAMBIAR CONTRASEÑA
router.put("/change-password/:email", verificarToken, async (req, res) => {
  try {
    const { email } = req.params;

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // 🚫 Solo puedes ver o cambiar tu propia cuenta
    if (user._id.toString() !== req.usuario.id) {
      return res.status(403).json({
        message: "No tienes permiso para esta cuenta"
      });
    }

    // Comprobar contraseña actual
    const passwordActualCorrecta = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordActualCorrecta) {
      return res.status(400).json({
        message: "La contraseña actual es incorrecta"
      });
    }

    // Comprobar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Las nuevas contraseñas no coinciden"
      });
    }

    // 🔒 Validar largo de la nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 6 caracteres"
      });
    }

    // Evitar colocar la misma contraseña
    if (newPassword === currentPassword) {
      return res.status(400).json({
        message: "La nueva contraseña debe ser diferente"
      });
    }

    // 🔒 Guardar la nueva contraseña cifrada
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al cambiar la contraseña"
    });
  }
});


// 👑 ADMIN: VER TODOS LOS USUARIOS
router.get("/", verificarToken, esAdmin, async (req, res) => {
  try {
    const usuarios = await User.find().sort({ name: 1 });

    res.json(usuarios);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los usuarios"
    });
  }
});


// 👑 ADMIN: CAMBIAR ROL DE UN USUARIO
router.put("/:id/rol", verificarToken, esAdmin, async (req, res) => {
  try {
    const { rol } = req.body;

    if (rol !== "cliente" && rol !== "admin") {
      return res.status(400).json({
        message: "Rol no válido"
      });
    }

    if (req.params.id === req.usuario.id) {
      return res.status(400).json({
        message: "No puedes cambiar tu propio rol"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    user.rol = rol;

    await user.save();

    res.json({
      message: "Rol actualizado correctamente",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al cambiar el rol"
    });
  }
});


// 🔑 OLVIDÉ MI CONTRASEÑA
router.post("/forgot-password", async (req, res) => {
  const respuesta = {
    message: "Si el correo está registrado, te enviamos un enlace para cambiar la contraseña"
  };

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Escribe tu correo"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json(respuesta);
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetExpira = Date.now() + 60 * 60 * 1000; // ⏰ vence en 1 hora

    await user.save();

    const enlace = FRONTEND_URL + "/restablecer/" + token;

    await enviarCorreo(
      user.email,
      "Restablecer contraseña - eMarketPro",
      plantilla(
        "Restablecer contraseña",
        "<p>Hola, " + user.name + ". Recibimos una solicitud para cambiar tu contraseña.</p>" +
        '<p><a href="' + enlace + '" style="background:#111111;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">Cambiar contraseña</a></p>' +
        "<p>El enlace vence en 1 hora. Si no fuiste tú, ignora este correo.</p>"
      )
    );

    res.json(respuesta);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al procesar la solicitud"
    });
  }
});


// 🔑 RESTABLECER CONTRASEÑA
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Completa los dos campos"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden"
      });
    }

    const tokenCifrado = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: tokenCifrado,
      resetExpira: { $gt: Date.now() } // que no haya vencido
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace no es válido o ya venció"
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = undefined;
    user.resetExpira = undefined;

    await user.save();

    res.json({
      message: "Contraseña actualizada correctamente, ya puedes iniciar sesión"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al restablecer la contraseña"
    });
  }
});


module.exports = router;