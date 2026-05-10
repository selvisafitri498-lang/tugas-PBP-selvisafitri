<?php
// ============================================================================
// HEADER
// ============================================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// HANDLE PREFLIGHT (OPTIONS)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// VALIDASI METHOD (HARUS DELETE)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Method tidak diizinkan. Gunakan DELETE."
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
$body = json_decode(file_get_contents('php://input'), true);
$id   = isset($body['id']) ? (int)$body['id'] : 0;

// ============================================================================
// VALIDASI INPUT
// ============================================================================
if ($id <= 0) {
    http_response_code(422);
    echo json_encode([
        "status"  => "error",
        "message" => "ID barang tidak valid."
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
// DELETE DATA
// ============================================================================
$deleteQuery = "DELETE FROM barang WHERE id = ?";
$deleteStmt = mysqli_prepare($koneksi, $deleteQuery);

if (!$deleteStmt) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Persiapan query gagal: " . mysqli_error($koneksi)
    ]);
    exit();
}

mysqli_stmt_bind_param($deleteStmt, "i", $id);
$hasil = mysqli_stmt_execute($deleteStmt);

if (!$hasil) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menghapus data: " . mysqli_stmt_error($deleteStmt)
    ]);
    mysqli_stmt_close($deleteStmt);
    exit();
}

mysqli_stmt_close($deleteStmt);

// ============================================================================
// RESPONSE SUCCESS
// ============================================================================
http_response_code(200);
echo json_encode([
    "status"  => "success",
    "message" => "Barang berhasil dihapus!"
], JSON_PRETTY_PRINT);

mysqli_close($koneksi);
?>
