<?php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Generate and store CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

echo json_encode(['csrf_token' => $_SESSION['csrf_token']]);