<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// koneksi untuk localhost xampp
$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_toko_selvi";

// koneksi ke database MySQL dari infinity
// $host = "sql105.infinityfree.com";
// $user = "if0_41844066";
// $pass = "kJ1OrhnyzZ8Er";
// $db   = "if0_41844066_db_toko_selvi";

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    http_response_code(500);
    die(json_encode([
        "status" => "error",
        "message" => "Koneksi database gagal: " . mysqli_connect_error()
    ]));
}

// Set charset UTF-8
mysqli_set_charset($koneksi, "utf8mb4");
?>