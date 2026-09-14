import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
          `http://localhost:3000/api/orders/usuario/${encodeURIComponent(email)}`
        );

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
          <p>📦 Cargando pedidos...</p>
        </div>
      </main>
    );
  }

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
              📦
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
                    📅{" "}
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
                  <strong>💳 Método de pago</strong>

                  <span>
                    {pedido.metodoPago}
                  </span>
                </div>

                <div className="pedido-dato">
                  <strong>📦 Estado</strong>

                  <span>
                    {pedido.estado}
                  </span>
                </div>

              </div>

              {/* PRODUCTOS */}
              <div className="pedido-productos">

                <h3>
                  🛍️ Productos del pedido
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
                            backgroundColor: "#f1f5ff",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px"
                          }}
                        >
                          🛍️
                        </div>
                      )}

                      <div className="pedido-producto-info">

                        <h4>
                          {producto.nombre}
                        </h4>

                        <p>
                          Cantidad:{" "}
                          {producto.cantidad || 1}
                        </p>

                      </div>

                      <div className="pedido-producto-precio">
                        $
                        {Number(
                          producto.precio
                        ).toLocaleString("es-CO")}
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
                  $
                  {Number(
                    pedido.total
                  ).toLocaleString("es-CO")}
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