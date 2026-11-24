import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../config";
import { avisoRapido } from "../avisos";
import { formatoPrecio } from "../formato";
import { agregarAlCarrito } from "../carrito";

function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaElegida, setCategoriaElegida] = useState("Todas");
  const [orden, setOrden] = useState("");

  const navigate = useNavigate();

  // 👕 Género que viene del menú: /productos?genero=Hombre
  const [parametros] = useSearchParams();
  const genero = parametros.get("genero") || "";

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

  // 🔥 Agregar producto al carrito (si tiene talla o color, va al detalle)
  const agregar = (producto) => {
    if (tieneVariantes(producto)) {
      navigate(`/producto/${producto._id}`);
      return;
    }

    agregarAlCarrito(producto);
    avisoRapido(`${producto.nombre} agregado al carrito`);
  };

  // 👕 Saber si el producto tiene talla o color
  const tieneVariantes = (producto) => {
    return (producto.tallas || []).length > 0 || (producto.colores || []).length > 0;
  };

  // 🔘 Texto del botón de cada producto
  const textoBoton = (producto) => {
    if (producto.stock === 0) return "Agotado";
    if (tieneVariantes(producto)) return "Ver opciones";
    return "Agregar al carrito";
  };

  // 🔍 Buscar por nombre y filtrar por género
  const encontrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter((p) => !genero || p.genero === genero || p.genero === "Unisex");

  // ↕️ Ordenar por precio
  if (orden === "menor") {
    encontrados.sort((a, b) => a.precio - b.precio);
  }

  if (orden === "mayor") {
    encontrados.sort((a, b) => b.precio - a.precio);
  }

  // 🏷️ Categorías que se muestran
  const categoriasVisibles = categoriaElegida === "Todas"
    ? categorias
    : [categoriaElegida];

  return (
    <main>
      {/* 🛍️ Banner de bienvenida */}
      <div className="banner-tienda">
        <h1>Bienvenido a eMarketPro</h1>
        <p>Ropa, calzado y accesorios con envío a todo el país.</p>
        <span>Envío gratis desde $150.000</span>
      </div>

      <h2>{genero ? "Productos para " + genero : "Productos"}</h2>

      <div className="filtros-tienda">
        <input
          className="buscador"
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className="select-orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="">Ordenar por</option>
          <option value="menor">Precio: menor a mayor</option>
          <option value="mayor">Precio: mayor a menor</option>
        </select>
      </div>

      {/* 🏷️ Filtro por categoría */}
      <div className="chips-categorias">
        {["Todas", ...categorias].map((cat) => (
          <button
            key={cat}
            className={categoriaElegida === cat ? "chip chip-activo" : "chip"}
            onClick={() => setCategoriaElegida(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {productos.length > 0 && encontrados.length === 0 && (
        <p>No se encontraron productos.</p>
      )}

      {categoriasVisibles.map(cat => {
        const lista = encontrados.filter(p => p.categoria === cat);
        if (lista.length === 0) return null;

        return (
          <section key={cat} className="categoria">
            <h3>{cat}</h3>

            <div className="grid-productos">
              {lista.map(producto => (
                <div className="producto" key={producto._id}>
                  <Link to={`/producto/${producto._id}`} className="producto-enlace">
                    <div className="producto-imagen">
                      <img src={producto.imagen} alt={producto.nombre} />

                      {producto.stock === 0 && (
                        <span className="etiqueta-agotado">Agotado</span>
                      )}
                    </div>

                    <h3>{producto.nombre}</h3>
                  </Link>

                  <p>{formatoPrecio(producto.precio)}</p>

                  <button
                    onClick={() => agregar(producto)}
                    disabled={producto.stock === 0}
                  >
                    {textoBoton(producto)}
                  </button>
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