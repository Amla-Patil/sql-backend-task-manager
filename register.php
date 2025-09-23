<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'];
$aadhar = $data['aadhar'];

// Check if user exists
$check = $conn->prepare("SELECT id FROM users WHERE email=?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['status' => 'exists']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO users (name,email,phone,aadhar) VALUES (?,?,?,?)");
$stmt->bind_param("ssss", $name, $email, $phone, $aadhar);
if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    echo json_encode(['status' => 'success', 'user_id' => $user_id]);
} else {
    echo json_encode(['status' => 'error']);
}
?>
