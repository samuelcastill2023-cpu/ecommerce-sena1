import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

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

  const handleRegister = async () => {
    // 📝 Validar que todos los campos estén llenos
    if (
      !form.nombre ||
      !form.correo ||
      !form.password ||
      !form.telefono ||
      !form.direccion ||
      !form.ciudad ||
      !form.fecha
    ) {
      alert("Completa todos los campos");
      return;
    }

    // 📧 Validar formato del correo
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(form.correo)) {
      alert("El correo no es válido");
      return;
    }

    // 🔒 Validar largo de la contraseña
    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
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

      alert(data.message);

      if (res.ok) {
        localStorage.setItem("nombre", form.nombre);
        navigate("/login");
      }

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
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