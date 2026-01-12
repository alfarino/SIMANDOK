# RINGKASAN EKSEKUTIF - SIMOMOU
## Sistem Informasi MOU - DKSHR Universitas Andalas

---

## Overview Sistem

**SIMOMOU** adalah platform terintegrasi untuk mengelola proses persetujuan dokumen MOU/kerja sama dengan notifikasi real-time dalam sistem, email batch reminder, dan tracking audit yang lengkap.

---

## Quick Facts

| Aspek | Detail |
|-------|--------|
| **Tujuan** | Streamline document approval dengan flexible approver |
| **User Roles** | 4 level (Staff, Kasie, Kasubdit, Direktur) |
| **Document Storage** | Microsoft OneDrive (via Graph API) |
| **Tech Stack** | React, Node.js, MySQL, Microsoft Graph API |
| **Approval Flow** | Flexible (user pilih approver sendiri) |
| **Notifikasi** | In-app notification + email batch reminder |
| **Time to Market** | 5 minggu development |

---

## Fitur Utama

### 1. Upload & Document Management
- ✅ Upload dokumen ke OneDrive
- ✅ **Pilih approver sendiri** (multi-select)
- ✅ Auto-sort approver berdasarkan hierarki
- ✅ Version tracking via OneDrive

### 2. Flexible Approval Workflow
- ✅ Pembuat dokumen pilih siapa yang harus approve
- ✅ Sistem otomatis urutkan berdasarkan level jabatan
- ✅ Reject = kembali ke pembuat untuk revisi
- ✅ Approval bersifat final

### 3. Notifikasi Sistem
- ✅ **In-app notification** untuk semua event
- ✅ Bell icon dengan badge unread count
- ✅ **TANPA email real-time** (tidak spam inbox)

### 4. Email Batch Reminder
- ✅ Kirim ringkasan dokumen pending ke atasan
- ✅ Manual trigger atau auto (cron daily)
- ✅ Escalation tool untuk management

### 5. Arsip & Audit Trail
- ✅ Semua dokumen dapat diakses selamanya
- ✅ Full audit trail (siapa, kapan, action apa)
- ✅ Export audit report

---

## Hierarki Organisasi DKSHR

```
┌────────────────────────────────────────────────┐
│         APPROVAL HIERARCHY                     │
├────────────────────────────────────────────────┤
│                                                │
│  D (Direktur) - Level 4                        │
│  └── Dr. Eng Muhammad Makky, STP., M.Si       │
│                                                │
│  C (Kepala Subdit) - Level 3                   │
│  ├── Arpentius, ST., MM – Kerja Sama          │
│  └── Dr. Kiki Yulianto – Hilirisasi           │
│                                                │
│  B (Kepala Seksi) - Level 2                    │
│  ├── Frengki, ST., MM                         │
│  ├── Roni Saputra, ST                         │
│  └── Riri Sari Hamdani, SE                    │
│                                                │
│  A (Staff/Team) - Level 1 (24 orang)          │
│  ├── Team Kerja Sama (4)                      │
│  ├── Team Alumni (2)                          │
│  ├── Team Hilirisasi (7)                      │
│  ├── Team EQUITY (7)                          │
│  └── Sekretariat & Support (4)                │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Alur Kerja Sistem

```
STAFF UPLOAD DOKUMEN
       │
       ▼
┌──────────────────┐
│ Pilih Approvers  │  ← Multi-select
│ (misal: Kasie,   │
│  Kasubdit, Dir)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ System auto-sort │  ← Berdasarkan hierarchy level
│ by hierarchy     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ In-App Notify    │  ← Approver pertama dapat notif
│ Approver #1      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 APPROVE    REJECT
    │         │
    ▼         ▼
 Next      Back to
Approver    Staff
    │
    ▼
┌──────────────────┐
│ Final Approval   │
│ SIAP CETAK       │
└──────────────────┘
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `roles` | Role definitions (A/B/C/D) |
| `role_hierarchy` | Urutan hierarki jabatan |
| `document_approvals` | Dokumen utama |
| `document_approvers` | Daftar approver per dokumen |
| `notifications` | In-app notifications |
| `approval_history` | Audit trail |
| `audit_logs` | Full system audit |
| `email_reminder_logs` | Log batch email |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, MUI |
| **Backend** | Node.js, Express, TypeScript, Sequelize |
| **Database** | MySQL 8.0 |
| **Storage** | Microsoft OneDrive (Graph API) |
| **Email** | Nodemailer (batch reminder only) |
| **Auth** | JWT, bcrypt |
| **Container** | Docker, Docker Compose |

---

## Project Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Setup & Infrastructure | Week 1 | Environment, DB, Skeleton |
| Core Backend | Week 2 | Auth, Users, Documents API |
| Approval System | Week 3 | Approval flow, Notifications |
| Email & Automation | Week 4 | Batch reminder, Archive |
| Testing & Deployment | Week 5 | UAT, Production |
| **TOTAL** | **5 weeks** | Production ready |

---

## Cost Estimation

### Development
- Backend: 10-12 days
- Frontend: 10-12 days
- Integration: 5-7 days
- Testing: 5-7 days
- **Total: ~40 developer days**

### Infrastructure (Monthly)
- Server: $50-150
- Database: $30-80
- Email Service: $10-30
- **Total: ~$100-260/month**

---

## Dokumentasi Lengkap

| Dokumen | Untuk |
|---------|-------|
| [design-system-*.md](./design-system-index.md) | Technical Design |
| [dev-guide-approval.md](./dev-guide-approval.md) | Developer |
| [user-manual-approval.md](./user-manual-approval.md) | End User |
| [visual-reference.md](./visual-reference.md) | UI/UX |

---

**Version:** 2.0
**Last Updated:** January 12, 2026
**Status:** Ready for Implementation
