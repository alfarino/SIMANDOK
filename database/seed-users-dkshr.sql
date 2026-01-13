-- =============================================
-- Seed Users DKSHR
-- Password: password123 (hashed with bcrypt)
-- =============================================

-- Default password hash for 'password123' (bcryptjs with 10 rounds)
SET @default_hash = '$2a$10$PgiLAQWb3BKfpNBhUhbPG.keEHKvU8WdJYgVGyaxNUgg8aXXQxjW96';

-- Direktur (D) - Level 4
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('mmakky', 'mmakky@unand.ac.id', @default_hash, 'Dr. Eng Muhammad Makky, STP., M.Si', 4, NULL);

-- Kepala Subdit (C) - Level 3
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('arpentius', 'arpentius@unand.ac.id', @default_hash, 'Arpentius, ST., MM', 3, 'Kerja Sama'),
('kyulianto', 'kyulianto@unand.ac.id', @default_hash, 'Dr. Kiki Yulianto, STP, MP', 3, 'Hilirisasi');

-- Kepala Seksi (B) - Level 2
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('frengki', 'frengki@unand.ac.id', @default_hash, 'Frengki, ST., MM', 2, 'Kerja Sama'),
('ronisaputra', 'ronisaputra@unand.ac.id', @default_hash, 'Roni Saputra, ST', 2, 'Alumni'),
('ririsari', 'ririsari@unand.ac.id', @default_hash, 'Riri Sari Hamdani, SE', 2, 'Hilirisasi');

-- Staff (A) - Level 1 - Team Kerja Sama
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('dikiputra', 'dikiputra@unand.ac.id', @default_hash, 'Diki Putra, S.T', 1, 'Kerja Sama'),
('irhamgunadi', 'irhamgunadi@unand.ac.id', @default_hash, 'Irham Gunadi, S.T', 1, 'Kerja Sama'),
('mzuhri', 'mzuhri@unand.ac.id', @default_hash, 'M Zuhri, SE', 1, 'Kerja Sama');

-- Staff (A) - Level 1 - Team Alumni
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('jusriani', 'jusriani@unand.ac.id', @default_hash, 'Jusriani, SH', 1, 'Alumni'),
('fachrurrozi', 'fachrurrozi@unand.ac.id', @default_hash, 'Fachrur Rozi, M.TP', 1, 'Alumni');

-- Staff (A) - Level 1 - Team Hilirisasi
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('ardillah', 'ardillah@unand.ac.id', @default_hash, 'Ardillah Anggraini Sirtin, S.TP', 1, 'Hilirisasi'),
('rekapermata', 'rekapermata@unand.ac.id', @default_hash, 'Reka Permata Zalen, S.TP', 1, 'Hilirisasi'),
('riofernanda', 'riofernanda@unand.ac.id', @default_hash, 'Rio Fernanda Pane, Amd.T', 1, 'Hilirisasi'),
('fitrarahma', 'fitrarahma@unand.ac.id', @default_hash, 'Fitra Rahma Winata, S.TP', 1, 'Hilirisasi'),
('antonimardoni', 'antonimardoni@unand.ac.id', @default_hash, 'Antoni Mardoni', 1, 'Hilirisasi'),
('vevisuswita', 'vevisuswita@unand.ac.id', @default_hash, 'Vevi Suswita', 1, 'Hilirisasi');

-- Staff (A) - Level 1 - Sekretariat
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('fifindwi', 'fifindwi@unand.ac.id', @default_hash, 'Fifin Dwi Rizki Emdi, S.Ak', 1, 'Sekretariat'),
('sitiaisyah', 'sitiaisyah@unand.ac.id', @default_hash, 'Siti Aisyah, S.T', 1, 'Sekretariat');

-- Staff (A) - Level 1 - Support
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('bunet', 'bunet@unand.ac.id', @default_hash, 'Bu Net', 1, 'Support'),
('diego', 'diego@unand.ac.id', @default_hash, 'Diego Three Afanny', 1, 'Support');

-- Staff (A) - Level 1 - Team EQUITY
INSERT INTO users (username, email, password_hash, full_name, role_id, team) VALUES
('mitahandayani', 'mitahandayani@unand.ac.id', @default_hash, 'Mita Handayani, S.Hum', 1, 'EQUITY'),
('rafif', 'rafif@unand.ac.id', @default_hash, 'Rafif, S.Hum', 1, 'EQUITY'),
('monicaguspa', 'monicaguspa@unand.ac.id', @default_hash, 'Monica Guspa, M.T', 1, 'EQUITY'),
('vriskananda', 'vriskananda@unand.ac.id', @default_hash, 'Vriska Nanda Lutfiana, S.TP', 1, 'EQUITY'),
('juliarif', 'juliarif@unand.ac.id', @default_hash, 'Juli Arifiansyah Sinambela, M.T', 1, 'EQUITY'),
('nabilahdina', 'nabilahdina@unand.ac.id', @default_hash, 'Nabilah Dina Humaidah, S.Psi', 1, 'EQUITY'),
('suaidahrahmi', 'suaidahrahmi@unand.ac.id', @default_hash, 'Suaidah Rahmi, M.T', 1, 'EQUITY');
