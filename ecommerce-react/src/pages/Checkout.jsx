import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");

  const [datosPago, setDatosPago] = useState({
    numeroTarjeta: "",
    titular: "",
    vencimiento: "",
    cvv: "",
    banco: "",
    correoPSE: "",
    telefono: ""
  });

  // 🛒 Cargar carrito
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(data);
  }, []);

  // 👤 Cargar usuario
  useEffect(() => {
    const correo = localStorage.getItem("sesion");

    if (!correo) {
      alert("Debes iniciar sesión para continuar");
      navigate("/login");
      return;
    }

    const cargarUsuario = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/users/profile/${correo}`
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "No se pudo cargar el perfil");
          return;
        }

        setUsuario(data.user);
      } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor");
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

  // 💰 Total
  const total = carrito.reduce(
    (acc, item) => acc + Number(item.precio),
    0
  );

  // 🛒 CONFIRMAR COMPRA
  const continuarCompra = async () => {
    if (!usuario) {
      alert("No se pudo cargar la información del usuario");
      return;
    }

    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    if (!metodoPago) {
      alert("Selecciona un método de pago");
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
        alert("Completa todos los datos de la tarjeta");
        return;
      }
    }

    // 🏦 Validar PSE
    if (metodoPago === "PSE") {
      if (!datosPago.banco || !datosPago.correoPSE) {
        alert("Completa los datos de PSE");
        return;
      }
    }

    // 📱 Validar Nequi y Daviplata
    if (
      metodoPago === "Nequi" ||
      metodoPago === "Daviplata"
    ) {
      if (!datosPago.telefono) {
        alert("Ingresa el número de celular");
        return;
      }
    }

    // 🔢 Crear número de pedido
    const numeroPedido =
      "EC-" + Math.floor(10000 + Math.random() * 90000);

    // 📦 Crear pedido
    const pedido = {
      numeroPedido,

      usuario: {
        name: usuario.name,
        email: usuario.email,
        phone: usuario.phone,
        address: usuario.address,
        city: usuario.city
      },

      productos: carrito.map((producto) => ({
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen: producto.imagen || ""
      })),

      total,

      metodoPago
    };

    try {
      // 📡 Guardar pedido en MongoDB
      const res = await fetch(
        "http://localhost:3000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(pedido)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message || "No se pudo registrar el pedido"
        );
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
      alert("No se pudo conectar con el servidor");
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
        <h1>Finalizar compra 🛒</h1>
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

                  <h3>{producto.nombre}</h3>

                  <p>
                    ${Number(producto.precio).toLocaleString()}
                  </p>

                </div>

              </div>
            ))}

            <div className="checkout-total">

              <span>Total de la compra</span>

              <strong>
                ${total.toLocaleString()}
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
            <span>📱 Nequi</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="Daviplata"
              checked={metodoPago === "Daviplata"}
              onChange={cambiarMetodoPago}
            />
            <span>📱 Daviplata</span>
          </label>

          <label className="metodo-pago">
            <input
              type="radio"
              name="metodoPago"
              value="PSE"
              checked={metodoPago === "PSE"}
              onChange={cambiarMetodoPago}
            />
            <span>🏦 PSE</span>
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
            <span>💳 Tarjeta débito/crédito</span>
          </label>

        </div>

        {/* ===== TARJETA ===== */}
        {metodoPago === "Tarjeta débito/crédito" && (
          <div className="datos-pago">

            <h3>Datos de la tarjeta</h3>

            <input
              name="numeroTarjeta"
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
                placeholder="MM/AA"
                value={datosPago.vencimiento}
                onChange={handlePagoChange}
              />

              <input
                name="cvv"
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
              placeholder="Número de celular"
              value={datosPago.telefono}
              onChange={handlePagoChange}
            />

            <p className="info-pago">
              Ingresa el número de celular asociado a tu cuenta.
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
          ← Volver al carrito
        </button>

        <button
          className="btn-continuar-compra"
          onClick={continuarCompra}
        >
          Confirmar compra
        </button>

      </div>

    </main>
  );
}

export default Checkout;