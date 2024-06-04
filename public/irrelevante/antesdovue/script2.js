document.addEventListener("DOMContentLoaded", function () {
    const progressElement = document.getElementById("progress");
    const messageElement = document.getElementById("message");
    const moreXpButton = document.getElementById("more-xp");
    const countdownElement = document.getElementById("countdown");

    const chooseJosefinaButton = document.getElementById("choose-josefina");
    const chooseJosephButton = document.getElementById("choose-joseph");
    const selectedNameElement = document.getElementById("selected-name");
    const nivelElement = document.getElementById("nivel"); // Select the level element

    // Function to update the displayed level
    function updateLevel(newLevel) {
        nivelElement.textContent = `Nível ${newLevel}`;
    }

    // Function to update progress bar
	function updateProgressBar() {
    const progressBarWidth = (progress / 7) * 100; // 7 points to reach 100%
    progressElement.style.width = progressBarWidth + "%";
}

    function updateProgress() {
        progress += 1;
        const progressBarWidth = (progress / 7) * 100; // 7 points to reach 100%
        progressElement.style.width = progressBarWidth + "%";
   
        if (progress === 7) {
            level++;
            progress = 0;
            progressElement.style.width = "0%";
            messageElement.textContent = `Parabéns, você subiu para o nível ${level}!`;


		
            setTimeout(() => {
                messageElement.textContent = "";
            }, 3000); // Display message for 3 seconds

            // Update the displayed level
            updateLevel(level);
			
			
            // Save the level and progress to localStorage when they change
            localStorage.setItem("level", level);
            localStorage.setItem("progress", progress);
        } else {
            // Save the progress to localStorage when it changes (not just when it reaches 3)
            localStorage.setItem("progress", progress);
        }
    }
	
	// Function to set the selected name in localStorage
function setSelectedName(name) {
    localStorage.setItem("selectedName", name);
}

// Function to get the selected name from localStorage
function getSelectedName() {
    return localStorage.getItem("selectedName");
}

// Function to hide the name buttons
function hideNameButtons() {
    chooseJosefinaButton.style.display = "none";
    chooseJosephButton.style.display = "none";
}


   // Function to load level and progress from localStorage
    function loadFromLocalStorage() {
        const savedLevel = localStorage.getItem("level");
        const savedProgress = localStorage.getItem("progress");
		
        
        if (savedLevel) {
            level = parseInt(savedLevel);
            updateLevel(level);
        }

        if (savedProgress !== null) {
            progress = parseInt(savedProgress);
        updateProgressBar(); // Update the progress bar			
			}
    }

	    // Initial values
    let progress = parseInt(localStorage.getItem("progress")) || 0; // Start with the value from localStorage or 0 if not present
    let level = 1;
    let canClick = true;
    let countdownInterval;
    let startTime;
    let timeRemaining = 0.1 * 60 * 1000; // 50 minutes in milliseconds

    function updateCountdown() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const remainingMilliseconds = timeRemaining - elapsedTime;

        if (remainingMilliseconds <= 0) {
            clearInterval(countdownInterval); // Stop the countdown
            updateProgress();
            canClick = true;
			countdownElement.textContent = ""; // Clear the countdown
            messageElement.textContent = "Hora da pausa";
			
        // Play the XP sound
        const xpSound = document.getElementById("xpSound");
        xpSound.play();

            // Display countdown during the pause
            let pauseTimeRemaining = 0.001 * 60 * 1000; // 15 minutes in milliseconds
            const pauseCountdown = setInterval(function () {
                const pauseRemainingSeconds = Math.ceil(pauseTimeRemaining / 1000);
                const pauseMinutes = Math.floor(pauseRemainingSeconds / 60);
                const pauseSeconds = pauseRemainingSeconds % 60;
                countdownElement.textContent = `${pauseMinutes}:${pauseSeconds < 10 ? "0" : ""}${pauseSeconds}`;
				countdownElement.classList.add("countdown-text"); // Add the class here
				


                if (pauseTimeRemaining <= 0) {
                    clearInterval(pauseCountdown);
                    countdownElement.textContent = "";
                    messageElement.textContent = "Parabéns! Você ganhou 1 ponto de experiência.";
					
                    setTimeout(() => {
                        messageElement.textContent = "";
                        moreXpButton.disabled = false; // Enable the "More XP" button
                    }, 5000); // Display message for 3 seconds
                }

                pauseTimeRemaining -= 1000;
            }, 1000);

            moreXpButton.disabled = true; // Disable the "More XP" button during the pause
        } else {
            const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            countdownElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
    }

    // Function to handle "More XP" button click
    function handleMoreXpClick() {
        if (canClick) {
            canClick = false;
            messageElement.textContent = "Hora de estudar";

            startTime = performance.now();
            updateCountdown();

            // Start the countdown interval and continue even when the tab is in the background
            countdownInterval = setInterval(updateCountdown, 1000); // Update every 1 second
        }
    }

    // Event listener for "More XP" button
    moreXpButton.addEventListener("click", handleMoreXpClick);

const welcomeMessageElement = document.getElementById("welcome-message");



// Add event listener for the "Escolher Josefina" button
chooseJosefinaButton.addEventListener("click", function () {
    chooseJosefinaButton.classList.add("selected");
    chooseJosephButton.classList.remove("selected");    
    // Hide the buttons
    chooseJosefinaButton.style.display = "none";
    chooseJosephButton.style.display = "none";
    
    // Change the welcome message
    welcomeMessageElement.textContent = "Seja bem-vinda, Josefina!";
	
	    // Save the selected name in localStorage
    setSelectedName("Josefina");
	
});

// Add event listener for the "Escolher Joseph" button
chooseJosephButton.addEventListener("click", function () {
    chooseJosephButton.classList.add("selected");
    chooseJosefinaButton.classList.remove("selected");    
    // Hide the buttons
    chooseJosefinaButton.style.display = "none";
    chooseJosephButton.style.display = "none";
    
    // Change the welcome message
    welcomeMessageElement.textContent = "Seja bem-vindo, Joseph!";
	
	    // Save the selected name in localStorage
    setSelectedName("Joseph");
});

// Check if a name has been previously selected and update the welcome message accordingly
const savedName = getSelectedName();
if (savedName) {
	 if (savedName === "Josefina") {
    welcomeMessageElement.textContent = `Seja bem-vinda, ${savedName}!`;
	    } else if (savedName === "Joseph") {
     welcomeMessageElement.textContent = `Seja bem-vindo, ${savedName}!`;
    }
	 hideNameButtons(); // Hide the buttons if a name is saved

}

    // Initialize the displayed level
    updateLevel(level);

	
    // Call the function to load level and progress from localStorage when the page loads
    loadFromLocalStorage();
});