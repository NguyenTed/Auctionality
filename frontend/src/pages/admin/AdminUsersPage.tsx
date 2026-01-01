/**
 * Admin Users Page
 * Manage users (view, update status, delete)
 */

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAdminUsersAsync,
  updateUserStatusAsync,
  deleteUserAsync,
  selectAdminUsers,
  selectAdminLoading,
} from "../../features/admin/adminSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import PeopleIcon from "@mui/icons-material/People";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const isLoading = useAppSelector(selectAdminLoading);
  const { toasts, success, error, removeToast } = useToast();

  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    dispatch(fetchAdminUsersAsync({ page, size }));
  }, [dispatch, page]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await dispatch(updateUserStatusAsync({ id, status })).unwrap();
      success("User status updated successfully");
      dispatch(fetchAdminUsersAsync({ page, size }));
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to update user status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone."))
      return;
    try {
      await dispatch(deleteUserAsync(id)).unwrap();
      success("User deleted successfully");
      dispatch(fetchAdminUsersAsync({ page, size }));
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <PeopleIcon className="text-4xl text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.fullName || "N/A"}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isEmailVerified ? (
                      <CheckCircleIcon className="text-green-500" />
                    ) : (
                      <CancelIcon className="text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.ratingPercent !== null ? `${user.ratingPercent}%` : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {users?.pagination && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {users.pagination.page * users.pagination.size - users.pagination.size + 1} to{" "}
                {Math.min(users.pagination.page * users.pagination.size, users.pagination.totalItems)} of{" "}
                {users.pagination.totalItems} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * size >= (users.pagination?.totalItems || 0)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

