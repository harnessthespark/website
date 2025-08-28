<?php
/**
 * Simple Contact Form Handler for Harness the Spark
 * Replace this with your preferred backend solution (Node.js, Python, etc.)
 */

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://harnessthespark.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$required = ['name', 'email', 'service', 'message'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit;
    }
}

// Sanitize input
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($data['phone'] ?? '', FILTER_SANITIZE_STRING);
$service = filter_var($data['service'], FILTER_SANITIZE_STRING);
$message = filter_var($data['message'], FILTER_SANITIZE_STRING);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Anti-spam checks
if (strlen($message) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Message too short']);
    exit;
}

// Rate limiting (simple implementation)
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . '/contact_rate_limit_' . md5($ip);
if (file_exists($rate_limit_file) && time() - filemtime($rate_limit_file) < 300) {
    http_response_code(429);
    echo json_encode(['error' => 'Please wait 5 minutes before submitting again']);
    exit;
}
touch($rate_limit_file);

try {
    // Email configuration
    $to = 'lisa@harnessthespark.com';
    $subject = 'New Coaching Inquiry - ' . $service;
    
    // Email body
    $email_body = "
New coaching inquiry from your website:

Name: $name
Email: $email
Phone: $phone
Service Interest: $service
Timestamp: " . date('Y-m-d H:i:s') . "

Message:
$message

---
Sent from Harness the Spark website contact form
    ";
    
    // Email headers
    $headers = [
        'From: website@harnessthespark.com',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    // Send email
    if (mail($to, $subject, $email_body, implode("\r\n", $headers))) {
        // Log successful submission
        error_log("Contact form submission: $name <$email> - $service");
        
        // Return success
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! Your message has been sent successfully.'
        ]);
    } else {
        throw new Exception('Mail sending failed');
    }
    
} catch (Exception $e) {
    // Log error
    error_log('Contact form error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Sorry, there was an error sending your message. Please try emailing directly.',
        'email_fallback' => 'lisa@harnessthespark.com'
    ]);
}
?>