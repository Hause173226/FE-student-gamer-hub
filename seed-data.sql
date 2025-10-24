-- Tạo dữ liệu mẫu cho PlatformGame-be
-- Chạy file này trong MySQL để có data test

-- 1. Tạo Communities (Cộng đồng)
INSERT INTO communities (id, name, description, school, is_public, members_count, created_at_utc) VALUES
(1, 'FPT Gaming Community', 'Cộng đồng game thủ FPT University - Nơi kết nối các game thủ FPT', 'FPT University', true, 1247, NOW()),
(2, 'HCMUT Gaming Hub', 'Gaming hub cho sinh viên HCMUT - Tổ chức các giải đấu và sự kiện gaming', 'HCMUT', true, 856, NOW()),
(3, 'UEH Esports', 'Esports community UEH - Cộng đồng thể thao điện tử UEH', 'UEH', true, 423, NOW()),
(4, 'VNU Gaming', 'Gaming community VNU - Cộng đồng game thủ VNU', 'VNU', true, 234, NOW());

-- 2. Tạo Clubs (Câu lạc bộ trong mỗi Community)
INSERT INTO clubs (id, community_id, name, description, is_public, members_count, created_at_utc) VALUES
-- FPT Gaming Community clubs
(1, 1, 'FPT Valorant Club', 'Club chơi Valorant của FPT - Tổ chức các giải đấu Valorant', true, 234, NOW()),
(2, 1, 'FPT League of Legends', 'Club chơi League of Legends FPT', true, 456, NOW()),
(3, 1, 'FPT Mobile Legends', 'Club Mobile Legends FPT', true, 189, NOW()),
(4, 1, 'FPT CS:GO Club', 'Club Counter-Strike FPT', true, 123, NOW()),

-- HCMUT Gaming Hub clubs
(5, 2, 'HCMUT Dota 2', 'Club Dota 2 HCMUT - Tổ chức các giải đấu Dota 2', true, 123, NOW()),
(6, 2, 'HCMUT PUBG', 'Club PUBG HCMUT', true, 89, NOW()),
(7, 2, 'HCMUT FIFA', 'Club FIFA HCMUT', true, 67, NOW()),

-- UEH Esports clubs
(8, 3, 'UEH Valorant', 'Club Valorant UEH', true, 145, NOW()),
(9, 3, 'UEH Free Fire', 'Club Free Fire UEH', true, 98, NOW());

-- 3. Tạo Rooms (Phòng chat trong mỗi Club)
INSERT INTO rooms (id, club_id, name, description, join_policy, capacity, members_count, created_at_utc) VALUES
-- FPT Valorant Club rooms
(1, 1, 'general-chat', 'Phòng chat chung Valorant - Nơi thảo luận về game', 'Open', 100, 45, NOW()),
(2, 1, 'ranked-team', 'Tìm team rank - Tìm đồng đội chơi rank', 'Open', 50, 12, NOW()),
(3, 1, 'tournament', 'Giải đấu - Thông tin về các giải đấu', 'Open', 200, 23, NOW()),
(4, 1, 'voice-chat', 'Voice chat - Phòng voice chat', 'Open', 20, 8, NOW()),

-- FPT League of Legends rooms
(5, 2, 'lol-general', 'Chat chung LOL - Thảo luận về League of Legends', 'Open', 100, 67, NOW()),
(6, 2, 'ranked-5v5', 'Ranked 5v5 - Tìm team 5v5', 'Open', 50, 15, NOW()),
(7, 2, 'aram', 'ARAM - Chơi ARAM cùng nhau', 'Open', 30, 9, NOW()),

-- HCMUT Dota 2 rooms
(8, 5, 'dota-general', 'Chat chung Dota 2', 'Open', 80, 34, NOW()),
(9, 5, 'ranked-party', 'Ranked Party - Tìm party rank', 'Open', 40, 11, NOW()),

-- UEH Valorant rooms
(10, 8, 'valorant-general', 'Chat chung Valorant UEH', 'Open', 60, 28, NOW()),
(11, 8, 'scrims', 'Scrims - Tổ chức scrims', 'Open', 20, 6, NOW());

-- 4. Tạo một số tin nhắn mẫu (nếu cần)
-- INSERT INTO chat_messages (id, room_id, user_id, username, message, timestamp) VALUES
-- (1, 1, 1, 'Admin', 'Chào mừng đến với FPT Valorant Club!', NOW()),
-- (2, 1, 2, 'Player1', 'Ai đi rank không?', NOW()),
-- (3, 1, 3, 'Player2', 'Mình vào nha!', NOW());

-- Hiển thị kết quả
SELECT 'Communities created:' as info, COUNT(*) as count FROM communities;
SELECT 'Clubs created:' as info, COUNT(*) as count FROM clubs;
SELECT 'Rooms created:' as info, COUNT(*) as count FROM rooms;
