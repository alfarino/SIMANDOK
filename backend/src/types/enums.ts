// Approval Status
export enum ApprovalStatus {
    DRAFT = 'DRAFT',
    DIAJUKAN = 'DIAJUKAN',
    DIBUKA = 'DIBUKA',
    DIPERIKSA = 'DIPERIKSA',
    DISETUJUI = 'DISETUJUI',
    DITOLAK = 'DITOLAK',
    SIAP_CETAK = 'SIAP_CETAK',
    SUDAH_DICETAK = 'SUDAH_DICETAK',
    ARCHIVED = 'ARCHIVED'
}

// Approver Status
export enum ApproverStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SKIPPED = 'SKIPPED'
}

// Notification Type
export enum NotificationType {
    NEW_DOCUMENT = 'NEW_DOCUMENT',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    READY_TO_PRINT = 'READY_TO_PRINT',
    REMINDER = 'REMINDER'
}

// Action Type (for audit trail)
export enum ActionType {
    CREATED = 'CREATED',
    SUBMITTED = 'SUBMITTED',
    OPENED = 'OPENED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REVISED = 'REVISED',
    RESUBMITTED = 'RESUBMITTED',
    PRINTED = 'PRINTED',
    ARCHIVED = 'ARCHIVED',
    RESTORED = 'RESTORED'
}

// Role codes
export enum RoleCode {
    A = 'A', // Staff
    B = 'B', // Kepala Seksi
    C = 'C', // Kepala Subdit
    D = 'D'  // Direktur
}

// Role hierarchy levels
export const HIERARCHY_LEVELS = {
    A: 1, // Staff
    B: 2, // Kepala Seksi
    C: 3, // Kepala Subdit
    D: 4  // Direktur
};
