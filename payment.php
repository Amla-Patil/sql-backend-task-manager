<?php
header('Content-Type: application/json');

// DB connection - adjust host/user/pass/dbname if needed
$host = '127.0.0.1';
$user = 'root';
$pass = ''; // set if you have a password
$db   = 'helping_hand';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
  exit;
}

// read POST JSON
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
  echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
  exit;
}

$task_id = isset($input['task_id']) ? intval($input['task_id']) : 0;
$user_email = isset($input['user_email']) ? $conn->real_escape_string($input['user_email']) : null;
$amount = isset($input['amount']) ? floatval($input['amount']) : 0.00;
$status = isset($input['status']) ? $conn->real_escape_string($input['status']) : 'Success';

if (!$task_id || !$user_email) {
  echo json_encode(['status' => 'error', 'message' => 'Missing task_id or user_email']);
  exit;
}

// get user id
$res = $conn->query("SELECT id FROM users WHERE email = '$user_email' LIMIT 1");
if (!$res || $res->num_rows == 0) {
  echo json_encode(['status' => 'error', 'message' => 'User not found']);
  exit;
}
$user = $res->fetch_assoc();
$user_id = intval($user['id']);

// Insert into payments table
$stmt = $conn->prepare("INSERT INTO payments (task_id, user_id, amount, status) VALUES (?, ?, ?, ?)");
$stmt->bind_param('iids', $task_id, $user_id, $amount, $status);
$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
  echo json_encode(['status' => 'error', 'message' => 'Failed to insert payment']);
  exit;
}

// Update task: mark Accepted and set accepted_by to this user
$upd = $conn->prepare("UPDATE tasks SET status = 'Accepted', accepted_by = ? WHERE id = ?");
$upd->bind_param('ii', $user_id, $task_id);
$upd->execute();
$upd->close();

echo json_encode(['status' => 'success', 'message' => 'Payment recorded and task accepted']);
$conn->close();
?>

