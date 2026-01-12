# SIMOMOU - Dokumentasi Desain Sistem
## Master Index

---

## Daftar File Dokumentasi

### Dokumentasi Desain Baru

| No | File | Konten |
|----|------|--------|
| 1 | [design-system-part1.md](file:///d:/User/Documents/KP/SIMOMOU/design-system-part1.md) | Ringkasan, Hierarki, Use Case Diagram, BPMN, ERD |
| 2 | [design-system-part2.md](file:///d:/User/Documents/KP/SIMOMOU/design-system-part2.md) | Database Design (SQL Schema) |
| 3 | [design-system-part3.md](file:///d:/User/Documents/KP/SIMOMOU/design-system-part3.md) | OOP Class Design, API Endpoints |
| 4 | [design-system-part4.md](file:///d:/User/Documents/KP/SIMOMOU/design-system-part4.md) | Folder Structure, Implementation Steps |

### Dokumentasi Lama (Akan Diupdate)

| No | File | Status |
|----|------|--------|
| 1 | bpmn-approval-system.md | Perlu update sesuai desain baru |
| 2 | dev-guide-approval.md | Perlu update sesuai desain baru |
| 3 | dokumentasi-index.md | Perlu update sesuai desain baru |
| 4 | executive-summary.md | Perlu update sesuai desain baru |
| 5 | user-manual-approval.md | Perlu update sesuai desain baru |
| 6 | visual-reference.md | Perlu update sesuai desain baru |

---

## Ringkasan Perubahan Utama

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Notifikasi** | Email untuk semua event | In-app notification saja |
| **Email** | Real-time setiap event | Batch reminder ke atasan saja |
| **Approver** | Fixed chain A→B→C→D | Flexible, pembuat pilih sendiri |
| **Hierarki** | Hardcoded di kode | Disimpan di database |
| **Arsip** | Tidak ada fitur khusus | Full audit trail & akses arsip |

---

## Quick Reference

### Hierarki Organisasi DKSHR

```
Level D (Direktur)
└── Dr. Eng Muhammad Makky

Level C (Kasubdit)  
├── Arpentius (Kerja Sama)
└── Dr. Kiki Yulianto (Hilirisasi)

Level B (Kasie)
├── Frengki (Penjajakan)
├── Roni Saputra (Alumni)
└── Riri Sari Hamdani (Hilirisasi)

Level A (Staff) - 24 orang
```

### Tabel Database Utama

1. `users` - Data pengguna
2. `roles` - Definisi role (A/B/C/D)
3. `role_hierarchy` - Urutan hierarki
4. `document_approvals` - Dokumen utama
5. `document_approvers` - Daftar approver per dokumen
6. `notifications` - Notifikasi in-app
7. `approval_history` - Riwayat approval
8. `audit_logs` - Audit trail
9. `email_reminder_logs` - Log email reminder

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, MUI
- **Backend**: Node.js, Express, TypeScript, Sequelize
- **Database**: MySQL 8.0
- **Storage**: Microsoft OneDrive
- **Email**: Nodemailer (hanya batch reminder)

---

## Langkah Selanjutnya

1. ✅ Dokumentasi desain sistem dibuat
2. ⏳ Update dokumentasi lama (6 file)
3. ⏳ Review oleh user
4. ⏳ Mulai implementasi Phase 1

---

**Dokumen ini adalah index utama untuk seluruh dokumentasi SIMOMOU.**
