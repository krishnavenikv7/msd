<?php
$host = "localhost:4306";
$user = "root";
$pass = "";
$dbname = "job_portfolio";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
