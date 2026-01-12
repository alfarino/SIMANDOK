# Development Guide - SIMOMOU
## Technical Implementation Reference

---

## Daftar Isi
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Setup & Installation](#setup--installation)
4. [Database Setup](#database-setup)
5. [API Implementation](#api-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Key Services](#key-services)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                    React + TypeScript + Vite                        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ REST API (JSON)
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                           BACKEND                                    │
│                  Node.js + Express + TypeScript                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ Auth       │  │ Document   │  │ Approval   │  │ Notif      │   │
│  │ Service    │  │ Service    │  │ Service    │  │ Service    │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐           ┌─────────────┐
│   MySQL     │          │  OneDrive   │           │   SMTP      │
│   Database  │          │  Graph API  │           │   (Batch)   │
└─────────────┘          └─────────────┘           └─────────────┘
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | React | 18.x |
| Frontend Build | Vite | 5.x |
| UI Library | MUI | 5.x |
| State | Redux Toolkit | 2.x |
| Backend | Node.js | 18.x |
| Backend Framework | Express | 4.x |
| ORM | Sequelize | 6.x |
| Database | MySQL | 8.0 |
| Auth | JWT + bcrypt | - |
| Email | Nodemailer | 6.x |
| Scheduler | node-cron | 3.x |
| Container | Docker | - |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0
- Docker (optional)

### 1. Clone Repository

```bash
git clone https://github.com/unand/simomou.git
cd simomou
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=simomou

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Microsoft Graph API
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Email (for batch reminder only)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@unand.ac.id
SMTP_PASS=yourpassword
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Run with Docker (Recommended)

```bash
docker-compose up -d
```

### 5. Run Manually

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Database Setup

### Run Migrations

```bash
cd backend
npm run migrate
```

### Run Seeders

```bash
npm run seed
```

### Schema Overview

Lihat [design-system-part2.md](./design-system-part2.md) untuk schema lengkap.

**Tables:**
- `users` - User accounts
- `roles` - Role definitions (A/B/C/D)
- `role_hierarchy` - Hierarki jabatan
- `document_approvals` - Dokumen utama
- `document_approvers` - Approvers per dokumen
- `notifications` - In-app notifications
- `approval_history` - Audit trail
- `audit_logs` - System audit
- `email_reminder_logs` - Email logs

---

## API Implementation

### Base URL
```
https://simomou.unand.ac.id/api
```

### Authentication

```typescript
// POST /api/auth/login
// Request:
{
  "email": "user@unand.ac.id",
  "password": "password123"
}

// Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@unand.ac.id",
    "fullName": "Diki Putra",
    "role": { "id": 1, "name": "Staff", "code": "A" }
  }
}
```

### Documents

```typescript
// POST /api/documents
// Headers: Authorization: Bearer <token>
// Request:
{
  "documentName": "MOU Kerja Sama PT ABC",
  "description": "Kerja sama pengadaan lab",
  "approverIds": [5, 2, 1]  // User IDs (akan di-sort otomatis)
}

// Response:
{
  "id": 123,
  "documentName": "MOU Kerja Sama PT ABC",
  "status": "DRAFT",
  "approvers": [
    { "userId": 5, "sequence": 1, "name": "Frengki", "level": "B" },
    { "userId": 2, "sequence": 2, "name": "Arpentius", "level": "C" },
    { "userId": 1, "sequence": 3, "name": "Direktur", "level": "D" }
  ]
}
```

### Upload File

```typescript
// POST /api/documents/:id/upload
// Headers: Authorization: Bearer <token>
// Content-Type: multipart/form-data
// Body: file (FormData)

// Response:
{
  "id": 123,
  "onedriveLink": "https://onedrive.live.com/...",
  "status": "DIAJUKAN"
}
```

### Approvals

```typescript
// POST /api/approvals/:docId/approve
{
  "remarks": "Sudah sesuai"
}

// POST /api/approvals/:docId/reject
{
  "reason": "Format tidak sesuai template"
}
```

### Notifications

```typescript
// GET /api/notifications
{
  "data": [
    {
      "id": 1,
      "type": "NEW_DOCUMENT",
      "title": "Dokumen baru menunggu review",
      "isRead": false,
      "createdAt": "2026-01-12T10:00:00Z"
    }
  ],
  "unreadCount": 3
}

// PUT /api/notifications/:id/read
// PUT /api/notifications/read-all
```

### Batch Reminder

```typescript
// POST /api/reminders/send-batch
{
  "targetUserId": 1  // Optional, default: atasan
}

// Response:
{
  "sent": true,
  "totalDocuments": 5,
  "sentTo": "direktur@unand.ac.id"
}
```

Lihat [design-system-part3.md](./design-system-part3.md) untuk API lengkap.

---

## Frontend Implementation

### Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── NotificationBell.tsx    ← In-app notifications
│   ├── documents/
│   │   ├── UploadForm.tsx
│   │   └── ApproverSelect.tsx      ← Multi-select approvers
│   └── approvals/
│       ├── ApprovalModal.tsx
│       └── RejectModal.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── DocumentsPage.tsx
│   └── ArchivePage.tsx
└── services/
    ├── api.ts
    └── notificationService.ts
```

### ApproverSelect Component

```tsx
// components/documents/ApproverSelect.tsx
import { useState, useEffect } from 'react';
import { Checkbox, FormGroup, FormControlLabel, Typography } from '@mui/material';

interface Approver {
  id: number;
  fullName: string;
  roleCode: string;
  hierarchyLevel: number;
}

export const ApproverSelect = ({ 
  selectedIds, 
  onChange 
}: { 
  selectedIds: number[], 
  onChange: (ids: number[]) => void 
}) => {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  
  useEffect(() => {
    // Fetch approvers from API
    fetch('/api/users/approvers')
      .then(res => res.json())
      .then(data => setApprovers(data));
  }, []);

  // Group by level
  const groupedByLevel = approvers.reduce((acc, a) => {
    const level = a.roleCode;
    if (!acc[level]) acc[level] = [];
    acc[level].push(a);
    return acc;
  }, {} as Record<string, Approver[]>);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Sort selected approvers by hierarchy
  const sortedSelected = selectedIds
    .map(id => approvers.find(a => a.id === id)!)
    .filter(Boolean)
    .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);

  return (
    <div>
      <Typography variant="h6">Pilih Approver</Typography>
      
      {['B', 'C', 'D'].map(level => (
        <FormGroup key={level}>
          <Typography variant="subtitle2">
            Level {level === 'B' ? 'Kasie' : level === 'C' ? 'Kasubdit' : 'Direktur'}
          </Typography>
          {groupedByLevel[level]?.map(approver => (
            <FormControlLabel
              key={approver.id}
              control={
                <Checkbox
                  checked={selectedIds.includes(approver.id)}
                  onChange={() => handleToggle(approver.id)}
                />
              }
              label={approver.fullName}
            />
          ))}
        </FormGroup>
      ))}

      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Urutan Approval:
      </Typography>
      <ol>
        {sortedSelected.map((a, i) => (
          <li key={a.id}>{a.fullName}</li>
        ))}
      </ol>
    </div>
  );
};
```

### NotificationBell Component

```tsx
// components/common/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Poll every 30 seconds
    const fetchNotifications = () => {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setNotifications(data.data);
          setUnreadCount(data.unreadCount);
        });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <List sx={{ width: 320 }}>
          {notifications.map((n: any) => (
            <ListItem key={n.id} sx={{ opacity: n.isRead ? 0.6 : 1 }}>
              {n.title}
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};
```

---

## Key Services

### HierarchyService

```typescript
// services/HierarchyService.ts
export class HierarchyService {
  /**
   * Sort user IDs by hierarchy level (ascending)
   */
  async sortApproversByHierarchy(userIds: number[]): Promise<number[]> {
    const users = await User.findAll({
      where: { id: userIds },
      include: [{ model: Role, as: 'role' }]
    });

    return users
      .sort((a, b) => a.role.hierarchyLevel - b.role.hierarchyLevel)
      .map(u => u.id);
  }

  /**
   * Get all users that can approve for given uploader
   */
  async getApproversAboveUser(userId: number): Promise<User[]> {
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    });

    return User.findAll({
      include: [{
        model: Role,
        as: 'role',
        where: {
          hierarchyLevel: { [Op.gt]: user.role.hierarchyLevel }
        }
      }]
    });
  }
}
```

### NotificationService (In-App Only)

```typescript
// services/NotificationService.ts
export class NotificationService {
  async create(data: {
    recipientUserId: number;
    documentId?: number;
    type: NotificationType;
    title: string;
    message?: string;
  }) {
    return Notification.create({
      ...data,
      isRead: false
    });
  }

  async notifyNewDocument(documentId: number, approverId: number) {
    const doc = await DocumentApproval.findByPk(documentId);
    
    await this.create({
      recipientUserId: approverId,
      documentId,
      type: 'NEW_DOCUMENT',
      title: 'Dokumen baru menunggu review Anda',
      message: `Dokumen "${doc.documentName}" menunggu approval`
    });
  }

  // NO EMAIL - all in-app only
}
```

### EmailReminderService (Batch Only)

```typescript
// services/EmailReminderService.ts
export class EmailReminderService {
  async sendBatchReminder(targetUserId?: number, sentByUserId?: number) {
    // Get pending documents grouped by approver
    const pendingDocs = await DocumentApproval.findAll({
      where: { 
        approvalStatus: ['DIAJUKAN', 'DIBUKA', 'DIPERIKSA'] 
      }
    });

    // Generate summary
    const summary = pendingDocs.map(d => ({
      name: d.documentName,
      daysPending: this.getDaysPending(d.createdAt)
    }));

    // Send single email with summary
    await this.sendEmail({
      to: targetUser.email,
      subject: `[SIMOMOU] Reminder: ${pendingDocs.length} Dokumen Menunggu`,
      html: this.generateEmailTemplate(summary)
    });

    // Log
    await EmailReminderLog.create({
      sentToUserId: targetUserId,
      sentByUserId,
      reminderType: sentByUserId ? 'MANUAL' : 'AUTO',
      totalDocuments: pendingDocs.length,
      documentIds: pendingDocs.map(d => d.id)
    });
  }
}
```

---

## Testing

### Run Tests

```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run test:coverage  # Coverage report
```

### Example Test

```typescript
// tests/services/ApprovalService.test.ts
describe('ApprovalService', () => {
  it('should sort approvers by hierarchy', async () => {
    const approverIds = [3, 1, 2]; // Mixed order
    const sorted = await approvalService.sortApproversByHierarchy(approverIds);
    
    // Should be sorted: Staff(1) -> Kasie(2) -> Kasubdit(3) 
    expect(sorted).toEqual([1, 2, 3]);
  });

  it('should create in-app notification on approval', async () => {
    await approvalService.approve(docId, approverId, 'OK');
    
    const notifications = await Notification.findAll({
      where: { documentId: docId }
    });
    
    expect(notifications.length).toBeGreaterThan(0);
  });
});
```

---

## Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: simomou
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: simomou
    ports:
      - "3000:3000"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ with nginx
```

---

## Dokumentasi Terkait

- [design-system-part1.md](./design-system-part1.md) - Use Case, BPMN, ERD
- [design-system-part2.md](./design-system-part2.md) - Database Schema
- [design-system-part3.md](./design-system-part3.md) - OOP, API
- [design-system-part4.md](./design-system-part4.md) - Folder Structure

---

**Version:** 2.0
**Last Updated:** January 12, 2026
