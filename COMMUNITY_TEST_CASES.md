# 🧪 TEST CASES - COMMUNITY SYSTEM

## 📋 Tổng quan
Test cases cho các tính năng Community System đã được implement.

---

## ✅ TEST CASE 1: Discover Communities (Public)

### Mục đích
Test endpoint `/api/Communities/discover` - Public endpoint, không cần auth

### Steps:
1. **Mở trang Communities** (`/communities`)
2. **Kiểm tra tab "Khám phá"** được chọn mặc định
3. **Kiểm tra danh sách communities hiển thị**
4. **Kiểm tra pagination controls** (nếu có nhiều hơn 20 communities)

### Expected Results:
- ✅ Danh sách communities hiển thị (không cần đăng nhập)
- ✅ Mỗi community card hiển thị: avatar, tên, mô tả, số thành viên, category
- ✅ Pagination hiển thị đúng (Trang X / Y, nút Trước/Sau)
- ✅ Loading state hiển thị khi đang tải

### Test Data:
- Không cần đăng nhập
- Endpoint: `GET /api/Communities/discover?offset=0&limit=20&orderBy=trending`

---

## ✅ TEST CASE 2: Search Communities

### Mục đích
Test tính năng search với debounce 500ms

### Steps:
1. **Mở trang Communities**
2. **Nhập từ khóa vào search box** (VD: "gaming", "FPT")
3. **Chờ 500ms** (debounce)
4. **Kiểm tra kết quả search**

### Expected Results:
- ✅ Kết quả search được filter theo từ khóa
- ✅ Debounce hoạt động (không gọi API ngay khi gõ)
- ✅ Hiển thị "Không tìm thấy" nếu không có kết quả
- ✅ Reset về danh sách đầy đủ khi xóa search

### Test Data:
- Search terms: "gaming", "FPT", "education", "không tồn tại"

---

## ✅ TEST CASE 3: Order By (Trending/Newest)

### Mục đích
Test sắp xếp communities theo trending hoặc newest

### Steps:
1. **Mở trang Communities**
2. **Chọn "Sắp xếp: Phổ biến"** (trending)
3. **Kiểm tra danh sách sắp xếp theo số thành viên giảm dần**
4. **Chọn "Sắp xếp: Mới nhất"** (newest)
5. **Kiểm tra danh sách sắp xếp theo ngày tạo mới nhất**

### Expected Results:
- ✅ Dropdown "Sắp xếp" hiển thị đúng
- ✅ Khi chọn "Phổ biến": communities có nhiều members nhất ở đầu
- ✅ Khi chọn "Mới nhất": communities mới tạo ở đầu
- ✅ Danh sách được reload khi thay đổi orderBy

### Test Data:
- OrderBy: "trending" (default), "newest"

---

## ✅ TEST CASE 4: Pagination

### Mục đích
Test pagination với offset-based

### Steps:
1. **Mở trang Communities**
2. **Scroll xuống cuối danh sách**
3. **Click nút "Sau"** (Next)
4. **Kiểm tra trang tiếp theo hiển thị**
5. **Click nút "Trước"** (Previous)
6. **Kiểm tra quay lại trang trước**

### Expected Results:
- ✅ Nút "Trước" disabled ở trang đầu tiên
- ✅ Nút "Sau" disabled ở trang cuối cùng
- ✅ Hiển thị đúng "Trang X / Y"
- ✅ Hiển thị đúng "Hiển thị Z / TotalCount cộng đồng"
- ✅ Danh sách được reload khi chuyển trang

### Test Data:
- Page size: 20 (default)
- Total communities: > 20 để test pagination

---

## ✅ TEST CASE 5: View Community Detail

### Mục đích
Test xem chi tiết community

### Steps:
1. **Mở trang Communities**
2. **Click vào một community card**
3. **Kiểm tra redirect đến `/communities/{id}`**
4. **Kiểm tra thông tin community hiển thị**

### Expected Results:
- ✅ Redirect đúng đến community detail page
- ✅ Hiển thị đầy đủ thông tin: tên, mô tả, số thành viên, category
- ✅ Hiển thị avatar và color gradient
- ✅ Hiển thị nút "Quay lại Cộng đồng"
- ✅ Loading state khi đang tải

### Test Data:
- Community ID hợp lệ từ API

---

## ✅ TEST CASE 6: Join Community

### Mục đích
Test tham gia community (idempotent)

