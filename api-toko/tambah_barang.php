<?php
// ============================================================================
// HEADER
// ============================================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// HANDLE PREFLIGHT (OPTIONS)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// VALIDASI METHOD (HARUS POST)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method tidak diizinkan. Gunakan POST."
    ]);
    exit();
}

// ============================================================================
// KONEKSI DATABASE (PAKAI koneksi.php)
// ============================================================================
require "koneksi.php"; // ✅ WAJIB pakai ini (InfinityFree)
/** @var mysqli $koneksi */
// ============================================================================
// AMBIL INPUT (JSON / FORM-DATA)
// ============================================================================
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($contentType, 'application/json') !== false) {
    $body        = json_decode(file_get_contents('php://input'), true);
    $nama_barang = trim($body['nama_barang'] ?? '');
    $harga       = trim($body['harga'] ?? '');
} else {
    $nama_barang = trim($_POST['nama_barang'] ?? '');
    $harga       = trim($_POST['harga'] ?? '');
}

// ============================================================================
// VALIDASI INPUT
// ============================================================================
$errors = [];

if ($nama_barang === '') {
    $errors[] = "Nama barang tidak boleh kosong.";
}

if ($harga === '') {
    $errors[] = "Harga tidak boleh kosong.";
} elseif (!is_numeric($harga) || (int)$harga < 0) {
    $errors[] = "Harga harus berupa angka positif.";
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        "status"  => "error",
        "message" => implode(' ', $errors),
        "errors"  => $errors
    ]);
    exit();
}

// ============================================================================
// SANITASI & INSERT DATA DENGAN PREPARED STATEMENT
// ============================================================================
$harga = (int) $harga;

// Gunakan prepared statement untuk keamanan (prevent SQL injection)
$query = "INSERT INTO barang (nama_barang, harga) VALUES (?, ?)";
$stmt = mysqli_prepare($koneksi, $query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Persiapan query gagal: " . mysqli_error($koneksi)
    ]);
    exit();
}

// Bind parameters: "si" = string, integer
mysqli_stmt_bind_param($stmt, "si", $nama_barang, $harga);
$hasil = mysqli_stmt_execute($stmt);

if (!$hasil) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menyimpan data: " . mysqli_stmt_error($stmt)
    ]);
    mysqli_stmt_close($stmt);
    exit();
}

$id_baru = mysqli_insert_id($koneksi);
mysqli_stmt_close($stmt);

// ============================================================================
// RESPONSE SUCCESS
// ============================================================================
http_response_code(201);
echo json_encode([
    "status"  => "success",
    "message" => "Barang berhasil ditambahkan!",
    "data"    => [
        "id"          => $id_baru,
        "nama_barang" => $nama_barang,
        "harga"       => $harga
    ]
], JSON_PRETTY_PRINT);

// ============================================================================
// CLOSE CONNECTION
// ============================================================================
mysqli_close($koneksi);
?>