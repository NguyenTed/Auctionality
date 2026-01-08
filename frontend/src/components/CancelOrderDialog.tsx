/**
 * Cancel Order Dialog Component
 * Confirmation dialog for canceling an order with reason input
 */

import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";

interface CancelOrderDialogProps {
  isOpen: boolean;
  orderId: number;
  productTitle: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CancelOrderDialog({
  isOpen,
  orderId,
  productTitle,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters long");
      return;
    }

    try {
      await onConfirm(reason.trim());
      setReason("");
      setError(null);
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <WarningIcon className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-600">Order #{orderId}</p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Canceling this order will allow you to
              sell the product again. This action cannot be undone.
            </p>
          </div>

          {/* Product Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Product:</p>
            <p className="text-sm font-medium text-gray-900">{productTitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Please provide a reason for canceling this order (minimum 10 characters)..."
                disabled={isLoading}
                required
                minLength={10}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {reason.length}/10 characters minimum
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !reason.trim() || reason.trim().length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Canceling...
                  </>
                ) : (
                  <>
                    <CancelIcon fontSize="small" />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
