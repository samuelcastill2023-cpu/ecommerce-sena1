import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";

function RestablecerPassword() {
  // 🔑 El token viene en la URL: /restablecer/abc123...
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const cambiarPassword = async () => {
    if (!password || !confirmar) {
      alert("Completa los dos campos");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmar) {
      alert("Las contraseñas no coinciden");
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

      alert(data.message);

      if (res.ok) {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <main>
      <div className="login-container">
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

        <button onClick={cambiarPassword}>Cambiar contraseña</button>
      </div>
    </main>
  );
}

export default RestablecerPassword;
