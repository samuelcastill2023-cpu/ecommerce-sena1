const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    // Pedir también la contraseña (está oculta en el modelo)
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

    // 🔒 Quitar la contraseña antes de responder
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
router.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
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
router.put("/profile/:email", async (req, res) => {
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

    // 📧 Comprobar si el nuevo correo ya pertenece a OTRO usuario
    if (newEmail && newEmail !== email) {

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
router.put("/change-password/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // Pedir también la contraseña (está oculta en el modelo)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // Comprobar contraseña actual
    const passwordActualCorrecta = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordActualCorrecta) {
      return res.status(401).json({
        message: "La contraseña actual es incorrecta"
      });
    }

    // Comprobar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Las nuevas contraseñas no coinciden"
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


module.exports = router;