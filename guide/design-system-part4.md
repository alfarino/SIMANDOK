# SIMOMOU - Desain Sistem Part 4
## Folder Structure & Implementation Steps

---

## 9. FOLDER STRUCTURE

```
simomou/
├── README.md
├── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── docs/                              # Dokumentasi
│   ├── design-system-part1.md         # Use Case, BPMN, ERD
│   ├── design-system-part2.md         # Database Design
│   ├── design-system-part3.md         # OOP, API
│   ├── design-system-part4.md         # Folder Structure, Steps
│   ├── bpmn-approval-system.md
│   ├── dev-guide-approval.md
│   ├── user-manual-approval.md
│   └── api-specification.md
│
├── backend/                           # Backend (Node.js/Express)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   │
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── app.ts                     # Express app setup
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts            # DB connection
│   │   │   ├── onedrive.ts            # OneDrive config
│   │   │   └── email.ts               # SMTP config
│   │   │
│   │   ├── entities/                  # ORM Entities
│   │   │   ├── User.ts
│   │   │   ├── Role.ts
│   │   │   ├── RoleHierarchy.ts
│   │   │   ├── DocumentApproval.ts
│   │   │   ├── DocumentApprover.ts
│   │   │   ├── Notification.ts
│   │   │   ├── ApprovalHistory.ts
│   │   │   ├── EmailReminderLog.ts
│   │   │   └── AuditLog.ts
│   │   │
│   │   ├── types/                     # Type Definitions
│   │   │   ├── enums.ts
│   │   │   ├── dto.ts                 # Data Transfer Objects
│   │   │   └── interfaces.ts
│   │   │
│   │   ├── services/                  # Business Logic
│   │   │   ├── AuthService.ts
│   │   │   ├── DocumentService.ts
│   │   │   ├── ApprovalService.ts
│   │   │   ├── NotificationService.ts
│   │   │   ├── EmailReminderService.ts
│   │   │   ├── HierarchyService.ts
│   │   │   ├── ArchiveService.ts
│   │   │   ├── AuditService.ts
│   │   │   └── OneDriveService.ts
│   │   │
│   │   ├── controllers/               # Request Handlers
│   │   │   ├── AuthController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── DocumentController.ts
│   │   │   ├── ApprovalController.ts
│   │   │   ├── NotificationController.ts
│   │   │   ├── ReminderController.ts
│   │   │   ├── ArchiveController.ts
│   │   │   └── DashboardController.ts
│   │   │
│   │   ├── routes/                    # API Routes
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── documents.routes.ts
│   │   │   ├── approvals.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── reminders.routes.ts
│   │   │   ├── archive.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   ├── rbac.middleware.ts     # Role-based access
│   │   │   ├── audit.middleware.ts    # Audit logging
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   │
│   │   ├── jobs/                      # Cron Jobs
│   │   │   ├── reminderJob.ts         # Auto email reminder
│   │   │   └── archiveJob.ts          # Auto archive
│   │   │
│   │   └── utils/
│   │       ├── errors.ts              # Custom errors
│   │       ├── validators.ts
│   │       ├── helpers.ts
│   │       └── constants.ts
│   │
│   ├── migrations/                    # DB Migrations
│   │   ├── 001_create_roles.ts
│   │   ├── 002_create_users.ts
│   │   ├── 003_create_role_hierarchy.ts
│   │   ├── 004_create_documents.ts
│   │   ├── 005_create_approvers.ts
│   │   ├── 006_create_notifications.ts
│   │   ├── 007_create_history.ts
│   │   ├── 008_create_audit_logs.ts
│   │   └── 009_create_reminder_logs.ts
│   │
│   ├── seeders/                       # DB Seeders
│   │   ├── 001_seed_roles.ts
│   │   ├── 002_seed_users.ts
│   │   └── 003_seed_hierarchy.ts
│   │
│   └── tests/                         # Unit & Integration Tests
│       ├── unit/
│       │   ├── AuthService.test.ts
│       │   ├── DocumentService.test.ts
│       │   └── ApprovalService.test.ts
│       └── integration/
│           ├── auth.test.ts
│           └── documents.test.ts
│
├── frontend/                          # Frontend (React)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── main.tsx                   # Entry point
│       ├── App.tsx                    # Root component
│       │
│       ├── assets/                    # Static assets
│       │   ├── images/
│       │   └── fonts/
│       │
│       ├── styles/                    # Global styles
│       │   ├── globals.css
│       │   └── variables.css
│       │
│       ├── types/                     # TypeScript types
│       │   ├── index.ts
│       │   ├── user.ts
│       │   ├── document.ts
│       │   └── notification.ts
│       │
│       ├── store/                     # State Management
│       │   ├── index.ts
│       │   ├── authSlice.ts
│       │   ├── documentSlice.ts
│       │   ├── notificationSlice.ts
│       │   └── uiSlice.ts
│       │
│       ├── services/                  # API Services
│       │   ├── api.ts                 # Axios instance
│       │   ├── authService.ts
│       │   ├── documentService.ts
│       │   ├── approvalService.ts
│       │   └── notificationService.ts
│       │
│       ├── hooks/                     # Custom Hooks
│       │   ├── useAuth.ts
│       │   ├── useDocuments.ts
│       │   ├── useNotifications.ts
│       │   └── usePagination.ts
│       │
│       ├── components/                # Reusable Components
│       │   ├── common/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Loading.tsx
│       │   │   ├── Button.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Toast.tsx
│       │   │   └── Table.tsx
│       │   │
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   │
│       │   ├── documents/
│       │   │   ├── DocumentTable.tsx
│       │   │   ├── DocumentCard.tsx
│       │   │   ├── UploadForm.tsx
│       │   │   ├── ApproverSelect.tsx
│       │   │   └── StatusBadge.tsx
│       │   │
│       │   ├── approvals/
│       │   │   ├── ApprovalModal.tsx
│       │   │   ├── RejectModal.tsx
│       │   │   └── ProgressTimeline.tsx
│       │   │
│       │   └── notifications/
│       │       ├── NotificationBell.tsx
│       │       ├── NotificationList.tsx
│       │       └── NotificationItem.tsx
│       │
│       ├── pages/                     # Page Components
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── DocumentsPage.tsx
│       │   ├── DocumentDetailPage.tsx
│       │   ├── UploadPage.tsx
│       │   ├── ApprovalsPage.tsx
│       │   ├── ArchivePage.tsx
│       │   ├── ProfilePage.tsx
│       │   └── NotFoundPage.tsx
│       │
│       └── utils/
│           ├── formatters.ts
│           ├── validators.ts
│           └── constants.ts
│
└── database/                          # Database Scripts
    ├── schema.sql                     # Full schema
    ├── seed-roles.sql
    ├── seed-users-dkshr.sql           # DKSHR users
    └── seed-hierarchy.sql
```

