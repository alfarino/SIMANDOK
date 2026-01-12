# SIMOMOU - Desain Sistem Approval Workflow
## Direktorat Kerja Sama dan Hilirisasi Riset (DKSHR)

---

## 1. RINGKASAN SISTEM

**Nama Sistem**: SIMOMOU (Sistem Informasi MOU)
**Tujuan**: Mengelola approval dokumen MOU/kerja sama dengan notifikasi in-app dan email reminder batch

### Fitur Utama
1. Upload dokumen dengan pemilihan approver fleksibel
2. Notifikasi dalam sistem (in-app)
3. Email batch reminder untuk dokumen pending
4. Approval chain berdasarkan hirarki jabatan
5. Arsip dokumen dengan audit trail lengkap

---

## 2. HIERARKI ORGANISASI

```
Level D (Direktur) - Hierarchy Level 4
└── Dr. Eng Muhammad Makky, STP., M.Si – Direktur DKSHR

Level C (Kepala Subdit) - Hierarchy Level 3
├── Arpentius, ST., MM – Kasubdit Kerja Sama
└── Dr. Kiki Yulianto, STP, MP – Kasubdit Hilirisasi

Level B (Kepala Seksi) - Hierarchy Level 2
├── Frengki, ST., MM – Kasie Penjajakan Kerja Sama
├── Roni Saputra, ST – Kasie Hubungan Alumni
└── Riri Sari Hamdani, SE – Kasie Identifikasi Hilirisasi

Level A (Staff/Team) - Hierarchy Level 1
├── Team Kerja Sama (4 orang)
├── Team Alumni (2 orang)
├── Team Hilirisasi (7 orang)
├── Sekretariat (2 orang)
├── Team EQUITY (7 orang)
├── CS & Driver (2 orang)
```

---

## 3. USE CASE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIMOMOU SYSTEM                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐                                                        │
│  │  Staff  │──────┬── UC01: Login/Logout                           │
│  │ (A)     │      ├── UC02: Upload Dokumen                         │
│  └─────────┘      ├── UC03: Pilih Approver                         │
│       │           ├── UC04: Lihat Status Dokumen                   │
│       │           ├── UC05: Lihat Notifikasi In-App                │
│       │           ├── UC06: Revisi Dokumen (Jika Ditolak)          │
│       │           └── UC07: Download Dokumen Final                  │
│       │                                                              │
│  ┌─────────┐                                                        │
│  │ Kasie   │──────┬── UC01: Login/Logout                           │
│  │ (B)     │      ├── UC04: Lihat Status Dokumen                   │
│  └─────────┘      ├── UC05: Lihat Notifikasi In-App                │
│       │           ├── UC08: Review Dokumen                          │
│       │           ├── UC09: Approve Dokumen                         │
│       │           ├── UC10: Reject Dokumen                          │
│       │           └── UC11: Kirim Batch Reminder                    │
│       │                                                              │
│  ┌─────────┐                                                        │
│  │Kasubdit │──────┬── (Same as Kasie)                              │
│  │ (C)     │      └── UC12: Lihat Laporan Pending                  │
│  └─────────┘                                                        │
│       │                                                              │
│  ┌─────────┐                                                        │
│  │Direktur │──────┬── (Same as Kasubdit)                           │
│  │ (D)     │      └── UC13: Final Approval                         │
│  └─────────┘                                                        │
│                                                                      │
│  ┌─────────┐                                                        │
│  │ Admin   │──────┬── UC14: Kelola User                            │
│  │         │      ├── UC15: Kelola Role Hierarchy                  │
│  └─────────┘      ├── UC16: Lihat Audit Trail                      │
│                   └── UC17: Kelola Arsip                            │
│                                                                      │
│  ┌─────────┐                                                        │
│  │ System  │──────┬── UC18: Generate In-App Notification           │
│  │(Cron)   │      ├── UC19: Generate Batch Email Reminder          │
│  └─────────┘      └── UC20: Auto-Archive Completed Docs            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. BPMN - ALUR UTAMA

### 4.1 Upload & Approval Flow

