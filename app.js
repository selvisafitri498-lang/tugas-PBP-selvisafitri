// ============================================================================
// REGISTER SERVICE WORKER untuk PWA
// ============================================================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
            console.log('✅ Service Worker registered:', registration);
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('📢 Aplikasi siap untuk update');
                    }
                });
            });
        })
        .catch((error) => console.error('❌ Service Worker registration failed:', error));
} else {
    console.warn('⚠️ Service Worker tidak didukung di browser ini');
}

// ============================================================================
// PWA INSTALL PROMPT HANDLER
// ============================================================================

let deferredPrompt = null;
let domReady = false;

const LS_INSTALLED = 'pwa-installed';
const LS_DISMISSED = 'pwa-modal-dismissed';

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📲 beforeinstallprompt tersimpan');
    if (domReady) decidePWAUI();
});

document.addEventListener('DOMContentLoaded', () => {
    domReady = true;

    const installBtn = document.getElementById('install-app-btn');
    const dismissBtn = document.getElementById('dismiss-install-btn');

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            await triggerInstall();
            hideModal();
            hideCard();
        });
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            localStorage.setItem(LS_DISMISSED, '1');
            hideModal();
            showCard();
        });
    }

    const installBtnSmall  = document.getElementById('install-btn-small');
    const closeInstallCard = document.getElementById('close-install-card');

    if (installBtnSmall) {
        installBtnSmall.addEventListener('click', async () => {
            await triggerInstall();
            hideCard();
        });
    }

    if (closeInstallCard) {
        closeInstallCard.addEventListener('click', () => hideCard());
    }

    if (deferredPrompt) decidePWAUI();
});

function decidePWAUI() {
    if (isStandalone() || localStorage.getItem(LS_INSTALLED)) {
        hideModal(); hideCard(); return;
    }
    if (!localStorage.getItem(LS_DISMISSED)) {
        showModal(); return;
    }
    showCard();
}

