import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* LOGO */}
        <h2 className="logo">Ecommerce</h2>

        {/* MENÚ */}
        <ul className="nav-links">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li>
            <Link to="/carrito" className="carrito-link">
              Carrito 🛒 <span className="contador">0</span>
            </Link>
          </li>
          <li><Link to="/login">Login</Link></li>
        </ul>

      </div>
    </nav>
  );
}

export default Navbar;