<?php
include 'db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Extract values
$category = $data['category'];
$title = $data['title'];
$description = $data['description'];
$time_slot = $data['timeSlot'];  // Expected as string (e.g. "2 PM - 4 PM")
$reward = $data['reward'];       // Expected as number
$posted_by_email = $data['postedBy'];  // We receive email, not user ID

// --- Step 1: Get user ID from email ---
$stmtUser = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmtUser->bind_param("s", $posted_by_email);
$stmtUser->execute();
$resultUser = $stmtUser->get_result();

if ($resultUser->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    exit;
}

$user = $resultUser->fetch_assoc();
$posted_by = $user['id'];

// --- Step 2: Insert the task ---
$stmt = $conn->prepare("INSERT INTO tasks (category, title, description, time_slot, reward, posted_by) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssdi", $category, $title, $description, $time_slot, $reward, $posted_by);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $stmt->error]);
}
?>
