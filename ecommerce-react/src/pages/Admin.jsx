import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";

function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);

  // 🛍️ Formulario de producto (sirve para crear y para editar)
  const [formProducto, setFormProducto] = useState({
    nombre: "",
    precio: "",
    imagen: "",
    categoria: ""
  });
  const [editandoId, setEditandoId] = useState(null);

  // 🏷️ Categorías
  const [categorias, setCategorias] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [editandoCategoriaId, setEditandoCategoriaId] = useState(null);

  const estados = [
    "Pedido recibido",
    "En preparación",
    "Enviado",
    "Entregado",
    "Cancelado"
  ];

  // 📡 Cargar pedidos y usuarios
  useEffect(() => {
    const cargarDatos = async () => {
      if (localStorage.getItem("rol") !== "admin") {
        setCargando(false);
        return;
      }

      try {
        const headers = {
          Authorization: "Bearer " + localStorage.getItem("token")
        };

        const resPedidos = await fetch(`${API_URL}/api/orders`, { headers });

        // ⏰ Si la sesión venció, ir al login
        if (sesionVencida(resPedidos)) {
          return;
        }

        const dataPedidos = await resPedidos.json();

        const resUsuarios = await fetch(`${API_URL}/api/users`, { headers });
        const dataUsuarios = await resUsuarios.json();

        const resProductos = await fetch(`${API_URL}/api/products`);
        const dataProductos = await resProductos.json();

        const resCategorias = await fetch(`${API_URL}/api/categories`);
        const dataCategorias = await resCategorias.json();

        if (!resPedidos.ok || !resUsuarios.ok) {
          alert(dataPedidos.message || dataUsuarios.message);
        } else {
          setPedidos(dataPedidos);
          setUsuarios(dataUsuarios);
          setProductos(dataProductos);
          setCategorias(dataCategorias);
        }
      } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 📦 Cambiar estado de un pedido
  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ estado })
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Actualizar solo ese pedido en la lista
      setPedidos(
        pedidos.map((pedido) =>
          pedido._id === id ? data.pedido : pedido
        )
      );
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // 👤 Cambiar rol de un usuario
  const cambiarRol = async (id, rol) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ rol })
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setUsuarios(
          usuarios.map((usuario) =>
            usuario._id === id ? data.user : usuario
          )
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // ✏️ Cambiar datos del formulario de producto
  const handleProductoChange = (e) => {
    setFormProducto({
      ...formProducto,
      [e.target.name]: e.target.value
    });
  };

  // 🧹 Limpiar el formulario
  const limpiarFormulario = () => {
    setFormProducto({
      nombre: "",
      precio: "",
      imagen: "",
      categoria: ""
    });
    setEditandoId(null);
  };

  // 💾 Guardar producto (crear o editar)
  const guardarProducto = async () => {
    if (
      !formProducto.nombre ||
      !formProducto.precio ||
      !formProducto.categoria
    ) {
      alert("Completa nombre, precio y categoría");
      return;
    }

    // Si estamos editando se usa PUT, si no POST
    const url = editandoId
      ? `${API_URL}/api/products/${editandoId}`
      : `${API_URL}/api/products`;

    const metodo = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(formProducto)
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (!res.ok) {
        return;
      }

      if (editandoId) {
        setProductos(
          productos.map((producto) =>
            producto._id === editandoId ? data.producto : producto
          )
        );
      } else {
        setProductos([...productos, data.producto]);
      }

      limpiarFormulario();
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // 🏷️ Guardar categoría (crear o editar)
  const guardarCategoria = async () => {
    if (!nombreCategoria) {
      alert("Escribe el nombre de la categoría");
      return;
    }

    // Si estamos editando se usa PUT, si no POST
    const url = editandoCategoriaId
      ? `${API_URL}/api/categories/${editandoCategoriaId}`
      : `${API_URL}/api/categories`;

    const metodo = editandoCategoriaId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ nombre: nombreCategoria })
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (!res.ok) {
        return;
      }

      if (editandoCategoriaId) {
        // Los productos de esa categoría también cambian de nombre
        const anterior = categorias.find(
          (categoria) => categoria._id === editandoCategoriaId
        );

        setCategorias(
          categorias.map((categoria) =>
            categoria._id === editandoCategoriaId ? data.categoria : categoria
          )
        );

        setProductos(
          productos.map((producto) =>
            producto.categoria === anterior.nombre
              ? { ...producto, categoria: data.categoria.nombre }
              : producto
          )
        );
      } else {
        setCategorias([...categorias, data.categoria]);
      }

      setNombreCategoria("");
      setEditandoCategoriaId(null);
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // ✏️ Pasar una categoría al formulario para editarla
  const editarCategoria = (categoria) => {
    setNombreCategoria(categoria.nombre);
    setEditandoCategoriaId(categoria._id);
  };

  // 🧹 Cancelar la edición de la categoría
  const cancelarCategoria = () => {
    setNombreCategoria("");
    setEditandoCategoriaId(null);
  };

  // 🗑️ Eliminar categoría
  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setCategorias(categorias.filter((categoria) => categoria._id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // 📥 Cargar las categorías iniciales cuando no hay ninguna
  const cargarCategoriasIniciales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories/cargar-iniciales`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // 📥 Cargar los productos iniciales cuando la tienda está vacía
  const cargarIniciales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/cargar-iniciales`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setProductos(data.productos);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  // ✏️ Pasar un producto al formulario para editarlo
  const editarProducto = (producto) => {
    setFormProducto({
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen || "",
      categoria: producto.categoria
    });
    setEditandoId(producto._id);
  };

  // 🗑️ Eliminar producto
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      // ⏰ Si la sesión venció, ir al login
      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        setProductos(productos.filter((producto) => producto._id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  if (cargando) {
    return (
      <main className="perfil-main">
        <p>Cargando panel...</p>
      </main>
    );
  }

  if (localStorage.getItem("rol") !== "admin") {
    return (
      <main className="perfil-main">
        <h2>Acceso denegado</h2>
        <p>Esta página es solo para administradores.</p>
      </main>
    );
  }

  return (
    <main className="perfil-main">

      <div className="perfil-header">
        <h1>Panel de administración</h1>
        <p>Administra las categorías, productos, pedidos y usuarios de la tienda.</p>
      </div>

      {/* ===== CATEGORÍAS ===== */}
      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2>🏷️ Categorías ({categorias.length})</h2>
          <p>Categorías en las que se organizan los productos.</p>
        </div>

        {categorias.length === 0 && (
          <>
            <p>No hay categorías todavía.</p>

            <button
              className="btn-guardar-perfil"
              onClick={cargarCategoriasIniciales}
            >
              Cargar categorías iniciales
            </button>
          </>
        )}

        <div className="perfil-form">

          <div className="campo-perfil">
            <label>
              {editandoCategoriaId ? "Editar categoría" : "Nueva categoría"}
            </label>
            <input
              type="text"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
            />
          </div>

          <button
            className="btn-guardar-perfil"
            onClick={guardarCategoria}
          >
            {editandoCategoriaId ? "Guardar cambios" : "Crear categoría"}
          </button>

          {editandoCategoriaId && (
            <button
              className="btn-editar-datos"
              onClick={cancelarCategoria}
            >
              Cancelar
            </button>
          )}

        </div>

        {categorias.map((categoria) => (
          <div className="admin-fila" key={categoria._id}>
            <div>
              <strong>{categoria.nombre}</strong>
              <p>
                {
                  productos.filter(
                    (producto) => producto.categoria === categoria.nombre
                  ).length
                }{" "}
                productos
              </p>
            </div>

            <div>
              <button
                className="btn-editar-datos"
                onClick={() => editarCategoria(categoria)}
              >
                Editar
              </button>{" "}
              <button
                className="btn-editar-datos"
                onClick={() => eliminarCategoria(categoria._id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

      </section>

      {/* ===== FORMULARIO DE PRODUCTO ===== */}
      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2>{editandoId ? "✏️ Editar producto" : "🛍️ Nuevo producto"}</h2>
          <p>Completa los datos del producto.</p>
        </div>

        <div className="perfil-form">

          <div className="campo-perfil">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formProducto.nombre}
              onChange={handleProductoChange}
            />
          </div>

          <div className="perfil-fila">

            <div className="campo-perfil">
              <label>Precio</label>
              <input
                type="number"
                name="precio"
                value={formProducto.precio}
                onChange={handleProductoChange}
              />
            </div>

            <div className="campo-perfil">
              <label>Categoría</label>
              <select
                name="categoria"
                value={formProducto.categoria}
                onChange={handleProductoChange}
              >
                <option value="">Selecciona</option>
                {categorias.map((categoria) => (
                  <option key={categoria._id} value={categoria.nombre}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="campo-perfil">
            <label>URL de la imagen</label>
            <input
              type="text"
              name="imagen"
              value={formProducto.imagen}
              onChange={handleProductoChange}
            />
          </div>

          <button
            className="btn-guardar-perfil"
            onClick={guardarProducto}
          >
            {editandoId ? "Guardar cambios" : "Crear producto"}
          </button>

          {editandoId && (
            <button
              className="btn-editar-datos"
              onClick={limpiarFormulario}
            >
              Cancelar
            </button>
          )}

        </div>

      </section>

      {/* ===== LISTA DE PRODUCTOS ===== */}
      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2>📋 Productos ({productos.length})</h2>
          <p>Productos que se muestran en la tienda.</p>
        </div>

        {productos.length === 0 && (
          <>
            <p>No hay productos todavía.</p>

            <button
              className="btn-guardar-perfil"
              onClick={cargarIniciales}
            >
              Cargar productos iniciales
            </button>
          </>
        )}

        {productos.map((producto) => (
          <div className="admin-fila" key={producto._id}>
            <div>
              <strong>{producto.nombre}</strong>
              <p>
                {producto.categoria} - ${producto.precio.toLocaleString()}
              </p>
            </div>

            <div>
              <button
                className="btn-editar-datos"
                onClick={() => editarProducto(producto)}
              >
                Editar
              </button>{" "}
              <button
                className="btn-editar-datos"
                onClick={() => eliminarProducto(producto._id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

      </section>

      {/* ===== PEDIDOS ===== */}
      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2>📦 Pedidos ({pedidos.length})</h2>
          <p>Cambia el estado de cada pedido.</p>
        </div>

        {pedidos.length === 0 && <p>No hay pedidos todavía.</p>}

        {pedidos.map((pedido) => (
          <div className="admin-fila" key={pedido._id}>
            <div>
              <strong>Pedido #{pedido.numeroPedido}</strong>
              <p>
                {pedido.usuario.name} - {pedido.usuario.email}
              </p>
              <p>
                ${pedido.total.toLocaleString()} - {pedido.metodoPago}
              </p>
            </div>

            <select
              value={pedido.estado}
              onChange={(e) => cambiarEstado(pedido._id, e.target.value)}
            >
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        ))}

      </section>

      {/* ===== USUARIOS ===== */}
      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2>👤 Usuarios ({usuarios.length})</h2>
          <p>Da o quita permisos de administrador.</p>
        </div>

        {usuarios.map((usuario) => (
          <div className="admin-fila" key={usuario._id}>
            <div>
              <strong>{usuario.name}</strong>
              <p>
                {usuario.email} - {usuario.rol}
              </p>
            </div>

            {usuario.email !== localStorage.getItem("sesion") && (
              <button
                className="btn-editar-datos"
                onClick={() =>
                  cambiarRol(
                    usuario._id,
                    usuario.rol === "admin" ? "cliente" : "admin"
                  )
                }
              >
                {usuario.rol === "admin" ? "Quitar admin" : "Hacer admin"}
              </button>
            )}
          </div>
        ))}

      </section>

    </main>
  );
}

export default Admin;
