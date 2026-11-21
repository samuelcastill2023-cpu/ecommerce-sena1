import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/eMarketPro-logo-blanco.png";
import { FiMenu, FiX, FiShoppingCart, FiShoppingBag, FiUser, FiPackage, FiShield, FiLogOut, FiLogIn, FiUserPlus, FiChevronDown } from "react-icons/fi";

function Navbar() {
  const [cantidad, setCantidad] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

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
            <FiMenu />
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

          {/* OPCIONES DEL CENTRO */}
          <ul className="nav-links nav-centro">

            <li>
              <Link to="/productos">
                Productos
              </Link>
            </li>

          </ul>

          {/* OPCIONES DE LA DERECHA */}
          <ul className="nav-links nav-derecha">

            <li className="solo-escritorio usuario-menu">
              {usuario ? (
                <>
                  {/* 👤 Botón que abre el menú del usuario */}
                  <button
                    className="usuario-icono"
                    title="Mi cuenta"
                    onClick={() => setMenuUsuario(!menuUsuario)}
                  >
                    <FiUser />
                    <FiChevronDown className="flecha" />
                  </button>

                  {/* Menú desplegable */}
                  {menuUsuario && (
                    <div
                      className="usuario-desplegable"
                      onClick={() => setMenuUsuario(false)}
                    >
                      <div className="usuario-datos">
                        <strong>{nombreUsuario}</strong>
                        <span>{usuario}</span>
                      </div>

                      <Link to="/perfil">
                        <FiUser /> Mi perfil
                      </Link>

                      <Link to="/mis-pedidos">
                        <FiPackage /> Mis pedidos
                      </Link>

                      {rol === "admin" && (
                        <Link to="/admin">
                          <FiShield /> Panel admin
                        </Link>
                      )}

                      <button onClick={cerrarSesion}>
                        <FiLogOut /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="usuario-icono"
                  title="Iniciar sesión"
                >
                  <FiUser />
                </Link>
              )}
            </li>

            <li>
              <Link
                to="/carrito"
                className="carrito-icono"
                title="Carrito"
              >
                <FiShoppingCart />
                <span className="contador">
                  {cantidad}
                </span>
              </Link>
            </li>

          </ul>

          {/* 📱 Carrito solo con ícono (celular y tablet) */}
          <Link
            to="/carrito"
            className="carrito-movil carrito-icono"
            title="Carrito"
          >
            <FiShoppingCart />
            <span className="contador">
              {cantidad}
            </span>
          </Link>

        </div>
      </nav>

      {/* Fondo invisible: al tocar fuera se cierra el menú del usuario */}
      {menuUsuario && (
        <div
          className="usuario-fondo"
          onClick={() => setMenuUsuario(false)}
        ></div>
      )}

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
            {usuario ? (
              <>
                <h2>Hola, {nombreUsuario || "Usuario"}</h2>
                <p>{usuario}</p>
              </>
            ) : (
              <>
                <h2>Bienvenido</h2>
                <p>Inicia sesión para comprar</p>
              </>
            )}
          </div>

          <button
            className="menu-cerrar"
            onClick={() => setMenuAbierto(false)}
          >
            <FiX />
          </button>

        </div>

        {/* OPCIONES */}
        <div className="menu-opciones">

          <Link
            to="/productos"
            className="menu-opcion"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="menu-icono">
              <FiShoppingBag />
            </span>

            <span>
              Productos
            </span>
          </Link>

          <Link
            to="/carrito"
            className="menu-opcion"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="menu-icono">
              <FiShoppingCart />
            </span>

            <span>
              Carrito ({cantidad})
            </span>
          </Link>

          {usuario ? (
            <>
              <Link
                to="/perfil"
                className="menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  <FiUser />
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
                  <FiPackage />
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
                    <FiShield />
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
                  <FiLogOut />
                </span>

                <span>
                  Cerrar sesión
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  <FiLogIn />
                </span>

                <span>
                  Iniciar sesión
                </span>
              </Link>

              <Link
                to="/register"
                className="menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span className="menu-icono">
                  <FiUserPlus />
                </span>

                <span>
                  Registrarse
                </span>
              </Link>
            </>
          )}

        </div>

      </aside>
    </>
  );
}

export default Navbar;