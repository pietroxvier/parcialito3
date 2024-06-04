<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    exit();
}

// Include your database connection code here
require_once 'db.php'; // Replace with your actual database connection code

// Get the user ID from the session
$userId = $_SESSION['user_id'];

try {
    // Calculate the new progress (for example, increment it)
    $query = "SELECT progress FROM users WHERE user_id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404); // User not found
        exit();
    }

    $newProgress = $row['progress'] + 1;

    // Update the user's progress in the database
    $updateQuery = "UPDATE users SET progress = ? WHERE user_id = ?";
    $updateStmt = $pdo->prepare($updateQuery);
    $updateStmt->execute([$newProgress, $userId]);

    // You can also update other user data if needed

    // Return the updated progress as JSON response
    echo json_encode(['progress' => $newProgress]);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
