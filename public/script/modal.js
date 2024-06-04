document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const closeButton = document.getElementById("close");
  const startLearningButton = document.querySelector(".hero-content .button");

  function openModal() {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  function outsideClick(event) {
    if (event.target === modal) {
      closeModal();
    }
  }

  // Open modal when "Começar Agora" button is clicked
  startLearningButton.addEventListener("click", openModal);

  // Close modal when the close button is clicked
  closeButton.addEventListener("click", closeModal);

  // Close modal when clicking outside the modal content
  window.addEventListener("click", outsideClick);
});
