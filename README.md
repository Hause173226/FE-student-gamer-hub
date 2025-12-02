## Student Gamer Hub – Frontend

Student Gamer Hub là giao diện web cho nền tảng quản lý cộng đồng, câu lạc bộ và sự kiện dành cho sinh viên yêu game. Dự án được xây dựng bằng **React + TypeScript** trên nền **Vite**, dùng **Tailwind CSS** và tích hợp với backend .NET (thư mục `StudentGamerHub`).

### Công nghệ chính
- **React 18 + TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS** + custom animation (particle / header effects)
- **React Router** (định tuyến trang)
- **Axios** (gọi API, `axiosInstance.ts`)
- **react-hot-toast** (thông báo)

### Cài đặt & chạy dự án

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev
npm run dev

# 3. Build production
npm run build

# 4. Preview build
npm run preview
```

Mặc định Vite sẽ chạy ở `http://localhost:5173` (có thể khác nếu port đang bận).

### Cấu trúc thư mục chính
- `src/`
  - `pages/` – các trang như `Dashboard`, `Games`, `MyGames`, `Events`, `Communities`, `Friends`, `Profile`, `Login`, `Register`, v.v.
  - `components/` – component dùng chung: `Sidebar`, `MobileNav`, `AnimatedHeader`, `EventDetailModal`, `CreateEventModal`, `VideoCall`, v.v.
  - `services/` – gọi API: `eventService`, `clubService`, `communityService`, `friendService`, `platformGameService`, `userService`, `axiosInstance`.
  - `contexts/` – `AuthContext` quản lý trạng thái đăng nhập và token.
  - `hooks/` – hook realtime chat/call: `useWebSocket`, `useSimpleWebSocket`, `useChat` (nếu có).
  - `types/` – định nghĩa kiểu dữ liệu dùng xuyên suốt (events, clubs, communities, users,…).
  - `utils/` – hàm tiện ích (auth, format, v.v.).

### Biến môi trường
Frontend sử dụng base URL từ cấu hình Axios/Env để gọi backend (`API Base` hiển thị trong debug). Khi deploy, cấu hình:

- **API base URL**: trỏ về backend Student Gamer Hub (ví dụ: Render / Azure / VPS).
- Token JWT được lấy từ `AuthContext` và tự động gắn vào `Authorization` header qua `authAxiosInstance`.

Kiểm tra file:
- `src/services/axiosInstance.ts`
để chỉnh lại URL cho môi trường mới nếu cần.

### Tính năng chính hiện tại
- Đăng ký / đăng nhập, quản lý hồ sơ cơ bản.
- Dashboard với header animated (particle).
- Quản lý **Events**: xem chi tiết, đăng ký tham gia, ràng buộc tham gia **Club** trước với event online, hiển thị trạng thái `Đã đăng ký`, số người tham gia, host, giá, v.v.
- Quản lý **Clubs / Communities**: tìm kiếm, phân trang, tạo cộng đồng, xem chi tiết club.
- Trang **Games / My Games / Quests / Membership** với header hoạt hình theo chủ đề.
- Hệ thống chat realtime (SignalR) cho room / club (tích hợp với backend `.NET`).

### Quy ước code ngắn gọn
- **TypeScript first**: luôn định nghĩa kiểu ở `types/` hoặc trong service.
- **Service tách riêng**: mọi gọi API đi qua `services/*.ts`.
- **UI**: ưu tiên component nhỏ, dùng Tailwind class, tránh inline style.
- **Không commit mã debug / panel nội bộ** vào production (đã loại bỏ `DebugInfo`, `ChatDebug`, banner trạng thái kết nối khỏi UI chính).

### Đóng góp & phát triển tiếp
- Khi thêm tính năng mới, ưu tiên:
  - Tạo service riêng cho API.
  - Thêm kiểu dữ liệu tương ứng ở `types/`.
  - Tách UI thành component riêng trong `components/` nếu dùng lại ở nhiều nơi.
- Nếu làm việc cùng backend trong thư mục `StudentGamerHub`, nên đọc thêm các file:
  - `README_API.md`, `API_Documentation.md`, `IMPLEMENTATION_SUMMARY.md`, `MIGRATION_PLAN.md`.

---

Nếu bạn là reviewer trên GitHub: xem nhanh các trang chính trong `src/pages/` và các service trong `src/services/` sẽ giúp hiểu rõ kiến trúc tổng thể của frontend này.


