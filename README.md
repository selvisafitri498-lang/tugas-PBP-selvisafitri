# 📱 Toko Selvi - Aplikasi Inventory Management PWA

Aplikasi manajemen inventory toko modern yang dibangun sebagai **Progressive Web App (PWA)** dengan fitur real-time data synchronization menggunakan MySQL database. Aplikasi ini dapat digunakan secara **offline** dan dapat diinstall langsung di perangkat mobile atau desktop.

---

## 🎯 Tentang Aplikasi

**Toko Selvi** adalah solusi inventory management yang user-friendly dengan fitur:
- ✅ Tambah, lihat, dan kelola data barang secara real-time
- ✅ Responsive design - optimal di desktop, tablet, dan mobile
- ✅ Progressive Web App (PWA) - installable seperti native app
- ✅ Offline-ready dengan Service Worker caching
- ✅ Statistik real-time (total barang, total harga)
- ✅ Fitur pencarian barang yang cepat
- ✅ HTTPS dan CORS-enabled untuk keamanan

---

## 🌐 Akses Aplikasi

### 📌 Tugas Kedua (Live Hosting)
**URL:** [https://tokoselvi.infinityfree.me/](https://tokoselvi.infinityfree.me/)

### 📌 Tugas Ketiga (Live Hosting - Version 2)
**URL:** [https://tokoselvisafitri.infinityfree.me/](https://tokoselvisafitri.infinityfree.me/)

### 📌 Tugas Pertama (Repository)
**Repository:** [GitHub - tugas-PBP-selvi-3](https://github.com/selvisafitri/tugas-PBP-selvi-3)

---

## ✨ Fitur Utama

### 1. **Manajemen Barang**
- Tambah barang baru dengan nama dan harga
- Tampilkan semua data barang dalam format tabel dan card
- Validasi input (nama tidak kosong, harga harus angka positif)
- Delete barang (implementasi bisa ditambahkan)

### 2. **Pencarian & Filter**
- Real-time search berdasarkan nama barang atau ID
- Hasil pencarian update otomatis saat mengetik

### 3. **Statistik Dashboard**
- Total jumlah barang di inventory
- Total nilai harga semua barang
- Preview format harga real-time saat input

### 4. **Progressive Web App (PWA)**
- Installable di mobile dan desktop
- Bekerja offline dengan caching strategy
- Service Worker untuk performance optimization
- Install prompt dengan UX yang baik

### 5. **Responsive Design**
- Mobile-first approach dengan Tailwind CSS
- Optimal display di semua ukuran layar
- Touch-friendly interface

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Tailwind CSS (utility-first framework)
- **JavaScript (Vanilla)** - No framework, lightweight
- **PWA** - Service Worker, Web App Manifest

### Backend
- **PHP 7+** - Server-side logic
- **MySQL** - Database (InfinityFree / Local XAMPP)
- **REST API** - JSON endpoints

### Hosting
- **InfinityFree** - Free PHP hosting (Production)
- **XAMPP** - Local development environment

---

## 📁 Struktur Folder

```
PBP-selvi-3/
├── api-toko/                 # Backend API
│   ├── koneksi.php          # Database connection
│   ├── get_barang.php       # GET API endpoint
│   └── tambah_barang.php    # POST API endpoint
├── app-toko/                # Frontend PWA
│   ├── index.html           # Main HTML
│   ├── app.js               # Main JavaScript logic
│   ├── sw.js                # Service Worker
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons (192x512px)
├── README.md                # This file
└── manifest.json            # Root PWA manifest
```

---

## 🚀 Setup & Installation

### 🔧 Setup Lokal (XAMPP)

#### 1. **Database Setup**
```sql
CREATE DATABASE db_toko_selvi;
USE db_toko_selvi;

CREATE TABLE barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    harga INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Clone & Setup Project**
```bash
# Clone repository
git clone https://github.com/selvisafitri/tugas-PBP-selvi-3.git
cd tugas-PBP-selvi-3

# Place di htdocs XAMPP
cp -r . C:/xampp/htdocs/PBP-selvi-3/
```

#### 3. **Konfigurasi Koneksi**
Edit `api-toko/koneksi.php` - pastikan menggunakan localhost:
```php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_toko_selvi";
```

#### 4. **Jalankan Aplikasi**
- Nyalakan XAMPP (Apache + MySQL)
- Akses: [http://localhost/PBP-selvi-3/](http://localhost/PBP-selvi-3/)

---

## 📡 API Endpoints

### `GET /api-toko/get_barang.php`
Mengambil semua data barang
```json
{
  "status": "success",
  "message": "Berhasil mengambil data",
  "jumlah": 5,
  "data": [
    { "id": 1, "nama_barang": "Beras", "harga": 50000 },
    { "id": 2, "nama_barang": "Gula", "harga": 15000 }
  ]
}
```

### `POST /api-toko/tambah_barang.php`
Menambah barang baru
```json
Request:
{
  "nama_barang": "Minyak Goreng",
  "harga": 30000
}

Response:
{
  "status": "success",
  "message": "Barang berhasil ditambahkan!",
  "data": {
    "id": 3,
    "nama_barang": "Minyak Goreng",
    "harga": 30000
  }
}
```

---

## 🔒 Keamanan

- ✅ **SQL Injection Prevention** - Menggunakan prepared statements
- ✅ **CORS Enabled** - Cross-Origin Resource Sharing untuk API access
- ✅ **Input Validation** - Validasi server-side untuk semua input
- ✅ **HTTPS** - SSL/TLS di production hosting
- ✅ **Content Security** - JSON content-type headers

---

## 📱 PWA Features

### Install Aplikasi
1. Buka aplikasi di browser (Chrome, Edge, Safari)
2. Klik tombol **"Install App"** atau gunakan menu browser
3. Aplikasi akan diinstall seperti native app
4. Akses offline tersedia untuk static assets

### Offline Support
- Static assets di-cache untuk offline access
- API calls tetap memerlukan internet connection
- Graceful error handling saat offline

---

## 🎓 Tugas PBP - Informatika ITB

**Program:** PBP (Praktikum Basis Data Progresif)  
**Mahasiswa:** Selvi Safitri  
**Periode:** 2025-2026

---

## 📝 Lisensi

Open source - Bebas digunakan untuk keperluan pendidikan.

---

## 💬 Kontak & Support

Untuk pertanyaan atau saran, silakan buka issue di repository atau hubungi melalui GitHub.

**GitHub:** [@selvisafitri](https://github.com/selvisafitri)

---

**Last Updated:** May 2026  
**Status:** ✅ Production Ready