function enviarRecuperacion() {
    const emailUsuario = document.getElementById("email").value;

    if (emailUsuario === "") {
        alert("Por favor escribe tu correo");
        return;
    }

    Email.send({
        SecureToken : "AQUI_TU_TOKEN",
        To : emailUsuario,
        From : "tu-correo@gmail.com",
        Subject : "Recuperación de contraseña",
        Body : "Haz clic en este enlace para recuperar tu contraseña."
    })
    .then(
      message => alert("Correo enviado correctamente")
    );
}
