import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Productos() {
  const categorias = ["Ropa", "Calzado", "Accesorios"];
  const [indices, setIndices] = useState({ Ropa: 0, Calzado: 0, Accesorios: 0 });
  const [productos, setProductos] = useState([]);

  // 📡 Cargar productos desde la base de datos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        if (res.ok) {
          setProductos(data);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    cargarProductos();
  }, []);

  // 🔥 Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Si el producto ya está en el carrito, se le suma 1 a la cantidad
    const existente = carrito.find((item) => item._id === producto._id);

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    // 🔥 Actualizar Navbar
    window.dispatchEvent(new Event("carritoActualizado"));

    alert(`${producto.nombre} agregado al carrito 🛒`);
  };

  // 🔥 Mover carrusel
  const mover = (cat, direccion) => {
    const lista = productos.filter(p => p.categoria === cat);
    setIndices(prev => {
      let nuevo = prev[cat] + direccion;
      if (nuevo < 0) nuevo = 0;
      if (nuevo > lista.length - 3) nuevo = lista.length - 3; // <-- Cambiado a 3
      return { ...prev, [cat]: nuevo };
    });
  };

  return (
    <main>
      <h2>Productos</h2>
      {categorias.map(cat => {
        const lista = productos.filter(p => p.categoria === cat);
        return (
          <section key={cat} className="categoria">
            <h3>{cat}</h3>

            <div className="carrusel">
              <button onClick={() => mover(cat, -1)} disabled={indices[cat] === 0}>⬅️</button>

              <div className="grid-productos">
                {lista.slice(indices[cat], indices[cat] + 3).map(producto => ( // <-- Cambiado a 3
                  <div className="producto" key={producto._id}>
                    <img src={producto.imagen} alt={producto.nombre} />
                    <h3>{producto.nombre}</h3>
                    <p>${producto.precio.toLocaleString()}</p>
                    <button onClick={() => agregarAlCarrito(producto)}>Agregar al carrito</button>
                  </div>
                ))}
              </div>

              <button onClick={() => mover(cat, 1)} disabled={indices[cat] >= lista.length - 3}>➡️</button> {/* <-- Cambiado a 3 */}
            </div>
          </section>
        );
      })}
    </main>
  );
}

export default Productos;