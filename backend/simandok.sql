-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 13 Jan 2026 pada 07.42
-- Versi server: 11.8.3-MariaDB-log
-- Versi PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `simandok`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `approval_history`
--

CREATE TABLE `approval_history` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `action_by_user_id` int(11) NOT NULL,
  `action_type` enum('CREATED','SUBMITTED','OPENED','APPROVED','REJECTED','REVISED','ARCHIVED','RESTORED') NOT NULL,
  `from_status` varchar(50) DEFAULT NULL,
  `to_status` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `document_approvals`
--

CREATE TABLE `document_approvals` (
  `id` int(11) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_description` text DEFAULT NULL,
  `uploaded_by_user_id` int(11) NOT NULL,
  `document_link` varchar(500) NOT NULL,
  `approval_status` enum('DRAFT','DIAJUKAN','DIBUKA','DIPERIKSA','DISETUJUI','DITOLAK','SIAP_CETAK','ARCHIVED') DEFAULT 'DRAFT',
  `current_approver_id` int(11) DEFAULT NULL,
  `current_sequence` int(11) DEFAULT 0,
  `total_approvers` int(11) DEFAULT 0,
  `rejection_reason` text DEFAULT NULL,
  `rejection_by_user_id` int(11) DEFAULT NULL,
  `rejection_count` int(11) DEFAULT 0,
  `is_archived` tinyint(1) DEFAULT 0,
  `archived_at` datetime DEFAULT NULL,
  `archived_by_user_id` int(11) DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `document_approvals`
--

INSERT INTO `document_approvals` (`id`, `document_name`, `document_description`, `uploaded_by_user_id`, `document_link`, `approval_status`, `current_approver_id`, `current_sequence`, `total_approvers`, `rejection_reason`, `rejection_by_user_id`, `rejection_count`, `is_archived`, `archived_at`, `archived_by_user_id`, `version`, `created_at`, `updated_at`) VALUES
(1, 'MOU 1', NULL, 2, 'https://docs.google.com/spreadsheets/d/1qyjXG1d55ajBGq9HVMIihV9HFuviuByNGTRmxz2ajwY/edit?gid=632919443#gid=632919443', 'DRAFT', NULL, 0, 0, NULL, NULL, 0, 0, NULL, NULL, 1, '2026-01-13 06:59:20', '2026-01-13 06:59:20'),
(2, 'MOU dengan PT B', 'Dokumen ini adgnaogaklsmf', 2, 'https://docs.google.com/spreadsheets/d/1qyjXG1d55ajBGq9HVMIihV9HFuviuByNGTRmxz2ajwY/edit?gid=632919443#gid=632919443', 'DRAFT', NULL, 0, 0, NULL, NULL, 0, 0, NULL, NULL, 1, '2026-01-13 07:05:49', '2026-01-13 07:05:49'),
(3, 'Dokumen Testing', NULL, 4, 'https://docs.google.com/spreadsheets/d/1qyjXG1d55ajBGq9HVMIihV9HFuviuByNGTRmxz2ajwY/edit?gid=632919443#gid=632919443', 'DRAFT', NULL, 0, 0, NULL, NULL, 0, 0, NULL, NULL, 1, '2026-01-13 07:10:01', '2026-01-13 07:10:01'),
(4, 'MOU ', 'lajfklasjklf', 2, 'http://localhost/phpmyadmin/index.php?route=/sql&db=simandok&table=document_approvers&pos=0', 'DRAFT', NULL, 0, 0, NULL, NULL, 0, 0, NULL, NULL, 1, '2026-01-13 07:31:56', '2026-01-13 07:31:56'),
(5, 'Testing', NULL, 2, 'https://docs.google.com/document/d/18Bygg1d7p9qW4Imk5wxdiopIaYhUZPVlzwdQBXKamqk/edit?tab=t.0', 'DRAFT', NULL, 0, 0, NULL, NULL, 0, 0, NULL, NULL, 1, '2026-01-13 07:41:09', '2026-01-13 07:41:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `document_approvers`
--

CREATE TABLE `document_approvers` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `approver_user_id` int(11) NOT NULL,
  `sequence_order` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','SKIPPED') DEFAULT 'PENDING',
  `approved_at` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_reminder_logs`
--

CREATE TABLE `email_reminder_logs` (
  `id` int(11) NOT NULL,
  `sent_to_user_id` int(11) NOT NULL,
  `sent_by_user_id` int(11) DEFAULT NULL,
  `reminder_type` enum('MANUAL','AUTO') NOT NULL,
  `total_documents` int(11) NOT NULL,
  `document_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`document_ids`)),
  `email_subject` varchar(255) DEFAULT NULL,
  `email_sent_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_user_id` int(11) NOT NULL,
  `document_id` int(11) DEFAULT NULL,
  `notification_type` enum('NEW_DOCUMENT','APPROVED','REJECTED','READY_TO_PRINT','REMINDER') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `role_code` char(1) NOT NULL,
  `description` text DEFAULT NULL,
  `hierarchy_level` int(11) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `role_code`, `description`, `hierarchy_level`, `department`, `created_at`, `updated_at`) VALUES
(1, 'Staff', 'A', 'Team/Staff/PHL/PTT/PT/CS/Sekretariat/Equity', 1, NULL, '2026-01-12 09:00:37', '2026-01-12 09:00:37'),
(2, 'Kepala Seksi', 'B', 'Kasie Penjajakan/Alumni/Hilirisasi', 2, NULL, '2026-01-12 09:00:37', '2026-01-12 09:00:37'),
(3, 'Kepala Subdit', 'C', 'Kasubdit Kerja Sama/Hilirisasi', 3, NULL, '2026-01-12 09:00:37', '2026-01-12 09:00:37'),
(4, 'Direktur', 'D', 'Direktur DKSHR', 4, NULL, '2026-01-12 09:00:37', '2026-01-12 09:00:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_hierarchy`
--

CREATE TABLE `role_hierarchy` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `parent_role_id` int(11) DEFAULT NULL,
  `can_approve_for` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`can_approve_for`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `role_hierarchy`
--

INSERT INTO `role_hierarchy` (`id`, `role_id`, `parent_role_id`, `can_approve_for`, `created_at`) VALUES
(1, 1, 2, NULL, '2026-01-12 09:00:51'),
(2, 2, 3, '[1]', '2026-01-12 09:00:51'),
(3, 3, 4, '[1,2]', '2026-01-12 09:00:51'),
(4, 4, NULL, '[1,2,3]', '2026-01-12 09:00:51');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `team` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role_id`, `team`, `phone`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@unand.ac.id', '$2a$10$ggkS4rvZIz75BSjj1IgEPeX8hRbErZ8lYIyD/NxYWpQjGa6IYhrFi', 'Administrator Sistem', 4, 'IT', NULL, 1, '2026-01-13 07:30:08', '2026-01-13 12:55:36', '2026-01-13 07:30:08'),
(2, 'svedrilioalfarino', 'svedrilioalfarino@gmail.com', '$2a$10$NMX2gIEaJ0rfo0PSGp4m7.B6cHsHgCKCze.DZ7OrjWta67PxiEPhe', 'Alfa Rino Svedrilio', 1, 'Kerja Sama', '087753440828', 1, '2026-01-13 07:40:43', '2026-01-13 06:52:50', '2026-01-13 07:40:43'),
(3, 'fajri', 'fajri@gmail.com', '$2a$10$yfTV/9jvwY77FamVOCqb3eN7RUP344clTgMs4bbkAlmvqbdMi73py', 'Muhammad Fajri', 2, 'Kerja Sama', '123456789', 1, '2026-01-13 07:41:41', '2026-01-13 06:55:43', '2026-01-13 07:41:41'),
(4, 'roni', 'roni@gmail.com', '$2a$10$JYDEFoGEY3OzEoOXk7vdter2MhCedy4u.LKiO2r1.YMTC9iY770zm', 'Roni Saputra', 3, 'Kerja Sama', '234589076', 1, '2026-01-13 07:40:23', '2026-01-13 06:56:14', '2026-01-13 07:40:23'),
(5, 'makky', 'makky@gmail.com', '$2a$10$KTNrBSQ4/DoLLXdGKdl6kuUZF4eZD.mknZe6YPtKBSlxlBtznqPju', 'Muhammad Makky', 4, 'Kerja Sama', '123456790', 1, NULL, '2026-01-13 06:56:41', '2026-01-13 06:56:41');

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `approval_history`
--
ALTER TABLE `approval_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_document` (`document_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `action_by_user_id` (`action_by_user_id`);

--
-- Indeks untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resource` (`resource_type`,`resource_id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`approval_status`),
  ADD KEY `idx_current_approver` (`current_approver_id`),
  ADD KEY `idx_uploaded_by` (`uploaded_by_user_id`),
  ADD KEY `idx_archived` (`is_archived`),
  ADD KEY `rejection_by_user_id` (`rejection_by_user_id`),
  ADD KEY `archived_by_user_id` (`archived_by_user_id`);

--
-- Indeks untuk tabel `document_approvers`
--
ALTER TABLE `document_approvers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_doc_approver` (`document_id`,`approver_user_id`),
  ADD KEY `idx_document_sequence` (`document_id`,`sequence_order`),
  ADD KEY `approver_user_id` (`approver_user_id`);

--
-- Indeks untuk tabel `email_reminder_logs`
--
ALTER TABLE `email_reminder_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sent_to` (`sent_to_user_id`),
  ADD KEY `idx_sent_at` (`email_sent_at`),
  ADD KEY `sent_by_user_id` (`sent_by_user_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_unread` (`recipient_user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `document_id` (`document_id`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD UNIQUE KEY `role_name_2` (`role_name`),
  ADD UNIQUE KEY `role_name_3` (`role_name`);

--
-- Indeks untuk tabel `role_hierarchy`
--
ALTER TABLE `role_hierarchy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role` (`role_id`),
  ADD KEY `parent_role_id` (`parent_role_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_team` (`team`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `approval_history`
--
ALTER TABLE `approval_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `document_approvals`
--
ALTER TABLE `document_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `document_approvers`
--
ALTER TABLE `document_approvers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `email_reminder_logs`
--
ALTER TABLE `email_reminder_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `role_hierarchy`
--
ALTER TABLE `role_hierarchy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `approval_history`
--
ALTER TABLE `approval_history`
  ADD CONSTRAINT `approval_history_ibfk_3` FOREIGN KEY (`document_id`) REFERENCES `document_approvals` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `approval_history_ibfk_4` FOREIGN KEY (`action_by_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD CONSTRAINT `document_approvals_ibfk_1` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `document_approvals_ibfk_2` FOREIGN KEY (`current_approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `document_approvals_ibfk_3` FOREIGN KEY (`rejection_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `document_approvals_ibfk_4` FOREIGN KEY (`archived_by_user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `document_approvers`
--
ALTER TABLE `document_approvers`
  ADD CONSTRAINT `document_approvers_ibfk_3` FOREIGN KEY (`document_id`) REFERENCES `document_approvals` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `document_approvers_ibfk_4` FOREIGN KEY (`approver_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `email_reminder_logs`
--
ALTER TABLE `email_reminder_logs`
  ADD CONSTRAINT `email_reminder_logs_ibfk_1` FOREIGN KEY (`sent_to_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `email_reminder_logs_ibfk_2` FOREIGN KEY (`sent_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`document_id`) REFERENCES `document_approvals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `role_hierarchy`
--
ALTER TABLE `role_hierarchy`
  ADD CONSTRAINT `role_hierarchy_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `role_hierarchy_ibfk_2` FOREIGN KEY (`parent_role_id`) REFERENCES `roles` (`id`);

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