async function triggerInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📦 User ${outcome === 'accepted' ? 'menerima' : 'menolak'} install`);
    deferredPrompt = null;
}

function showModal() {
    const el = document.getElementById('install-prompt-modal');
    if (el) { el.classList.remove('hidden'); }
}
function hideModal() {
    const el = document.getElementById('install-prompt-modal');
    if (el) el.classList.add('hidden');
}
function showCard() {
    const el = document.getElementById('install-card');
    if (el) {
        el.classList.remove('hidden');
        el.style.animation = 'slideUp 0.4s ease-out forwards';
    }
}
function hideCard() {
    const el = document.getElementById('install-card');
    if (el) el.classList.add('hidden');
}

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully!');
    localStorage.setItem(LS_INSTALLED, '1');
    deferredPrompt = null;
    hideModal(); hideCard();
    showToast('✅ Aplikasi berhasil diinstall!', 'success');
});

// ============================================================================
// DATA BARANG - Fetch dari API
// ============================================================================
let semuaDataBarang = [];
let editingId = null; // ✅ Variable untuk track mode EDIT

// ini dari wbsite asli (infinityfree) yang sudah online hosting
const API_BASE = 'https://tokoselvisafitri.infinityfree.me/api-toko';

// ini untuk testing lokal (xampp)
// const API_BASE = 'http://localhost/PBP-selvi-3/api-toko';

async function ambilDataBarang() {
    try {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('error-state').classList.add('hidden');
        document.getElementById('data-container').classList.add('hidden');

        // ✅ FIX: Tambah timestamp + cache:'no-store' agar TIDAK pernah ambil dari cache
        const url = `${API_BASE}/get_barang.php?_=${Date.now()}`;
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',   // instruksi ke browser: bypass cache sepenuhnya
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        const hasil = await response.json();

        if (hasil.status === 'success') {
            semuaDataBarang = hasil.data;
            tampilkanDataBarang(semuaDataBarang);

            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('data-container').classList.remove('hidden');
            document.getElementById('jumlah-barang').textContent = hasil.jumlah;
            document.getElementById('stat-jumlah').textContent = hasil.jumlah;
        } else {
            throw new Error(hasil.message || 'Gagal mengambil data');
        }
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('error-state').classList.remove('hidden');
        document.getElementById('error-message').textContent =
            error.message || 'Gagal memuat data. Silakan coba lagi nanti.';
    }
}

function tampilkanDataBarang(dataBarang) {
    let barisHTML = '';
    let cardHTML  = '';
    let totalHarga = 0;

    const emptyState    = document.getElementById('empty-state');
    const table         = document.getElementById('tabel-barang');
    const cardContainer = document.getElementById('card-container');

    if (dataBarang.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        table.innerHTML = '';
        if (cardContainer) cardContainer.innerHTML = '';
        document.getElementById('total-harga').textContent = 'Rp 0';
        document.getElementById('stat-total').textContent  = 'Rp 0';
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    dataBarang.forEach((barang, index) => {
        const hargaNumber = parseInt(barang.harga) || 0;
        totalHarga += hargaNumber;
        const nomor = index + 1;

        barisHTML += `
            <tr class="hover:bg-emerald-50 transition">
                <td class="px-6 py-4 text-gray-700 font-medium">${nomor}</td>
                <td class="px-6 py-4 text-gray-700">${barang.nama_barang}</td>
                <td class="px-6 py-4 text-right font-semibold text-emerald-600">
                    Rp ${hargaNumber.toLocaleString('id-ID')}
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="handleEditClick(${barang.id})" class="px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition-all">
                            ✏️ Edit
                        </button>
                        <button onclick="handleDeleteClick(${barang.id})" class="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-all">
                            🗑️ Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;

        cardHTML += `
            <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-gray-500">No: ${nomor}</span>
                    <span class="text-emerald-600 font-bold text-sm">
                        Rp ${hargaNumber.toLocaleString('id-ID')}
                    </span>
                </div>
                <h2 class="text-base font-semibold text-gray-800 mb-3">${barang.nama_barang}</h2>
                <div class="flex gap-2">
                    <button onclick="handleEditClick(${barang.id})" class="flex-1 px-2 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition-all">
                        ✏️ Edit
                    </button>
                    <button onclick="handleDeleteClick(${barang.id})" class="flex-1 px-2 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-all">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
    });

    table.innerHTML = barisHTML;
    if (cardContainer) cardContainer.innerHTML = cardHTML;

    const formatted = 'Rp ' + totalHarga.toLocaleString('id-ID');
    document.getElementById('total-harga').textContent = formatted;
    document.getElementById('stat-total').textContent  = formatted;
}

function scrollToForm() {
    const formSection = document.getElementById('form-tambah');
    const inputNama   = document.getElementById('input-nama');
    if (!formSection) return;
    formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        if (inputNama) inputNama.focus();
        formSection.classList.add('highlight-form');
        setTimeout(() => formSection.classList.remove('highlight-form'), 800);
    }, 500);
}

function cariBarang(keyword) {
    if (keyword.trim() === '') {
        tampilkanDataBarang(semuaDataBarang);
        return;
    }
    const hasil = semuaDataBarang.filter(barang =>
        barang.nama_barang.toLowerCase().includes(keyword.toLowerCase()) ||
        barang.id.toString().includes(keyword)
    );
    tampilkanDataBarang(hasil);
}

document.getElementById('search-input').addEventListener('keyup', (e) => {
    cariBarang(e.target.value);
});

ambilDataBarang();

// ============================================================================
// FORMAT HARGA - Preview real-time saat user mengetik
// ============================================================================
document.getElementById('input-harga').addEventListener('input', function () {
    const raw = this.value.replace(/\D/g, '');
    this.value = raw;

    const preview = document.getElementById('preview-harga');
    if (raw && parseInt(raw) > 0) {
        preview.textContent = 'Rp ' + parseInt(raw).toLocaleString('id-ID');
        preview.classList.remove('text-gray-400');
        preview.classList.add('text-emerald-600', 'font-semibold');
    } else {
        preview.textContent = '';
        preview.classList.add('text-gray-400');
        preview.classList.remove('text-emerald-600', 'font-semibold');
    }
});

['input-nama', 'input-harga'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitBarang();
    });
});

// ============================================================================
// SUBMIT BARANG - Bisa Tambah atau Update (tergantung mode editing)
// ============================================================================
async function submitBarang() {
    const inputNama  = document.getElementById('input-nama');
    const inputHarga = document.getElementById('input-harga');
    const errNama    = document.getElementById('err-nama');
    const errHarga   = document.getElementById('err-harga');
    const btnTambah  = document.getElementById('btn-tambah');

    const nama  = inputNama.value.trim();
    const harga = inputHarga.value.replace(/\D/g, '').trim();

    errNama.classList.add('hidden');
    errHarga.classList.add('hidden');
    inputNama.classList.remove('border-red-400');
    inputHarga.classList.remove('border-red-400');

    let valid = true;

    if (!nama) {
        errNama.classList.remove('hidden');
        inputNama.classList.add('border-red-400');
        inputNama.focus();
        valid = false;
    }

    if (!harga || parseInt(harga) <= 0) {
        errHarga.classList.remove('hidden');
        inputHarga.classList.add('border-red-400');
        if (valid) inputHarga.focus();
        valid = false;
    }

    if (!valid) return;

    btnTambah.disabled = true;
    btnTambah.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Menyimpan...
    `;

    try {
        // ✅ CEK APAKAH MODE EDIT ATAU TAMBAH
        if (editingId) {
            // MODE EDIT - gunakan PUT
            const response = await fetch(`${API_BASE}/update_barang.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: editingId,
                    nama_barang: nama, 
                    harga: harga 
                }),
                cache: 'no-store'
            });

            const hasil = await response.json();

            if (hasil.status === 'success') {
                showToast(`✅ "${nama}" berhasil diperbarui!`, 'success');
                resetForm();
                await ambilDataBarang();
            } else {
                showToast(`❌ ${hasil.message}`, 'error');
            }
        } else {
            // MODE TAMBAH - gunakan POST
            const response = await fetch(`${API_BASE}/tambah_barang.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_barang: nama, harga: harga }),
                cache: 'no-store'
            });

            const hasil = await response.json();

            if (hasil.status === 'success') {
                inputNama.value  = '';
                inputHarga.value = '';
                document.getElementById('preview-harga').textContent = '';

                showToast(`✅ "${nama}" berhasil ditambahkan!`, 'success');
                await ambilDataBarang();
            } else {
                showToast(`❌ ${hasil.message}`, 'error');
            }
        }

    } catch (error) {
        console.error('Gagal submit barang:', error);
        showToast('❌ Gagal terhubung ke server. Periksa koneksi.', 'error');
    } finally {
        btnTambah.disabled = false;
        btnTambah.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Barang
        `;
    }
}

// ============================================================================
// EDIT BARANG - Load data ke form
// ============================================================================
function handleEditClick(id) {
    // ✅ Convert id ke number untuk type-safe comparison
    const idNum = parseInt(id);
    console.log('Edit clicked - Looking for ID:', idNum, 'Type:', typeof idNum);
    console.log('Available data:', semuaDataBarang);
    
    // ✅ Cari data barang dari array sesuai id
    const barang = semuaDataBarang.find(b => {
        // Debug: log setiap perbandingan
        console.log(`  Comparing: b.id=${b.id} (${typeof b.id}) vs idNum=${idNum} (${typeof idNum}) -> ${b.id === idNum}`);
        return parseInt(b.id) === idNum;
    });
    
    if (!barang) {
        console.error('❌ Data not found for ID:', idNum);
        showToast('❌ Data tidak ditemukan', 'error');
        return;
    }

    console.log('✅ Found barang:', barang);

    // ✅ Set mode editing
    editingId = idNum;

    // ✅ Isi form dengan data barang
    document.getElementById('input-nama').value = barang.nama_barang;
    document.getElementById('input-harga').value = barang.harga;

    // ✅ Update preview harga
    const preview = document.getElementById('preview-harga');
    preview.textContent = 'Rp ' + parseInt(barang.harga).toLocaleString('id-ID');
    preview.classList.remove('text-gray-400');
    preview.classList.add('text-emerald-600', 'font-semibold');

    // ✅ Tampilkan tombol Batal dan ubah teks tombol Tambah
    const btnTambah = document.getElementById('btn-tambah');
    const btnBatal = document.getElementById('btn-batal');
    
    btnTambah.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Update Barang
    `;
    btnBatal.classList.remove('hidden');
    btnBatal.classList.add('flex');

    // ✅ Scroll ke form dan highlight
    scrollToForm();
    showToast(`📝 Mode Edit: "${barang.nama_barang}"`, 'info');
}

