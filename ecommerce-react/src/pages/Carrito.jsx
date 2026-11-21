import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiTrash2, FiCheck } from "react-icons/fi";

function Carrito() {
  // 🔥 Cargar carrito guardado
  const [carrito, setCarrito] = useState(
    JSON.parse(localStorage.getItem("carrito")) || []
  );
  const navigate = useNavigate();

  // 🔥 Eliminar producto
  const eliminarProducto = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));

    // 🔥 Actualizar Navbar
    window.dispatchEvent(new Event("carritoActualizado"));
  };

  // 🔥 Cambiar cantidad
  const cambiarCantidad = (index, cambio) => {
    const nuevo = [...carrito];
    const cantidadActual = nuevo[index].cantidad || 1;
    const nuevaCantidad = cantidadActual + cambio;

    if (nuevaCantidad < 1) return;

    nuevo[index] = { ...nuevo[index], cantidad: nuevaCantidad };
    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));

    // 🔥 Actualizar Navbar
    window.dispatchEvent(new Event("carritoActualizado"));
  };

  // 🔥 Vaciar carrito
  const vaciarCarrito = () => {
    const confirmar = confirm("¿Seguro que quieres vaciar el carrito?");
    if (!confirmar) return;

    localStorage.removeItem("carrito");
    setCarrito([]);

    // 🔥 Actualizar Navbar
    window.dispatchEvent(new Event("carritoActualizado"));
  };

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  );

  return (
    <main className="carrito-main">
      <h2>Carrito <FiShoppingCart /></h2>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <p>Tu carrito está vacío</p>

          <button
            className="btn-guardar-perfil"
            onClick={() => navigate("/productos")}
          >
            Ver productos
          </button>
        </div>
      ) : (
        <>
          {carrito.map((producto, index) => (
            <div className="carrito-item" key={index}>
              <img src={producto.imagen} alt={producto.nombre} />

              <div className="carrito-info">
                <h4>{producto.nombre}</h4>
                <p>${producto.precio.toLocaleString()}</p>
              </div>

              <div className="carrito-cantidad">
                <button onClick={() => cambiarCantidad(index, -1)}><FiMinus /></button>
                <span>{producto.cantidad || 1}</span>
                <button onClick={() => cambiarCantidad(index, 1)}><FiPlus /></button>
              </div>

              <button
                className="carrito-quitar"
                onClick={() => eliminarProducto(index)}
              >
                <FiX />
              </button>
            </div>
          ))}

          <h3 className="carrito-total">Total: ${total.toLocaleString()}</h3>

          <div className="carrito-acciones">
            <button className="btn-vaciar" onClick={vaciarCarrito}>
              <FiTrash2 /> Vaciar carrito
            </button>

            <button className="btn-comprar" onClick={() => navigate("/checkout")}>
              <FiCheck /> Comprar
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default Carrito;
