/**
 * VerifyEmailPage Component
 * Modern, classy email verification page
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { verifyEmailAsync, resendVerificationEmailAsync } from "../../features/auth/authSlice";
import EmailIcon from "@mui/icons-material/Email";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const email = (location.state as { email?: string })?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<{ general?: string; otp?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");

    setOtp(newOtp);
    setErrors({});

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await dispatch(verifyEmailAsync(otpString));
      if (verifyEmailAsync.fulfilled.match(result)) {
        navigate("/");
      } else {
        setErrors({ general: result.payload as string || "Verification failed. Please try again." });
      }
    } catch (error: unknown) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrors({ general: "Email address is required to resend verification code" });
      return;
    }

    setIsResending(true);
    setResendMessage("");
    setErrors({});

    try {
      const result = await dispatch(resendVerificationEmailAsync(email));
      if (resendVerificationEmailAsync.fulfilled.match(result)) {
        setResendMessage("Verification code has been resent to your email");
        setOtp(["", "", "", "", "", ""]);
      } else {
        setErrors({ general: result.payload as string || "Failed to resend verification code" });
      }
    } catch (error: unknown) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    document.getElementById("otp-0")?.focus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-orange-500 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <EmailIcon className="text-white" style={{ fontSize: 40 }} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-primary font-semibold mt-1">{email || "your email"}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-fade-in">
                <p className="text-sm text-red-800 font-medium">{errors.general}</p>
              </div>
            )}

            {resendMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 animate-fade-in">
                <p className="text-sm text-green-800 font-medium">{resendMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all ${
                      errors.otp ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-3 text-sm text-red-600 text-center animate-fade-in">{errors.otp}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || !email}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Resending..." : "Resend verification code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
