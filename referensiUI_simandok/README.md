# Sistem Pemantauan Progress Dokumen

Sistem web untuk memantau progress pengeditan dan persetujuan dokumen dengan multi-level approval workflow.

## 📋 Fitur Utama

-   **Dashboard Monitoring**: Tampilan tabel dokumen dengan status dan progress tracking
-   **Form Pengajuan**: Interface untuk staff mengajukan dokumen baru
-   **Workflow Approval**: Alur persetujuan 4 level (Staff → Kasi → Kasubdit → Direktur)
-   **Progress Tracking**: Visualisasi status dengan dropdown tracking detail
-   **Review System**: Halaman untuk review dan approval dokumen
-   **Komentar**: Sistem komentar untuk feedback dan revisi

## 🚀 Tech Stack

-   **Backend**: Node.js + Express.js
-   **Template Engine**: EJS
-   **Frontend**: Bootstrap 5 + Bootstrap Icons
-   **CSS**: Custom styling untuk tracking system

## 📦 Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

File `.env` sudah tersedia dengan konfigurasi default:

```
PORT=3000
SESSION_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 3. Jalankan Server

**Development mode (dengan auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server akan berjalan di: `http://localhost:3000`

## 🌐 Akses dari Jaringan Lokal

Untuk mengakses dari komputer lain di jaringan yang sama:

### 1. Cek IP Address Komputer Anda

**Windows (PowerShell):**

```powershell
ipconfig
```

Cari "IPv4 Address" (contoh: 192.168.1.100)

### 2. Akses dari Komputer Lain

Buka browser di komputer lain dan akses:

```
http://192.168.1.100:3000
```

(Ganti dengan IP address komputer server Anda)

### 3. Firewall

Pastikan port 3000 terbuka di firewall:

**Windows:**

```powershell
# Buka PowerShell sebagai Administrator
New-NetFirewallRule -DisplayName "Node.js App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## 👥 Role & Permissions

Sistem mendukung 4 role user:

1. **Staff**: Membuat dan mengajukan dokumen
2. **Kasi** (Kepala Seksi): Review dan approve untuk ke Kasubdit
3. **Kasubdit** (Kepala Sub Direktorat): Review dan approve untuk ke Direktur
4. **Direktur**: Final approval

### Ganti Role untuk Testing

Edit di [app.js](app.js) baris 30-37:

```javascript
req.session.user = {
    id: 1,
    name: 'John Doe',
    role: 'staff', // Ganti: staff, kasi, kasubdit, direktur
    department: 'IT',
};
```

## 🎨 Fitur UI

### Dashboard

-   **Stats Cards**: Total dokumen, disetujui, sedang review, dokumen saya
-   **Tabel Dokumen**: List semua dokumen dengan informasi lengkap
-   **Status Badge**: Indikator visual status dokumen
-   **Tracking Dropdown**: Hover pada ikon mata untuk melihat progress detail
    -   ✅ Hijau = Disetujui
    -   ⏳ Kuning = Sedang direview
    -   ⚪ Abu-abu = Belum/menunggu

### Form Pengajuan

-   Upload file .docx
-   Kategori dan prioritas dokumen
-   Preview file sebelum submit
-   Alur persetujuan yang jelas

### Review Dokumen

-   Detail dokumen lengkap
-   Preview area (siap untuk integrasi OnlyOffice)
-   Sistem komentar dengan reply
-   Progress workflow di sidebar
-   Action buttons untuk approve/reject/revisi

## 📁 Struktur Project

```
sistemPemantauanProgress/
├── app.js                 # Main application file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── public/
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── main.js       # Client-side JavaScript
├── views/
│   ├── layout.ejs        # Main layout template
│   ├── dashboard.ejs     # Dashboard page
│   ├── document-form.ejs # Form pengajuan
│   └── document-review.ejs # Review page
└── uploads/              # Uploaded documents
```

## 🔄 Workflow Alur Dokumen

```
[Staff] Buat Dokumen
   ↓
[Staff] Ajukan ke Kasi
   ↓
[Kasi] Review
   ├─→ Approve → Lanjut ke Kasubdit
   ├─→ Reject → Ditolak
   └─→ Revisi → Kembali ke Staff
        ↓
[Staff] Perbaiki & Ajukan Lagi
   ↓
[Kasubdit] Review
   ├─→ Approve → Lanjut ke Direktur
   └─→ Revisi/Reject
        ↓
[Direktur] Final Approval
   ├─→ Approve → Selesai ✅
   └─→ Reject → Ditolak
```

## 🎯 Data Dummy

Saat ini menggunakan data dummy (array in-memory) untuk testing. File: [app.js](app.js) baris 42-95

Untuk production, data ini akan diganti dengan database (PostgreSQL/MySQL/MongoDB).

## 🔮 Next Steps / Pengembangan Selanjutnya

1. **Database Integration**

    - Setup PostgreSQL/MySQL
    - Buat schema dan models
    - Migrate data dummy ke database

2. **Authentication**

    - Login system
    - JWT/Session management
    - Password hashing

3. **File Upload**

    - Multer configuration
    - File validation
    - Storage management

4. **Document Editor Integration**

    - OnlyOffice Document Server
    - Real-time collaboration
    - Comment on specific lines

5. **Notifications**

    - Email notifications
    - In-app notifications
    - Real-time updates (Socket.io)

6. **API Development**
    - RESTful API endpoints
    - Validation middleware
    - Error handling

## 📝 Notes

-   **Data saat ini**: Dummy data (belum persistent)
-   **Authentication**: Belum implementasi (mock user di session)
-   **File upload**: UI sudah ada, backend belum
-   **Database**: Belum ada, pakai array in-memory

## 🤝 Kontribusi

Untuk menambahkan fitur atau perbaikan:

1. Buat branch baru
2. Commit changes
3. Submit pull request

## 📄 License

Private - For Internal Office Use

---

**Dibuat**: 12 Januari 2026  
**Tech**: Node.js + Express + EJS + Bootstrap 5
