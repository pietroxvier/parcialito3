document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout-button");
  
    logoutButton.addEventListener("click", function () {
      // Deleta o cookie jwtToken
      deleteJwtToken();
  
      // Redireciona o usuário para a página inicial
      window.location.href = "/";
    });
  });
  
  function deleteJwtToken() {
    // Define o cookie jwtToken com uma data de expiração passada, o que fará com que seja excluído
    localStorage.removeItem("jwtToken");
  }
  