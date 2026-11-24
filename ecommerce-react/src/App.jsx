import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import Checkout from "./pages/Checkout";
import Confirmacion from "./pages/Confirmacion";
import MisPedidos from "./components/MisPedidos";
import Admin from "./pages/Admin";
import Usuarios from "./pages/Usuarios";
import OlvidePassword from "./pages/OlvidePassword";
import RestablecerPassword from "./pages/RestablecerPassword";

import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/productos" />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/restablecer/:token" element={<RestablecerPassword />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;