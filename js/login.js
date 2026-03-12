document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(
    (u) => u.email === email && u.password === password
  );

  if (usuario) {
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
    alert(`Bienvenido, ${usuario.name}!`);
    window.location.href = "index.html";
  } else {
    alert("Correo o contraseña incorrectos ❌");
  }
});
