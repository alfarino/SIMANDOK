# 📋 DOKUMENTASI LENGKAP - SIMOMOU
## Sistem Informasi MOU - DKSHR Universitas Andalas

---

## 🎯 Ringkasan Sistem

**SIMOMOU** adalah platform terintegrasi untuk mengelola proses persetujuan dokumen MOU/kerja sama dengan:
- ✅ Notifikasi dalam sistem (in-app)
- ✅ Email batch reminder untuk dokumen pending
- ✅ Pemilihan approver fleksibel
- ✅ Approval chain berdasarkan hirarki jabatan
- ✅ Arsip dokumen dengan audit trail lengkap

---

## 📁 Struktur Dokumentasi

### Dokumentasi Teknis (Technical Design)

| File | Konten | Untuk |
|------|--------|-------|
| [design-system-part1.md](./design-system-part1.md) | Use Case, BPMN, ERD | Architect, Developer |
| [design-system-part2.md](./design-system-part2.md) | Database Schema (SQL) | Backend Developer |
| [design-system-part3.md](./design-system-part3.md) | OOP Classes, API Endpoints | Developer |
| [design-system-part4.md](./design-system-part4.md) | Folder Structure, Implementation Steps | Developer, PM |
| [design-system-index.md](./design-system-index.md) | Master Index Design | Semua |

### Dokumentasi Implementasi & Referensi

| File | Konten | Untuk |
|------|--------|-------|
| [dev-guide-approval.md](./dev-guide-approval.md) | Setup, Code Implementation, Deployment | Developer |
| [user-manual-approval.md](./user-manual-approval.md) | Panduan Pengguna, FAQ | End User |
| [visual-reference.md](./visual-reference.md) | UI Mockups, Status Colors | Designer, Frontend |
| [executive-summary.md](./executive-summary.md) | Overview, Timeline, Budget | Management |

---

## 🔄 Perubahan Terbaru (v2.0)

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Notifikasi** | Email untuk semua event | In-app notification saja |
| **Email** | Real-time setiap action | Batch reminder ke atasan |
| **Approver** | Fixed chain A→B→C→D | Flexible, user pilih sendiri |
| **Hierarchy** | Hardcoded | Database driven |
| **Arsip** | Minimal | Full audit trail |

---

## 🏢 Hierarki Organisasi DKSHR

```
Level D (Direktur)
└── Dr. Eng Muhammad Makky, STP., M.Si

Level C (Kepala Subdit)
├── Arpentius, ST., MM (Kerja Sama)
└── Dr. Kiki Yulianto, STP, MP (Hilirisasi)

Level B (Kepala Seksi)
├── Frengki, ST., MM
├── Roni Saputra, ST
└── Riri Sari Hamdani, SE

Level A (Staff/Team) - 24 orang
```

---

## 🚀 Quick Start

### Untuk Developer
1. Baca [design-system-part1.md](./design-system-part1.md) untuk arsitektur
2. Baca [design-system-part2.md](./design-system-part2.md) untuk database
3. Ikuti [dev-guide-approval.md](./dev-guide-approval.md) untuk implementasi

### Untuk End User
1. Baca [user-manual-approval.md](./user-manual-approval.md)

### Untuk Management
1. Baca [executive-summary.md](./executive-summary.md)

---

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, MUI |
| Backend | Node.js, Express, TypeScript, Sequelize |
| Database | MySQL 8.0 |
| Storage | Microsoft OneDrive (Graph API) |
| Email | Nodemailer (batch reminder only) |

---

## ⏱️ Timeline Pengembangan

| Phase | Durasi | Deliverable |
|-------|--------|-------------|
| Setup & Infrastructure | Week 1 | Environment ready |
| Core Backend | Week 2 | API working |
| Approval System | Week 3 | Approval flow ready |
| Email & Automation | Week 4 | Batch reminder ready |
| Frontend | Week 3-4 | UI complete |
| Testing & Deployment | Week 5 | Production ready |

---

**Last Updated:** January 12, 2026
**Version:** 2.0
**Status:** Ready for Implementation
