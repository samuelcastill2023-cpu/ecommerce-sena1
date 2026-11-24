import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { aviso } from "../avisos";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (correo === "" || password === "") {
      aviso("Por favor completa todos los campos", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correo,
          password: password,
        }),
      });

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
  localStorage.setItem("sesion", data.user.email);
  localStorage.setItem("nombreUsuario", data.user.name);
  localStorage.setItem("token", data.token);
  localStorage.setItem("rol", data.user.rol);

  window.dispatchEvent(new Event("sesionActualizada"));

  navigate("/productos");
}

    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  return (
    <main>
      <form className="login-container" onSubmit={handleLogin} noValidate>
        <h2>Iniciar Sesión</h2>

        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Ingresar</button>

        <p className="forgot">
          <Link to="/olvide-password">¿Olvidaste tu contraseña?</Link>
        </p>

        <p className="registro">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;