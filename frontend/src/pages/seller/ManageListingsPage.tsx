/**
 * Manage Listings Page
 * Seller page for viewing and managing their product listings
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchMyProductsAsync,
  deleteProductAsync,
  selectMyProducts,
  selectSellerLoading,
  selectSellerPagination,
} from "../../features/seller/sellerSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import ConfirmDialog from "../../components/ConfirmDialog";
import type { Product } from "../../interfaces/Product";

export default function ManageListingsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectMyProducts);
  const isLoading = useAppSelector(selectSellerLoading);
  const pagination = useAppSelector(selectSellerPagination);
  const { toasts, success, error: toastError, removeToast } = useToast();

  const [page, setPage] = useState(1);
  const size = 10;
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    dispatch(fetchMyProductsAsync({ page, size }));
  }, [dispatch, page]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const result = await dispatch(deleteProductAsync(productToDelete.id));
      if (deleteProductAsync.fulfilled.match(result)) {
        success(`Product "${productToDelete.title}" deleted successfully`);
        dispatch(fetchMyProductsAsync({ page, size }));
      } else {
        toastError(result.payload as string || "Failed to delete product");
      }
      setProductToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "€0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span>;
      case "ENDED":
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Ended</span>;
      case "SUSPENDED":
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Suspended</span>;
      case "REMOVED":
        return <span className="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Removed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <InventoryIcon className="text-4xl text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
        </div>
        <Link
          to="/seller/listings/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <AddIcon className="mr-2" /> Create New Listing
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <div className="flex gap-2">
            {["ALL", "ACTIVE", "ENDED", "SUSPENDED", "REMOVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading listings...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <InventoryIcon className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">You haven't created any listings yet</p>
          <Link
            to="/seller/listings/create"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products
                    .filter((p) => statusFilter === "ALL" || p.status === statusFilter)
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images.find((img) => img.isThumbnail)?.url || product.images[0].url}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <Link
                              to={`/products/${product.id}`}
                              className="font-medium text-gray-900 hover:text-primary transition-colors"
                            >
                              {product.title}
                            </Link>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {product.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.category?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(product.currentPrice || product.startPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.bidCount || 0}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.endTime
                          ? new Date(product.endTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <EditIcon fontSize="small" />
                          </Link>
                          {(product.status === "ACTIVE" && (product.bidCount || 0) === 0) && (
                            <Link
                              to={`/seller/listings/${product.id}/edit`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <EditIcon fontSize="small" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {pagination.page * pagination.size - pagination.size + 1} to{" "}
                  {Math.min(pagination.page * pagination.size, pagination.totalItems)} of{" "}
                  {pagination.totalItems} products
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
                    disabled={page * size >= (pagination.totalItems || 0)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
      />
    </div>
  );
}

