// ⏰ Cerrar sesión si el token venció
export const sesionVencida = (res) => {
  if (res.status !== 401) {
    return false;
  }

  localStorage.removeItem("sesion");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("token");
  localStorage.removeItem("rol");

  alert("Tu sesión expiró, inicia sesión de nuevo");
  window.location.href = "/login";

  return true;
};
