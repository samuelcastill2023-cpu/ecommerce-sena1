import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

function Navbar() {
  const [cantidad, setCantidad] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Actualizar carrito
  useEffect(() => {
    const actualizarCarrito = () => {
      const carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];

      setCantidad(carrito.length);
    };

    actualizarCarrito();

    window.addEventListener(
      "carritoActualizado",
      actualizarCarrito
    );

    return () => {
      window.removeEventListener(
        "carritoActualizado",
        actualizarCarrito
      );
    };
  }, []);

  // Sesión
  const usuario = localStorage.getItem("sesion");
  const nombreUsuario =
    localStorage.getItem("nombreUsuario");

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("sesion");
    localStorage.removeItem("nombreUsuario");
    window.location.reload();
  };

  return (
    <>
      <nav>
        <div className="nav-container">

          {/* BOTÓN MENÚ */}
          <button
            className="menu-toggle"
            onClick={() => setMenuAbierto(true)}
          >
            ☰
          </button>

          {/* LOGO */}
          <Link
            to="/productos"
            className="logo-container"
          >
            <img
              src={logo}
              alt="Logo Ecommerce"
              className="logo-img"
            />

            <h2 className="logo-text">
              Ecommerce
            </h2>
          </Link>

          {/* OPCIONES SUPERIORES */}
          <ul className="nav-links">

            <li>
              <Link to="/productos">
                Productos
              </Link>
            </li>

            <li>
              <Link
                to="/carrito"
                className="carrito-link"
              >
                Carrito 🛒{" "}
                <span className="contador">
                  {cantidad}
                </span>
              </Link>
            </li>

            {usuario && (
              <li className="usuario">
                Hola, {nombreUsuario} 👋
              </li>
            )}

          </ul>

        </div>
      </nav>

      {/* FONDO OSCURO */}
      {menuAbierto && (
        <div
          className="menu-overlay"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* MENÚ LATERAL */}
      <aside
        className={
          menuAbierto
            ? "menu-lateral menu-lateral-abierto"
            : "menu-lateral"
        }
      >

        {/* CABECERA */}
        <div className="menu-lateral-header">

          <div>
            <h2>Mi cuenta</h2>

            {usuario && (
              <p>
                {nombreUsuario || "Usuario"}
              </p>
            )}
          </div>

          <button
            className="menu-cerrar"
            onClick={() => setMenuAbierto(false)}
          >
            ×
          </button>

        </div>

        {/* OPCIONES */}
        <div className="menu-opciones">

          {usuario ? (
            <>
              <Link
                to="/perfil"
                className="menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  👤
                </span>

                <span>
                  Mi perfil
                </span>
              </Link>

              <Link
                to="/mis-pedidos"
                className="menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  📦
                </span>

                <span>
                  Mis pedidos
                </span>
              </Link>

              <button
                className="menu-opcion menu-logout"
                onClick={cerrarSesion}
              >
                <span className="menu-icono">
                  🚪
                </span>

                <span>
                  Cerrar sesión
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="menu-opcion"
              onClick={() => setMenuAbierto(false)}
            >
              <span className="menu-icono">
                🔐
              </span>

              <span>
                Iniciar sesión
              </span>
            </Link>
          )}

        </div>

      </aside>
    </>
  );
}

export default Navbar;