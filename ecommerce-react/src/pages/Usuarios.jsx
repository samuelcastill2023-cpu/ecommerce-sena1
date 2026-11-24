import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { sesionVencida } from "../sesion";
import { FiUsers } from "react-icons/fi";
import { aviso } from "../avisos";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const rol = localStorage.getItem("rol");

  const perfiles = [
    { valor: "cliente", nombre: "Cliente" },
    { valor: "gestor", nombre: "Gestor de tienda" },
    { valor: "admin", nombre: "Super admin" }
  ];

  // 📡 Cargar usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      if (rol !== "admin") {
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });

        if (sesionVencida(res)) {
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          aviso(data.message, "error");
          return;
        }

        setUsuarios(data);
      } catch (error) {
        console.error(error);
        aviso("Error al conectar con el servidor", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, [rol]);

  // 👤 Cambiar perfil de un usuario
  const cambiarRol = async (id, nuevoRol) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ rol: nuevoRol })
      });

      if (sesionVencida(res)) {
        return;
      }

      const data = await res.json();

      aviso(data.message, res.ok ? "success" : "error");

      if (res.ok) {
        setUsuarios(
          usuarios.map((usuario) =>
            usuario._id === id ? data.user : usuario
          )
        );
      }
    } catch (error) {
      console.error(error);
      aviso("Error al conectar con el servidor", "error");
    }
  };

  if (cargando) {
    return (
      <main className="perfil-main">
        <p>Cargando usuarios...</p>
      </main>
    );
  }

  if (rol !== "admin") {
    return (
      <main className="perfil-main">
        <h2>Acceso denegado</h2>
        <p>Esta página es solo para el super admin.</p>
      </main>
    );
  }

  return (
    <main className="perfil-main admin-main">

      <div className="admin-header">
        <h1>Usuarios del sistema</h1>
        <p>Asigna el perfil de cada usuario.</p>
      </div>

      {/* ===== RESUMEN POR PERFIL ===== */}
      <div className="admin-resumen">
        {perfiles.map((perfil) => (
          <div className="resumen-item" key={perfil.valor}>
            <strong>
              {usuarios.filter((usuario) => usuario.rol === perfil.valor).length}
            </strong>
            <span>{perfil.nombre}</span>
          </div>
        ))}
      </div>

      <section className="perfil-card">

        <div className="perfil-card-header">
          <h2><FiUsers /> Usuarios ({usuarios.length})</h2>
          <p>Cliente compra, el gestor maneja la tienda y el super admin hace todo.</p>
        </div>

        {usuarios.map((usuario) => (
          <div className="admin-fila" key={usuario._id}>
            <span className="usuario-avatar">
              {usuario.name.charAt(0).toUpperCase()}
            </span>

            <div className="admin-info">
              <strong>{usuario.name}</strong>
              <p>{usuario.email}</p>
            </div>

            {usuario.email === localStorage.getItem("sesion") ? (
              <span className="badge-rol">Super admin (tú)</span>
            ) : (
              <select
                className={"select-rol rol-" + usuario.rol}
                value={usuario.rol}
                onChange={(e) => cambiarRol(usuario._id, e.target.value)}
              >
                {perfiles.map((perfil) => (
                  <option key={perfil.valor} value={perfil.valor}>
                    {perfil.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

      </section>

    </main>
  );
}

export default Usuarios;
