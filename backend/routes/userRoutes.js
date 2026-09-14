const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

    if (!name || !email || !password) {
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

    const newUser = new User({
      name,
      email,
      password,
      phone,
      address,
      city,
      birthdate
    });

    await newUser.save();

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: newUser
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al registrar usuario"
    });
  }
});


// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Contraseña incorrecta"
      });
    }

    res.json({
      message: "Autenticación correcta",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error en el login"
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
      error: "Error al obtener el perfil"
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
      error: "Error al actualizar el perfil"
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // Comprobar contraseña actual
    if (user.password !== currentPassword) {
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

    user.password = newPassword;

    await user.save();

    res.json({
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al cambiar la contraseña"
    });
  }
});


module.exports = router;