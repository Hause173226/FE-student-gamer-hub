import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle,
  X,
  Loader2,
  Crown,
  Zap,
  Star,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import MembershipService from "../services/membershipService";
import PaymentService from "../services/paymentService";
import { MembershipPlanDto, CurrentMembershipDto } from "../types/membership";
import { ContentSkeleton } from "../components/ContentSkeleton";

// Cache keys
const MEMBERSHIP_PLANS_CACHE_KEY = "membership_plans_cache";
const MEMBERSHIP_CURRENT_CACHE_KEY = "membership_current_cache";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const Membership = () => {
  const [plans, setPlans] = useState<MembershipPlanDto[]>([]);
  const [currentMembership, setCurrentMembership] =
    useState<CurrentMembershipDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State cho popup xác nhận
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanDto | null>(
    null
  );
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedPlans = getCachedPlans();
      const cachedMembership = getCachedMembership();

      if (cachedPlans && cachedMembership !== undefined) {
        setPlans(cachedPlans);
        setCurrentMembership(cachedMembership);
        setLoading(false);

        // Refresh in background
        Promise.all([
          MembershipService.getPlans(),
          MembershipService.getMyMembership(),
        ])
          .then(([plansData, membershipData]) => {
            const sortedPlans = plansData.sort((a, b) => a.Price - b.Price);
            setPlans(sortedPlans);
            setCurrentMembership(membershipData);
            cachePlans(sortedPlans);
            cacheMembership(membershipData);
          })
          .catch((err) => {
            console.warn("Background refresh failed:", err);
          });
        return;
      }

      // Load from API
      const [plansData, membershipData] = await Promise.all([
        MembershipService.getPlans(),
        MembershipService.getMyMembership(),
      ]);

      // Sắp xếp theo giá (thấp đến cao)
      const sortedPlans = plansData.sort((a, b) => a.Price - b.Price);
      setPlans(sortedPlans);
      setCurrentMembership(membershipData);

      // Cache results
      cachePlans(sortedPlans);
      cacheMembership(membershipData);
    } catch (err: unknown) {
      console.error("Load membership data error:", err);

      // Try to use cache on error
      const cachedPlans = getCachedPlans();
      const cachedMembership = getCachedMembership();

      if (cachedPlans) {
        setPlans(cachedPlans);
      }
      if (cachedMembership !== undefined) {
        setCurrentMembership(cachedMembership);
      }

      if (!cachedPlans && !cachedMembership) {
        setError("Không thể tải danh sách gói membership");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBuyNow = async (plan: MembershipPlanDto) => {
    try {
      setPurchasing(plan.Id);
      setError(null);

      // Bước 1: Gọi POST /api/Payments/buy-membership/{planId}
      const result = await PaymentService.buyMembership(plan.Id);

      // Lưu PaymentIntentId và plan để dùng trong popup
      setPaymentIntentId(result.PaymentIntentId);
      setSelectedPlan(plan);

      // Hiển thị popup xác nhận
      setShowConfirmPopup(true);
    } catch (err: unknown) {
      console.error("Buy membership error:", err);

      if (err && typeof err === "object" && "response" in err) {
        const response = err.response as {
          status?: number;
          data?: { message?: string };
        };
        if (response.status === 402) {
          setError("❌ Số dư ví không đủ. Vui lòng nạp thêm tiền.");
        } else {
          setError(
            response.data?.message ||
              "Không thể tạo đơn hàng. Vui lòng thử lại."
          );
        }
      } else {
        setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentIntentId || !selectedPlan) {
      setError("Không tìm thấy thông tin thanh toán");
      return;
    }

    try {
      setConfirming(true);
      setError(null);

      // Bước 2: Gọi POST /api/Payments/payos/create
      const payosResult = await PaymentService.createPayOsPayment(
        paymentIntentId,
        window.location.origin + "/membership/success"
      );

      // Redirect đến PayOS
      window.location.href = payosResult.checkoutUrl;
    } catch (err: unknown) {
      console.error("PayOS payment error:", err);

      let errorMessage = "Không thể tạo link thanh toán. Vui lòng thử lại.";

      if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;
        if ("response" in errorObj) {
          const response = errorObj.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if (typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
      setConfirming(false);
    }
  };

  const handleCancelPopup = () => {
    setShowConfirmPopup(false);
    setSelectedPlan(null);
    setPaymentIntentId(null);
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("ultimate") || name.includes("premium")) return Crown;
    if (name.includes("pro")) return Zap;
    return Star;
  };

  // Memoize expensive calculations
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const calculateDaysRemaining = useCallback((endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, []);

  // Memoize filtered and sorted plans
  const activePlans = useMemo(() => {
    return plans.filter((p) => p.IsActive).sort((a, b) => a.Price - b.Price);
  }, [plans]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="h-12 bg-indigo-700 rounded w-1/3 mx-auto skeleton-item mb-4"></div>
            <div className="h-6 bg-indigo-700 rounded w-1/2 mx-auto skeleton-item" style={{ animationDelay: '100ms' }}></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ContentSkeleton type="grid" count={3} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 progressive-list">
          {activePlans.map((plan) => {
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
        {activePlans.length === 0 && !loading && (
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

      {/* Popup Xác nhận Thanh toán */}
      {showConfirmPopup && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                Xác nhận thanh toán
              </h3>
              <button
                onClick={handleCancelPopup}
                className="text-slate-400 hover:text-white"
                disabled={confirming}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin gói */}
            <div className="bg-slate-900 rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gói:</span>
                  <span className="font-semibold text-white">
                    {selectedPlan.Name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mô tả:</span>
                  <span className="text-slate-300 text-right text-sm max-w-[200px]">
                    {selectedPlan.Description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giới hạn sự kiện:</span>
                  <span className="font-semibold text-white">
                    {selectedPlan.MonthlyEventLimit === -1
                      ? "Không giới hạn"
                      : `${selectedPlan.MonthlyEventLimit} sự kiện/tháng`}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Tổng thanh toán:
                    </span>
                    <span className="text-2xl font-bold text-indigo-400">
                      {formatPrice(selectedPlan.Price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-6">
              <p className="text-blue-200 text-sm">
                💳 Bạn sẽ được chuyển đến cổng thanh toán PayOS để hoàn tất giao
                dịch
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelPopup}
                disabled={confirming}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Thanh toán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cache helper functions
function getCachedPlans(): MembershipPlanDto[] | null {
  try {
    const cached = localStorage.getItem(MEMBERSHIP_PLANS_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(MEMBERSHIP_PLANS_CACHE_KEY);
      return null;
    }

    return data.plans;
  } catch (error) {
    console.error("Error reading plans cache:", error);
    return null;
  }
}

function cachePlans(plans: MembershipPlanDto[]) {
  try {
    const cache = {
      plans,
      timestamp: Date.now(),
    };
    localStorage.setItem(MEMBERSHIP_PLANS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching plans:", error);
  }
}

function getCachedMembership(): CurrentMembershipDto | null | undefined {
  try {
    const cached = localStorage.getItem(MEMBERSHIP_CURRENT_CACHE_KEY);
    if (!cached) return undefined;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(MEMBERSHIP_CURRENT_CACHE_KEY);
      return undefined;
    }

    return data.membership;
  } catch (error) {
    console.error("Error reading membership cache:", error);
    return undefined;
  }
}

function cacheMembership(membership: CurrentMembershipDto | null) {
  try {
    const cache = {
      membership,
      timestamp: Date.now(),
    };
    localStorage.setItem(MEMBERSHIP_CURRENT_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching membership:", error);
  }
}

export default Membership;
