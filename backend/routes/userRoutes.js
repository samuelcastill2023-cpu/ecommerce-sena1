const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, city, birthdate } = req.body;

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
    res.status(500).json({
      error: "Error en el login"
    });
  }
});

module.exports = router;