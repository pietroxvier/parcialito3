document.addEventListener("DOMContentLoaded", function () {
    const loginModal = document.getElementById("login-modal");
    const closeLoginButton = document.getElementById("close-login");
    const loginButton = document.getElementById("login-button");
  
    function openLoginModal() {
      loginModal.classList.add("open");
      document.body.classList.add("modal-open");
    }
  
    function closeLoginModal() {
      loginModal.classList.remove("open");
      document.body.classList.remove("modal-open");
    }
  
    function outsideClick(event) {
      if (event.target === loginModal) {
        closeLoginModal();
      }
    }
  
    // Open login modal when "Login" button is clicked
    loginButton.addEventListener("click", openLoginModal);
  
    // Close login modal when the close button is clicked
    closeLoginButton.addEventListener("click", closeLoginModal);
  
    // Close login modal when clicking outside the modal content
    window.addEventListener("click", outsideClick);
  });
  