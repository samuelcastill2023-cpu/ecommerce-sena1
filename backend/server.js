const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb+srv://samuelcastill2023_db_user:Gb3hSFZnJi3h4E@cluster0.2xmiuio.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.log("❌ Error:", err));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// Puerto
const PORT = 3000;

// Levantar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
