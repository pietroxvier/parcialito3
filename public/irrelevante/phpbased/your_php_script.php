<?php
// Establish a database connection
$mysqli = new mysqli("localhost", "root", "", "game_db");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Increment progress points
if (isset($_POST["increment_progress"])) {
    // Get the current progress points from the database
    $result = $mysqli->query("SELECT progress_points FROM levels WHERE id = 1");
    $row = $result->fetch_assoc();
    $currentProgressPoints = $row["progress_points"];

    // Increment progress points by 1
    $newProgressPoints = $currentProgressPoints + 1;

    // Update the progress points in the database
    $mysqli->query("UPDATE levels SET progress_points = $newProgressPoints WHERE id = 1");

    // Handle any errors here

    // Send a JSON response with the updated progress points
    echo json_encode(["progressPoints" => $newProgressPoints]);
    exit; // Terminate the script to prevent further output
}

// Check progress points and level up
if (isset($_GET["check_progress"])) {
    $result = $mysqli->query("SELECT progress_points, level FROM levels WHERE id = 1");
    $row = $result->fetch_assoc();
    $progressPoints = $row["progress_points"];

    if ($progressPoints >= 7) {
        $mysqli->query("UPDATE levels SET level = level + 1, progress_points = 0 WHERE id = 1");

        // Handle any errors here

        // Send a response to the client
        echo json_encode(["levelUp" => true, "level" => $row["level"]]);
    } else {
        echo json_encode(["levelUp" => false, "progressPoints" => $progressPoints, "level" => $row["level"]]);
    }
}

// Close the database connection
$mysqli->close();
?>
