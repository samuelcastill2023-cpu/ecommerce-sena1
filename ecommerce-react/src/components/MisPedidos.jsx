import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";
import { FiPackage, FiCalendar, FiCreditCard, FiShoppingBag } from "react-icons/fi";
import { formatoPrecio } from "../formato";

function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerPedidos = async () => {
      const email = localStorage.getItem("sesion");

      if (!email) {
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/orders/usuario/${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        );

        if (sesionVencida(res)) {
          return;
        }

        const data = await res.json();

        if (res.ok) {
          setPedidos(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerPedidos();
  }, []);

  // ===== CARGANDO =====
  if (cargando) {
    return (
      <main className="mis-pedidos-main">
        <div className="pedidos-cargando">
          <h1>Mis pedidos</h1>
          <p>Cargando pedidos...</p>
        </div>
      </main>
    );
  }


  // 🚚 Pasos del seguimiento del pedido
  const pasos = ["Pedido recibido", "En preparación", "Enviado", "Entregado"];

  return (
    <main className="mis-pedidos-main">

      {/* ENCABEZADO */}
      <div className="mis-pedidos-header">
        <h1>Mis pedidos</h1>
        <p>
          Consulta el historial de tus compras y el estado de tus pedidos.
        </p>
      </div>

      {/* CONTENEDOR */}
      <div className="mis-pedidos-contenedor">

        {pedidos.length === 0 ? (

          /* SIN PEDIDOS */
          <div className="pedidos-vacios">
            <div className="pedidos-vacios-icono">
              <FiPackage />
            </div>

            <h2>Aún no tienes pedidos</h2>

            <p>
              Cuando realices una compra, tus pedidos aparecerán aquí.
            </p>

            <Link
              to="/productos"
              className="btn-ver-productos"
            >
              Ver productos
            </Link>
          </div>

        ) : (

          /* LISTA DE PEDIDOS */
          pedidos.map((pedido) => (

            <div
              className="pedido-card"
              key={pedido._id}
            >

              {/* CABECERA */}
              <div className="pedido-header">

                <div>
                  <h2>
                    Pedido #{pedido.numeroPedido}
                  </h2>

                  <p className="pedido-fecha">
                    <FiCalendar />{" "}
                    {new Date(
                      pedido.createdAt
                    ).toLocaleDateString("es-CO")}
                  </p>
                </div>

                <span className="pedido-estado">
                  {pedido.estado}
                </span>

              </div>

              {/* INFORMACIÓN */}
              <div className="pedido-info">

                <div className="pedido-dato">
                  <strong><FiCreditCard /> Método de pago</strong>

                  <span>
                    {pedido.referenciaPago || pedido.metodoPago}
                  </span>
                </div>

                <div className="pedido-dato">
                  <strong><FiPackage /> Estado</strong>

                  <span>
                    {pedido.estado}
                  </span>
                </div>

              </div>

              {/* SEGUIMIENTO */}
              {pedido.estado === "Cancelado" ? (
                <p className="seguimiento-cancelado">
                  Este pedido fue cancelado.
                </p>
              ) : (
                <div className="seguimiento">
                  {pasos.map((paso, i) => (
                    <div
                      key={paso}
                      className={
                        i <= pasos.indexOf(pedido.estado)
                          ? "paso paso-hecho"
                          : "paso"
                      }
                    >
                      <span className="paso-circulo">{i + 1}</span>
                      <span className="paso-texto">{paso}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PRODUCTOS */}
              <div className="pedido-productos">

                <h3>
                  <FiShoppingBag /> Productos del pedido
                </h3>

                {pedido.productos.map(
                  (producto, index) => (

                    <div
                      className="pedido-producto"
                      key={index}
                    >

                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                        />
                      ) : (
                        <div
                          style={{
                            width: "65px",
                            height: "65px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px"
                          }}
                        >
                          <FiShoppingBag />
                        </div>
                      )}

                      <div className="pedido-producto-info">

                        <h4>
                          {producto.nombre}
                        </h4>

                        {(producto.talla || producto.color) && (
                          <p>
                            {producto.talla && "Talla " + producto.talla}
                            {producto.talla && producto.color && " · "}
                            {producto.color}
                          </p>
                        )}

                        <p>
                          Cantidad:{" "}
                          {producto.cantidad || 1}
                        </p>

                      </div>

                      <div className="pedido-producto-precio">
                        {formatoPrecio(producto.precio)}
                      </div>

                    </div>

                  )
                )}

              </div>

              {/* TOTAL */}
              <div className="pedido-total">

                <span>
                  Total del pedido
                </span>

                <strong>
                  {formatoPrecio(pedido.total)}
                </strong>

              </div>

            </div>

          ))

        )}

      </div>

    </main>
  );
}

export default MisPedidos;