<?php
include 'db.php';

$result = $conn->query("SELECT t.*, u.name as poster FROM tasks t JOIN users u ON t.posted_by=u.id ORDER BY t.id DESC");
$tasks = [];

while($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

echo json_encode($tasks);
?>
