import { useEffect, useState } from "react";

function Carrito() {
  const [carrito, setCarrito] = useState([]);

  // 🔥 Cargar carrito
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(data);
  }, []);

  // 🔥 Eliminar producto
  const eliminarProducto = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
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

  const total = carrito.reduce((acc, item) => acc + item.precio, 0);

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "600px" }}>
        <h2 style={{ textAlign: "center" }}>Carrito 🛒</h2>

        {carrito.length === 0 ? (
          <p style={{ textAlign: "center" }}>Tu carrito está vacío</p>
        ) : (
          <>
            {carrito.map((producto, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "10px" }}>
                <img src={producto.imagen} width="80" />
                <div style={{ flex: 1 }}>
                  <h4>{producto.nombre}</h4>
                  <p>${producto.precio.toLocaleString()}</p>
                </div>
                <button onClick={() => eliminarProducto(index)}>❌</button>
              </div>
            ))}

            <h3 style={{ textAlign: "right" }}>Total: ${total.toLocaleString()}</h3>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={vaciarCarrito} style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", flex: 1 }}>
                Vaciar carrito 🗑️
              </button>

              <button onClick={() => { alert("Compra realizada con éxito 🎉"); localStorage.removeItem("carrito"); setCarrito([]); window.dispatchEvent(new Event("carritoActualizado")); }} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", flex: 1 }}>
                Comprar ✅
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Carrito;