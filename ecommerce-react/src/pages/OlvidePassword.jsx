import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { aviso } from "../avisos";

function OlvidePassword() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  // 📧 Pedir el enlace para cambiar la contraseña
  const enviarEnlace = async (e) => {
    e.preventDefault();

    if (!correo) {
      aviso("Escribe tu correo", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: correo })
      });

      const data = await res.json();

      if (!res.ok) {
        aviso(data.message, "error");
        return;
      }

      setEnviado(true);
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  return (
    <main>
      <form className="login-container" onSubmit={enviarEnlace} noValidate>
        <h2>¿Olvidaste tu contraseña?</h2>

        {enviado ? (
          <p>
            Si el correo está registrado, te enviamos un enlace para cambiar
            la contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
          </p>
        ) : (
          <>
            <p>Escribe tu correo y te enviaremos un enlace para cambiarla.</p>

            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />

            <button type="submit">Enviar enlace</button>
          </>
        )}

        <p className="registro">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </form>
    </main>
  );
}

export default OlvidePassword;
