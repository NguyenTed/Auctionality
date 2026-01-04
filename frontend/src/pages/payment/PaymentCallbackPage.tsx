/**
 * Payment Callback Page
 * Handles VNPay payment return callback
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import {
  processPaymentCallbackAsync,
  clearCallbackResult,
} from "../../features/payment/paymentSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toasts, success, error, removeToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get query string from URL (everything after ?)
        const queryString = window.location.search.substring(1);

        if (!queryString) {
          setResult({
            success: false,
            message: "No payment data received",
          });
          setIsProcessing(false);
          return;
        }

        // Process payment callback
        const action = await dispatch(
          processPaymentCallbackAsync(queryString)
        );

        if (processPaymentCallbackAsync.fulfilled.match(action)) {
          const callbackResult = action.payload;
          setResult(callbackResult);

          if (callbackResult.success) {
            success("Payment completed successfully!");
            // Extract paymentId from query string to get orderId
            const paymentId = searchParams.get("paymentId");
            if (paymentId) {
              // Redirect to orders page after 3 seconds
              setTimeout(() => {
                navigate("/orders");
              }, 3000);
            } else {
              setTimeout(() => {
                navigate("/orders");
              }, 3000);
            }
          } else {
            error(callbackResult.message || "Payment failed");
            // Redirect back after 5 seconds
            setTimeout(() => {
              navigate("/orders");
            }, 5000);
          }
        } else {
          const errorMessage =
            (action.payload as string) || "Payment processing failed";
          setResult({
            success: false,
            message: errorMessage,
          });
          error(errorMessage);
          setTimeout(() => {
            navigate("/orders");
          }, 5000);
        }
      } catch (err: any) {
        const errorMessage = err.message || "An unexpected error occurred";
        setResult({
          success: false,
          message: errorMessage,
        });
        error(errorMessage);
        setTimeout(() => {
          navigate("/orders");
        }, 5000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();

    // Cleanup on unmount
    return () => {
      dispatch(clearCallbackResult());
    };
  }, [dispatch, navigate, searchParams, success, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {isProcessing ? (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment
            </p>
          </>
        ) : result ? (
          <>
            {result.success ? (
              <>
                <CheckCircleIcon
                  className="text-green-500 mx-auto mb-4"
                  style={{ fontSize: 64 }}
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-4">{result.message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to orders page...
                </p>
              </>
            ) : (
              <>
                <ErrorIcon
                  className="text-red-500 mx-auto mb-4"
                  style={{ fontSize: 64 }}
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Failed
                </h2>
                <p className="text-gray-600 mb-4">{result.message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to orders page...
                </p>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

