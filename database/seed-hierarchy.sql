-- =============================================
-- Seed Hierarchy for DKSHR
-- A -> B -> C -> D
-- =============================================

INSERT INTO role_hierarchy (role_id, parent_role_id, can_approve_for) VALUES
(1, 2, NULL),           -- Staff -> Kasie
(2, 3, '[1]'),          -- Kasie -> Kasubdit, can approve Staff
(3, 4, '[1,2]'),        -- Kasubdit -> Direktur, can approve Staff & Kasie
(4, NULL, '[1,2,3]');   -- Direktur -> Top, can approve all
