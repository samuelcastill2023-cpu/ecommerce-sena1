import Navbar from "./components/Navbar";
import Productos from "./pages/Productos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Carrito from "./pages/Carrito";

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
      </Routes>
    </>
  );
}

export default App;