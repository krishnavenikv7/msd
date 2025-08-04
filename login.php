<?php
session_start();
include 'db.php';

$errorMessage = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (empty($email) || empty($password)) {
        $errorMessage = "Please fill in all fields.";
    } else {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['password'])) {
                // Login successful
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['user_email'] = $user['email']; // Store email in session
                header("Location: sectors.html");
                exit();
            } else {
                $errorMessage = "Invalid email or password.";
            }
        } else {
            $errorMessage = "Invalid email or password.";
        }

        $stmt->close();
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
      <h2>Login</h2>
      <?php if (!empty($errorMessage)): ?>
          <div class="error-message"><?php echo $errorMessage; ?></div>
      <?php endif; ?>
      <form action="login.php" method="POST">
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="signup.php">Sign up here</a></p>
  </div>
</body>
</html>
