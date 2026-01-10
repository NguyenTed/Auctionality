/**
 * BidConfirmDialog Component
 * Confirmation dialog for placing bids with error message support
 */

interface BidConfirmDialogProps {
  open: boolean;
  bidAmount: number;
  minBid: number;
  productTitle: string;
  errorMessage?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const BidConfirmDialog = ({
  open,
  bidAmount,
  minBid,
  productTitle,
  errorMessage,
  loading = false,
  onConfirm,
  onCancel,
}: BidConfirmDialogProps) => {
  if (!open) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg w-[450px] max-w-[90%] p-6 z-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Confirm Your Bid
        </h2>

        {/* Product Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Product:</p>
          <p className="font-semibold text-gray-900 line-clamp-2">
            {productTitle}
          </p>
        </div>

        {/* Bid Amount */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Your Bid Amount:</p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(bidAmount)}
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">⚠️ {errorMessage}</p>
          </div>
        )}

        {/* Warning if below minimum */}
        {bidAmount < minBid && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Minimum bid is {formatPrice(minBid)}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 text-sm text-gray-600">
          <p>
            By confirming, you agree to place a bid of{" "}
            <span className="font-semibold">{formatPrice(bidAmount)}</span> on
            this item.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading || bidAmount < minBid}
            className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Placing Bid..." : "Confirm Bid"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidConfirmDialog;
