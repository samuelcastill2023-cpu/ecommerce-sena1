import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { aviso } from "../avisos";

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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !form.nombre ||
      !form.correo ||
      !form.password ||
      !form.telefono ||
      !form.direccion ||
      !form.ciudad ||
      !form.fecha
    ) {
      aviso("Completa todos los campos", "warning");
      return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(form.correo)) {
      aviso("El correo no es válido", "warning");
      return;
    }

    if (form.password.length < 6) {
      aviso("La contraseña debe tener al menos 6 caracteres", "warning");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.nombre,
          email: form.correo,
          password: form.password,
          phone: form.telefono,
          address: form.direccion,
          city: form.ciudad,
          birthdate: form.fecha
        }),
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
    <form className="login-container" onSubmit={handleRegister} noValidate>
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

      <button type="submit">Registrarse</button>
    </form>
  );
}

export default Register;