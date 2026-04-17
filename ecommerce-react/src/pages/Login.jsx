import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (correo === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: correo,
          password: password,
        }),
      });

      const data = await res.json();

      alert(data.mensaje);

      if (res.ok) {
        // 🔥 CAMBIO AQUÍ
        const nombre = localStorage.getItem("nombre");
        localStorage.setItem("sesion", nombre);

        window.location.href = "/productos";
      }

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <main>
      <div className="login-container">
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

        <button onClick={handleLogin}>Ingresar</button>

        <p className="registro">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>

        <p className="forgot">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </p>
      </div>
    </main>
  );
}

export default Login;