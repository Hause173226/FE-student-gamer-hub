import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, X, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import PaymentService from "../services/paymentService";

interface PaymentIntentData {
  paymentIntentId: string | null;
  requiresExternalPayment: boolean;
  membership: {
    membershipPlanId: string;
    planName: string;
    monthlyEventLimit: number;
    startDate: string;
    endDate: string;
    remainingEventQuota: number | null;
    isActive: boolean;
  };
  planInfo: {
    planId: string;
    planName: string;
    price: number;
    description: string;
  };
}

const MembershipConfirm = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentIntentData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy thông tin PaymentIntent từ localStorage
    const savedData = localStorage.getItem("payment_intent_data");
    if (savedData) {
      setPaymentData(JSON.parse(savedData));
    } else {
      // Không có PaymentIntent, quay lại trang membership
      navigate("/membership");
    }
  }, [navigate]);

  const handleConfirmPayment = async () => {
    if (!paymentData) {
      setError("Không tìm thấy thông tin thanh toán");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Bước 2: Gọi POST /api/Payments/payos/create
      const payosResult = await PaymentService.createPayOsPayment(
        paymentData.paymentIntentId || "", // Truyền empty string nếu null
        window.location.origin + "/membership/success"
      );

      // Lưu paymentLinkId để tracking
      localStorage.setItem("payment_link_id", payosResult.paymentLinkId || "");

      // Redirect đến PayOS để thanh toán
      window.location.href = payosResult.checkoutUrl;
    } catch (err: any) {
      console.error("PayOS payment error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tạo link thanh toán. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("payment_intent_data");
    navigate("/membership");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Xác nhận thanh toán</h1>
          <p className="text-slate-400">
            Vui lòng kiểm tra thông tin trước khi thanh toán
          </p>
        </div>

        {/* Plan Details Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Thông tin gói membership
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Tên gói:</span>
              <span className="font-semibold text-lg">
                {paymentData.planInfo.planName}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-400">Mô tả:</span>
              <span className="text-right max-w-xs">
                {paymentData.planInfo.description}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-400">Giới hạn sự kiện:</span>
              <span className="font-semibold">
                {paymentData.membership.monthlyEventLimit === -1
                  ? "Không giới hạn"
                  : `${paymentData.membership.monthlyEventLimit} sự kiện/tháng`}
              </span>
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Tổng thanh toán:</span>
                <span className="text-3xl font-bold text-indigo-400">
                  {formatPrice(paymentData.planInfo.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-200">
              <p className="font-semibold mb-1">
                Phương thức thanh toán: PayOS
              </p>
              <p>
                Bạn sẽ được chuyển đến cổng thanh toán PayOS để hoàn tất giao
                dịch.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tạo link...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Xác nhận thanh toán</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipConfirm;
