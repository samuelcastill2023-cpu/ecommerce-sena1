import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

function Navbar() {
  const [cantidad, setCantidad] = useState(0);

  // 🔥 Actualizar carrito
  useEffect(() => {
    const actualizarCarrito = () => {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      setCantidad(carrito.length);
    };

    actualizarCarrito();

    window.addEventListener("carritoActualizado", actualizarCarrito);

    return () => {
      window.removeEventListener("carritoActualizado", actualizarCarrito);
    };
  }, []);

  // 🔥 Leer sesión
  const usuario = localStorage.getItem("sesion");

  // 🔥 Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("sesion");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/login" className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <h2 className="logo-text">Ecommerce</h2>
        </Link>

        <ul className="nav-links">
          <li><Link to="/productos">Productos</Link></li>
          <li>
            <Link to="/carrito" className="carrito-link">
              Carrito 🛒 <span className="contador">{cantidad}</span>
            </Link>
          </li>

          {usuario ? (
            <>
              <li className="usuario">Hola, {usuario}</li>
              <li>
                <button className="btn-logout" onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;