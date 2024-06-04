document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("login-error");
  const errorText = document.getElementById("error-text");
  const closeError = document.getElementById("close-error");

  if (hasActiveToken()) {
    window.location.href = "/progressbar.html";
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const data = { email: email, password: password };

    const serverPort = ':8080';
    const serverUrl = `${window.location.protocol}//${window.location.hostname}${serverPort}`;
    const loginUrl = `${serverUrl}/login`;

    axios.post(loginUrl, data)
      .then(function (response) {
        const token = response.data.token;

        localStorage.setItem("jwtToken", token);

        console.log('Token armazenado com sucesso');
        console.log("Login bem-sucedido!");

        window.location.href = "/progressbar.html";
      })
      .catch(function(error) {
        console.error("Erro ao fazer login:", error);
        if (errorMessage && errorText) {
          let message = "Erro ao fazer login. Verifique suas credenciais e tente novamente.";
          if (error.response && error.response.data && error.response.data.error) {
            if (error.response.data.error === "Invalid email") {
              message = "E-mail inválido. Verifique e tente novamente.";
            } else if (error.response.data.error === "Invalid password") {
              message = "Senha inválida. Verifique e tente novamente.";
            }
          }
          errorText.textContent = message;
          errorMessage.classList.add("show", "shake");
          setTimeout(() => {
            errorMessage.classList.remove("shake");
          }, 500); // Remove shake animation after 0.5s
        } else {
          console.error("Error element not found");
        }
      });
  });


});

function hasActiveToken() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds

    if (Date.now() >= exp) {
      localStorage.removeItem("jwtToken");
      return false;
    }

    return true;
  } catch (e) {
    console.error("Erro ao verificar token:", e);
    localStorage.removeItem("jwtToken");
    return false;
  }
}
