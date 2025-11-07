import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  X,
  Loader2,
  Crown,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import MembershipService from "../services/membershipService";
import PaymentService from "../services/paymentService";
import { MembershipPlanDto, CurrentMembershipDto } from "../types/membership";

const Membership = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlanDto[]>([]);
  const [currentMembership, setCurrentMembership] =
    useState<CurrentMembershipDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, membershipData] = await Promise.all([
        MembershipService.getPlans(),
        MembershipService.getMyMembership(),
      ]);
      // Sắp xếp theo giá (thấp đến cao)
      setPlans(plansData.sort((a, b) => a.Price - b.Price));
      setCurrentMembership(membershipData);
    } catch (err: any) {
      setError("Không thể tải danh sách gói membership");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (plan: MembershipPlanDto) => {
    try {
      setPurchasing(plan.Id);
      setError(null);

      // Bước 1: Gọi POST /api/Payments/buy-membership/{planId}
      const result = await PaymentService.buyMembership(plan.Id);

      // Lưu thông tin để dùng ở trang confirm
      localStorage.setItem(
        "payment_intent_data",
        JSON.stringify({
          paymentIntentId: result.PaymentIntentId,
          requiresExternalPayment: result.RequiresExternalPayment,
          membership: result.Membership,
          planInfo: {
            planId: plan.Id,
            planName: plan.Name,
            price: plan.Price,
            description: plan.Description,
          },
        })
      );

      // Chuyển đến trang xác nhận thanh toán
      navigate("/membership/confirm");
    } catch (err: any) {
      if (err.response?.status === 402) {
        setError("❌ Số dư ví không đủ. Vui lòng nạp thêm tiền.");
      } else {
        setError(
          err.response?.data?.message ||
            "Không thể tạo đơn hàng. Vui lòng thử lại."
        );
      }
      console.error("Buy membership error:", err);
    } finally {
      setPurchasing(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("ultimate") || name.includes("premium")) return Crown;
    if (name.includes("pro")) return Zap;
    return Star;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nâng cấp trải nghiệm của bạn
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Chọn gói membership phù hợp để tham gia nhiều sự kiện hơn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Current Membership Status */}
        {currentMembership?.IsActive && (
          <div className="mb-12 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-green-100">
                    Gói hiện tại: {currentMembership.PlanName}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-slate-300">
                    Từ {formatDate(currentMembership.StartDate)}
                  </div>
                  <div className="text-slate-300">
                    Đến {formatDate(currentMembership.EndDate)}
                  </div>
                  <div className="text-slate-300">
                    Còn {calculateDaysRemaining(currentMembership.EndDate)} ngày
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-300">
                  📊 Giới hạn sự kiện:{" "}
                  {currentMembership.MonthlyEventLimit === -1
                    ? "Không giới hạn"
                    : `${currentMembership.MonthlyEventLimit} sự kiện/tháng`}
                  {currentMembership.RemainingEventQuota !== null && (
                    <> (Còn lại: {currentMembership.RemainingEventQuota})</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-start gap-3">
            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans
            .filter((p) => p.IsActive)
            .map((plan) => {
              const Icon = getPlanIcon(plan.Name);
              const isCurrentPlan =
                currentMembership?.MembershipPlanId === plan.Id;
              const isFree = plan.Price === 0;

              return (
                <div
                  key={plan.Id}
                  className={`relative bg-slate-800 border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                    isCurrentPlan
                      ? "border-green-500 shadow-lg shadow-green-500/20"
                      : "border-slate-700 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/20"
                  }`}
                >
                  {/* Badge - Đang dùng */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Đang dùng
                    </div>
                  )}

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-600/20 rounded-xl">
                      <Icon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold">{plan.Name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 mb-6 min-h-[48px]">
                    {plan.Description || "Gói membership tiêu chuẩn"}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {isFree ? (
                      <div className="text-4xl font-bold text-green-400">
                        Miễn phí
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-white">
                          {formatPrice(plan.Price)}
                        </div>
                        <div className="text-slate-400 mt-1">
                          /{plan.DurationMonths} tháng
                        </div>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">
                        {plan.MonthlyEventLimit === -1
                          ? "Không giới hạn sự kiện"
                          : `${plan.MonthlyEventLimit} sự kiện/tháng`}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">
                        Thời hạn: {plan.DurationMonths} tháng
                      </span>
                    </div>
                  </div>

                  {/* CTA Button - Mua ngay */}
                  <button
                    onClick={() => handleBuyNow(plan)}
                    disabled={isCurrentPlan || purchasing === plan.Id}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : purchasing === plan.Id
                        ? "bg-indigo-600/50 text-white cursor-wait"
                        : isFree
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                    }`}
                  >
                    {purchasing === plan.Id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang tạo đơn...</span>
                      </>
                    ) : isCurrentPlan ? (
                      <span>Đã kích hoạt</span>
                    ) : (
                      <>
                        <span>Mua ngay</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
        </div>

        {/* No Plans Available */}
        {plans.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
              <Crown className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Chưa có gói membership nào
            </h3>
            <p className="text-slate-500">Vui lòng quay lại sau</p>
          </div>
        )}

        {/* Features Comparison */}
        <div className="mt-20 bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Tại sao nên nâng cấp?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Tham gia nhiều sự kiện hơn
              </h3>
              <p className="text-slate-400">
                Tăng giới hạn số lượng sự kiện bạn có thể tham gia mỗi tháng
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Tính năng độc quyền
              </h3>
              <p className="text-slate-400">
                Mở khóa các tính năng và quyền lợi dành riêng cho thành viên
                premium
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hỗ trợ ưu tiên</h3>
              <p className="text-slate-400">
                Nhận được sự hỗ trợ nhanh chóng và ưu tiên từ đội ngũ của chúng
                tôi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
