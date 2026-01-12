# SIMOMOU - Desain Sistem Part 2
## Database Design, OOP Structure, Folder Structure

---

## 6. DATABASE DESIGN (SQL)

### 6.1 Tabel Roles

```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_code CHAR(1) NOT NULL,  -- A, B, C, D
    description TEXT,
    hierarchy_level INT NOT NULL, -- 1=Staff, 2=Kasie, 3=Kasubdit, 4=Direktur
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert DKSHR Roles
INSERT INTO roles (role_name, role_code, description, hierarchy_level, department) VALUES
('Staff', 'A', 'Team/Staff/PHL/PTT/PT/CS/Sekretariat/Equity', 1, NULL),
('Kepala Seksi', 'B', 'Kasie Penjajakan/Alumni/Hilirisasi', 2, NULL),
('Kepala Subdit', 'C', 'Kasubdit Kerja Sama/Hilirisasi', 3, NULL),
('Direktur', 'D', 'Direktur DKSHR', 4, NULL);
```

### 6.2 Tabel Users

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    team VARCHAR(100), -- Team Kerja Sama, Team Alumni, dll
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_role (role_id),
    INDEX idx_team (team)
);

-- Sample Users DKSHR
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
-- Direktur (D)
('mmakky', 'mmakky@unand.ac.id', '$hash', 'Dr. Eng Muhammad Makky, STP., M.Si', 4, NULL),
-- Kasubdit (C)
('arpentius', 'arpentius@unand.ac.id', '$hash', 'Arpentius, ST., MM', 3, 'Kerja Sama'),
('kyulianto', 'kyulianto@unand.ac.id', '$hash', 'Dr. Kiki Yulianto, STP, MP', 3, 'Hilirisasi'),
-- Kasie (B)
('frengki', 'frengki@unand.ac.id', '$hash', 'Frengki, ST., MM', 2, 'Kerja Sama'),
('ronisaputra', 'ronisaputra@unand.ac.id', '$hash', 'Roni Saputra, ST', 2, 'Alumni'),
('ririsari', 'ririsari@unand.ac.id', '$hash', 'Riri Sari Hamdani, SE', 2, 'Hilirisasi'),
-- Staff (A) - sample
('dikiputra', 'dikiputra@unand.ac.id', '$hash', 'Diki Putra, S.T', 1, 'Kerja Sama'),
('irhamgunadi', 'irhamgunadi@unand.ac.id', '$hash', 'Irham Gunadi, S.T', 1, 'Kerja Sama');
```

### 6.3 Tabel Role Hierarchy

```sql
CREATE TABLE role_hierarchy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    parent_role_id INT,
    can_approve_for JSON, -- Array of role_ids this role can approve
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (parent_role_id) REFERENCES roles(id),
    UNIQUE KEY unique_role (role_id)
);

-- Hierarchy: A->B->C->D
INSERT INTO role_hierarchy (role_id, parent_role_id, can_approve_for) VALUES
(1, 2, NULL),           -- Staff -> Kasie
(2, 3, '[1]'),          -- Kasie -> Kasubdit, can approve Staff
(3, 4, '[1,2]'),        -- Kasubdit -> Direktur, can approve Staff & Kasie
(4, NULL, '[1,2,3]');   -- Direktur -> Top, can approve all
```

### 6.4 Tabel Document Approvals

```sql
CREATE TABLE document_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_name VARCHAR(255) NOT NULL,
    document_description TEXT,
    uploaded_by_user_id INT NOT NULL,
    onedrive_file_id VARCHAR(255),
    onedrive_link VARCHAR(500),
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
```

### 6.5 Tabel Document Approvers

```sql
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
```

### 6.6 Tabel Notifications (In-App)

```sql
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
```

### 6.7 Tabel Email Reminder Log

```sql
CREATE TABLE email_reminder_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sent_to_user_id INT NOT NULL,
    sent_by_user_id INT, -- NULL jika auto/cron
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
```

### 6.8 Tabel Approval History

```sql
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
```

### 6.9 Tabel Audit Log

```sql
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
```

---

*Lanjutan di design-system-part3.md*
