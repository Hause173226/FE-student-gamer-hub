// DEBUG - Tại sao SignalR không tự động kết nối?

console.log("=== ��� DEBUG SIGNALR AUTO-CONNECT ===\n");

// 1. Check localStorage
console.log("��� 1. LocalStorage:");
const token = localStorage.getItem("token");
const isAuth = localStorage.getItem("isAuthenticated");
console.log("   - token:", token ? `✅ CÓ (${token.length} chars)` : "❌ KHÔNG");
console.log("   - isAuthenticated:", isAuth);

// 2. Check signalRService
console.log("\n��� 2. SignalRService:");
if (typeof signalRService !== 'undefined') {
  console.log("   - signalRService: ✅ CÓ");
  console.log("   - isConnected:", signalRService.isConnected());
  console.log("   - state:", signalRService.getChatConnectionState());
} else {
  console.log("   - signalRService: ❌ KHÔNG TỒN TẠI");
}

// 3. Check if SignalRInitializer ran
console.log("\n��� 3. Kiểm tra SignalRInitializer đã chạy chưa:");
console.log("   Tìm log với icon: ��� ��� ��� ✅ ���");
console.log("   Nếu KHÔNG thấy → SignalRInitializer CHƯA CHẠY");

// 4. Solution
console.log("\n��� 4. GIẢI PHÁP:");
if (!token || isAuth !== "true") {
  console.log("   ❌ Chưa đăng nhập → Đăng nhập lại");
} else if (typeof signalRService === 'undefined') {
  console.log("   ❌ signalRService không tồn tại → Reload trang (Ctrl+Shift+R)");
} else if (!signalRService.isConnected()) {
  console.log("   ��� SignalR chưa kết nối → Chạy lệnh sau:");
  console.log("\n   signalRService.setTokenGetter(() => localStorage.getItem('token'));");
  console.log("   await signalRService.connect();");
  console.log("\n   Hoặc chạy script QUICK CONNECT ở trên ⬆️");
} else {
  console.log("   ✅ ĐÃ KẾT NỐI! Có thể chat được rồi!");
}

console.log("\n=== KẾT THÚC DEBUG ===");
