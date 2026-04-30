const express = require("express");

const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, city, birthdate } = req.body;

    // Validación básica
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Faltan datos obligatorios"
      });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe"
      });
    }

    // Crear usuario
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
      message: "Usuario guardado correctamente",
      user: newUser
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al guardar usuario"
    });
  }
});

module.exports = router;