/**
 * reCAPTCHA Component
 * Wrapper for Google reCAPTCHA v2
 */

import { useRef, useImperativeHandle, forwardRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  className?: string;
}

export interface RecaptchaRef {
  reset: () => void;
}

const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ siteKey, onChange, onExpired, onError, className = "" }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
    }));

    const handleExpired = () => {
      if (onExpired) {
        onExpired();
      }
      onChange(null);
    };

    const handleError = () => {
      if (onError) {
        onError();
      }
      onChange(null);
    };

    // Don't render if siteKey is not provided
    if (!siteKey || siteKey.trim() === "") {
      return null;
    }

    return (
      <div className={className}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={handleExpired}
          onError={handleError}
          theme="light"
        />
      </div>
    );
  }
);

Recaptcha.displayName = "Recaptcha";

export default Recaptcha;
