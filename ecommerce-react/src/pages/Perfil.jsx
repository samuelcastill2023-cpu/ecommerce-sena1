import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";
import { FiUser, FiLock } from "react-icons/fi";
import { aviso } from "../avisos";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    fecha: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      const correoSesion = localStorage.getItem("sesion");

      if (!correoSesion) {
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/users/profile/${encodeURIComponent(correoSesion)}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        );

        if (sesionVencida(res)) {
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          aviso(data.message || "No se pudo cargar el perfil", "error");
          setCargando(false);
          return;
        }

        setUsuario(data.user);

        setForm({
          nombre: data.user.name || "",
          correo: data.user.email || "",
          telefono: data.user.phone || "",
          direccion: data.user.address || "",
          ciudad: data.user.city || "",
          fecha: data.user.birthdate
            ? data.user.birthdate.substring(0, 10)
            : ""
        });

      } catch (error) {
        console.error(error);
        aviso("Error al conectar con el servidor", "error");
      }

      setCargando(false);
    };

    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (
      !form.nombre ||
      !form.correo ||
      !form.telefono ||
      !form.direccion ||
      !form.ciudad
    ) {
      aviso("Completa todos los campos", "warning");
      return;
    }

    const correoAnterior = localStorage.getItem("sesion");

    try {
      const res = await fetch(
        `${API_URL}/api/users/profile/${encodeURIComponent(correoAnterior)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify({
            name: form.nombre,
            newEmail: form.correo,
            phone: form.telefono,
            address: form.direccion,
            city: form.ciudad
          })
        }
      );

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        aviso(data.message || "No se pudieron guardar los cambios", "error");
        return;
      }

      localStorage.setItem("sesion", data.user.email);
      localStorage.setItem("nombreUsuario", data.user.name);

      window.dispatchEvent(new Event("sesionActualizada"));

      setUsuario(data.user);

      aviso("Perfil actualizado correctamente", "success");

    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.actual ||
      !passwordForm.nueva ||
      !passwordForm.confirmar
    ) {
      aviso("Completa todos los campos de contraseña", "warning");
      return;
    }

    const correoSesion = localStorage.getItem("sesion");

    try {
      const res = await fetch(
        `${API_URL}/api/users/change-password/${encodeURIComponent(correoSesion)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify({
            currentPassword: passwordForm.actual,
            newPassword: passwordForm.nueva,
            confirmPassword: passwordForm.confirmar
          })
        }
      );

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        aviso(data.message || "No se pudo cambiar la contraseña", "error");
        return;
      }

      aviso("Contraseña actualizada correctamente", "success");

      setPasswordForm({
        actual: "",
        nueva: "",
        confirmar: ""
      });

    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  if (cargando) {
    return (
      <main className="perfil-main">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="perfil-main">
        <h2>No hay una sesión activa</h2>
        <p>Inicia sesión para consultar tu perfil.</p>
      </main>
    );
  }

  return (
    <main className="perfil-main">

      <div className="perfil-header">
        <h1>Mi perfil</h1>
        <p>Administra tu información personal y de seguridad.</p>
      </div>

      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2><FiUser /> Información personal</h2>
          <p>Actualiza los datos de tu cuenta.</p>
        </div>

        <form className="perfil-form" onSubmit={guardarCambios} noValidate>

          <div className="campo-perfil">
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="campo-perfil">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
            />
          </div>

          <div className="perfil-fila">

            <div className="campo-perfil">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="campo-perfil">
              <label>Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="campo-perfil">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="campo-perfil">
            <label>Fecha de nacimiento <FiLock /></label>
            <input
              type="date"
              value={form.fecha}
              disabled
            />
            <small>
              La fecha de nacimiento no puede modificarse.
            </small>
          </div>

          <button
            className="btn-guardar-perfil"
            type="submit"
          >
            Guardar cambios
          </button>

        </form>

      </section>


      <section className="perfil-card seguridad-card">

        <div className="perfil-card-header">
          <h2><FiLock /> Seguridad</h2>
          <p>Cambia la contraseña de tu cuenta.</p>
        </div>

        <form className="perfil-form" onSubmit={cambiarPassword} noValidate>

          <div className="campo-perfil">
            <label>Contraseña actual</label>
            <input
              type="password"
              name="actual"
              value={passwordForm.actual}
              onChange={handlePasswordChange}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="campo-perfil">
            <label>Nueva contraseña</label>
            <input
              type="password"
              name="nueva"
              value={passwordForm.nueva}
              onChange={handlePasswordChange}
              placeholder="Ingresa la nueva contraseña"
            />
          </div>

          <div className="campo-perfil">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              name="confirmar"
              value={passwordForm.confirmar}
              onChange={handlePasswordChange}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <button
            className="btn-guardar-perfil"
            type="submit"
          >
            Cambiar contraseña
          </button>

        </form>

      </section>

    </main>
  );
}

export default Perfil;