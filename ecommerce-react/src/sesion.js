// ⏰ Revisar si el servidor dijo que la sesión ya no sirve (error 401)
// Si es así, se cierra la sesión y se manda al login
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
