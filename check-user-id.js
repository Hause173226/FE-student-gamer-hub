// CHECK USER ID - Kiểm tra user ID có đúng không

console.log("=== ��� CHECK USER ID ===\n");

const userStr = localStorage.getItem("user");
console.log("1. localStorage.getItem('user'):");
console.log("   Raw:", userStr ? userStr.substring(0, 100) + "..." : "❌ NULL");

if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log("\n2. Parsed user object:");
    console.log(user);
    
    console.log("\n3. User ID fields:");
    console.log("   - user.id:", user.id || "❌ KHÔNG CÓ");
    console.log("   - user.userId:", user.userId || "❌ KHÔNG CÓ");
    
    const userId = user.id || user.userId;
    console.log("\n4. ✅ User ID sẽ dùng:", userId);
    
    // Check if it's a valid GUID
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && guidRegex.test(userId)) {
      console.log("   ✅ Đây là GUID hợp lệ!");
    } else {
      console.log("   ⚠️ KHÔNG phải GUID format!");
    }
    
  } catch (e) {
    console.error("❌ Không parse được JSON:", e);
  }
} else {
  console.log("❌ Không có user trong localStorage!");
  console.log("   → Cần đăng nhập lại");
}

console.log("\n=== KẾT THÚC ===");
