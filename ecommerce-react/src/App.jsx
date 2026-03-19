import Navbar from "./components/Navbar";
import Productos from "./pages/Productos";
import Login from "./pages/Login";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/carrito" element={<h1>Carrito</h1>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;