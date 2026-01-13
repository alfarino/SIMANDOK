# Panduan Pengguna - SIMOMOU
## Sistem Informasi MOU - DKSHR

---

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Login & Dashboard](#login--dashboard)
3. [Memahami Role & Hierarchy](#memahami-role--hierarchy)
4. [Upload Dokumen & Pilih Approver](#upload-dokumen--pilih-approver)
5. [Review & Approval](#review--approval)
6. [Notifikasi Dalam Sistem](#notifikasi-dalam-sistem)
7. [Kirim Batch Reminder](#kirim-batch-reminder)
8. [Status Dokumen](#status-dokumen)
9. [Arsip & Audit](#arsip--audit)
10. [FAQ](#faq)

---

## Pendahuluan

**SIMOMOU** adalah platform untuk mengelola persetujuan dokumen MOU/kerja sama dengan fitur:
- ✅ Upload dokumen dengan **pilih approver sendiri**
- ✅ Notifikasi **dalam sistem** (bukan email)
- ✅ Email hanya untuk **batch reminder** ke atasan
- ✅ Approval chain otomatis berdasarkan hierarki
- ✅ Arsip lengkap dengan audit trail

---

## Login & Dashboard

### Login
1. Buka `https://simomou.unand.ac.id`
2. Masukkan email dan password
3. Klik **Sign In**

### Dashboard
Setelah login, Anda akan melihat:

```
┌─────────────────────────────────────────────────────────┐
│  SIMOMOU                    🔔 [3]  [User Menu ▼]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Total: 12 │  │Pending: 3│  │Approved:5│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  [+ Upload Dokumen]         [Kirim Batch Reminder]     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Nama Dokumen │ Status │ Approver │ Aksi          │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ MOU_ABC.docx │ ⏳     │ Frengki  │ [Detail]      │ │
│  │ MOU_XYZ.docx │ ✅     │ -        │ [Detail]      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Keterangan:**
- 🔔 = Notifikasi dalam sistem (klik untuk lihat)
- Pending = Dokumen menunggu action Anda
- Approved = Dokumen yang sudah Anda setujui

---

## Memahami Role & Hierarchy

### 4 Level Role

| Level | Role | Tugas |
|-------|------|-------|
| **D** | Direktur | Final approval |
| **C** | Kepala Subdit | Review level 3 |
| **B** | Kepala Seksi | Review level 2 |
| **A** | Staff/Team | Upload & revisi dokumen |

### Hierarki Approval
Ketika Anda memilih beberapa approver, sistem **otomatis mengurutkan** berdasarkan level:

```
Anda pilih: Direktur, Kasie Frengki, Kasubdit Arpentius

Sistem urutkan:
1. Kasie Frengki (Level B)
2. Kasubdit Arpentius (Level C)
3. Direktur (Level D)
```

---

## Upload Dokumen & Pilih Approver

### Langkah Upload

1. Klik **[+ Upload Dokumen]** di dashboard
2. Isi form:

```
┌───────────────────────────────────────────────────────┐
│  UPLOAD DOKUMEN BARU                                  │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Nama Dokumen: *                                      │
│  ┌───────────────────────────────────────────┐        │
│  │ MOU Kerja Sama dengan PT ABC              │        │
│  └───────────────────────────────────────────┘        │
│                                                       │
│  Deskripsi:                                           │
│  ┌───────────────────────────────────────────┐        │
│  │ MOU pengadaan peralatan lab               │        │
│  └───────────────────────────────────────────┘        │
│                                                       │
│  Pilih File: *                                        │
│  ┌───────────────────────────────────────────┐        │
│  │ [Browse] MOU_ABC.docx (2.3 MB)           │         │
│  └───────────────────────────────────────────┘        │
│                                                       │
│  ═══════════════════════════════════════════════      │
│                                                       │
│  PILIH APPROVER: * (Wajib)                            │
│  ┌───────────────────────────────────────────┐        │
│  │ ☑ Frengki, ST., MM (Kasie)               │        │
│  │ ☑ Arpentius, ST., MM (Kasubdit)          │       │
│  │ ☑ Dr. Eng Muhammad Makky (Direktur)      │       │
│  │ ☐ Roni Saputra, ST (Kasie)               │       │
│  │ ☐ Dr. Kiki Yulianto (Kasubdit)           │       │
│  └───────────────────────────────────────────┘       │
│                                                       │
│  Urutan approval (otomatis):                         │
│  1. Frengki → 2. Arpentius → 3. Direktur            │
│                                                       │
│         [Upload & Submit]     [Cancel]               │
│                                                       │
└───────────────────────────────────────────────────────┘
```

3. Pilih minimal 1 approver (boleh lebih)
4. Sistem otomatis mengurutkan berdasarkan level
5. Klik **Upload & Submit**
6. Approver pertama akan dapat **notifikasi dalam sistem**

---

## Review & Approval

### Untuk Approver (B/C/D)

1. Anda akan lihat **🔔 badge** di ikon notifikasi
2. Klik notifikasi atau dokumen di dashboard
3. Review dokumen:

```
┌───────────────────────────────────────────────────────┐
│  REVIEW DOKUMEN                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Nama: MOU Kerja Sama dengan PT ABC                  │
│  Dari: Diki Putra (Staff)                            │
│  Tanggal: 12 Jan 2026                                │
│                                                       │
│  [📄 Buka Dokumen di Word Online]                    │
│                                                       │
│  ─────────────────────────────────────────────────   │
│                                                       │
│  Progress:                                           │
│  ✓ Diki Putra - Upload (12 Jan, 10:00)              │
│  ⏳ Anda - Review (sekarang)                         │
│  ○ Arpentius - Pending                               │
│  ○ Direktur - Pending                                │
│                                                       │
│  ─────────────────────────────────────────────────   │
│                                                       │
│       [✓ Approve]        [✗ Reject]                  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

4. Pilih:
   - **Approve** → Lanjut ke approver berikutnya
   - **Reject** → Kembali ke uploader untuk revisi

---

## Notifikasi Dalam Sistem

### Jenis Notifikasi

| Tipe | Contoh |
|------|--------|
| **NEW_DOCUMENT** | "Dokumen baru menunggu review Anda" |
| **APPROVED** | "Dokumen Anda disetujui oleh Frengki" |
| **REJECTED** | "Dokumen Anda ditolak, alasan: ..." |
| **READY_TO_PRINT** | "Dokumen siap cetak!" |

### Cara Akses

Klik **🔔** di header untuk melihat daftar notifikasi:

```
┌──────────────────────────────────────┐
│  NOTIFIKASI                    [✓]  │
├──────────────────────────────────────┤
│                                      │
│  ● Dokumen baru menunggu review     │
│    MOU_ABC.docx - 5 menit lalu      │
│                                      │
│  ○ Dokumen disetujui oleh Frengki   │
│    MOU_XYZ.docx - 1 jam lalu        │
│                                      │
│  ○ Dokumen Anda siap cetak!         │
│    MOU_123.docx - kemarin           │
│                                      │
│  [Tandai Semua Dibaca]              │
│                                      │
└──────────────────────────────────────┘
```

**● = Belum dibaca, ○ = Sudah dibaca**

---

## Kirim Batch Reminder

### Kapan Menggunakan?
- Ada banyak dokumen pending di atasan
- Perlu escalate ke management

### Cara Kirim

1. Klik **[Kirim Batch Reminder]** di dashboard
2. Pilih target (opsional, default: atasan langsung)
3. Review ringkasan:

```
┌───────────────────────────────────────────────────────┐
│  BATCH REMINDER                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Akan dikirim EMAIL ke atasan dengan ringkasan:      │
│                                                       │
│  Total Dokumen Pending: 5                             │
│                                                       │
│  • MOU_ABC.docx - pending 3 hari                     │
│  • MOU_XYZ.docx - pending 2 hari                     │
│  • MOU_123.docx - pending 1 hari                     │
│  ...                                                  │
│                                                       │
│  Kirim ke: Dr. Eng Muhammad Makky (Direktur)         │
│                                                       │
│         [Kirim Email]     [Batal]                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

4. Klik **Kirim Email**

> **Catatan:** Ini adalah SATU-SATUNYA email yang dikirim sistem. Notifikasi lain hanya dalam sistem.

---

## Status Dokumen

| Status | Icon | Arti |
|--------|------|------|
| **DIAJUKAN** | ⏳ | Menunggu approver pertama |
| **DIBUKA** | 👀 | Sedang direview |
| **DISETUJUI** | ✅ | Lanjut ke approver berikutnya |
| **DITOLAK** | ❌ | Kembali ke uploader untuk revisi |
| **SIAP_CETAK** | 🎉 | Semua approver sudah setuju |

---

## Arsip & Audit

### Akses Arsip
1. Buka menu **Arsip**
2. Cari dokumen berdasarkan nama/tanggal
3. Klik untuk lihat detail dan audit trail

### Audit Trail
Setiap dokumen memiliki log lengkap:

```
┌───────────────────────────────────────────────────────┐
│  AUDIT TRAIL - MOU_ABC.docx                          │
├───────────────────────────────────────────────────────┤
│                                                       │
│  12 Jan 2026, 10:00 - Diki Putra                     │
│  ACTION: CREATED                                      │
│                                                       │
│  12 Jan 2026, 10:05 - System                         │
│  ACTION: SUBMITTED                                    │
│                                                       │
│  12 Jan 2026, 11:00 - Frengki                        │
│  ACTION: APPROVED                                     │
│  Remarks: "Sudah sesuai"                             │
│                                                       │
│  12 Jan 2026, 14:00 - Arpentius                      │
│  ACTION: APPROVED                                     │
│                                                       │
│  12 Jan 2026, 16:00 - Direktur                       │
│  ACTION: APPROVED (Final)                             │
│                                                       │
│  [Export PDF]                                        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## FAQ

### Q: Kenapa saya tidak dapat email notifikasi?
**A:** Sistem ini menggunakan **notifikasi dalam sistem** (bukan email). Buka website dan cek icon 🔔.

### Q: Bagaimana cara mengirim reminder ke approver?
**A:** Gunakan tombol **[Kirim Batch Reminder]**. Ini akan mengirim email ringkasan ke atasan.

### Q: Bisa pilih approver siapa saja?
**A:** Ya! Anda bebas pilih siapa yang harus approve. Sistem akan otomatis mengurutkan berdasarkan level jabatan.

### Q: Kalau ditolak, dokumen kemana?
**A:** Kembali ke Anda untuk revisi. Notifikasi akan muncul di sistem.

### Q: Bisa akses dokumen lama?
**A:** Ya, semua dokumen tersimpan di **Arsip** dengan audit trail lengkap.

### Q: Apakah bisa skip approver?
**A:** Tidak. Approval harus berurutan sesuai yang dipilih.

### Q: Format file apa yang didukung?
**A:** .docx, .doc, .pdf (max 25 MB)

---

**Version:** 2.0
**Last Updated:** January 12, 2026
