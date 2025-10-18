# 🚀 Hướng Dẫn Chạy Project - PlatformGame Integration

## 📋 Tổng Quan

Đã tích hợp **Frontend (React)** với **PlatformGame-be (Java Spring Boot)** để có:
- ✅ Danh sách Communities (cộng đồng)
- ✅ Danh sách Clubs trong mỗi Community
- ✅ Danh sách Rooms trong mỗi Club
- ✅ Real-time Chat WebSocket trong Room

## 🔧 Yêu Cầu Hệ Thống

### Backend (PlatformGame-be)
- **Java 17**
- **MySQL** (port 3306, database: `exe201`)
- **Redis** (port 6379)
- **Maven**

### Frontend
- **Node.js 18+** (đang dùng 18.20.8 - khuyến nghị nâng lên 20+)
- **npm 10+**

---

## 🏃 CÁCH CHẠY

### **Bước 1: Chạy Backend (PlatformGame-be)**

```bash
# 1. Đảm bảo MySQL đang chạy
# Database: exe201
# Username: root
# Password: 12345

# 2. Đảm bảo Redis đang chạy
redis-server
# Hoặc trên Windows: 
# Tải Redis từ https://github.com/microsoftarchive/redis/releases
# Chạy redis-server.exe

# 3. Di chuyển vào folder backend
cd PlatformGame-be

# 4. Build và chạy
mvn clean install
mvn spring-boot:run

# Backend sẽ chạy trên: http://localhost:8080
```

**✅ Kiểm tra Backend:**
```bash
# Test API
curl http://localhost:8080/api/community
# Nếu trả về danh sách communities -> OK!
```

---

### **Bước 2: Chạy Frontend**

```bash
# 1. Cài dependencies (nếu chưa cài)
npm install

# 2. Chạy development server
npm run dev

# Frontend sẽ chạy trên: http://localhost:5173
```

**✅ Kiểm tra Frontend:**
- Mở browser: `http://localhost:5173`
- Login (nếu cần)
- Click "Communities" → Phải thấy danh sách cộng đồng từ database

---

## 📊 FLOW HOẠT ĐỘNG

### **1. User Flow**

```
Login → Dashboard 
  ↓
Communities (GET /api/community)
  ↓
Chọn 1 Community → CommunityDetail (filter clubs by communityId)
  ↓
Chọn 1 Club → ClubDetail (filter rooms by clubId)
  ↓
Chọn 1 Room → RoomChat 
  ↓
Connect WebSocket (ws://localhost:8080/ws/chat)
  ↓
Load message history (GET /rooms/{id}/messages)
  ↓
Send/Receive messages real-time
```

### **2. API Calls**

| Màn hình | API Call | Backend Endpoint |
|----------|----------|------------------|
| Communities | `GET /api/community` | Lấy tất cả communities |
| CommunityDetail | `GET /api/clubs/public` | Lấy tất cả clubs rồi filter client-side |
| ClubDetail | `GET /api/rooms` | Lấy tất cả rooms rồi filter client-side |
| RoomChat | `GET /api/rooms/{id}` | Lấy thông tin room |
| RoomChat | `GET /api/rooms/{id}/messages` | Lấy lịch sử chat |
| RoomChat | WebSocket `/ws/chat` | Real-time messaging |

---

## 🧪 TESTING

### **Test 1: Load Communities**
1. Mở `http://localhost:5173/communities`
2. Kiểm tra console: `✅ Loaded communities: [...]`
3. Phải thấy danh sách communities từ database

### **Test 2: Navigate to Clubs**
1. Click vào 1 community
2. URL chuyển thành: `/communities/1` (hoặc ID khác)
3. Phải thấy danh sách clubs thuộc community đó

### **Test 3: Navigate to Rooms**
1. Click vào 1 club
2. URL chuyển thành: `/clubs/1`
3. Phải thấy danh sách rooms thuộc club đó

### **Test 4: Chat Real-time**
1. Click vào 1 room
2. URL chuyển thành: `/rooms/1`
3. Kiểm tra console:
   - `✅ WebSocket Connected to room: 1`
   - `✅ Loaded messages: [...]`
4. Gõ tin nhắn → Click Send
5. Tin nhắn hiện ngay lập tức
6. Mở tab mới, vào cùng room → Phải thấy tin nhắn đồng bộ

---

## 🐛 TROUBLESHOOTING

### **Lỗi: Cannot connect to MySQL**
```
Solution:
1. Check MySQL service đang chạy
2. Database 'exe201' đã tồn tại chưa
3. Username/password đúng chưa (root/12345)
```

### **Lỗi: WebSocket connection failed**
```
Solution:
1. Check backend đang chạy (port 8080)
2. Check Redis đang chạy (port 6379)
3. Check console: Có lỗi CORS không?
```

### **Lỗi: Communities không load**
```
Solution:
1. Mở DevTools → Network tab
2. Check request đến http://localhost:8080/api/community
3. Status code: 
   - 401 Unauthorized → Sai Basic Auth credentials
   - 404 Not Found → Backend chưa chạy
   - 200 OK nhưng empty array → Database chưa có data
```

