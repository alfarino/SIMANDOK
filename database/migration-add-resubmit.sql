-- =============================================
-- SIMANDOK Migration: Add RESUBMITTED, PRINTED, SUDAH_DICETAK
-- Run this on existing database to update enum values
-- =============================================

USE simandok;

-- 1. Update document_approvals.approval_status enum to include SUDAH_DICETAK
ALTER TABLE document_approvals 
MODIFY COLUMN approval_status ENUM(
    'DRAFT',
    'DIAJUKAN',
    'DIBUKA',
    'DIPERIKSA',
    'DISETUJUI',
    'DITOLAK',
    'SIAP_CETAK',
    'SUDAH_DICETAK',
    'ARCHIVED'
) DEFAULT 'DRAFT';

-- 2. Add viewed_at column to document_approvers if not exists
ALTER TABLE document_approvers ADD COLUMN IF NOT EXISTS viewed_at DATETIME AFTER status;

-- 3. Add printed fields to document_approvals if not exist
ALTER TABLE document_approvals ADD COLUMN IF NOT EXISTS printed_at DATETIME AFTER archived_by_user_id;
ALTER TABLE document_approvals ADD COLUMN IF NOT EXISTS printed_by_user_id INT AFTER printed_at;

-- 4. Update approval_history.action_type enum to include RESUBMITTED and PRINTED
ALTER TABLE approval_history 
MODIFY COLUMN action_type ENUM(
    'CREATED',
    'SUBMITTED',
    'OPENED',
    'APPROVED',
    'REJECTED',
    'REVISED',
    'RESUBMITTED',
    'PRINTED',
    'ARCHIVED',
    'RESTORED'
) NOT NULL;

SELECT 'Migration completed successfully!' AS status;
