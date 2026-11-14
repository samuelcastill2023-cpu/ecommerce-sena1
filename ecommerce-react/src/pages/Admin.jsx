import { useEffect, useState } from "react";
import { API_URL } from "../config";

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
        const dataPedidos = await resPedidos.json();

        const resUsuarios = await fetch(`${API_URL}/api/users`, { headers });
        const dataUsuarios = await resUsuarios.json();

        const resProductos = await fetch(`${API_URL}/api/products`);
        const dataProductos = await resProductos.json();

        if (!resPedidos.ok || !resUsuarios.ok) {
          alert(dataPedidos.message || dataUsuarios.message);
        } else {
          setPedidos(dataPedidos);
          setUsuarios(dataUsuarios);
          setProductos(dataProductos);
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
      <main className="mis-pedidos-main">
        <p>Cargando panel...</p>
      </main>
    );
  }

  if (localStorage.getItem("rol") !== "admin") {
    return (
      <main className="mis-pedidos-main">
        <h2>Acceso denegado 🚫</h2>
        <p>Esta página es solo para administradores.</p>
      </main>
    );
  }

  return (
    <main className="mis-pedidos-main">

      <div className="mis-pedidos-header">
        <h1>Panel de administración 👑</h1>
        <p>Gestiona los pedidos y los usuarios de la tienda.</p>
      </div>

      {/* ===== PRODUCTOS ===== */}
      <div className="mis-pedidos-contenedor">
        <h2>Productos ({productos.length})</h2>

        <div className="pedido-card">
          <h3>{editandoId ? "Editar producto ✏️" : "Nuevo producto ➕"}</h3>

          <div className="perfil-form">
            <input
              name="nombre"
              placeholder="Nombre"
              value={formProducto.nombre}
              onChange={handleProductoChange}
            />

            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={formProducto.precio}
              onChange={handleProductoChange}
            />

            <input
              name="imagen"
              placeholder="URL de la imagen"
              value={formProducto.imagen}
              onChange={handleProductoChange}
            />

            <select
              name="categoria"
              value={formProducto.categoria}
              onChange={handleProductoChange}
            >
              <option value="">Selecciona la categoría</option>
              <option value="Ropa">Ropa</option>
              <option value="Calzado">Calzado</option>
              <option value="Accesorios">Accesorios</option>
            </select>

            <button onClick={guardarProducto}>
              {editandoId ? "Guardar cambios" : "Crear producto"}
            </button>

            {editandoId && (
              <button onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {productos.map((producto) => (
          <div className="pedido-card" key={producto._id}>
            <div className="pedido-header">
              <div>
                <h2>{producto.nombre}</h2>
                <p className="pedido-fecha">
                  {producto.categoria} — ${producto.precio.toLocaleString()}
                </p>
              </div>

              <div>
                <button onClick={() => editarProducto(producto)}>
                  Editar
                </button>{" "}
                <button onClick={() => eliminarProducto(producto._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PEDIDOS ===== */}
      <div className="mis-pedidos-contenedor">
        <h2>Pedidos ({pedidos.length})</h2>

        {pedidos.length === 0 && <p>No hay pedidos todavía.</p>}

        {pedidos.map((pedido) => (
          <div className="pedido-card" key={pedido._id}>
            <div className="pedido-header">
              <div>
                <h2>Pedido #{pedido.numeroPedido}</h2>
                <p className="pedido-fecha">
                  👤 {pedido.usuario.name} — {pedido.usuario.email}
                </p>
                <p className="pedido-fecha">
                  💰 ${pedido.total.toLocaleString()} — {pedido.metodoPago}
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
          </div>
        ))}
      </div>

      {/* ===== USUARIOS ===== */}
      <div className="mis-pedidos-contenedor">
        <h2>Usuarios ({usuarios.length})</h2>

        {usuarios.map((usuario) => (
          <div className="pedido-card" key={usuario._id}>
            <div className="pedido-header">
              <div>
                <h2>{usuario.name}</h2>
                <p className="pedido-fecha">
                  {usuario.email} — {usuario.rol}
                </p>
              </div>

              {usuario.email !== localStorage.getItem("sesion") && (
                <button
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
          </div>
        ))}
      </div>

    </main>
  );
}

export default Admin;
