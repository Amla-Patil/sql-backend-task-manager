<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

$task_id = $data['task_id'];

$stmt = $conn->prepare("UPDATE tasks SET status='Accepted' WHERE id=? AND status='Available'");
$stmt->bind_param("i", $task_id);

if ($stmt->execute()) {
    echo json_encode(['status'=>'success']);
} else {
    echo json_encode(['status'=>'error']);
}
?>
