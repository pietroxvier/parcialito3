<?php
// Database connection parameters
$host = "localhost"; // Replace with your database host (usually 'localhost' for XAMPP)
$dbname = "parcialito"; // Replace with your database name
$username = "root"; // Replace with your database username
$password = ""; // Replace with your database password

// Attempt to connect to the database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    // Set PDO to throw exceptions on errors
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
