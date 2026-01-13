-- =============================================
-- Seed Admin User
-- Password: admin123 (hashed with bcryptjs)
-- =============================================

INSERT INTO users (username, email, password_hash, full_name, role_id, team, is_active, created_at, updated_at) 
VALUES (
    'admin', 
    'admin@unand.ac.id', 
    '$2a$10$ggkS4rvZIz75BSjj1IgEPeX8hRbErZ8lYIyD/NxYWpQjGa6IYhrFi', 
    'Administrator Sistem', 
    4, 
    'IT', 
    1,
    NOW(),
    NOW()
);
