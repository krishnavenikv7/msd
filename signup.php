<?php
include 'db.php';

$errorMessage = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $passwordInput = $_POST['password'];
    $confirmPass = $_POST['confirm_password'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errorMessage = "Invalid email format.";
    } elseif (strlen($passwordInput) < 6) {
        $errorMessage = "Password must be at least 6 characters long.";
    } elseif ($passwordInput !== $confirmPass) {
        $errorMessage = "Passwords do not match.";
    } else {
        $password = password_hash($passwordInput, PASSWORD_DEFAULT);

        // Check for duplicate username or email
        $checkSql = "SELECT * FROM users WHERE username = ? OR email = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ss", $username, $email);
        $checkStmt->execute();
        $result = $checkStmt->get_result();

        if ($result->num_rows > 0) {
            $existingUser = $result->fetch_assoc();
            if ($existingUser['username'] == $username) {
                $errorMessage = "Username is not available.";
            } elseif ($existingUser['email'] == $email) {
                $errorMessage = "Email is not available.";
            }
        } else {
            // Generate unique user ID
            do {
                $userID = "SPM" . mt_rand(100000, 999999);
                $checkID = "SELECT user_id FROM users WHERE user_id = ?";
                $checkIDStmt = $conn->prepare($checkID);
                $checkIDStmt->bind_param("s", $userID);
                $checkIDStmt->execute();
                $checkIDStmt->store_result();
            } while ($checkIDStmt->num_rows > 0);

            $checkIDStmt->close();

            // Insert new user record
            $sql = "INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $userID, $username, $email, $password);

            if ($stmt->execute()) {
                header("Location: login.php");
                exit();
            } else {
                $errorMessage = "Error: " . $stmt->error;
            }
            $stmt->close();
        }
        $checkStmt->close();
    }
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="login.css"> <!-- Link to the CSS file -->
</head>
<body>
  <div class="container">
      <h2>Sign Up</h2>
      <?php if (!empty($errorMessage)): ?>
          <div class="error-message"><?php echo $errorMessage; ?></div>
      <?php endif; ?>
      <form action="signup.php" method="POST">
          <input type="text" name="username" placeholder="Username" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password" required>
          <input type="password" name="confirm_password" placeholder="Confirm Password" required>
          <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="login.php">Login here</a></p>
  </div>
</body>
</html>