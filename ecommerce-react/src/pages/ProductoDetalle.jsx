import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { avisoRapido, aviso } from "../avisos";
import { formatoPrecio } from "../formato";
import { agregarAlCarrito } from "../carrito";
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart, FiTruck } from "react-icons/fi";

function ProductoDetalle() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [talla, setTalla] = useState("");
  const [color, setColor] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // 📡 Cargar el producto
  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProducto({
            ...data,
            tallas: data.tallas || [],
            colores: data.colores || []
          });
        }
      } catch (error) {
        console.error(error);
        aviso("Error al conectar con el servidor", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  // ➕ Cambiar cantidad sin pasar del stock
  const cambiarCantidad = (cambio) => {
    const nueva = cantidad + cambio;

    if (nueva < 1 || nueva > producto.stock) return;

    setCantidad(nueva);
  };

  // 🛒 Agregar al carrito
  const agregar = () => {
    if (producto.tallas.length > 0 && !talla) {
      aviso("Selecciona una talla", "warning");
      return;
    }

    if (producto.colores.length > 0 && !color) {
      aviso("Selecciona un color", "warning");
      return;
    }

    agregarAlCarrito(producto, talla, color, cantidad);
    avisoRapido(`${producto.nombre} agregado al carrito`);
  };

  if (cargando) {
    return (
      <main>
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (!producto) {
    return (
      <main>
        <h2>Producto no encontrado</h2>
        <Link to="/productos">Volver a la tienda</Link>
      </main>
    );
  }

  const agotado = producto.stock === 0;

  return (
    <main className="detalle-main">

      <Link to="/productos" className="detalle-volver">
        <FiArrowLeft /> Volver a la tienda
      </Link>

      <div className="detalle-producto">

        <img src={producto.imagen} alt={producto.nombre} />

        <div className="detalle-info">
          <span className="detalle-categoria">
            {producto.categoria} · {producto.genero}
          </span>

          <h1>{producto.nombre}</h1>

          <p className="detalle-precio">{formatoPrecio(producto.precio)}</p>

          {producto.descripcion && (
            <p className="detalle-descripcion">{producto.descripcion}</p>
          )}

          {/* 👕 Tallas */}
          {producto.tallas.length > 0 && (
            <div className="detalle-opciones">
              <strong>Talla</strong>

              <div>
                {producto.tallas.map((item) => (
                  <button
                    key={item}
                    className={talla === item ? "opcion opcion-activa" : "opcion"}
                    onClick={() => setTalla(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🎨 Colores */}
          {producto.colores.length > 0 && (
            <div className="detalle-opciones">
              <strong>Color</strong>

              <div>
                {producto.colores.map((item) => (
                  <button
                    key={item}
                    className={color === item ? "opcion opcion-activa" : "opcion"}
                    onClick={() => setColor(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {agotado ? (
            <p className="etiqueta-agotado">Agotado</p>
          ) : (
            <>
              <p className="detalle-stock">
                {producto.stock <= 5
                  ? `¡Solo quedan ${producto.stock} unidades!`
                  : "Disponible"}
              </p>

              <div className="detalle-comprar">
                <div className="carrito-cantidad">
                  <button onClick={() => cambiarCantidad(-1)}><FiMinus /></button>
                  <span>{cantidad}</span>
                  <button onClick={() => cambiarCantidad(1)}><FiPlus /></button>
                </div>

                <button className="btn-agregar" onClick={agregar}>
                  <FiShoppingCart /> Agregar al carrito
                </button>
              </div>
            </>
          )}

          <p className="detalle-envio">
            <FiTruck /> Envío gratis en compras desde $150.000
          </p>
        </div>

      </div>

    </main>
  );
}

export default ProductoDetalle;
