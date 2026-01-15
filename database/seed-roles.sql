-- =============================================
-- Seed Roles for DKSHR
-- =============================================

INSERT INTO roles (role_name, role_code, description, hierarchy_level, department) VALUES
('Admin', 'Z', 'Administrator Sistem', 0, NULL),
('Staff', 'A', 'Team/Staff/PHL/PTT/PT/CS/Sekretariat/Equity', 1, NULL),
('Kepala Seksi', 'B', 'Kasie Penjajakan/Alumni/Hilirisasi', 2, NULL),
('Kepala Subdit', 'C', 'Kasubdit Kerja Sama/Hilirisasi', 3, NULL),
('Direktur', 'D', 'Direktur DKSHR', 4, NULL);
