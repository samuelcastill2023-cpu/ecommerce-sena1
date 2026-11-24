import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { aviso } from "../avisos";

function RestablecerPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const cambiarPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmar) {
      aviso("Completa los dos campos", "warning");
      return;
    }

    if (password.length < 6) {
      aviso("La contraseña debe tener al menos 6 caracteres", "warning");
      return;
    }

    if (password !== confirmar) {
      aviso("Las contraseñas no coinciden", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: password,
          confirmPassword: confirmar
        })
      });

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  return (
    <main>
      <form className="login-container" onSubmit={cambiarPassword} noValidate>
        <h2>Nueva contraseña</h2>

        <label>Nueva contraseña</label>
        <input
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirmar contraseña</label>
        <input
          type="password"
          placeholder="Repite la contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        <button type="submit">Cambiar contraseña</button>
      </form>
    </main>
  );
}

export default RestablecerPassword;
