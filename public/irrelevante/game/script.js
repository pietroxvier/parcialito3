document.addEventListener("DOMContentLoaded", () => {
    const levelElement = document.getElementById("level");
    const incrementButton = document.getElementById("incrementButton");

    // Function to update the level in the database
    const updateLevel = () => {
        fetch("/update-level", {
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            levelElement.textContent = data.level;
        })
        .catch(error => console.error(error));
    };

    // Add event listener to the button
    incrementButton.addEventListener("click", updateLevel);
});
