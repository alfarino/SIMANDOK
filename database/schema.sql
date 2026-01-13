-- =============================================
-- SIMANDOK Database Schema
-- Generated from design-system-part2.md
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS simandok;
USE simandok;

-- =============================================
-- 1. Roles Table
-- =============================================
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_code CHAR(1) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 2. Users Table
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    team VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_role (role_id),
    INDEX idx_team (team)
);

-- =============================================
-- 3. Role Hierarchy Table
-- =============================================
CREATE TABLE role_hierarchy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    parent_role_id INT,
    can_approve_for JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (parent_role_id) REFERENCES roles(id),
    UNIQUE KEY unique_role (role_id)
);

-- =============================================
-- 4. Document Approvals Table
-- =============================================
CREATE TABLE document_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_name VARCHAR(255) NOT NULL,
    document_description TEXT,
    uploaded_by_user_id INT NOT NULL,
    document_link VARCHAR(500) NOT NULL,  -- Link ke draft dokumen (Google Docs, OneDrive, dll)
    approval_status ENUM(
        'DRAFT',
        'DIAJUKAN',
        'DIBUKA',
        'DIPERIKSA',
        'DISETUJUI',
        'DITOLAK',
        'SIAP_CETAK',
        'ARCHIVED'
    ) DEFAULT 'DRAFT',
    current_approver_id INT,
    current_sequence INT DEFAULT 0,
    total_approvers INT DEFAULT 0,
    rejection_reason TEXT,
    rejection_by_user_id INT,
    rejection_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at DATETIME,
    archived_by_user_id INT,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
    FOREIGN KEY (current_approver_id) REFERENCES users(id),
    FOREIGN KEY (rejection_by_user_id) REFERENCES users(id),
    FOREIGN KEY (archived_by_user_id) REFERENCES users(id),
    INDEX idx_status (approval_status),
    INDEX idx_current_approver (current_approver_id),
    INDEX idx_uploaded_by (uploaded_by_user_id),
    INDEX idx_archived (is_archived)
);

-- =============================================
-- 5. Document Approvers Table
-- =============================================
CREATE TABLE document_approvers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    approver_user_id INT NOT NULL,
    sequence_order INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED') DEFAULT 'PENDING',
    approved_at DATETIME,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES document_approvals(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_user_id) REFERENCES users(id),
    UNIQUE KEY unique_doc_approver (document_id, approver_user_id),
    INDEX idx_document_sequence (document_id, sequence_order)
);

-- =============================================
-- 6. Notifications Table (In-App Only)
-- =============================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_user_id INT NOT NULL,
    document_id INT,
    notification_type ENUM(
        'NEW_DOCUMENT',
        'APPROVED',
        'REJECTED',
        'READY_TO_PRINT',
        'REMINDER'
    ) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES document_approvals(id),
    INDEX idx_recipient_unread (recipient_user_id, is_read),
    INDEX idx_created (created_at)
);

-- =============================================
-- 7. Email Reminder Logs Table
-- =============================================
CREATE TABLE email_reminder_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sent_to_user_id INT NOT NULL,
    sent_by_user_id INT,
    reminder_type ENUM('MANUAL', 'AUTO') NOT NULL,
    total_documents INT NOT NULL,
    document_ids JSON,
    email_subject VARCHAR(255),
    email_sent_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_to_user_id) REFERENCES users(id),
    FOREIGN KEY (sent_by_user_id) REFERENCES users(id),
    INDEX idx_sent_to (sent_to_user_id),
    INDEX idx_sent_at (email_sent_at)
);

-- =============================================
-- 8. Approval History Table
-- =============================================
CREATE TABLE approval_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    action_by_user_id INT NOT NULL,
    action_type ENUM(
        'CREATED',
        'SUBMITTED',
        'OPENED',
        'APPROVED',
        'REJECTED',
        'REVISED',
        'ARCHIVED',
        'RESTORED'
    ) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES document_approvals(id),
    FOREIGN KEY (action_by_user_id) REFERENCES users(id),
    INDEX idx_document (document_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- 9. Audit Logs Table
-- =============================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);
