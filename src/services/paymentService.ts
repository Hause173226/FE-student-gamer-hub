import axiosInstance from "./axiosInstance";

// ============================================
// TYPES & INTERFACES - BASED ON REAL BACKEND
// ============================================

export enum PaymentStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
}

export enum BillingCycle {
  Monthly = "monthly",
  Yearly = "yearly",
}

// Payment DTO
export interface PaymentDto {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  paymentLinkId: string;
  description: string;
  createdAt: string;
  completedAt: string | null;
  metadata: any;
}

// PayOS Create Payment Request
export interface CreatePayOsPaymentRequest {
  amount: number;
  description?: string;
}

// PayOS Create Payment Response
export interface CreatePayOsPaymentResponse {
  checkoutUrl: string;
  paymentLinkId: string;
  qrCode?: string;
  amount: number;
  currency: string;
}

// Payment History Response
export interface PaymentHistoryResponse {
  items: PaymentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Buy Membership Response - Backend trả về PascalCase!
export interface BuyMembershipResponse {
  RequiresExternalPayment: boolean;
  PaymentIntentId: string | null;
  Membership: {
    MembershipPlanId: string;
    PlanName: string;
    MonthlyEventLimit: number;
    StartDate: string;
    EndDate: string;
    RemainingEventQuota: number | null;
    IsActive: boolean;
  };
}

// ============================================
// PAYMENT SERVICE
// ============================================

const paymentService = {
  /**
   * POST /api/Payments/payos/create
   * Create PayOS payment link for membership payment
   * @param intentId - Payment intent ID from buy-membership
   * @param returnUrl - URL to return after payment
   */
  createPayOsPayment(intentId: string, returnUrl: string) {
    return axiosInstance
      .post<CreatePayOsPaymentResponse>("/api/Payments/payos/create", {
        intentId,
        returnUrl,
      })
      .then((res) => res.data);
  },

  /**
   * GET /payments/history
   * Get payment history
   */
  getPaymentHistory(
    page: number = 1,
    pageSize: number = 10,
    status?: PaymentStatus
  ) {
    return axiosInstance
      .get<PaymentHistoryResponse>("/api/payments/history", {
        params: { page, pageSize, status },
      })
      .then((res) => res.data);
  },

  /**
   * GET /payments/{paymentId}
   * Get payment details
   */
  getPaymentById(paymentId: string) {
    return axiosInstance
      .get<PaymentDto>(`/api/payments/${paymentId}`)
      .then((res) => res.data);
  },

  /**
   * POST /payments/{paymentId}/cancel
   * Cancel pending payment
   */
  cancelPayment(paymentId: string) {
    return axiosInstance
      .post<{ success: boolean; message: string }>(
        `/api/payments/${paymentId}/cancel`
      )
      .then((res) => res.data);
  },

  /**
   * POST /api/Payments/buy-membership/{planId}
   * Buy membership plan
   * Returns membership info and whether external payment is required
   */
  buyMembership(planId: string) {
    return axiosInstance
      .post<BuyMembershipResponse>(`/api/Payments/buy-membership/${planId}`)
      .then((res) => res.data);
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Format amount to VND
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  },

  /**
   * Get payment status label (Vietnamese)
   */
  getStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return "Đang chờ";
      case PaymentStatus.Completed:
        return "Hoàn thành";
      case PaymentStatus.Failed:
        return "Thất bại";
      case PaymentStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  },

  /**
   * Get payment status color (Tailwind classes)
   */
  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return "text-yellow-500";
      case PaymentStatus.Completed:
        return "text-green-500";
      case PaymentStatus.Failed:
        return "text-red-500";
      case PaymentStatus.Cancelled:
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  },
};

export default paymentService;
