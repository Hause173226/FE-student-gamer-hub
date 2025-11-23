-- Tạo data mẫu cho Communities (bảng communities trống)
-- Chạy file này trong MySQL để có communities

-- 1. Tạo Communities
INSERT INTO communities (id, name, description, school, is_public, members_count, created_at_utc) VALUES
(1, 'FPT Gaming Community', 'Cộng đồng game thủ FPT University - Nơi kết nối các game thủ FPT', 'FPT University', true, 1247, NOW()),
(2, 'HCMUT Gaming Hub', 'Gaming hub cho sinh viên HCMUT - Tổ chức các giải đấu và sự kiện gaming', 'HCMUT', true, 856, NOW()),
(3, 'UEH Esports', 'Esports community UEH - Cộng đồng thể thao điện tử UEH', 'UEH', true, 423, NOW()),
(4, 'VNU Gaming', 'Gaming community VNU - Cộng đồng game thủ VNU', 'VNU', true, 234, NOW());

-- Hiển thị kết quả
SELECT 'Communities created:' as info, COUNT(*) as count FROM communities;
