import Navbar from "./components/Navbar";
import Productos from "./pages/Productos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import Checkout from "./pages/Checkout";
import Confirmacion from "./pages/Confirmacion";
import MisPedidos from "./components/MisPedidos";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/productos" />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
      </Routes>
    </>
  );
}

export default App;