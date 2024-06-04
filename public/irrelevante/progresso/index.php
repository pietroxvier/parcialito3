<?php


// Initialize a session to track user data
session_start();

// Include the database connection code
include('db.php'); // Adjust the path if necessary

$full_name = ""; // Initialize the variable

// Check if a user is logged in and retrieve their data
if (isset($_SESSION['user_id'])) {
    // Fetch user data from the database based on the user_id stored in $_SESSION
    $user_id = $_SESSION['user_id'];
    
    // Query the database to get user data (full_name, level, progress, etc.)
    // Replace 'users' with your actual table name
    $query = "SELECT full_name, level, progress FROM users WHERE user_id = ?";
    
    // Prepare and execute the query (replace with your database connection)
    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user) {
        $full_name = $user['full_name'];
        $level = $user['level'];
        $progress = $user['progress'];
    } else {
        // Handle the case where the user is not found in the database
        // You can redirect them to a login page or show an error message
        // header("Location: login.php");
        // exit();
    }
} else {
    // If the user is not logged in, redirect them to the login page
    header("Location: login.php");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Countdown Client</title>
</head>
<body>
<button id="start-button">Start Countdown</button>
<p id="countdown">Countdown: 0</p>
<p id="progress-points">Progress Points: 0</p>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-button");
    const countdownElement = document.getElementById("countdown");
    const progressPointsElement = document.getElementById("progress-points");
    
    // Define and initialize the WebSocket connection
    const ws = new WebSocket("ws://localhost:3000");

    let countdownInterval;
    let progressPoints = 0; // Initialize progress points

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.countdown !== undefined) {
            countdownElement.textContent = `Countdown: ${data.countdown}`;

            if (data.countdown === 0) {
                // Countdown reached 0, add 1 progress point
                progressPoints++;
                progressPointsElement.textContent = `Progress Points: ${progressPoints}`;
            }
        }
    });

    startButton.addEventListener("click", () => {
        ws.send(JSON.stringify({ startCountdown: true }));
    });
});
</script>
</body>
</html>
