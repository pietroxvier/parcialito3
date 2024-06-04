<?php
// Establish a database connection
$mysqli = new mysqli("localhost", "root", "", "game_db");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Increment progress points
if (isset($_POST["increment_progress"])) {
    $mysqli->query("UPDATE levels SET progress_points = progress_points + 1 WHERE id = 1");

    // Handle any errors here

    // Send a response to the client
    echo json_encode(["message" => "Progress point incremented"]);
}

// Check progress points and level up
if (isset($_GET["check_progress"])) {
    $result = $mysqli->query("SELECT progress_points FROM levels WHERE id = 1");
    $row = $result->fetch_assoc();
    $progressPoints = $row["progress_points"];

    if ($progressPoints >= 7) {
        $mysqli->query("UPDATE levels SET level = level + 1, progress_points = 0 WHERE id = 1");

        // Handle any errors here

        // Send a response to the client
        echo json_encode(["levelUp" => true, "level" => $row["level"]]);
    } else {
        echo json_encode(["levelUp" => false, "progressPoints" => $progressPoints]);
    }
}

// Close the database connection
$mysqli->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game</title>
</head>
<body>
    <button id="incrementProgressButton">Increment Progress</button>
    <p>Progress Points: <span id="progress">0</span></p>
    <p>Level: <span id="level">1</span></p>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const incrementProgressButton = document.getElementById("incrementProgressButton");
            const progressElement = document.getElementById("progress");
            const levelElement = document.getElementById("level");

            // Function to update progress points and level
const updateProgressAndLevel = () => {
    // Send a POST request to increment progress points and check progress
    fetch("your_php_script.php?increment_progress", { method: "POST" })
        .then(response => response.text()) // Change to text() to inspect response
        .then(data => {
            console.log("Response from server:", data); // Log the response
            try {
                const jsonData = JSON.parse(data);
                // Update progress points and level on the screen
                progressElement.textContent = jsonData.progressPoints;
                levelElement.textContent = jsonData.level;

                if (jsonData.levelUp) {
                    console.log("Level up!");
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        })
        .catch(error => console.error("Fetch error:", error));
};
            // Add event listener to the increment progress button
            incrementProgressButton.addEventListener("click", updateProgressAndLevel);

            // Fetch and display initial progress points when the page loads
            updateProgressAndLevel();
        });
    </script>
</body>
</html>
