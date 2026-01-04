/**
 * Rating Modal Component
 * Allows users to rate sellers or buyers after order completion
 */

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

interface RatingModalProps {
  open: boolean;
  orderId: number; // Used for API calls, not displayed in UI
  isBuyer: boolean; // true if buyer is rating seller, false if seller is rating buyer
  targetUserName: string;
  onClose: () => void;
  onSubmit: (value: number, comment?: string) => Promise<void>;
  loading?: boolean;
}

const RatingModal = ({
  open,
  isBuyer,
  targetUserName,
  onClose,
  onSubmit,
  loading = false,
}: RatingModalProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (rating === null) return;
    await onSubmit(rating, comment.trim() || undefined);
    // Reset form
    setRating(null);
    setComment("");
  };

  const handleClose = () => {
    setRating(null);
    setComment("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-[500px] max-w-[90%] p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Rate {isBuyer ? "Seller" : "Buyer"}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          How was your experience with{" "}
          <span className="font-semibold">{targetUserName}</span>?
        </p>

        {/* Rating Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRating(1)}
            disabled={loading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 transition-all
              ${
                rating === 1
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <ThumbUpIcon
              className={rating === 1 ? "text-green-600" : "text-gray-400"}
            />
            <span className="font-semibold">Positive (+1)</span>
          </button>

          <button
            onClick={() => setRating(-1)}
            disabled={loading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 transition-all
              ${
                rating === -1
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <ThumbDownIcon
              className={rating === -1 ? "text-red-600" : "text-gray-400"}
            />
            <span className="font-semibold">Negative (-1)</span>
          </button>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label
            htmlFor="rating-comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comment (Optional)
          </label>
          <textarea
            id="rating-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Share your experience..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === null || loading}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