### Steps:
1. **Mở Community Detail** (chưa tham gia)
2. **Kiểm tra nút "Tham gia cộng đồng" hiển thị**
3. **Click nút "Tham gia cộng đồng"**
4. **Kiểm tra loading state**
5. **Kiểm tra sau khi join thành công**
6. **Click lại nút "Tham gia"** (test idempotent)

### Expected Results:
- ✅ Nút "Tham gia cộng đồng" hiển thị khi chưa join
- ✅ Loading state hiển thị khi đang join
- ✅ Toast success: "Đã tham gia cộng đồng thành công!"
- ✅ Nút chuyển thành "Đã tham gia" (màu xanh)
- ✅ Recent members được reload
- ✅ Click lại không bị lỗi (idempotent)
- ✅ Members count tăng lên

### Test Data:
- User chưa tham gia community
- User đã tham gia community (test idempotent)

### Error Cases:
- ❌ 401 Unauthorized → Toast: "Vui lòng đăng nhập để tham gia cộng đồng"
- ❌ 404 Not Found → Toast: "Không tìm thấy cộng đồng"
- ❌ 409 Conflict → Toast: "Bạn đã là thành viên của cộng đồng này"

---

## ✅ TEST CASE 7: View Recent Members

### Mục đích
Test hiển thị recent members (5 người mới nhất)

### Steps:
1. **Mở Community Detail**
2. **Scroll xuống phần "Thành viên mới tham gia"**
3. **Kiểm tra danh sách 5 members mới nhất**
4. **Kiểm tra avatar, tên, role**

### Expected Results:
- ✅ Section "Thành viên mới tham gia" hiển thị
- ✅ Hiển thị tối đa 5 members
- ✅ Mỗi member hiển thị: avatar (chữ cái đầu), tên, role (nếu là Owner)
- ✅ Avatar có gradient màu đẹp
- ✅ Nút "Xem tất cả" / "Ẩn" hoạt động

### Test Data:
- Community có ít nhất 1 member
- Community có > 5 members (test limit)

---

## ✅ TEST CASE 8: View All Members

### Mục đích
Test xem danh sách tất cả members

### Steps:
1. **Mở Community Detail**
2. **Click nút "Xem tất cả"** trong Recent Members section
3. **Kiểm tra section "Tất cả thành viên" hiển thị**
4. **Kiểm tra danh sách members**
5. **Kiểm tra pagination** (nếu có > 50 members)

### Expected Results:
- ✅ Section "Tất cả thành viên" hiển thị
- ✅ Hiển thị đúng số lượng members
- ✅ Mỗi member hiển thị: avatar, tên, role (Owner/Moderator/Member)
- ✅ Loading state khi đang tải
- ✅ Empty state nếu không có members
- ✅ Nút "Ẩn" để đóng section

### Test Data:
- Community có members
- Community không có members (empty state)

---

## ✅ TEST CASE 9: Remove Member (Owner Only)

### Mục đích
Test xóa member khỏi community (chỉ Owner mới được)

### Steps:
1. **Đăng nhập với tài khoản Owner của community**
2. **Mở Community Detail**
3. **Click "Xem tất cả" để xem members**
4. **Tìm một member không phải Owner**
5. **Click nút X (UserX icon) bên cạnh member**
6. **Confirm trong dialog**
7. **Kiểm tra member bị xóa**

### Expected Results:
- ✅ Nút X chỉ hiển thị cho Owner
- ✅ Nút X không hiển thị cho Owner và chính user hiện tại
- ✅ Confirm dialog hiển thị: "Bạn có chắc chắn muốn xóa thành viên này khỏi cộng đồng?"
- ✅ Toast success: "Đã xóa thành viên khỏi cộng đồng"
- ✅ Member bị xóa khỏi danh sách
- ✅ Members count giảm đi 1
- ✅ Recent members được reload

### Test Data:
- User là Owner của community
- User là Member (không thấy nút X)
- Member để xóa không phải Owner

### Error Cases:
- ❌ 403 Forbidden → Toast: "Chỉ chủ sở hữu mới có thể xóa thành viên"
- ❌ 404 Not Found → Toast: "Không tìm thấy thành viên hoặc cộng đồng"

---

## ✅ TEST CASE 10: Create Community

### Mục đích
Test tạo community mới

### Steps:
1. **Mở trang Communities**
2. **Click nút "Tạo cộng đồng"**
3. **Điền form:**
   - Tên: "Test Community"
   - Mô tả: "Mô tả test"
   - Danh mục: "Gaming"
4. **Click "Tạo cộng đồng"**
5. **Kiểm tra community mới được tạo**