```
START
  │
  ▼
┌─────────────────────┐
│ A: Login Sistem     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ A: Upload Dokumen   │
│ + Pilih Approvers   │
│ (Multi-select)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────┐
│ System: Simpan ke OneDrive  │
│ + Create DB Record          │
│ + Sort Approvers by Level   │
│ + Create document_approvers │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ System: In-App Notification │
│ ke Approver Pertama         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Approver: Review    │
│ Dokumen             │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
 APPROVE    REJECT
    │         │
    ▼         ▼
┌────────┐ ┌────────────────┐
│Next?   │ │Back to A       │
│        │ │Status: DITOLAK │
└───┬────┘ │In-App Notify A │
    │      └────────────────┘
 YES│NO
    │  │
    ▼  ▼
┌────────────────┐
│Final Approver? │
└───┬─────┬──────┘
  YES     NO
    │      │
    ▼      ▼
┌────────┐ ┌──────────────┐
│SIAP    │ │Next Approver │
│CETAK   │ │In-App Notify │
└────────┘ └──────────────┘
```

### 4.2 Batch Email Reminder Flow

```
Option A: Manual Trigger              Option B: Auto (Cron Job)
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌───────────────────────┐
│ User klik "Kirim    │              │ Cron: Setiap hari     │
│ Reminder Batch"     │              │ jam 08:00 WIB         │
└────────┬────────────┘              └───────────┬───────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │ System: Query dokumen       │
           │ WHERE status = PENDING      │
           │ GROUP BY current_approver   │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │ System: Generate Summary    │
           │ per Approver                │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │ System: Send Email ke       │
           │ Atasan (Level di atas)      │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │ System: Log reminder_sent   │
           └─────────────────────────────┘
```

---

## 5. ERD (Entity Relationship Diagram)

```
┌──────────────────┐       ┌───────────────────┐
│      USERS       │       │      ROLES        │
├──────────────────┤       ├───────────────────┤
│ PK id            │       │ PK id             │
│    username      │       │    role_name      │
│    email         │◄──────│    description    │
│    password_hash │   1:N │    hierarchy_level│
│ FK role_id       │───────│    department     │
│    full_name     │       │    created_at     │
│    phone         │       └───────────────────┘
│    is_active     │
│    created_at    │       ┌───────────────────┐
└──────────────────┘       │  ROLE_HIERARCHY   │
         │                 ├───────────────────┤
         │                 │ PK id             │
         │ 1:N             │ FK role_id        │
         ▼                 │    hierarchy_level│
┌──────────────────┐       │ FK parent_role_id │
│ DOCUMENT_APPROVALS│       └───────────────────┘
├──────────────────┤
│ PK id            │       ┌───────────────────┐
│    document_name │       │ DOCUMENT_APPROVERS│
│    description   │       ├───────────────────┤
│ FK uploaded_by   │──────►│ PK id             │
│    onedrive_id   │  1:N  │ FK document_id    │
│    onedrive_link │◄──────│ FK approver_id    │
│    status        │       │    sequence_order │
│ FK current_rev_id│       │    status         │
│    rejection_rsn │       │    approved_at    │
│    is_archived   │       │    remarks        │
│    archived_at   │       └───────────────────┘
│    created_at    │
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌───────────────────┐
│ APPROVAL_HISTORY │       │   NOTIFICATIONS   │
├──────────────────┤       ├───────────────────┤
│ PK id            │       │ PK id             │
│ FK document_id   │       │ FK recipient_id   │
│ FK action_by     │       │ FK document_id    │
│    action_type   │       │    type           │
│    from_status   │       │    title          │
│    to_status     │       │    message        │
│    remarks       │       │    is_read        │
│    created_at    │       │    read_at        │
└──────────────────┘       │    created_at     │
                           └───────────────────┘
┌──────────────────┐
│    AUDIT_LOG     │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│    action        │
│    resource_type │
│    resource_id   │
│    old_value     │
│    new_value     │
│    ip_address    │
│    created_at    │
└──────────────────┘
```

---

*Lanjutan di design-system-part2.md*
