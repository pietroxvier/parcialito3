document.addEventListener("DOMContentLoaded", function () {
    const progressBar = document.getElementById("progress-bar");
    const levelElement = document.getElementById("level");
    const clickButton = document.getElementById("click-button");

    let progress = 0;
    let level = 1;
    let userId; // Declare userId in the outer scope

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
	
	
	

    // Function to update progress and level on the screen
    function updateProgressAndLevel(data) {
        // Update progress and level based on the data received
        progress = data.progress;
        level = data.level;

        // Update the UI with the received progress and level values
        progressBar.style.width = `${(progress / 7) * 100}%`; // Update the progress bar width
        levelElement.textContent = `Level: ${level}`;
    }

    // Function to handle the logout process
    function logout() {
        // You may need to perform additional tasks here, such as clearing cookies or tokens
        // For session-based authentication, you can unset or destroy the session
        // For token-based authentication, you can remove the token from local storage or a cookie

        // Redirect the user to the logout or login page
        window.location.href = "logout.php"; // Replace with your actual logout URL
    }

    // Add a click event listener to the logout button
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    // Event listener for the button click
    clickButton.addEventListener("click", () => {
        progress++;
        if (progress >= 7) {
            level++;
            progress = 0;
        }
        progressBar.style.width = `${(progress / 7) * 100}%`; // Update the progress bar width
        levelElement.textContent = `Level: ${level}`;

        saveUserData(); // Call the function to save user data when needed
    });

    // Load progress and level from the server when the page loads
    fetch("http://127.0.0.1:3000/api/check-progress")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // Update the UI with the received progress and level values
            updateProgressAndLevel(data);
        })
        .catch((error) => {
            console.error("Error loading progress and level:", error);
        });
		
		
  // Access the user_id variable defined in index.php
    const user = { userId: user_id };

    // Send a POST request to the server's API endpoint
    fetch("http://127.0.0.1:3000/api/your-endpoint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userId),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // Handle the response from the server, if needed
            console.log("Response from the server:", data);
        })
        .catch((error) => {
            console.error("Fetch error:", error);
        });


});
