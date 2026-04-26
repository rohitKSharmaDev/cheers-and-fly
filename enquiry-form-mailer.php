<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Security: Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Security: Secure headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Security: Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Security: Rate Limiting
$max_attempts = 5;
$time_window  = 300;
if (!isset($_SESSION['form_attempts'])) {
    $_SESSION['form_attempts']      = 0;
    $_SESSION['form_first_attempt'] = time();
}
if (time() - $_SESSION['form_first_attempt'] > $time_window) {
    $_SESSION['form_attempts']      = 0;
    $_SESSION['form_first_attempt'] = time();
}
if ($_SESSION['form_attempts'] >= $max_attempts) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Too many requests. Try again later.']);
    exit;
}
$_SESSION['form_attempts']++;

// Security: CSRF Validation
function validateCSRFToken($token) {
    if (empty($token) || empty($_SESSION['csrf_token'])) return false;
    return hash_equals($_SESSION['csrf_token'], $token);
}

// Security: Sanitize Input
function sanitizeInput($data) {
    return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Security: Validate Email
function validateEmail($email) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return false;
    if (preg_match('/[\r\n]/', $email)) return false;
    return $email;
}

// Security: Validate Phone
function validatePhone($phone) {
    $phone = preg_replace('/[^0-9+\-\s()]/', '', $phone);
    if (strlen($phone) < 7 || strlen($phone) > 20) return false;
    return $phone;
}

// Security: Validate CSRF
$csrfToken = $_POST['csrf_token'] ?? '';
if (!validateCSRFToken($csrfToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid request. Refresh and try again.']);
    exit;
}

// Security: Length Limits
$max_lengths = [
    'name'       => 100,
    'email'      => 254,
    'phone'      => 20,
    'getQuoteOf' => 100,  // ✅ Added
    'message'    => 1000
];
foreach ($max_lengths as $field => $max) {
    if (isset($_POST[$field]) && strlen($_POST[$field]) > $max) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Invalid $field"]);
        exit;
    }
}

// Get and validate inputs
$name       = sanitizeInput($_POST['name'] ?? '');
$email      = validateEmail($_POST['email'] ?? '');
$phone      = validatePhone($_POST['phone'] ?? '');
$getQuoteOf = sanitizeInput($_POST['getQuoteOf'] ?? ''); // ✅ Added
$message    = sanitizeInput($_POST['message'] ?? '');    // ✅ Optional now

// Only name, email, phone, getQuoteOf are required
if (!$name || !$email || !$phone || !$getQuoteOf) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing required fields']);
    exit;
}

// Send Email via PHPMailer
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;

    $mail->setFrom($_ENV['SMTP_USER'], 'Cheers and Fly Vacations');
    $mail->addAddress($_ENV['MAIL_TO']);
    $mail->addAddress($_ENV['MAIL_TO_PERSONAL']);
    $mail->addReplyTo($email, $name);

    $mail->CharSet  = 'UTF-8';
    $mail->Encoding = 'base64';
    $mail->isHTML(true);

    $mail->Subject = 'New Enquiry: ' . $getQuoteOf . ' from ' . $name;
    $template = file_get_contents(__DIR__ . '/enquiry-email-template.html');
    $messageBlock = $message
    ? "<hr class='divider'><div class='message-box'><div class='message-label'>💬 Message</div><div class='message-text'>{$message}</div></div>"
    : '';
    $template = str_replace([
        '{{NAME}}',
        '{{EMAIL}}',
        '{{PHONE}}',
        '{{GET_QUOTE_OF}}',
        '{{MESSAGE_BLOCK}}'
    ], [
        $name,
        $email,
        $phone,
        $getQuoteOf,
        $messageBlock
    ], $template);

    $mail->Body    = $template;
    $mail->AltBody = "Name: $name\nEmail: $email\nPhone: $phone\nEnquiry For: $getQuoteOf\nMessage: $message";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Enquiry sent successfully']);

} catch (Exception $e) {
    error_log('Mailer Error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send enquiry. Please try again.']);
}