// ============================================================================
// DELETE BARANG - Confirm dialog + API DELETE
// ============================================================================
async function handleDeleteClick(id) {
    // ✅ Convert id ke number untuk type-safe comparison
    const idNum = parseInt(id);
    console.log('Delete clicked - Looking for ID:', idNum, 'Type:', typeof idNum);
    
    // ✅ Cari data barang dari array
    const barang = semuaDataBarang.find(b => parseInt(b.id) === idNum);
    
    if (!barang) {
        console.error('❌ Data not found for ID:', idNum);
        showToast('❌ Data tidak ditemukan', 'error');
        return;
    }

    console.log('✅ Found barang to delete:', barang);

    // ✅ Confirm dialog
    if (!confirm(`Yakin ingin menghapus "${barang.nama_barang}"?`)) {
        return; // User cancel
    }

    try {
        // ✅ Kirim DELETE request
        const response = await fetch(`${API_BASE}/hapus_barang.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idNum }),
            cache: 'no-store'
        });

        const hasil = await response.json();

        if (hasil.status === 'success') {
            showToast(`✅ "${barang.nama_barang}" berhasil dihapus!`, 'success');
            // ✅ Refresh tabel otomatis
            await ambilDataBarang();
        } else {
            showToast(`❌ ${hasil.message}`, 'error');
        }

    } catch (error) {
        console.error('Gagal hapus barang:', error);
        showToast('❌ Gagal terhubung ke server. Periksa koneksi.', 'error');
    }
}

// ============================================================================
// RESET FORM - Kembali ke mode TAMBAH
// ============================================================================
function resetForm() {
    // ✅ Clear edit mode
    editingId = null;

    // ✅ Kosongkan form
    document.getElementById('input-nama').value = '';
    document.getElementById('input-harga').value = '';
    document.getElementById('preview-harga').textContent = '';

    // ✅ Clear error messages
    document.getElementById('err-nama').classList.add('hidden');
    document.getElementById('err-harga').classList.add('hidden');
    document.getElementById('input-nama').classList.remove('border-red-400');
    document.getElementById('input-harga').classList.remove('border-red-400');

    // ✅ Ubah tombol kembali ke "Tambah Barang"
    const btnTambah = document.getElementById('btn-tambah');
    const btnBatal = document.getElementById('btn-batal');

    btnTambah.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Barang
    `;
    btnBatal.classList.add('hidden');
    btnBatal.classList.remove('flex');

    // ✅ Focus ke input nama
    document.getElementById('input-nama').focus();
    showToast('🔄 Mode reset ke Tambah Barang', 'info');
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const colors = {
        success: 'bg-emerald-500',
        error:   'bg-red-500',
        info:    'bg-blue-500',
    };

    const toast = document.createElement('div');
    toast.className = `
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
        ${colors[type] ?? colors.success}
    `;
    toast.style.animation = 'toastIn 0.3s ease-out forwards';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================================
// RESET APLIKASI
// ============================================================================
function resetAplikasi() {
    if (!confirm('Reset akan menghapus cache aplikasi. Lanjutkan?')) return;

    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-modal-dismissed');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => reg.unregister());
        });
        caches.keys().then(keys => {
            keys.forEach(key => caches.delete(key));
        });
    }

    showToast('🔄 Cache dihapus, memuat ulang...', 'info');
    setTimeout(() => location.reload(true), 1000);
}
