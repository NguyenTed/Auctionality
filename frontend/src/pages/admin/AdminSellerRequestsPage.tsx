/**
 * Admin Seller Requests Page
 * Approve/reject seller upgrade requests
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchSellerUpgradeRequestsAsync,
  approveSellerUpgradeRequestAsync,
  rejectSellerUpgradeRequestAsync,
  selectSellerUpgradeRequests,
  selectAdminLoading,
} from "../../features/admin/adminSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function AdminSellerRequestsPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectSellerUpgradeRequests);
  const isLoading = useAppSelector(selectAdminLoading);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    dispatch(fetchSellerUpgradeRequestsAsync());
  }, [dispatch]);

  const handleApprove = async (id: number) => {
    try {
      await dispatch(approveSellerUpgradeRequestAsync(id)).unwrap();
      success("Seller upgrade request approved");
      dispatch(fetchSellerUpgradeRequestsAsync());
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to approve request");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this seller upgrade request?")) return;
    try {
      await dispatch(rejectSellerUpgradeRequestAsync(id)).unwrap();
      success("Seller upgrade request rejected");
      dispatch(fetchSellerUpgradeRequestsAsync());
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to reject request");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <UpgradeIcon className="text-4xl text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Seller Upgrade Requests</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <UpgradeIcon className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No pending seller upgrade requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  User ID: {request.userId}
                </h3>
                <p className="text-sm text-gray-600">Email: {request.userEmail}</p>
                <p className="text-sm text-gray-600">Name: {request.userName}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-500">
                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircleIcon />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <CancelIcon />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

