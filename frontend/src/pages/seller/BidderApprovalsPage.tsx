/**
 * Bidder Approvals Page
 * Seller page for managing bidder approval requests
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchBidderApprovalsAsync,
  approveBidderApprovalAsync,
  rejectBidderApprovalAsync,
  selectBidderApprovals,
  selectSellerLoading,
} from "../../features/seller/sellerSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useState } from "react";
import type { BidderApproval } from "../../features/seller/sellerService";

export default function BidderApprovalsPage() {
  const dispatch = useAppDispatch();
  const approvals = useAppSelector(selectBidderApprovals);
  const isLoading = useAppSelector(selectSellerLoading);
  const { toasts, success, error: toastError, removeToast } = useToast();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<BidderApproval | null>(null);

  useEffect(() => {
    dispatch(fetchBidderApprovalsAsync());
  }, [dispatch]);

  const handleApprove = (approval: BidderApproval) => {
    setSelectedApproval(approval);
    setActionType("approve");
    setIsConfirmDialogOpen(true);
  };

  const handleReject = (approval: BidderApproval) => {
    setSelectedApproval(approval);
    setActionType("reject");
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApproval || !actionType) return;

    try {
      if (actionType === "approve") {
        const result = await dispatch(approveBidderApprovalAsync(selectedApproval.id));
        if (approveBidderApprovalAsync.fulfilled.match(result)) {
          success("Bidder approval request approved");
          dispatch(fetchBidderApprovalsAsync());
        } else {
          toastError(result.payload as string || "Failed to approve bidder");
        }
      } else {
        const result = await dispatch(rejectBidderApprovalAsync(selectedApproval.id));
        if (rejectBidderApprovalAsync.fulfilled.match(result)) {
          success("Bidder approval request rejected");
          dispatch(fetchBidderApprovalsAsync());
        } else {
          toastError(result.payload as string || "Failed to reject bidder");
        }
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    }

    setIsConfirmDialogOpen(false);
    setSelectedApproval(null);
    setActionType(null);
  };

  const handleCancelAction = () => {
    setIsConfirmDialogOpen(false);
    setSelectedApproval(null);
    setActionType(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="flex items-center gap-3">
        <AssignmentIcon className="text-4xl text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Bidder Approval Requests</h1>
      </div>

      {isLoading && approvals.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading approvals...</p>
          </div>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AssignmentIcon className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No pending bidder approval requests</p>
          <p className="text-sm text-gray-500 mt-2">
            When new bidders (or bidders with low ratings) try to bid on your products, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <Link
                  to={`/products/${approval.productId}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors mb-2 block"
                >
                  {approval.productTitle}
                </Link>
                <p className="text-sm text-gray-500">Product ID: {approval.productId}</p>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <PersonIcon className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{approval.bidderName}</p>
                    <p className="text-xs text-gray-500">{approval.bidderEmail}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StarIcon className="text-yellow-400 text-sm" />
                  <span className="text-sm text-gray-600">Bidder Rating: {approval.bidderRating ? approval.bidderRating.toFixed(1) : "N/A"}%</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Requested Bid Amount</p>
                <p className="text-xl font-bold text-primary">{formatPrice(approval.amount)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requested: {new Date(approval.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(approval)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={isLoading}
                >
                  <CheckCircleIcon fontSize="small" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(approval)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  <CancelIcon fontSize="small" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onCancel={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={actionType === "approve" ? "Approve Bidder" : "Reject Bidder"}
        message={
          actionType === "approve"
            ? `Are you sure you want to approve ${selectedApproval?.bidderName}'s bid request for "${selectedApproval?.productTitle}"?`
            : `Are you sure you want to reject ${selectedApproval?.bidderName}'s bid request?`
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        cancelText="Cancel"
        loading={isLoading}
      />
    </div>
  );
}

