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

      // Sumar las cantidades de todos los productos
      const total = carrito.reduce(
        (acc, item) => acc + (item.cantidad || 1),
        0
      );

      setCantidad(total);
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
  const [usuario, setUsuario] = useState(
    localStorage.getItem("sesion")
  );
  const [nombreUsuario, setNombreUsuario] = useState(
    localStorage.getItem("nombreUsuario")
  );
  const [rol, setRol] = useState(
    localStorage.getItem("rol")
  );

  // 🔥 Actualizar sesión cuando el usuario inicia sesión
  useEffect(() => {
    const actualizarSesion = () => {
      setUsuario(localStorage.getItem("sesion"));
      setNombreUsuario(localStorage.getItem("nombreUsuario"));
      setRol(localStorage.getItem("rol"));
    };

    window.addEventListener(
      "sesionActualizada",
      actualizarSesion
    );

    return () => {
      window.removeEventListener(
        "sesionActualizada",
        actualizarSesion
      );
    };
  }, []);

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("sesion");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
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

              {/* 👑 Solo lo ve el administrador */}
              {rol === "admin" && (
                <Link
                  to="/admin"
                  className="menu-opcion"
                  onClick={() => setMenuAbierto(false)}
                >
                  <span className="menu-icono">
                    👑
                  </span>

                  <span>
                    Panel admin
                  </span>
                </Link>
              )}

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