import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Productos() {
  const [categorias, setCategorias] = useState([]);
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

        // 🏷️ Cargar categorías (solo se usan los nombres)
        const resCategorias = await fetch(`${API_URL}/api/categories`);
        const dataCategorias = await resCategorias.json();

        if (resCategorias.ok) {
          setCategorias(dataCategorias.map((categoria) => categoria.nombre));
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

    alert(`${producto.nombre} agregado al carrito`);
  };

  return (
    <main>
      <h2>Productos</h2>
      {categorias.map(cat => {
        const lista = productos.filter(p => p.categoria === cat);
        // No mostrar categorías sin productos
        if (lista.length === 0) return null;

        return (
          <section key={cat} className="categoria">
            <h3>{cat}</h3>

            <div className="grid-productos">
              {lista.map(producto => (
                <div className="producto" key={producto._id}>
                  <img src={producto.imagen} alt={producto.nombre} />
                  <h3>{producto.nombre}</h3>
                  <p>${producto.precio.toLocaleString()}</p>
                  <button onClick={() => agregarAlCarrito(producto)}>Agregar al carrito</button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

export default Productos;