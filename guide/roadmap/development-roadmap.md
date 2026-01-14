# 🚀 Panduan Pengembangan SIMOMOU
## File Reference per Phase

---

## ✅ Status Sinkronisasi: READY

Semua 10 file dokumentasi sudah sinkron dengan design baru:
- Notifikasi in-app saja
- Email hanya batch reminder
- Flexible approver selection
- Role hierarchy database
- Arsip dengan audit trail

---

## 📋 Pengelompokan File per Phase

### Phase 1: Setup & Infrastructure (Week 1)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `design-system-part4.md` | Section 9: Folder Structure |
| `design-system-part2.md` | Section 6.1-6.9: SQL Schema |
| `dev-guide-approval.md` | Setup & Installation, Database Setup |

**Task:**
- [x] Setup git repo dengan folder structure
- [x] Setup backend (Express + TypeScript)
- [x] Setup frontend (Vite + React)
- [x] Setup Docker + MySQL
- [x] Run migrations (buat semua tabel)
- [x] Run seeders (roles, hierarchy)
- [x] Seed admin user saja (`seed-admin.sql`)
- [x] **Admin tambah user DKSHR via UI** (UserManagementPage)

---

### Phase 2: Core Backend (Week 2)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `design-system-part3.md` | Section 7: OOP Classes (Entities) |
| `design-system-part3.md` | Section 8: API Endpoints |
| `dev-guide-approval.md` | API Implementation |

**Task:**
- [x] Auth Module (login, JWT, RBAC)
- [x] User Module (CRUD, get approvers)
- [x] Document Module (CRUD, dengan link)
- [x] HierarchyService (sort by level)

---

### Phase 3: Approval System (Week 3)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `design-system-part1.md` | Section 4: BPMN Flow |
| `design-system-part3.md` | ApprovalService, NotificationService |
| `dev-guide-approval.md` | Key Services |

**Task:**
- [x] ApprovalService (approve, reject, next)
- [x] Document Approvers (multi-select, auto-sort)
- [x] NotificationService (in-app only!)
- [x] ApprovalHistory (audit trail)

---

### Phase 4: Email & Automation (Week 4)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `design-system-part1.md` | Section 4.2: Batch Reminder Flow |
| `design-system-part3.md` | EmailReminderService |
| `visual-reference.md` | Section 8: Email Template |

**Task:**
- [x] EmailReminderService (batch only!)
- [x] Cron job (auto daily reminder)
- [x] ArchiveService
- [x] AuditService

---

### Phase 5: Frontend (Week 3-4, paralel)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `visual-reference.md` | Semua UI mockups |
| `design-system-part4.md` | Section 9: Frontend structure |
| `dev-guide-approval.md` | Frontend Implementation |
| `user-manual-approval.md` | Untuk memahami UX |

**Task:**
- [x] Dashboard (gradient cards, backlog chart, personal stats)
- [x] Semua Dokumen (table, tabs, filter, email reminder button)
- [x] Dokumen Saya (personal queue, approve/reject buttons)
- [x] Upload form + ApproverSelect (real API integration)
- [x] Login page (gradient, real auth)
- [x] NotificationBell (in-app, realtime count)
- [x] Archive page (table, restore, audit trail)
- [x] **Admin User Management** (CRUD users, role-based nav)
- [x] Role-based access control (admin vs regular user nav)
- [x] **Upload protected for Staff only** (requireStaffOnly middleware)
- [x] **Document Review Page** for approvers with workflow progress

---

### Phase 6: Testing & Deployment (Week 5)

**Baca file ini:**
| File | Bagian yang Relevan |
|------|---------------------|
| `dev-guide-approval.md` | Testing, Deployment |
| `user-manual-approval.md` | Untuk UAT checklist |

**Task:**
- [ ] Unit tests
- [ ] Integration tests
- [ ] UAT dengan user DKSHR
- [ ] Production deploy

---

## 📁 Quick Reference

| Butuh Info Tentang | Buka File |
|--------------------|-----------|
| Alur approval | `design-system-part1.md` |
| SQL/Database | `design-system-part2.md` |
| API & Classes | `design-system-part3.md` |
| Folder structure | `design-system-part4.md` |
| Cara install | `dev-guide-approval.md` |
| UI mockups | `visual-reference.md` |
| Cara pakai (user) | `user-manual-approval.md` |
| Overview singkat | `executive-summary.md` |

---

## ⚠️ Reminder Penting

1. **Notifikasi = In-App saja** (BUKAN email)
2. **Email = Batch reminder only** (ringkasan ke atasan)
3. **Approver = User pilih sendiri** (sistem auto-sort by level)
4. **Hierarchy = Dari database** (bukan hardcode)

---

**Selamat mengembangkan! 🎉**
