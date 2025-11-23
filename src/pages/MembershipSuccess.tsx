import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Home,
  ArrowRight,
  Crown,
} from "lucide-react";
import MembershipService from "../services/membershipService";
import { CurrentMembershipDto } from "../types/membership";

const MembershipSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<CurrentMembershipDto | null>(
    null
  );
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkMembershipStatus();
  }, []);

  const checkMembershipStatus = async () => {
    try {
      setLoading(true);

      // Get purchase info from localStorage
      const savedInfo = localStorage.getItem("payment_intent_data");
      if (savedInfo) {
        const data = JSON.parse(savedInfo);
        setPurchaseInfo(data.planInfo);
      }

      // Poll membership status (backend might need a few seconds to process webhook)
      let attempts = 0;
      const maxAttempts = 15; // 15 * 2s = 30s max
      let activeMembership: CurrentMembershipDto | null = null;

      while (attempts < maxAttempts) {
        const membershipData = await MembershipService.getMyMembership();

        if (membershipData?.IsActive) {
          activeMembership = membershipData;
          setMembership(membershipData);
          // Clear localStorage
          localStorage.removeItem("payment_intent_data");
          localStorage.removeItem("payment_link_id");
          break;
        }

        // Wait 2 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      // If still no membership after polling
      if (!activeMembership) {
        setError(
          "Đang xử lý thanh toán. Vui lòng chờ thêm vài phút và kiểm tra lại."
        );
      }
    } catch (err: any) {
      console.error("Membership check error:", err);
      setError(
        "Không thể kiểm tra trạng thái membership. Vui lòng kiểm tra lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-lg">Đang kiểm tra thanh toán...</p>
          <p className="text-slate-500 text-sm">
            Có thể mất vài giây để xác nhận
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = membership?.IsActive;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success State */}
        {isSuccess && membership && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h1 className="text-3xl font-bold mb-3">
              Thanh toán thành công! 🎉
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Gói membership của bạn đã được kích hoạt
            </p>

            {/* Membership Details */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-indigo-400" />
                Chi tiết gói membership
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tên gói:</span>
                  <span className="font-semibold">{membership.PlanName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày bắt đầu:</span>
                  <span className="font-semibold">
                    {formatDate(membership.StartDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày hết hạn:</span>
                  <span className="font-semibold">
                    {formatDate(membership.EndDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời hạn còn lại:</span>
                  <span className="font-semibold text-green-400">
                    {calculateDaysRemaining(membership.EndDate)} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giới hạn sự kiện:</span>
                  <span className="font-semibold">
                    {membership.MonthlyEventLimit === -1
                      ? "Không giới hạn"
                      : `${membership.MonthlyEventLimit} sự kiện/tháng`}
                  </span>
                </div>
                {membership.RemainingEventQuota !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Còn lại:</span>
                    <span className="font-semibold text-green-400">
                      {membership.RemainingEventQuota} sự kiện
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Info (if available) */}
            {purchaseInfo && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-indigo-400">💳</span> Thông tin thanh
                  toán
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gói đã mua:</span>
                    <span className="font-semibold">
                      {purchaseInfo.planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mô tả:</span>
                    <span className="font-semibold text-right max-w-xs">
                      {purchaseInfo.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-semibold text-green-400">
                      {formatPrice(purchaseInfo.price)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Về Dashboard
              </button>
              <button
                onClick={() => navigate("/events")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Xem sự kiện
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Failed/Error State */}
        {!isSuccess && error && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            {/* Warning Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-yellow-400" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Đang xử lý...</h1>
            <p className="text-slate-400 text-lg mb-8">{error}</p>

            {/* Info */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-left">
              <p className="text-slate-300 mb-3">
                ℹ️ Thanh toán của bạn đang được xử lý. Membership sẽ được kích
                hoạt trong vài phút.
              </p>
              <p className="text-slate-400 text-sm">
                Nếu sau 5 phút vẫn chưa thấy membership, vui lòng liên hệ hỗ
                trợ.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                Kiểm tra lại
              </button>
              <button
                onClick={() => navigate("/membership")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                Quay lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipSuccess;
