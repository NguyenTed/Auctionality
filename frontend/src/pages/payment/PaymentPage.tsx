/**
 * Payment Page
 * Redirects user to VNPay payment gateway
 */

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getPaymentUrlAsync,
  selectPaymentUrl,
  selectPaymentLoading,
  selectPaymentError,
} from "../../features/payment/paymentSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import PaymentIcon from "@mui/icons-material/Payment";

export default function PaymentPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toasts, error, removeToast } = useToast();

  const paymentUrl = useAppSelector(selectPaymentUrl);
  const isLoading = useAppSelector(selectPaymentLoading);
  const paymentError = useAppSelector(selectPaymentError);

  useEffect(() => {
    if (productId) {
      dispatch(getPaymentUrlAsync(parseInt(productId)));
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (paymentUrl) {
      // Redirect to VNPay payment gateway
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (paymentError) {
      error(paymentError);
      // Redirect back after 3 seconds
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    }
  }, [paymentError, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Preparing Payment...
            </h2>
            <p className="text-gray-600">
              Redirecting to VNPay payment gateway
            </p>
          </>
        ) : paymentError ? (
          <>
            <PaymentIcon
              className="text-red-500 mx-auto mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Error
            </h2>
            <p className="text-gray-600 mb-4">{paymentError}</p>
            <p className="text-sm text-gray-500">
              Redirecting back in a moment...
            </p>
          </>
        ) : (
          <>
            <PaymentIcon
              className="text-primary mx-auto mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Redirecting to Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we redirect you to VNPay
            </p>
          </>
        )}
      </div>
    </div>
  );
}

