function registrarUsuario(event) {
  event.preventDefault();

  // Obtener valores
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const apellidos = document.getElementById('apellidosRegistro').value.trim();
  const direccion = document.getElementById('direccionRegistro').value.trim();
  const pais = document.getElementById('paisRegistro').value.trim();
  const fechaNacimiento = document.getElementById('fechaNacimientoRegistro').value;
  const codigoPostal = document.getElementById('codigoPostalRegistro').value.trim();
  const email = document.getElementById('emailRegistro').value.trim();
  const password = document.getElementById('passwordRegistro').value;
  const confirmar = document.getElementById('confirmarPasswordRegistro').value;

  // Validar contraseñas
  if (password !== confirmar) {
    alert('❌ Las contraseñas no coinciden.');
    return;
  }

  // Obtener usuarios existentes o crear nuevo arreglo
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verificar si el correo ya existe
  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    alert('⚠️ Ya existe una cuenta registrada con este correo.');
    return;
  }

  // Crear objeto usuario
  const nuevoUsuario = {
    nombre,
    apellidos,
    direccion,
    pais,
    fechaNacimiento,
    codigoPostal,
    email,
    password
  };

  // Guardar usuario en localStorage
  usuarios.push(nuevoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert('✅ Registro completado correctamente.');
  window.location.href = 'index.html';
}
