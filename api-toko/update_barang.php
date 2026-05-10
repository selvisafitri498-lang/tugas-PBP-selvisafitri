<?php
// ============================================================================
// HEADER
// ============================================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// HANDLE PREFLIGHT (OPTIONS)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// VALIDASI METHOD (HARUS PUT atau PATCH)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method tidak diizinkan. Gunakan PUT atau PATCH."
    ]);
    exit();
}

// ============================================================================
// KONEKSI DATABASE
// ============================================================================
require "koneksi.php";
/** @var mysqli $koneksi */

// ============================================================================
// AMBIL INPUT (JSON)
// ============================================================================
$body        = json_decode(file_get_contents('php://input'), true);
$id          = isset($body['id']) ? (int)$body['id'] : 0;
$nama_barang = trim($body['nama_barang'] ?? '');
$harga       = trim($body['harga'] ?? '');

// ============================================================================
// VALIDASI INPUT
// ============================================================================
$errors = [];

if ($id <= 0) {
    $errors[] = "ID barang tidak valid.";
}

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
// CEK APAKAH DATA EXIST
// ============================================================================
$checkQuery = "SELECT id FROM barang WHERE id = ?";
$checkStmt = mysqli_prepare($koneksi, $checkQuery);
mysqli_stmt_bind_param($checkStmt, "i", $id);
mysqli_stmt_execute($checkStmt);
$result = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($result) === 0) {
    http_response_code(404);
    echo json_encode([
        "status"  => "error",
        "message" => "Data barang tidak ditemukan."
    ]);
    mysqli_stmt_close($checkStmt);
    exit();
}
mysqli_stmt_close($checkStmt);

// ============================================================================
// UPDATE DATA DENGAN PREPARED STATEMENT
// ============================================================================
$harga = (int) $harga;

$updateQuery = "UPDATE barang SET nama_barang = ?, harga = ? WHERE id = ?";
$updateStmt = mysqli_prepare($koneksi, $updateQuery);

if (!$updateStmt) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Persiapan query gagal: " . mysqli_error($koneksi)
    ]);
    exit();
}

// Bind parameters: "sii" = string, integer, integer
mysqli_stmt_bind_param($updateStmt, "sii", $nama_barang, $harga, $id);
$hasil = mysqli_stmt_execute($updateStmt);

if (!$hasil) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal memperbarui data: " . mysqli_stmt_error($updateStmt)
    ]);
    mysqli_stmt_close($updateStmt);
    exit();
}

mysqli_stmt_close($updateStmt);

// ============================================================================
// RESPONSE SUCCESS
// ============================================================================
http_response_code(200);
echo json_encode([
    "status"  => "success",
    "message" => "Barang berhasil diperbarui!",
    "data"    => [
        "id"          => $id,
        "nama_barang" => $nama_barang,
        "harga"       => $harga
    ]
], JSON_PRETTY_PRINT);

mysqli_close($koneksi);
?>
