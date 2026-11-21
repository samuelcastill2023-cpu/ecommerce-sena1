import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function OlvidePassword() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  // 📧 Pedir el enlace para cambiar la contraseña
  const enviarEnlace = async () => {
    if (!correo) {
      alert("Escribe tu correo");
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
        alert(data.message);
        return;
      }

      setEnviado(true);
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <main>
      <div className="login-container">
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

            <button onClick={enviarEnlace}>Enviar enlace</button>
          </>
        )}

        <p className="registro">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </main>
  );
}

export default OlvidePassword;
