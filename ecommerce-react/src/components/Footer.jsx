import { Link } from "react-router-dom";
import { FiTruck, FiShield, FiCreditCard } from "react-icons/fi";
import logo from "../assets/eMarketPro-logo-blanco.png";

function Footer() {
  return (
    <footer className="footer">

      {/* ===== BENEFICIOS ===== */}
      <div className="footer-beneficios">
        <div>
          <FiTruck />
          <span>Envío gratis desde $150.000</span>
        </div>

        <div>
          <FiCreditCard />
          <span>Nequi, Daviplata, PSE, tarjeta o contra entrega</span>
        </div>

        <div>
          <FiShield />
          <span>Compra segura</span>
        </div>
      </div>

      {/* ===== COLUMNAS ===== */}
      <div className="footer-columnas">
        <div>
          <img src={logo} alt="eMarketPro" className="footer-logo" />
          <p>Ropa, calzado y accesorios para toda la familia.</p>
        </div>

        <div>
          <h4>Tienda</h4>
          <Link to="/productos">Todos los productos</Link>
          <Link to="/productos?genero=Hombre">Hombre</Link>
          <Link to="/productos?genero=Mujer">Mujer</Link>
        </div>

        <div>
          <h4>Mi cuenta</h4>
          <Link to="/perfil">Mi perfil</Link>
          <Link to="/mis-pedidos">Mis pedidos</Link>
          <Link to="/carrito">Carrito</Link>
        </div>
      </div>

      <p className="footer-copy">© 2026 eMarketPro · Proyecto SENA ADSO</p>

    </footer>
  );
}

export default Footer;
