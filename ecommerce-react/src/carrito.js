// 🛒 Agregar un producto al carrito (con talla y color si tiene)
export const agregarAlCarrito = (producto, talla = "", color = "", cantidad = 1) => {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const existente = carrito.find(
    (item) =>
      item._id === producto._id &&
      (item.talla || "") === talla &&
      (item.color || "") === color
  );

  if (existente) {
    existente.cantidad = (existente.cantidad || 1) + cantidad;
  } else {
    carrito.push({ ...producto, talla, color, cantidad });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  // 🔥 Actualizar Navbar
  window.dispatchEvent(new Event("carritoActualizado"));
};
