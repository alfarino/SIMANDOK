# SIMOMOU - Desain Sistem Part 3
## OOP Class Design & API Endpoints

---

## 7. OOP CLASS DESIGN (TypeScript)

### 7.1 Entity Classes

```typescript
// entities/User.ts
export class User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: number;
    team: string | null;
    phone: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    
    // Relations
    role?: Role;
    documentsUploaded?: DocumentApproval[];
    notifications?: Notification[];
}

// entities/Role.ts
export class Role {
    id: number;
    roleName: string;
    roleCode: 'A' | 'B' | 'C' | 'D';
    description: string;
    hierarchyLevel: number;
    department: string | null;
    createdAt: Date;
    
    // Relations
    users?: User[];
    hierarchy?: RoleHierarchy;
}

// entities/RoleHierarchy.ts
export class RoleHierarchy {
    id: number;
    roleId: number;
    parentRoleId: number | null;
    canApproveFor: number[];
    createdAt: Date;
    
    // Relations
    role?: Role;
    parentRole?: Role;
}

// entities/DocumentApproval.ts
export class DocumentApproval {
    id: number;
    documentName: string;
    documentDescription: string | null;
    uploadedByUserId: number;
    onedriveFileId: string | null;
    onedriveLink: string | null;
    approvalStatus: ApprovalStatus;
    currentApproverId: number | null;
    currentSequence: number;
    totalApprovers: number;
    rejectionReason: string | null;
    rejectionByUserId: number | null;
    rejectionCount: number;
    isArchived: boolean;
    archivedAt: Date | null;
    archivedByUserId: number | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    
    // Relations
    uploadedBy?: User;
    currentApprover?: User;
    approvers?: DocumentApprover[];
    history?: ApprovalHistory[];
}

// entities/DocumentApprover.ts
export class DocumentApprover {
    id: number;
    documentId: number;
    approverUserId: number;
    sequenceOrder: number;
    status: ApproverStatus;
    approvedAt: Date | null;
    remarks: string | null;
    createdAt: Date;
    
    // Relations
    document?: DocumentApproval;
    approver?: User;
}

// entities/Notification.ts
export class Notification {
    id: number;
    recipientUserId: number;
    documentId: number | null;
    notificationType: NotificationType;
    title: string;
    message: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    
    // Relations
    recipient?: User;
    document?: DocumentApproval;
}

// entities/ApprovalHistory.ts
export class ApprovalHistory {
    id: number;
    documentId: number;
    actionByUserId: number;
    actionType: ActionType;
    fromStatus: string | null;
    toStatus: string | null;
    remarks: string | null;
    createdAt: Date;
    
    // Relations
    document?: DocumentApproval;
    actionBy?: User;
}

// entities/AuditLog.ts
export class AuditLog {
    id: number;
    userId: number | null;
    action: string;
    resourceType: string;
    resourceId: number | null;
    oldValue: object | null;
    newValue: object | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

// entities/EmailReminderLog.ts
export class EmailReminderLog {
    id: number;
    sentToUserId: number;
    sentByUserId: number | null;
    reminderType: 'MANUAL' | 'AUTO';
    totalDocuments: number;
    documentIds: number[];
    emailSubject: string;
    emailSentAt: Date;
    createdAt: Date;
}
```

### 7.2 Enums

```typescript
// types/enums.ts
export enum ApprovalStatus {
    DRAFT = 'DRAFT',
    DIAJUKAN = 'DIAJUKAN',
    DIBUKA = 'DIBUKA',
    DIPERIKSA = 'DIPERIKSA',
    DISETUJUI = 'DISETUJUI',
    DITOLAK = 'DITOLAK',
    SIAP_CETAK = 'SIAP_CETAK',
    ARCHIVED = 'ARCHIVED'
}

export enum ApproverStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SKIPPED = 'SKIPPED'
}

export enum NotificationType {
    NEW_DOCUMENT = 'NEW_DOCUMENT',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    READY_TO_PRINT = 'READY_TO_PRINT',
    REMINDER = 'REMINDER'
}

export enum ActionType {
    CREATED = 'CREATED',
    SUBMITTED = 'SUBMITTED',
    OPENED = 'OPENED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REVISED = 'REVISED',
    ARCHIVED = 'ARCHIVED',
    RESTORED = 'RESTORED'
}
```

### 7.3 Service Classes

