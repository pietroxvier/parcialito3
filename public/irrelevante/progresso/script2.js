document.addEventListener("DOMContentLoaded", function () {
    const progressElement = document.getElementById("progress-bar");
    const levelElement = document.getElementById("level");
    const clickButton = document.getElementById("click-button");
    const countdownElement = document.getElementById("countdown");

    let progress = 0;
    let level = 1;

    // Function to save user data to the server
    function saveUserData() {
        // Prepare the data to send to the server
        const userData = {
            progress: progress,
            level: level,
        };

        // Make a POST request to update user data
        fetch("http://127.0.0.1:3000/api/updateuserdata", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data); // Log the response from the server (optional)
            })
            .catch((error) => {
                console.error("Error saving user data:", error);
            });
    }

    // Function to update progress and level on the client-side
    function updateProgressAndLevel(data) {
        progress = data.progress;
        level = data.level;
        progressElement.textContent = `Progress: ${progress}`;
        levelElement.textContent = `Level: ${level}`;
    }

    // Create a WebSocket connection to the server
    const socket = new WebSocket("ws://127.0.0.1:3000");

    // Listen for WebSocket messages from the server
    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.countdown) {
            // Update the countdown timer
            countdownElement.textContent = `Countdown: ${data.countdown}`;
        }
    });

    // Event listener for the button click
    clickButton.addEventListener("click", () => {
        // Check if the button is clickable based on the countdown value
        if (parseInt(countdownElement.textContent.split(" ")[1]) === 0) {
            progress++;
            if (progress >= 7) {
                level++;
                progress = 0;
            }
            progressElement.textContent = `Progress: ${progress}`;
            levelElement.textContent = `Level: ${level}`;

            // Send an empty message to the server to start the countdown
            socket.send(JSON.stringify({ startCountdown: true }));

            // Call the function to save user data when needed
            saveUserData();
        } else {
            countdownElement.textContent = `Countdown: ${data.countdown}`;
        }
    });
});