### **Lỗi: Message không gửi được**
```
Solution:
1. Check console: Connected = true?
2. Check Redis đang chạy
3. Check WebSocket URL đúng chưa: ws://localhost:8080/ws/chat
```

---

## 📝 SEED DATA (Nếu database trống)

### **Tạo data mẫu qua SQL:**

```sql
-- Tạo Communities
INSERT INTO communities (id, name, description, school, is_public, members_count, created_at_utc) VALUES
(1, 'FPT Gaming Community', 'Cộng đồng game thủ FPT University', 'FPT University', true, 1247, NOW()),
(2, 'HCMUT Gaming Hub', 'Gaming hub cho sinh viên HCMUT', 'HCMUT', true, 856, NOW()),
(3, 'UEH Esports', 'Esports community UEH', 'UEH', true, 423, NOW());

-- Tạo Clubs
INSERT INTO clubs (id, community_id, name, description, is_public, members_count, created_at_utc) VALUES
(1, 1, 'FPT Valorant Club', 'Club chơi Valorant của FPT', true, 234, NOW()),
(2, 1, 'FPT LOL Club', 'Club chơi League of Legends', true, 456, NOW()),
(3, 2, 'HCMUT Dota 2', 'Club Dota 2 HCMUT', true, 123, NOW());

-- Tạo Rooms
INSERT INTO rooms (id, club_id, name, description, join_policy, capacity, members_count, created_at_utc) VALUES
(1, 1, 'general-chat', 'Phòng chat chung Valorant', 'Open', 100, 45, NOW()),
(2, 1, 'ranked-team', 'Tìm team rank', 'Open', 50, 12, NOW()),
(3, 2, 'lol-general', 'Chat chung LOL', 'Open', 100, 67, NOW());
```

---

## 🎨 UI PREVIEW

### **Communities Page**
```
┌─────────────────────────────────────┐
│ 🎓 Cộng đồng sinh viên             │
├─────────────────────────────────────┤
│ [Search] [Filter] [Tạo cộng đồng]  │
├─────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐          │
│ │ FPT      │ │ HCMUT    │          │
│ │ Gaming   │ │ Gaming   │          │
│ │ 1247 👥  │ │ 856 👥   │          │
│ └──────────┘ └──────────┘          │
└─────────────────────────────────────┘
```

### **RoomChat Page**
```
┌─────────────────────────────────────┐
│ ← #general-chat     Connected 🟢    │
├─────────────────────────────────────┤
│                                     │
│ [TuanAnh] 14:30                    │
│ Ai đi rank không?                   │
│                                     │
│ [ThuyLinh] 14:32                   │
│ Mình vào nha!                       │
│                                     │
├─────────────────────────────────────┤
│ [📎] [🖼️] [Input...] [😊] [Send] │
└─────────────────────────────────────┘
```

---

## 📚 FILE STRUCTURE MỚI

```
src/
├── services/
│   └── platformGameService.ts       # API calls to PlatformGame-be
├── hooks/
│   └── useWebSocket.ts              # WebSocket chat hook
├── pages/
│   ├── Communities.tsx              # Updated với API
│   ├── CommunityDetail.tsx          # NEW - Show clubs
│   ├── ClubDetail.tsx               # NEW - Show rooms  
│   └── RoomChat.tsx                 # NEW - Chat UI
├── types/
│   └── sockjs-client.d.ts           # TypeScript declarations
└── routes/
    └── AuthenticatedRoutes.tsx      # Updated routes
```

---

## ⚙️ CONFIGURATION

### **API Base URL** (platformGameService.ts)
```typescript
const PLATFORM_GAME_API = 'http://localhost:8080/api';
```

### **Basic Auth Credentials**
```typescript
Username: admin
Password: 123456
```

### **WebSocket URL** (useWebSocket.ts)
```typescript
ws://localhost:8080/ws/chat
```

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **Backend PHẢI chạy trước Frontend**
2. **MySQL và Redis phải đang chạy**
3. **Database phải có data** (seed data nếu cần)
4. **Không tắt backend** khi đang test chat real-time
5. **WebSocket chỉ hoạt động khi cả frontend và backend cùng chạy**

---

## 🎯 NEXT STEPS (Tương lai)

1. ✅ DONE: Basic flow Community → Club → Room → Chat
2. ⏳ TODO: Thêm authentication riêng (hiện dùng Basic Auth)
3. ⏳ TODO: Thêm pagination (hiện load toàn bộ data)
4. ⏳ TODO: Thêm search/filter clubs và rooms
5. ⏳ TODO: Thêm member management
6. ⏳ TODO: Thêm upload images trong chat
7. ⏳ TODO: Thêm voice channel (WebRTC)

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check console (F12) để xem lỗi
2. Check Network tab để xem API requests
3. Check backend logs trong terminal

**Happy Coding! 🎮🚀**


