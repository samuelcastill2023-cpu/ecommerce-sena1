// ======== Manejo de usuarios (Login y Registro) ========

// Función para registrar nuevo usuario
function registrarUsuario(event) {
  event.preventDefault();

  const nombres = document.getElementById("nombresRegistro").value.trim();
  const apellidos = document.getElementById("apellidosRegistro").value.trim();
  const direccion = document.getElementById("direccionRegistro").value.trim();
  const pais = document.getElementById("paisRegistro").value.trim();
  const fechaNacimiento = document.getElementById("fechaRegistro").value;
  const codigoPostal = document.getElementById("codigoPostalRegistro").value.trim();
  const email = document.getElementById("emailRegistro").value.trim();
  const password = document.getElementById("passwordRegistro").value.trim();
  const confirmar = document.getElementById("confirmarPasswordRegistro").value.trim();

  // Validación de campos obligatorios
  if (!nombres || !apellidos || !direccion || !pais || !fechaNacimiento || !codigoPostal || !email || !password || !confirmar) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Validar contraseñas
  if (password !== confirmar) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Verifica si el correo ya está registrado
  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    alert("Ya existe una cuenta con este correo.");
    return;
  }

  // Guardar usuario con todos los campos
  usuarios.push({
    nombres,
    apellidos,
    direccion,
    pais,
    fechaNacimiento,
    codigoPostal,
    email,
    password
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
  window.location.href = "index.html";
}

// Función para iniciar sesión
function iniciarSesion(event) {
  event.preventDefault();

  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuarioValido = usuarios.find(u => u.email === email && u.password === password);

  if (usuarioValido) {
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioValido));
    alert(`Bienvenido ${usuarioValido.nombres}`);
    window.location.href = "productos.html";
  } else {
    alert("Correo o contraseña incorrectos.");
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  window.location.href = "index.html";
}

// ======== Manejo del carrito de compras ========

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio) {
  const productoExistente = carrito.find(item => item.nombre === nombre);

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  alert(`${nombre} agregado al carrito`);
}

// Mostrar productos del carrito en carrito.html
function mostrarCarrito() {
  const contenedor = document.getElementById("carrito-contenedor");
  const totalElemento = document.getElementById("total");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalElemento.textContent = "";
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");
    div.innerHTML = `
      <p>${item.nombre} - $${item.precio} x ${item.cantidad}</p>
      <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  totalElemento.textContent = `Total: $${total}`;

  // ===== Botones de acción =====
  const accionesDiv = document.createElement("div");
  accionesDiv.style.marginTop = "20px";
  accionesDiv.style.display = "flex";
  accionesDiv.style.justifyContent = "center";
  accionesDiv.style.gap = "15px";

  const btnComprar = document.createElement("button");
  btnComprar.textContent = "Comprar";
  btnComprar.style.backgroundColor = "#2563eb";
  btnComprar.style.color = "white";
  btnComprar.style.border = "none";
  btnComprar.style.padding = "10px 15px";
  btnComprar.style.borderRadius = "8px";
  btnComprar.style.cursor = "pointer";
  btnComprar.onclick = comprarCarrito;

  const btnVaciar = document.createElement("button");
  btnVaciar.textContent = "Vaciar carrito";
  btnVaciar.style.backgroundColor = "#1e3a8a";
  btnVaciar.style.color = "white";
  btnVaciar.style.border = "none";
  btnVaciar.style.padding = "10px 15px";
  btnVaciar.style.borderRadius = "8px";
  btnVaciar.style.cursor = "pointer";
  btnVaciar.onclick = vaciarCarrito;

  accionesDiv.appendChild(btnComprar);
  accionesDiv.appendChild(btnVaciar);
  contenedor.appendChild(accionesDiv);
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContadorCarrito();
}

// Vaciar carrito completo
function vaciarCarrito() {
  if (confirm("¿Seguro que deseas vaciar el carrito?")) {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContadorCarrito();
  }
}

// Simular compra
function comprarCarrito() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  alert("✅ ¡Compra realizada con éxito! Gracias por tu pedido.");
  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContadorCarrito();
}

// Contador del carrito (ícono)
function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// ======== Ejecución automática según página ========

document.addEventListener("DOMContentLoaded", () => {
  const pagina = window.location.pathname;

  if (pagina.includes("productos.html")) {
    actualizarContadorCarrito();
  }

  if (pagina.includes("carrito.html")) {
    mostrarCarrito();
  }

  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
  if (!usuarioActual && (pagina.includes("productos.html") || pagina.includes("carrito.html"))) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
  }
});
