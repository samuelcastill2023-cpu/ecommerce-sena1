import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";
import { FiShoppingCart, FiSmartphone, FiGlobe, FiCreditCard, FiArrowLeft, FiTruck, FiEdit2 } from "react-icons/fi";
import { aviso } from "../avisos";
import { formatoPrecio } from "../formato";

function Checkout() {
  const navigate = useNavigate();

  // 🛒 Cargar carrito guardado
  const [carrito, setCarrito] = useState(
    JSON.parse(localStorage.getItem("carrito")) || []
  );
  const [usuario, setUsuario] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);

  const [datosPago, setDatosPago] = useState({
    numeroTarjeta: "",
    titular: "",
    vencimiento: "",
    cvv: "",
    banco: "",
    correoPSE: "",
    telefono: ""
  });

  // 👤 Cargar usuario
  useEffect(() => {
    const correo = localStorage.getItem("sesion");

    if (!correo) {
      aviso("Debes iniciar sesión para continuar", "warning");
      navigate("/login");
      return;
    }

    const cargarUsuario = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/users/profile/${encodeURIComponent(correo)}`,
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

        if (!res.ok) {
          aviso(data.message || "No se pudo cargar el perfil", "error");
          return;
        }

        setUsuario(data.user);
      } catch (error) {
        console.error(error);
        aviso("Error al conectar con el servidor", "error");
      }
    };

    cargarUsuario();
  }, [navigate]);

  // 💳 Cambiar método de pago
  const cambiarMetodoPago = (e) => {
    setMetodoPago(e.target.value);

    setDatosPago({
      numeroTarjeta: "",
      titular: "",
      vencimiento: "",
      cvv: "",
      banco: "",
      correoPSE: "",
      telefono: ""
    });
  };

  // ✏️ Cambiar datos del pago
  const handlePagoChange = (e) => {
    setDatosPago({
      ...datosPago,
      [e.target.name]: e.target.value
    });
  };

  // 💰 Subtotal, envío y total
  const subtotal = carrito.reduce(
    (acc, item) => acc + Number(item.precio) * (item.cantidad || 1),
    0
  );

  const envio = subtotal >= 150000 ? 0 : 10000;
  const total = subtotal + envio;

  // 🛒 CONFIRMAR COMPRA
  const continuarCompra = async () => {
    if (!usuario) {
      aviso("No se pudo cargar la información del usuario", "warning");
      return;
    }

    if (carrito.length === 0) {
      aviso("Tu carrito está vacío", "warning");
      return;
    }

    if (!metodoPago) {
      aviso("Selecciona un método de pago", "warning");
      return;
    }

    // 💳 Validar tarjeta
    if (metodoPago === "Tarjeta débito/crédito") {
      if (
        !datosPago.numeroTarjeta ||
        !datosPago.titular ||
        !datosPago.vencimiento ||
        !datosPago.cvv
      ) {
        aviso("Completa todos los datos de la tarjeta", "warning");
        return;
      }

      if (!/^\d{16}$/.test(datosPago.numeroTarjeta)) {
        aviso("El número de tarjeta debe tener 16 dígitos", "warning");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datosPago.vencimiento)) {
        aviso("El vencimiento debe tener el formato MM/AA", "warning");
        return;
      }

      const mes = Number(datosPago.vencimiento.slice(0, 2));
      const anio = 2000 + Number(datosPago.vencimiento.slice(3));
      const hoy = new Date();

      if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
        aviso("La tarjeta está vencida", "warning");
        return;
      }

      if (!/^\d{3}$/.test(datosPago.cvv)) {
        aviso("El CVV debe tener 3 dígitos", "warning");
        return;
      }
    }

    // 🏦 Validar PSE
    if (metodoPago === "PSE") {
      if (!datosPago.banco || !datosPago.correoPSE) {
        aviso("Completa los datos de PSE", "warning");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPago.correoPSE)) {
        aviso("El correo de PSE no es válido", "warning");
        return;
      }
    }

    // 📱 Validar Nequi y Daviplata
    if (
      metodoPago === "Nequi" ||
      metodoPago === "Daviplata"
    ) {
      if (!datosPago.telefono) {
        aviso("Ingresa el número de celular", "warning");
        return;
      }

      if (!/^3\d{9}$/.test(datosPago.telefono)) {
        aviso("El celular debe tener 10 dígitos y empezar por 3", "warning");
        return;
      }
    }

    // 🔒 Solo se envían los últimos 4 dígitos o el banco
    let detallePago = "";

    if (metodoPago === "Tarjeta débito/crédito") {
      detallePago = datosPago.numeroTarjeta.slice(-4);
    }

    if (metodoPago === "Nequi" || metodoPago === "Daviplata") {
      detallePago = datosPago.telefono.slice(-4);
    }

    if (metodoPago === "PSE") {
      detallePago = datosPago.banco;
    }

    // 📦 Crear pedido
    const pedido = {
      productos: carrito.map((producto) => ({
        _id: producto._id,
        cantidad: producto.cantidad || 1,
        talla: producto.talla || "",
        color: producto.color || ""
      })),

      metodoPago,
      detallePago
    };

    setProcesando(true);

    try {
      // ⏳ Simular la respuesta de la pasarela de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 📡 Guardar pedido en MongoDB
      const res = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify(pedido)
        }
      );

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        aviso(
          data.message || "No se pudo registrar el pedido",
          "error"
        );
        setProcesando(false);
        return;
      }

      // 🗑️ Vaciar carrito
      localStorage.removeItem("carrito");
      setCarrito([]);

      // 🔄 Actualizar contador del Navbar
      window.dispatchEvent(
        new Event("carritoActualizado")
      );

      // ✅ Ir a confirmación
      navigate("/confirmacion", {
        state: data.pedido
      });

    } catch (error) {
      console.error("Error al registrar pedido:", error);
      aviso("No se pudo conectar con el servidor", "error");
      setProcesando(false);
    }
  };

  // ⏳ Mientras carga el usuario
  if (!usuario) {
    return (
      <main className="checkout-main">
        <div className="checkout-card">
          <div className="checkout-card-header">
            <h2>Cargando información...</h2>
            <p>Estamos preparando tu proceso de compra.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-main">

      {/* ===== ENCABEZADO ===== */}
      <div className="checkout-header">
        <h1>Finalizar compra <FiShoppingCart /></h1>
        <p>Revisa tu pedido y completa el proceso de pago.</p>
      </div>

      {/* ===== INFORMACIÓN DE ENTREGA ===== */}
      <section className="checkout-card">

        <div className="checkout-card-header">
          <h2>Información de entrega</h2>
          <p>Estos son los datos asociados a tu cuenta.</p>
        </div>

        <div className="datos-entrega">

          <div>
            <strong>Nombre</strong>
            <span>{usuario.name}</span>
          </div>

          <div>
            <strong>Correo electrónico</strong>
            <span>{usuario.email}</span>
          </div>

          <div>
            <strong>Teléfono</strong>
            <span>{usuario.phone}</span>
          </div>

          <div>
            <strong>Dirección</strong>
            <span>{usuario.address}</span>
          </div>

          <div>
            <strong>Ciudad</strong>
            <span>{usuario.city}</span>
          </div>

        </div>

        <button
          className="btn-editar-datos"
          onClick={() => navigate("/perfil")}
        >
          <FiEdit2 /> Cambiar datos de entrega
        </button>

      </section>

      {/* ===== RESUMEN DEL PEDIDO ===== */}
      <section className="checkout-card">

        <div className="checkout-card-header">
          <h2>Resumen del pedido</h2>
          <p>Productos que estás a punto de comprar.</p>
        </div>

        {carrito.length === 0 ? (

          <div className="checkout-vacio">
            <p>Tu carrito está vacío.</p>

            <button onClick={() => navigate("/productos")}>
              Volver a productos
            </button>
          </div>

        ) : (

          <>
            {carrito.map((producto, index) => (
              <div
                key={index}
                className="checkout-producto"
              >

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                />

                <div className="checkout-producto-info">

                  <h3>
                    {producto.nombre}
                    {producto.talla && " - Talla " + producto.talla}
                    {producto.color && " - " + producto.color}
                    {" "}x{producto.cantidad || 1}
                  </h3>

                  <p>
                    {formatoPrecio(producto.precio)}
                  </p>

                </div>

              </div>
            ))}

            <div className="checkout-linea">
              <span>Subtotal</span>
              <span>{formatoPrecio(subtotal)}</span>
            </div>

            <div className="checkout-linea">
              <span><FiTruck /> Envío</span>
              <span>{envio === 0 ? "Gratis" : formatoPrecio(envio)}</span>
            </div>

            {envio > 0 && (
              <p className="info-pago">
                Envío gratis en compras desde $150.000.
              </p>
            )}

            <div className="checkout-total">

              <span>Total de la compra</span>

              <strong>
                {formatoPrecio(total)}
              </strong>

            </div>
          </>

        )}

      </section>

      {/* ===== MÉTODO DE PAGO ===== */}
      <section className="checkout-card">

        <div className="checkout-card-header">
          <h2>Método de pago</h2>
          <p>Selecciona cómo deseas realizar tu pago.</p>
        </div>

        <div className="metodos-pago">

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="Nequi"
              checked={metodoPago === "Nequi"}
              onChange={cambiarMetodoPago}
            />
            <span><FiSmartphone /> Nequi</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="Daviplata"
              checked={metodoPago === "Daviplata"}
              onChange={cambiarMetodoPago}
            />
            <span><FiSmartphone /> Daviplata</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="PSE"
              checked={metodoPago === "PSE"}
              onChange={cambiarMetodoPago}
            />
            <span><FiGlobe /> PSE</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="Tarjeta débito/crédito"
              checked={
                metodoPago === "Tarjeta débito/crédito"
              }
              onChange={cambiarMetodoPago}
            />
            <span><FiCreditCard /> Tarjeta débito/crédito</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="Contra entrega"
              checked={metodoPago === "Contra entrega"}
              onChange={cambiarMetodoPago}
            />

            <span><FiTruck /> Contra entrega</span>
          </label>

        </div>

        {/* ===== TARJETA ===== */}
        {metodoPago === "Tarjeta débito/crédito" && (
          <div className="datos-pago">

            <h3>Datos de la tarjeta</h3>

            <input
              name="numeroTarjeta"
              inputMode="numeric"
              maxLength={16}
              placeholder="Número de tarjeta"
              value={datosPago.numeroTarjeta}
              onChange={handlePagoChange}
            />

            <input
              name="titular"
              placeholder="Nombre del titular"
              value={datosPago.titular}
              onChange={handlePagoChange}
            />

            <div className="datos-pago-fila">

              <input
                name="vencimiento"
                maxLength={5}
                placeholder="MM/AA"
                value={datosPago.vencimiento}
                onChange={handlePagoChange}
              />

              <input
                name="cvv"
                inputMode="numeric"
                maxLength={3}
                placeholder="CVV"
                value={datosPago.cvv}
                onChange={handlePagoChange}
              />

            </div>

          </div>
        )}

        {/* ===== PSE ===== */}
        {metodoPago === "PSE" && (
          <div className="datos-pago">

            <h3>Datos para PSE</h3>

            <select
              name="banco"
              value={datosPago.banco}
              onChange={handlePagoChange}
            >

              <option value="">
                Selecciona tu banco
              </option>

              <option value="Bancolombia">
                Bancolombia
              </option>

              <option value="Davivienda">
                Davivienda
              </option>

              <option value="Banco de Bogotá">
                Banco de Bogotá
              </option>

            </select>

            <input
              type="email"
              name="correoPSE"
              placeholder="Correo electrónico"
              value={datosPago.correoPSE}
              onChange={handlePagoChange}
            />

          </div>
        )}

        {/* ===== NEQUI / DAVIPLATA ===== */}
        {(metodoPago === "Nequi" ||
          metodoPago === "Daviplata") && (
          <div className="datos-pago">

            <h3>
              Datos de {metodoPago}
            </h3>

            <input
              name="telefono"
              inputMode="numeric"
              maxLength={10}
              placeholder="Número de celular"
              value={datosPago.telefono}
              onChange={handlePagoChange}
            />

            <p className="info-pago">
              Ingresa el número de celular asociado a tu cuenta.
            </p>

          </div>
        )}

        {/* ===== CONTRA ENTREGA ===== */}
        {metodoPago === "Contra entrega" && (
          <div className="datos-pago">
            <h3>Pago contra entrega</h3>

            <p className="info-pago">
              Pagas en efectivo cuando recibas el pedido en tu dirección.
            </p>
          </div>
        )}

      </section>

      {/* ===== ACCIONES ===== */}
      <div className="checkout-acciones">

        <button
          className="btn-volver-carrito"
          onClick={() => navigate("/carrito")}
        >
          <FiArrowLeft /> Volver al carrito
        </button>

        <button
          className="btn-continuar-compra"
          onClick={continuarCompra}
          disabled={procesando}
        >
          {procesando ? "Procesando pago..." : "Confirmar compra"}
        </button>

      </div>

    </main>
  );
}

export default Checkout;