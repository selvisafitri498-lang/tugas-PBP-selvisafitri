<?php
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
require "koneksi.php";
/** @var mysqli $koneksi */

try {
    // Query ambil data
    $query = "SELECT id, nama_barang, harga FROM barang";
    $hasil = mysqli_query($koneksi, $query);

    // Cek query
    if (!$hasil) {
        http_response_code(400);
        die(json_encode([
            "status" => "error",
            "message" => "Query gagal: " . mysqli_error($koneksi),
            "debug" => [
                "query" => $query,
                "error_code" => mysqli_errno($koneksi)
            ]
        ]));
    }

    // Tampung data
    $data_barang = [];

    while ($baris = mysqli_fetch_assoc($hasil)) {
        $data_barang[] = $baris;
    }

    // Response
    echo json_encode([
        "status" => "success",
        "message" => "Berhasil mengambil data",
        "jumlah" => count($data_barang),
        "data" => $data_barang
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Exception: " . $e->getMessage()
    ]);
}
?>