import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";
import { FiTag, FiEdit2, FiShoppingBag, FiList, FiPackage, FiMail, FiClock } from "react-icons/fi";
import { aviso, confirmar } from "../avisos";
import { formatoPrecio } from "../formato";

function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState("pedidos");
  const [productos, setProductos] = useState([]);

  // 🛍️ Formulario de producto
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

  // 📧 Configuración del correo
  const [formCorreo, setFormCorreo] = useState({
    remitenteNombre: "",
    remitenteEmail: "",
    brevoApiKey: ""
  });
  const [apiKeyConfigurada, setApiKeyConfigurada] = useState(false);

  const estados = [
    "Pedido recibido",
    "En preparación",
    "Enviado",
    "Entregado",
    "Cancelado"
  ];

  const rol = localStorage.getItem("rol");

  // 📡 Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (rol !== "admin" && rol !== "gestor") {
        setCargando(false);
        return;
      }

      try {
        const headers = {
          Authorization: "Bearer " + localStorage.getItem("token")
        };

        const resPedidos = await fetch(`${API_URL}/api/orders`, { headers });

        if (sesionVencida(resPedidos)) {
          return;
        }

        const dataPedidos = await resPedidos.json();

        const resProductos = await fetch(`${API_URL}/api/products`);
        const dataProductos = await resProductos.json();

        const resCategorias = await fetch(`${API_URL}/api/categories`);
        const dataCategorias = await resCategorias.json();

        if (rol === "admin") {
          const resCorreo = await fetch(`${API_URL}/api/config/correo`, { headers });
          const dataCorreo = await resCorreo.json();

          if (resCorreo.ok) {
            setFormCorreo({
              remitenteNombre: dataCorreo.remitenteNombre,
              remitenteEmail: dataCorreo.remitenteEmail,
              brevoApiKey: ""
            });
            setApiKeyConfigurada(dataCorreo.apiKeyConfigurada);
          }
        }

        if (!resPedidos.ok) {
          aviso(dataPedidos.message, "error");
        } else {
          setPedidos(dataPedidos);
          setProductos(dataProductos);
          setCategorias(dataCategorias);
        }
      } catch (error) {
        console.error(error);
        aviso("Error al conectar con el servidor", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [rol]);

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

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        aviso(data.message, "error");
        return;
      }

      setPedidos(
        pedidos.map((pedido) =>
          pedido._id === id ? data.pedido : pedido
        )
      );
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
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
  const guardarProducto = async (e) => {
    e.preventDefault();

    if (
      !formProducto.nombre ||
      !formProducto.precio ||
      !formProducto.categoria
    ) {
      aviso("Completa nombre, precio y categoría", "warning");
      return;
    }

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

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

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
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // ✏️ Cambiar datos del formulario de correo
  const handleCorreoChange = (e) => {
    setFormCorreo({
      ...formCorreo,
      [e.target.name]: e.target.value
    });
  };

  // 💾 Guardar la configuración del correo
  const guardarCorreo = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/config/correo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(formCorreo)
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setApiKeyConfigurada(data.apiKeyConfigurada);
        setFormCorreo({ ...formCorreo, brevoApiKey: "" });
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // 📨 Correo de prueba
  const probarCorreo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/config/correo/prueba`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // 🏷️ Guardar categoría (crear o editar)
  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombreCategoria) {
      aviso("Escribe el nombre de la categoría", "warning");
      return;
    }

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

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (!res.ok) {
        return;
      }

      if (editandoCategoriaId) {
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
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // ✏️ Editar categoría
  const editarCategoria = (categoria) => {
    setNombreCategoria(categoria.nombre);
    setEditandoCategoriaId(categoria._id);
  };

  // 🧹 Cancelar edición
  const cancelarCategoria = () => {
    setNombreCategoria("");
    setEditandoCategoriaId(null);
  };

  // 🗑️ Eliminar categoría
  const eliminarCategoria = async (id) => {
    if (!await confirmar("¿Seguro que quieres eliminar esta categoría?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setCategorias(categorias.filter((categoria) => categoria._id !== id));
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // 📥 Cargar categorías iniciales
  const cargarCategoriasIniciales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories/cargar-iniciales`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // 📥 Cargar productos iniciales
  const cargarIniciales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/cargar-iniciales`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setProductos(data.productos);
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // ✏️ Editar producto
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
    if (!await confirmar("¿Seguro que quieres eliminar este producto?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setProductos(productos.filter((producto) => producto._id !== id));
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  // 🚚 Pedidos que faltan por despachar
  const pendientes = pedidos.filter(
    (pedido) => pedido.estado === "Pedido recibido" || pedido.estado === "En preparación"
  ).length;

  // 🎨 Clase de color según el estado
  const colorEstado = (estado) => {
    if (estado === "Entregado") return "estado-verde";
    if (estado === "Enviado") return "estado-azul";
    if (estado === "Cancelado") return "estado-rojo";
    return "estado-amarillo";
  };

  if (cargando) {
    return (
      <main className="perfil-main">
        <p>Cargando panel...</p>
      </main>
    );
  }

  if (rol !== "admin" && rol !== "gestor") {
    return (
      <main className="perfil-main">
        <h2>Acceso denegado</h2>
        <p>Esta página es solo para administradores y gestores de tienda.</p>
      </main>
    );
  }

  return (
    <main className="perfil-main admin-main">

      <div className="admin-header">
        <h1>Panel de administración</h1>
        <p>Hola, {localStorage.getItem("nombreUsuario")}. Administra las categorías, productos y pedidos de la tienda.</p>
      </div>

      {/* ===== RESUMEN ===== */}
      <div className="admin-resumen">
        <div className="resumen-item">
          <FiPackage />
          <strong>{pedidos.length}</strong>
          <span>Pedidos</span>
        </div>

        <div className="resumen-item">
          <FiClock />
          <strong>{pendientes}</strong>
          <span>Por despachar</span>
        </div>

        <div className="resumen-item">
          <FiShoppingBag />
          <strong>{productos.length}</strong>
          <span>Productos</span>
        </div>

        <div className="resumen-item">
          <FiTag />
          <strong>{categorias.length}</strong>
          <span>Categorías</span>
        </div>
      </div>

      {/* ===== MENÚ DEL PANEL ===== */}
      <div className="admin-tabs">
        <button
          className={seccion === "pedidos" ? "tab-activa" : ""}
          onClick={() => setSeccion("pedidos")}
        >
          <FiPackage /> Pedidos
        </button>

        <button
          className={seccion === "productos" ? "tab-activa" : ""}
          onClick={() => setSeccion("productos")}
        >
          <FiShoppingBag /> Productos
        </button>

        <button
          className={seccion === "categorias" ? "tab-activa" : ""}
          onClick={() => setSeccion("categorias")}
        >
          <FiTag /> Categorías
        </button>

        {rol === "admin" && (
          <button
            className={seccion === "correo" ? "tab-activa" : ""}
            onClick={() => setSeccion("correo")}
          >
            <FiMail /> Correo
          </button>
        )}
      </div>

      {/* ===== CATEGORÍAS ===== */}
      {seccion === "categorias" && (
        <section className="perfil-card">

          <div className="perfil-card-header">
            <h2><FiTag /> Categorías ({categorias.length})</h2>
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

          <form className="perfil-form" onSubmit={guardarCategoria} noValidate>

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
              type="submit"
            >
              {editandoCategoriaId ? "Guardar cambios" : "Crear categoría"}
            </button>

            {editandoCategoriaId && (
              <button
                type="button"
                className="btn-editar-datos"
                onClick={cancelarCategoria}
              >
                Cancelar
              </button>
            )}

          </form>

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
                  producto(s)
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
                  className="btn-editar-datos btn-eliminar"
                  onClick={() => eliminarCategoria(categoria._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

        </section>
      )}

      {/* ===== PRODUCTOS ===== */}
      {seccion === "productos" && (
        <>
          <section className="perfil-card">

            <div className="perfil-card-header">
              <h2>
                {editandoId ? <FiEdit2 /> : <FiShoppingBag />}{" "}
                {editandoId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <p>Completa los datos del producto.</p>
            </div>

            <form className="perfil-form" onSubmit={guardarProducto} noValidate>

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
                type="submit"
              >
                {editandoId ? "Guardar cambios" : "Crear producto"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn-editar-datos"
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              )}

            </form>

          </section>

          <section className="perfil-card">

            <div className="perfil-card-header">
              <h2><FiList /> Productos ({productos.length})</h2>
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
                <img className="admin-miniatura" src={producto.imagen} alt={producto.nombre} />

                <div className="admin-info">
                  <strong>{producto.nombre}</strong>
                  <p>
                    {producto.categoria} - {formatoPrecio(producto.precio)}
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
                    className="btn-editar-datos btn-eliminar"
                    onClick={() => eliminarProducto(producto._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

          </section>
        </>
      )}

      {/* ===== PEDIDOS ===== */}
      {seccion === "pedidos" && (
        <section className="perfil-card">

          <div className="perfil-card-header">
            <h2><FiPackage /> Pedidos ({pedidos.length})</h2>
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
                  {formatoPrecio(pedido.total)} - {pedido.referenciaPago || pedido.metodoPago}
                </p>
              </div>

              <select
                className={"select-estado " + colorEstado(pedido.estado)}
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
      )}

      {/* ===== CONFIGURACIÓN DE CORREO ===== */}
      {rol === "admin" && seccion === "correo" && (
        <section className="perfil-card">

          <div className="perfil-card-header">
            <h2><FiMail /> Configuración de correo</h2>
            <p>Datos de Brevo para enviar los correos de la tienda.</p>
          </div>

          <form className="perfil-form" onSubmit={guardarCorreo} noValidate>

            <div className="perfil-fila">

              <div className="campo-perfil">
                <label>Nombre del remitente</label>
                <input
                  type="text"
                  name="remitenteNombre"
                  value={formCorreo.remitenteNombre}
                  onChange={handleCorreoChange}
                />
              </div>

              <div className="campo-perfil">
                <label>Correo del remitente</label>
                <input
                  type="email"
                  name="remitenteEmail"
                  value={formCorreo.remitenteEmail}
                  onChange={handleCorreoChange}
                />
              </div>

            </div>

            <div className="campo-perfil">
              <label>Clave de la API de Brevo</label>
              <input
                type="password"
                name="brevoApiKey"
                value={formCorreo.brevoApiKey}
                onChange={handleCorreoChange}
                placeholder={
                  apiKeyConfigurada
                    ? "✓ Configurada (escribe una nueva solo si quieres cambiarla)"
                    : "Pega aquí la clave de Brevo"
                }
              />
              <small>
                Por seguridad, la clave guardada nunca se vuelve a mostrar.
              </small>
            </div>

            <button
              className="btn-guardar-perfil"
              type="submit"
            >
              Guardar configuración
            </button>

            {apiKeyConfigurada && (
              <button
                type="button"
                className="btn-editar-datos"
                onClick={probarCorreo}
              >
                Enviar correo de prueba
              </button>
            )}

          </form>

        </section>
      )}

    </main>
  );
}

export default Admin;