```typescript
// services/AuthService.ts
export class AuthService {
    async register(data: RegisterDTO): Promise<AuthResponse>;
    async login(email: string, password: string): Promise<AuthResponse>;
    async logout(userId: number): Promise<void>;
    async refreshToken(refreshToken: string): Promise<AuthResponse>;
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void>;
    private generateToken(user: User): string;
    private hashPassword(password: string): Promise<string>;
    private verifyPassword(password: string, hash: string): Promise<boolean>;
}

// services/DocumentService.ts
export class DocumentService {
    async create(data: CreateDocumentDTO, userId: number): Promise<DocumentApproval>;
    async upload(documentId: number, file: File): Promise<DocumentApproval>;
    async findById(id: number): Promise<DocumentApproval>;
    async findByUser(userId: number, filters: DocumentFilters): Promise<PaginatedResult<DocumentApproval>>;
    async findPendingForApprover(approverId: number): Promise<DocumentApproval[]>;
    async getHistory(documentId: number): Promise<ApprovalHistory[]>;
    async update(id: number, data: UpdateDocumentDTO): Promise<DocumentApproval>;
    async archive(id: number, userId: number): Promise<void>;
    async restore(id: number, userId: number): Promise<void>;
}

// services/ApprovalService.ts
export class ApprovalService {
    async setApprovers(documentId: number, approverIds: number[]): Promise<DocumentApprover[]>;
    async sortApproversByHierarchy(approverIds: number[]): Promise<number[]>;
    async approve(documentId: number, approverId: number, remarks?: string): Promise<DocumentApproval>;
    async reject(documentId: number, approverId: number, reason: string): Promise<DocumentApproval>;
    async getNextApprover(documentId: number): Promise<User | null>;
    async isCurrentApprover(documentId: number, userId: number): Promise<boolean>;
    private moveToNextApprover(documentId: number): Promise<void>;
    private resetToUploader(documentId: number): Promise<void>;
}

// services/NotificationService.ts
export class NotificationService {
    async create(data: CreateNotificationDTO): Promise<Notification>;
    async getUnreadByUser(userId: number): Promise<Notification[]>;
    async getUnreadCount(userId: number): Promise<number>;
    async markAsRead(notificationId: number, userId: number): Promise<void>;
    async markAllAsRead(userId: number): Promise<void>;
    async notifyNewDocument(documentId: number, approverId: number): Promise<void>;
    async notifyApproved(documentId: number, uploaderId: number): Promise<void>;
    async notifyRejected(documentId: number, uploaderId: number, reason: string): Promise<void>;
    async notifyReadyToPrint(documentId: number, uploaderId: number): Promise<void>;
}

// services/EmailReminderService.ts
export class EmailReminderService {
    async sendBatchReminder(sentByUserId?: number): Promise<EmailReminderLog[]>;
    async sendManualReminder(approverIds: number[], sentByUserId: number): Promise<EmailReminderLog>;
    async getPendingDocumentsSummary(): Promise<PendingDocsSummary[]>;
    private generateEmailContent(summary: PendingDocsSummary): string;
    private sendEmail(to: string, subject: string, content: string): Promise<void>;
}

// services/HierarchyService.ts
export class HierarchyService {
    async getApproversAboveUser(userId: number): Promise<User[]>;
    async getSupervisor(userId: number): Promise<User | null>;
    async sortUsersByHierarchy(userIds: number[]): Promise<number[]>;
    async canApprove(approverId: number, uploaderId: number): Promise<boolean>;
    async getHierarchyLevel(userId: number): Promise<number>;
}

// services/ArchiveService.ts
export class ArchiveService {
    async getArchivedDocuments(filters: ArchiveFilters): Promise<PaginatedResult<DocumentApproval>>;
    async getAuditTrail(documentId: number): Promise<AuditLog[]>;
    async archiveDocument(documentId: number, userId: number, reason?: string): Promise<void>;
    async restoreDocument(documentId: number, userId: number): Promise<void>;
    async exportAuditReport(documentId: number): Promise<Buffer>;
}

// services/AuditService.ts
export class AuditService {
    async log(data: AuditLogDTO): Promise<AuditLog>;
    async getByResource(resourceType: string, resourceId: number): Promise<AuditLog[]>;
    async getByUser(userId: number, filters: AuditFilters): Promise<PaginatedResult<AuditLog>>;
}
```

---

## 8. API ENDPOINTS

### 8.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login dan dapatkan token |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |
| PUT | `/api/auth/password` | Change password |

### 8.2 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (admin) |
| GET | `/api/users/approvers` | List users yang bisa jadi approver |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### 8.3 Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List dokumen user |
| POST | `/api/documents` | Create dokumen baru |
| GET | `/api/documents/:id` | Get dokumen detail |
| PUT | `/api/documents/:id` | Update dokumen |
| DELETE | `/api/documents/:id` | Delete dokumen (draft only) |
| POST | `/api/documents/:id/upload` | Upload file ke OneDrive |
| POST | `/api/documents/:id/submit` | Submit untuk approval |
| GET | `/api/documents/:id/history` | Get approval history |

### 8.4 Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approvals/pending` | List dokumen pending untuk user |
| POST | `/api/approvals/:docId/approve` | Approve dokumen |
| POST | `/api/approvals/:docId/reject` | Reject dokumen |
| GET | `/api/approvals/:docId/approvers` | Get list approvers dokumen |
| PUT | `/api/approvals/:docId/approvers` | Update approvers (draft only) |

### 8.5 Notifications (In-App)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifikasi user |
| GET | `/api/notifications/unread-count` | Count unread |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### 8.6 Email Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminders/send-batch` | Send batch reminder email |
| GET | `/api/reminders/pending-summary` | Get pending docs summary |
| GET | `/api/reminders/logs` | Get reminder history |

### 8.7 Archive

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/archive` | List dokumen terarsip |
| GET | `/api/archive/:id` | Get archived document detail |
| GET | `/api/archive/:id/audit` | Get full audit trail |
| POST | `/api/archive/:id/restore` | Restore dokumen |
| GET | `/api/archive/:id/export` | Export audit report |

### 8.8 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard summary |
| GET | `/api/dashboard/pending` | Get pending documents |
| GET | `/api/dashboard/recent` | Get recent activities |

---

*Lanjutan di design-system-part4.md*
