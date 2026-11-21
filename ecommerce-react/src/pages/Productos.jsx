import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // 📡 Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        if (res.ok) {
          setProductos(data);
        }

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

  // 🔍 Buscar productos por nombre
  const encontrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main>
      <h2>Productos</h2>

      <input
        className="buscador"
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {productos.length > 0 && encontrados.length === 0 && (
        <p>No se encontraron productos.</p>
      )}

      {categorias.map(cat => {
        const lista = encontrados.filter(p => p.categoria === cat);
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