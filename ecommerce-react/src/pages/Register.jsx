import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    fecha: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = () => {
    if (!form.nombre || !form.correo || !form.password) {
      alert("Completa los campos obligatorios");
      return;
    }

    // 🔥 Guardar usuario
    localStorage.setItem("usuario", JSON.stringify(form));

    alert("Registro exitoso");

    // 🔥 Redirigir al login
    navigate("/login");
  };

  return (
    <div className="login-container">
      <h2>Registro</h2>

      <label>Nombre completo</label>
      <input name="nombre" onChange={handleChange} />

      <label>Correo</label>
      <input type="email" name="correo" onChange={handleChange} />

      <label>Contraseña</label>
      <input type="password" name="password" onChange={handleChange} />

      <label>Teléfono</label>
      <input name="telefono" onChange={handleChange} />

      <label>Dirección</label>
      <input name="direccion" onChange={handleChange} />

      <label>Ciudad</label>
      <input name="ciudad" onChange={handleChange} />

      <label>Fecha de nacimiento</label>
      <input type="date" name="fecha" onChange={handleChange} />

      <button onClick={handleRegister}>Registrarse</button>
    </div>
  );
}

export default Register;