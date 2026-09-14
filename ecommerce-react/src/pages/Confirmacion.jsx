import { useLocation, useNavigate } from "react-router-dom";

function Confirmacion() {
  const navigate = useNavigate();
  const location = useLocation();

  const pedido = location.state;

  if (!pedido) {
    return (
      <main className="confirmacion-main">
        <div className="confirmacion-card">
          <h2>No hay información del pedido</h2>

          <button
            className="btn-confirmacion"
            onClick={() => navigate("/productos")}
          >
            Volver a productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="confirmacion-main">

      <div className="confirmacion-card">

        <div className="confirmacion-icono">
          ✓
        </div>

        <h1>¡Compra confirmada!</h1>

        <p className="confirmacion-mensaje">
          Gracias por tu compra, <strong>{pedido.usuario.name}</strong>.
        </p>

        <p className="confirmacion-submensaje">
          Tu pedido ha sido registrado correctamente.
        </p>


        <div className="detalle-pedido">

          <div>
            <span>Número de pedido</span>
            <strong>{pedido.numeroPedido}</strong>
          </div>

          <div>
            <span>Método de pago</span>
            <strong>{pedido.metodoPago}</strong>
          </div>

          <div>
            <span>Total pagado</span>
            <strong>
              ${pedido.total.toLocaleString()}
            </strong>
          </div>

        </div>


        <div className="estado-pedido">

          <div className="estado-icono">
            📦
          </div>

          <div>
            <strong>Pedido confirmado</strong>

            <p>
              Tu pedido será preparado y enviado a la dirección
              registrada en tu perfil.
            </p>
          </div>

        </div>


        <button
          className="btn-confirmacion"
          onClick={() => navigate("/productos")}
        >
          Seguir comprando 🛍️
        </button>

      </div>

    </main>
  );
}

export default Confirmacion;