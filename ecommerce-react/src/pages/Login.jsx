import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (correo === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    // 🔥 Obtener usuario registrado
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioGuardado) {
      alert("No hay usuario registrado");
      return;
    }

    // 🔥 Validar datos
    if (
      correo === usuarioGuardado.correo &&
      password === usuarioGuardado.password
    ) {
      // 🔥 Guardar sesión (nombre)
      localStorage.setItem("sesion", usuarioGuardado.nombre);

      alert("Bienvenido " + usuarioGuardado.nombre);

      // 🔥 Redirigir a productos
     window.location.href = "/productos";
    } else {
      alert("Datos incorrectos");
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

        {/* 🔥 REGISTRO FUNCIONANDO */}
        <p className="registro">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>

        {/* 🔥 (Luego lo conectamos bien) */}
        <p className="forgot">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </p>
      </div>
    </main>
  );
}

export default Login;