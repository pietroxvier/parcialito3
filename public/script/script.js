document.addEventListener("DOMContentLoaded", function () {
  const hero = document.getElementById("hero");
  const practiceSection = document.getElementById("practice-section");
  const buttonsDiv = document.querySelector(".buttons");

  // Callback function for the Intersection Observer
  function handleIntersection(entries) {
    const isInHero = entries[0].isIntersecting;
    buttonsDiv.classList.toggle("hidden", !isInHero);
  }

  // Create a new Intersection Observer
  const observer = new IntersectionObserver(handleIntersection);

  // Observe the learn section
  observer.observe(practiceSection);
});