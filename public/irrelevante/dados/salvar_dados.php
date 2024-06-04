<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$logData = date('Y-m-d H:i:s') . "\n";
$logData .= "Received POST data:\n" . json_encode($_POST, JSON_PRETTY_PRINT) . "\n\n";

file_put_contents('received_data.txt', $logData, FILE_APPEND);

?>