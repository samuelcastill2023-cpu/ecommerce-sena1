function Login() {
  return (
    <main>
      <div className="login-container">
        <h2>Iniciar Sesión</h2>

        <label>Correo electrónico</label>
        <input type="email" placeholder="Ingresa tu correo" />

        <label>Contraseña</label>
        <input type="password" placeholder="Ingresa tu contraseña" />

        <button>Ingresar</button>

        <p className="registro">
          ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
        </p>

        <p className="forgot">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </p>
      </div>
    </main>
  );
}

export default Login;