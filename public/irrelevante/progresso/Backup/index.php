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
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500&display=swap" rel="stylesheet">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parcialito - Game</title>
    <link rel="stylesheet" href="style2.css">
<audio id="xpSound" preload="auto">
  <source src="levelup.mp3" type="audio/mpeg">
</audio>

</head>
<body>
    <div class="sidebar">
        <!-- Sidebar content goes here -->
        <ul>
            <li><a href="index.html">Início do Site</a></li>
			<li><a href="#">Choices</a></li>
            <li><a href="#">Meu perfil</a></li>
            <li><a href="#">Configurações</a></li>
			<li id="logout-button"><b>Sair</b></li>
			
        </ul>
    </div>
	
	    <div class="content">

    <div class="progress-container">
	    <h1><div id="level">Level: 1</div></h1>
        <div class="progress-bar">
            <div class="progress" id="progress-bar"></div>
        </div>
    <button id="click-button">Click Me</button>


        <!-- New avatar section -->
        <div class="avatar-section">
            <img src="enfermeira-fofa.svg" alt="Avatar">
            <div class="name-selection">
                    <div id="welcome-message">
                        <?php
                if (!empty($full_name)) {
                    echo "Seja bem-vindo(a), $full_name!";
					echo "$user_id";
                } else {
                    echo "Escolha seu nome:";
                }
                        ?>
            </div>
        </div>
    </div>
	    </div>
<script>
    var userid = <?php echo $user_id; ?>;

</script>

    <script src="script2.js"></script>
	
</body>
</html>