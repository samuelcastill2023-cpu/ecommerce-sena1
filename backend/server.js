const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/ecommerce")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.log("❌ Error MongoDB:", err));

// Rutas
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});