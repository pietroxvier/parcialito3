<?php
session_start(); // Start the session

// Check if the user is logged in (you can use your own authentication logic)
if (isset($_SESSION['user_id'])) {
    // Unset all session variables
    $_SESSION = array();

    // Destroy the session
    session_destroy();

    // Redirect the user to the login page or any other page after logout
    header("Location: login.php"); // Replace with your actual login page URL
    exit();
} else {
    // If the user is not logged in, redirect them to the login page
    header("Location: login.php"); // Replace with your actual login page URL
    exit();
}
?>