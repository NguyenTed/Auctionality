/**
 * Payment Service
 * Axios API calls for payment feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface PaymentCallbackResponse {
  success: boolean;
  message: string;
}

export const paymentService = {
  /**
   * Get VNPay payment URL for a product
   * @param productId Product ID
   * @returns Payment URL string
   */
  getPaymentUrl: async (productId: number): Promise<string> => {
    const response = await axiosInstance.get<string>(
      `/payments/${productId}/vnpay-url`
    );
    return response.data;
  },

  /**
   * Process VNPay payment callback
   * @param queryString Query string from VNPay return URL
   * @returns Payment callback response
   */
  processPaymentCallback: async (
    queryString: string
  ): Promise<PaymentCallbackResponse> => {
    try {
      const response = await axiosInstance.get<string>(
        `/payments/vnpay-return?${queryString}`
      );
      return {
        success: true,
        message: response.data || "Payment processed successfully",
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Payment processing failed";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

