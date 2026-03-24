import { useState } from "react";

// Lista completa de productos
const productos = [
  // ROPA
  { id: 1, nombre: "Camisa Azul", precio: 60000, imagen: "https://media.istockphoto.com/id/488160041/photo/mens-shirt.jpg?s=2048x2048&w=is&k=20&c=YPbIbqxG92awyPuMre-871UtKmii43b8DFhsAysx5k4=", categoria: "Ropa" },
  { id: 2, nombre: "Jean Clásico", precio: 80000, imagen: "https://media.istockphoto.com/id/173239968/photo/skinny-tight-blue-jeans-on-white-background.jpg?s=2048x2048&w=is&k=20&c=p1taiRab1WZm98e03PrzFWHEkDl7_packPvFQBQAVWc=", categoria: "Ropa" },
  { id: 3, nombre: "Chaqueta Negra", precio: 150000, imagen: "https://media.istockphoto.com/id/695933044/photo/black-hoodie-mock-up.jpg?s=2048x2048&w=is&k=20&c=ydeyqEpyRF8xiy2m7Tl_Si6d4V3bgsKwBjJGKMtbmnY=", categoria: "Ropa" },
  { id: 4, nombre: "Vestido Rojo", precio: 110000, imagen: "https://cdn.pixabay.com/photo/2021/09/02/13/02/woman-6593404_1280.jpg", categoria: "Ropa" },
  { id: 5, nombre: "Camiseta Blanca", precio: 45000, imagen: "https://cdn.pixabay.com/photo/2016/03/25/09/04/t-shirt-1278404_1280.jpg", categoria: "Ropa" },

  // CALZADO
  { id: 6, nombre: "Zapatos Deportivos", precio: 120000, imagen: "https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg", categoria: "Calzado" },
  { id: 7, nombre: "Tenis Blancos", precio: 125000, imagen: "https://cdn.pixabay.com/photo/2020/05/27/07/41/nike-5226091_1280.jpg", categoria: "Calzado" },
  { id: 8, nombre: "Zapatos Formales", precio: 150000, imagen: "https://cdn.pixabay.com/photo/2022/10/08/17/04/shoes-7507418_1280.jpg", categoria: "Calzado" },
  { id: 9, nombre: "Sandalias Verano", precio: 65000, imagen: "https://cdn.pixabay.com/photo/2015/01/10/04/53/flip-flops-594914_1280.jpg", categoria: "Calzado" },
  { id: 10, nombre: "Botas Marrones", precio: 180000, imagen: "https://cdn.pixabay.com/photo/2019/11/26/20/02/shoes-4655404_1280.jpg", categoria: "Calzado" },

  // ACCESORIOS
  { id: 11, nombre: "Reloj de Pulsera", precio: 90000, imagen: "https://cdn.pixabay.com/photo/2022/04/01/03/20/timepiece-7103973_1280.jpg", categoria: "Accesorios" },
  { id: 12, nombre: "Gafas de Sol", precio: 45000, imagen: "https://cdn.pixabay.com/photo/2017/12/06/20/23/accessory-3002608_1280.jpg", categoria: "Accesorios" },
  { id: 13, nombre: "Bolso de Cuero", precio: 130000, imagen: "https://cdn.pixabay.com/photo/2015/11/20/03/53/package-1052370_1280.jpg", categoria: "Accesorios" },
  { id: 14, nombre: "Auriculares Bluetooth", precio: 110000, imagen: "https://cdn.pixabay.com/photo/2020/07/03/04/47/bluetooth-headset-5365166_1280.jpg", categoria: "Accesorios" },
  { id: 15, nombre: "Perfume Clásico", precio: 95000, imagen: "https://cdn.pixabay.com/photo/2017/03/14/11/39/perfume-2142817_1280.jpg", categoria: "Accesorios" },
];

function Productos() {
  const categorias = ["Ropa", "Calzado", "Accesorios"];
  const [indices, setIndices] = useState({ Ropa: 0, Calzado: 0, Accesorios: 0 });

  // 🔥 Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // 🔥 Actualizar Navbar
    window.dispatchEvent(new Event("carritoActualizado"));

    alert(`${producto.nombre} agregado al carrito 🛒`);
  };

  // 🔥 Mover carrusel
  const mover = (cat, direccion) => {
    const lista = productos.filter(p => p.categoria === cat);
    setIndices(prev => {
      let nuevo = prev[cat] + direccion;
      if (nuevo < 0) nuevo = 0;
      if (nuevo > lista.length - 3) nuevo = lista.length - 3; // <-- Cambiado a 3
      return { ...prev, [cat]: nuevo };
    });
  };

  return (
    <main>
      <h2>Productos</h2>
      {categorias.map(cat => {
        const lista = productos.filter(p => p.categoria === cat);
        return (
          <section key={cat} className="categoria">
            <h3>{cat}</h3>

            <div className="carrusel">
              <button onClick={() => mover(cat, -1)} disabled={indices[cat] === 0}>⬅️</button>

              <div className="grid-productos">
                {lista.slice(indices[cat], indices[cat] + 3).map(producto => ( // <-- Cambiado a 3
                  <div className="producto" key={producto.id}>
                    <img src={producto.imagen} alt={producto.nombre} />
                    <h3>{producto.nombre}</h3>
                    <p>${producto.precio.toLocaleString()}</p>
                    <button onClick={() => agregarAlCarrito(producto)}>Agregar al carrito</button>
                  </div>
                ))}
              </div>

              <button onClick={() => mover(cat, 1)} disabled={indices[cat] >= lista.length - 3}>➡️</button> {/* <-- Cambiado a 3 */}
            </div>
          </section>
        );
      })}
    </main>
  );
}

export default Productos;