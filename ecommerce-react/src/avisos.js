import Swal from "sweetalert2";

// 🔔 Mostrar un aviso (success, error, warning o info)
export const aviso = (mensaje, tipo = "info") => {
  return Swal.fire({
    text: mensaje,
    icon: tipo,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#0468f8"
  });
};

// ✅ Aviso pequeño que se cierra solo
export const avisoRapido = (mensaje) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: mensaje,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
};

// ❓ Pedir confirmación antes de una acción
export const confirmar = async (mensaje) => {
  const resultado = await Swal.fire({
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0468f8",
    cancelButtonColor: "#666666"
  });

  return resultado.isConfirmed;
};