---

## 10. IMPLEMENTATION STEPS

### Phase 1: Setup & Infrastructure (Week 1)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 1.1 | Setup Repository | Git repo, branches, README | Git repo ready |
| 1.2 | Setup Backend Project | Express.js, TypeScript, Sequelize | Backend skeleton |
| 1.3 | Setup Frontend Project | Vite, React, TypeScript | Frontend skeleton |
| 1.4 | Setup Docker | docker-compose, MySQL, Redis | Dev environment |
| 1.5 | Database Migrations | Create all tables | Schema ready |
| 1.6 | Seed Data | Roles, DKSHR users, hierarchy | Test data |

### Phase 2: Core Backend (Week 2)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 2.1 | Auth Module | Register, Login, JWT, RBAC | Auth working |
| 2.2 | User Module | CRUD, Profile, Get Approvers | User API |
| 2.3 | Document Module | CRUD, Upload, Status | Document API |
| 2.4 | Hierarchy Service | Sort by level, Get supervisors | Hierarchy logic |
| 2.5 | OneDrive Integration | Upload, Share link | OneDrive working |

### Phase 3: Approval System (Week 3)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 3.1 | Approver Selection | Multi-select, Auto-sort | Approver pick UI+API |
| 3.2 | Approval Flow | Approve, Reject, Next approver | Approval logic |
| 3.3 | In-App Notifications | Create, Read, List, Count | Notification system |
| 3.4 | Approval History | Log all actions | Audit trail |

### Phase 4: Email & Automation (Week 4)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 4.1 | Email Service | SMTP setup, Templates | Email working |
| 4.2 | Batch Reminder | Manual trigger | Reminder API |
| 4.3 | Cron Job | Auto daily reminder | Scheduler |
| 4.4 | Archive System | Archive, Restore, Audit | Archive module |

### Phase 5: Frontend Development (Week 3-4)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 5.1 | Auth Pages | Login, Protected routes | Auth UI |
| 5.2 | Dashboard | Summary cards, Tables | Dashboard UI |
| 5.3 | Document Management | Upload, List, Detail | Documents UI |
| 5.4 | Approver Selection | Multi-select component | Approver UI |
| 5.5 | Approval Actions | Approve/Reject modals | Approval UI |
| 5.6 | Notifications | Bell icon, Dropdown | Notification UI |
| 5.7 | Archive | List, Detail, Export | Archive UI |

### Phase 6: Testing & Deployment (Week 5)

| Step | Task | Detail | Deliverable |
|------|------|--------|-------------|
| 6.1 | Unit Tests | Services, Controllers | Test coverage |
| 6.2 | Integration Tests | API endpoints | E2E tests |
| 6.3 | UAT | User testing | Bug fixes |
| 6.4 | Production Deploy | Docker, CI/CD | Live system |

---

## 11. TECHNOLOGY STACK SUMMARY

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Redux Toolkit, MUI |
| **Backend** | Node.js 18, Express.js, TypeScript, Sequelize |
| **Database** | MySQL 8.0 |
| **Storage** | Microsoft OneDrive (Graph API) |
| **Email** | Nodemailer (SMTP) |
| **Auth** | JWT, bcrypt |
| **Scheduler** | node-cron |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 12. RINGKASAN PERUBAHAN DARI SISTEM LAMA

| Aspek | Sistem Lama | Sistem Baru |
|-------|-------------|-------------|
| **Notifikasi** | Email untuk semua | In-app only, email batch saja |
| **Approver** | Fixed A→B→C→D | Flexible, pilih sendiri |
| **Hierarchy** | Hardcoded | Database driven |
| **Arsip** | Tidak ada | Full audit trail |

---

**Dokumen ini adalah referensi utama untuk pengembangan SIMOMOU.** 

Semua dokumentasi lama akan diupdate untuk menyesuaikan dengan desain baru ini.