### Expected Results:
- ✅ Modal "Tạo cộng đồng mới" hiển thị
- ✅ Form validation hoạt động (tên bắt buộc)
- ✅ Toast success: "Tạo cộng đồng thành công!"
- ✅ Community mới xuất hiện trong danh sách
- ✅ User tự động trở thành Owner
- ✅ Modal đóng sau khi tạo thành công

### Test Data:
- Tên: "Test Community", "FPT Gaming Hub"
- Mô tả: Optional
- Danh mục: Gaming, Education, Sports, Music, Technology

### Error Cases:
- ❌ Tên trống → Toast: "Vui lòng điền đầy đủ thông tin"
- ❌ 401 Unauthorized → Toast: "Vui lòng đăng nhập"

---

## ✅ TEST CASE 11: Filter Communities (UI)

### Mục đích
Test bộ lọc communities (UI only - backend filters chưa implement)

### Steps:
1. **Mở trang Communities**
2. **Click nút "Bộ lọc"**
3. **Chọn danh mục: "Gaming"**
4. **Chọn số thành viên: "101 - 500 thành viên"**
5. **Click "Áp dụng"**
6. **Kiểm tra kết quả** (hiện tại chỉ là UI, chưa filter thực sự)

### Expected Results:
- ✅ Modal "Bộ lọc" hiển thị
- ✅ Các options hiển thị đúng
- ✅ Nút "Xóa bộ lọc" hoạt động
- ✅ Nút "Áp dụng" đóng modal

### Note:
- ⚠️ Backend filters (school, gameId, isPublic, membersFrom, membersTo) chưa được implement trong UI
- ⚠️ Chỉ có UI mockup

---

## ✅ TEST CASE 12: Popular Tab

### Mục đích
Test tab "Phổ biến"

### Steps:
1. **Mở trang Communities**
2. **Click tab "Phổ biến"**
3. **Kiểm tra danh sách communities**

### Expected Results:
- ✅ Tab "Phổ biến" được highlight
- ✅ Hiển thị top 6 communities có nhiều members nhất
- ✅ Có badge "Popular" trên mỗi card
- ✅ Sắp xếp theo membersCount DESC

### Test Data:
- Communities có membersCount khác nhau

---

## ✅ TEST CASE 13: Responsive Design

### Mục đích
Test responsive trên mobile/tablet

### Steps:
1. **Mở trang Communities trên desktop**
2. **Resize browser xuống mobile size (< 768px)**
3. **Kiểm tra layout điều chỉnh**
4. **Test trên mobile device thật**

### Expected Results:
- ✅ Grid layout: 1 cột trên mobile, 2 cột trên tablet, 3 cột trên desktop
- ✅ Search và buttons stack vertically trên mobile
- ✅ Pagination controls responsive
- ✅ Community cards không bị overflow

---

## ✅ TEST CASE 14: Error Handling

### Mục đích
Test xử lý lỗi khi API fail

### Steps:
1. **Disconnect internet**
2. **Mở trang Communities**
3. **Thử các actions: join, view detail, search**

### Expected Results:
- ✅ Loading state hiển thị
- ✅ Error toast hiển thị với message rõ ràng
- ✅ UI không bị crash
- ✅ Có thể retry sau khi reconnect

### Error Messages:
- Network error → "Không thể tải danh sách cộng đồng. Vui lòng kiểm tra kết nối và đăng nhập lại."
- 401 → "Vui lòng đăng nhập"
- 404 → "Không tìm thấy cộng đồng"
- 500 → "Lỗi server. Vui lòng thử lại sau."

---

## 📊 TEST SUMMARY

### ✅ Pass Criteria:
- Tất cả test cases trên đều pass
- Không có console errors
- UI/UX mượt mà, không lag
- Error handling đầy đủ

### 🔧 Test Environment:
- **Frontend**: `http://localhost:5173`
- **Backend**: `https://student-gamer-hub.onrender.com`
- **Browser**: Chrome, Firefox, Safari
- **Devices**: Desktop, Tablet, Mobile

### 📝 Notes:
- Test với cả authenticated và unauthenticated users
- Test với communities có nhiều members và ít members
- Test với communities public và private
- Test rate limiting (nếu có)

---

## 🐛 KNOWN ISSUES / TODO:
- [ ] Backend filters (school, gameId, membersFrom, membersTo) chưa được implement trong UI
- [ ] Cursor pagination cho search endpoint chưa được implement
- [ ] Community settings page chưa có
- [ ] Leave community feature chưa có
- [ ] Update community feature chưa có UI

---

**Last Updated**: 2025-01-24
**Tested By**: [Your Name]
**Status**: ✅ Ready for Testing

