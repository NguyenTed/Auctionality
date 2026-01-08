/**
 * Admin Products Page
 * Manage products (view, remove, take down)
 */

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAdminProductsAsync,
  removeProductAsync,
  takeDownProductAsync,
  selectAdminProducts,
  selectAdminLoading,
} from "../../features/admin/adminSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import InventoryIcon from "@mui/icons-material/Inventory";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import { Link } from "react-router-dom";

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAdminProducts);
  const isLoading = useAppSelector(selectAdminLoading);
  const { toasts, success, error, removeToast } = useToast();

  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    dispatch(fetchAdminProductsAsync({ page, size }));
  }, [dispatch, page]);

  const handleRemove = async (id: number) => {
    if (!confirm("Are you sure you want to permanently remove this product?")) return;
    try {
      await dispatch(removeProductAsync(id)).unwrap();
      success("Product removed successfully");
      dispatch(fetchAdminProductsAsync({ page, size }));
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to remove product");
    }
  };

  const handleTakeDown = async (id: number) => {
    if (!confirm("Are you sure you want to take down this product?")) return;
    try {
      await dispatch(takeDownProductAsync(id)).unwrap();
      success("Product taken down successfully");
      dispatch(fetchAdminProductsAsync({ page, size }));
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to take down product");
    }
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <InventoryIcon className="text-4xl text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products?.items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : product.status === "REMOVED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatPrice(product.currentPrice || product.startPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.sellerId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTakeDown(product.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Take Down"
                      >
                        <BlockIcon />
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {products?.pagination && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {products.pagination.page * products.pagination.size - products.pagination.size + 1} to{" "}
                {Math.min(products.pagination.page * products.pagination.size, products.pagination.totalItems)} of{" "}
                {products.pagination.totalItems} products
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
                  disabled={page * size >= (products.pagination?.totalItems || 0)}
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

