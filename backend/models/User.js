const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // 🔒 No devolver la contraseña en las consultas
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  birthdate: {
    type: Date,
    required: true
  },
  rol: {
    type: String,
    enum: ["cliente", "admin"],
    default: "cliente" // 👤 Todo usuario nuevo es cliente
  },
  // 🔑 Para "olvidé mi contraseña" (el token se guarda cifrado)
  resetToken: {
    type: String,
    select: false
  },
  resetExpira: {
    type: Date
  }
});

module.exports = mongoose.model("User", UserSchema);