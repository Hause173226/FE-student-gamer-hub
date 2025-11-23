# 🎮 HƯỚNG DẪN SỬ DỤNG - STUDENT GAMER HUB

## ✅ **ĐÃ XÓA HẾT MOCK DATA - CHỈ SỬ DỤNG API THẬT**

### 🚀 **CÁCH CHẠY PROJECT**

#### **Bước 1: Chạy Backend (PlatformGame-be)**
```bash
# 1. Đảm bảo MySQL đang chạy
# Database: exe201, Username: root, Password: 12345

# 2. Đảm bảo Redis đang chạy
redis-server

# 3. Chạy backend
cd PlatformGame-be
mvn spring-boot:run
# Backend: http://localhost:8080
```

#### **Bước 2: Tạo dữ liệu mẫu (QUAN TRỌNG!)**
```sql
-- Chạy file seed-data.sql trong MySQL để có data test
-- Hoặc copy nội dung từ file seed-data.sql và chạy trong MySQL
```

#### **Bước 3: Chạy Frontend**
```bash
npm run dev
# Frontend: http://localhost:5173 (hoặc port khác nếu bận)
```

---

## 🎯 **FLOW SỬ DỤNG HOÀN CHỈNH**

### **1. Mở trang web**
- URL: `http://localhost:5173` (hoặc port khác)
- Đăng nhập (nếu cần)

### **2. Vào Communities**
- Click **"Communities"** ở sidebar
- Sẽ thấy danh sách cộng đồng từ database:
  - 🎓 **FPT Gaming Community** (1247 thành viên)
  - 🎓 **HCMUT Gaming Hub** (856 thành viên)
  - 🎓 **UEH Esports** (423 thành viên)
  - 🎓 **VNU Gaming** (234 thành viên)

### **3. Chọn Community**
- Click vào **"FPT Gaming Community"**
- URL: `/communities/1`
- Sẽ thấy danh sách **Clubs**:
  - 🎮 **FPT Valorant Club** (234 thành viên)
  - 🎮 **FPT League of Legends** (456 thành viên)
  - 🎮 **FPT Mobile Legends** (189 thành viên)
  - 🎮 **FPT CS:GO Club** (123 thành viên)

### **4. Chọn Club**
- Click vào **"FPT Valorant Club"**
- URL: `/clubs/1`
- Sẽ thấy danh sách **Rooms**:
  - 💬 **general-chat** (45 online)
  - 💬 **ranked-team** (12 online)
  - 💬 **tournament** (23 online)
  - 💬 **voice-chat** (8 online)

### **5. Vào Chat**
- Click vào **"general-chat"**
- URL: `/rooms/1`
- Giao diện chat Discord-like:
  - **Header**: Tên phòng, trạng thái kết nối
  - **Messages**: Lịch sử chat (nếu có)
  - **Input**: Ô nhập tin nhắn
  - **Sidebar**: Danh sách thành viên online

### **6. Chat Real-time**
- Gõ tin nhắn vào ô input
- Click **Send** hoặc nhấn **Enter**
- Tin nhắn hiện ngay lập tức
- Mở tab mới, vào cùng room → Tin nhắn đồng bộ!

---

## 🔧 **TÍNH NĂNG ĐÃ IMPLEMENT**

### ✅ **Communities Page**
- **API Integration**: Gọi `GET /api/community`
- **Search**: Tìm kiếm theo tên, trường, mô tả
- **Filter**: Lọc theo trường, số thành viên, quyền riêng tư
- **Responsive**: Mobile-friendly
- **Loading states**: Spinner khi load data
- **Error handling**: Toast notifications

### ✅ **CommunityDetail Page**
- **API Integration**: Gọi `GET /api/clubs/public` + filter client-side
- **Navigation**: Breadcrumb navigation
- **Club cards**: Hiển thị clubs với gradient backgrounds
- **Member count**: Số thành viên real-time
- **Privacy indicators**: Public/Private icons

### ✅ **ClubDetail Page**
- **API Integration**: Gọi `GET /api/rooms` + filter client-side
- **Room cards**: Hiển thị rooms với icons
- **Online indicators**: Số người online
- **Capacity info**: Thông tin capacity
- **Quick stats**: Tổng phòng, online, capacity

### ✅ **RoomChat Page**
- **API Integration**: 
  - `GET /api/rooms/:id` (room info)
  - `GET /api/rooms/:id/messages` (message history)
- **WebSocket**: Real-time chat với `ws://localhost:8080/ws/chat`
- **Message history**: Load lịch sử chat
- **Real-time messaging**: Send/receive messages
- **UI Features**:
  - Discord-like interface
  - Message timestamps
  - User avatars
  - Online indicators
  - Voice controls (mute/deafen)
  - Members sidebar

---

## 🚨 **TROUBLESHOOTING**

### **❌ Không thấy Communities:**
```bash
# Check backend
node test-backend.cjs

# Nếu database trống, chạy seed-data.sql trong MySQL
```

### **❌ Không chat được:**
```bash
# Check WebSocket connection trong console
# Phải thấy: "✅ WebSocket Connected to room: 1"
```

### **❌ Lỗi CORS:**
```bash
# Backend cần cấu hình CORS
# Hoặc dùng browser khác
```

---

## 📊 **API ENDPOINTS SỬ DỤNG**

| Màn hình | API Call | Mô tả |
|----------|----------|-------|
| Communities | `GET /api/community` | Lấy tất cả communities |
| CommunityDetail | `GET /api/clubs/public` | Lấy tất cả clubs rồi filter |
| ClubDetail | `GET /api/rooms` | Lấy tất cả rooms rồi filter |
| RoomChat | `GET /api/rooms/:id` | Lấy thông tin room |
| RoomChat | `GET /api/rooms/:id/messages` | Lấy lịch sử chat |
| RoomChat | WebSocket `/ws/chat` | Real-time messaging |

---

## 🎨 **UI FEATURES**

### ✅ **Design System**
- **Gradient backgrounds**: Blue, purple, emerald, orange
- **Card hover effects**: Scale, border color changes
- **Loading states**: Spinner animations
- **Empty states**: Icons + messages
- **Responsive**: Mobile-first design
- **Dark theme**: Gray-900 background

### ✅ **Navigation**
- **Breadcrumb**: Communities → Community → Club → Room
- **Back buttons**: Quay lại từng bước
- **URL routing**: React Router với params
- **Sidebar**: Navigation menu

### ✅ **Interactive Elements**
- **Search**: Real-time search
- **Filter**: Modal với options
- **Chat**: Real-time messaging
- **Voice controls**: Mute/deafen buttons
- **Member list**: Online members sidebar

---

## 🚀 **NEXT STEPS (Tương lai)**

1. ✅ **DONE**: Basic flow Community → Club → Room → Chat
2. ⏳ **TODO**: Thêm authentication riêng
3. ⏳ **TODO**: Thêm pagination
4. ⏳ **TODO**: Thêm search/filter clubs và rooms
5. ⏳ **TODO**: Thêm member management
6. ⏳ **TODO**: Thêm upload images trong chat
7. ⏳ **TODO**: Thêm voice channel (WebRTC)

---

## 📞 **SUPPORT**

Nếu gặp vấn đề:
1. Check console (F12) để xem lỗi
2. Check Network tab để xem API requests
3. Check backend logs trong terminal
4. Chạy `node test-backend.cjs` để test backend

**Happy Gaming! 🎮🚀**


