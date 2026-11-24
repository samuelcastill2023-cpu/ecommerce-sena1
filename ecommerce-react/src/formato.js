// 💲 Mostrar un precio en pesos colombianos: $110.000
export const formatoPrecio = (valor) => {
  return "$" + Number(valor).toLocaleString("es-CO");
};
