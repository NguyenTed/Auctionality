/**
 * Order Management Page
 * Display orders for buyers and sellers with rating functionality
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUser } from "../../features/auth/authSlice";
import {
  fetchOrdersAsync,
  selectOrders,
  selectOrderLoading,
  selectOrderPagination,
} from "../../features/order/orderSlice";
import {
  userService,
  type RatingRequest,
} from "../../features/user/userService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import RatingModal from "../../components/RatingModal";
import ChatWindow from "../../components/ChatWindow";
import type { OrderDto, ShipmentDto } from "../../features/order/orderService";
import { orderService } from "../../features/order/orderService";
import { useNavigate } from "react-router-dom";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RateReviewIcon from "@mui/icons-material/RateReview";
import MessageIcon from "@mui/icons-material/Message";
import PaymentIcon from "@mui/icons-material/Payment";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <InventoryIcon className="text-gray-500" />;
    case "PAID":
    case "CONFIRMED":
      return <CheckCircleIcon className="text-blue-500" />;
    case "SHIPPING":
      return <LocalShippingIcon className="text-orange-500" />;
    case "DELIVERED":
      return <CheckCircleIcon className="text-green-500" />;
    case "COMPLETED":
      return <CheckCircleIcon className="text-green-600" />;
    case "CANCELLED":
    case "REFUNDED":
      return <CancelIcon className="text-red-500" />;
    default:
      return <InventoryIcon className="text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-700";
    case "PAID":
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "SHIPPING":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrderManagementPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrderLoading);
  const pagination = useAppSelector(selectOrderPagination);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toasts, success, error, removeToast } = useToast();

  const tabParam = searchParams.get("tab") as "buyer" | "seller" | null;
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">(
    tabParam === "seller" ? "seller" : "buyer"
  );
  const [page, setPage] = useState(1);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [chatOrderId, setChatOrderId] = useState<number | null>(null);
  const [orderShipments, setOrderShipments] = useState<
    Record<number, ShipmentDto>
  >({});

  useEffect(() => {
    const isSeller = activeTab === "seller";
    dispatch(fetchOrdersAsync({ isSeller, page, size: 10 }));
  }, [dispatch, activeTab, page]);

  // Load shipments for orders that are in SHIPPING or DELIVERED status
  useEffect(() => {
    const loadShipments = async () => {
      const shipments: Record<number, ShipmentDto> = {};
      for (const order of orders) {
        if (
          order.status === "SHIPPING" ||
          order.status === "DELIVERED" ||
          order.status === "COMPLETED"
        ) {
          try {
            const shipment = await orderService.getShipment(order.id);
            shipments[order.id] = shipment;
          } catch (err) {
            // Shipment not found, skip
          }
        }
      }
      setOrderShipments(shipments);
    };

    if (orders.length > 0) {
      loadShipments();
    }
  }, [orders]);

  const handleTabChange = (tab: "buyer" | "seller") => {
    setActiveTab(tab);
    setPage(1);
    setSearchParams({ tab });
  };

  const handleRateClick = (order: OrderDto) => {
    setSelectedOrder(order);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (value: number, comment?: string) => {
    if (!selectedOrder || !user) return;

    try {
      const isBuyer = activeTab === "buyer";
      const ratingRequest: RatingRequest = {
        orderId: selectedOrder.id,
        isBuyer,
        value,
        comment,
      };

      await userService.createRating(ratingRequest);
      success("Rating submitted successfully!");
      setRatingModalOpen(false);
      setSelectedOrder(null);
      // Refresh orders
      dispatch(
        fetchOrdersAsync({ isSeller: activeTab === "seller", page, size: 10 })
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to submit rating";
      error(errorMessage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canRateOrder = (order: OrderDto) => {
    // Can rate if order is DELIVERED or COMPLETED
    return order.status === "DELIVERED" || order.status === "COMPLETED";
  };

  const getTargetUser = (order: OrderDto) => {
    return activeTab === "buyer" ? order.seller : order.buyer;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">View and manage your orders</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange("buyer")}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "buyer"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Orders as Buyer
              </button>
              <button
                onClick={() => handleTabChange("seller")}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "seller"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Orders as Seller
              </button>
            </nav>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <InventoryIcon
                className="mx-auto text-gray-300 mb-4"
                style={{ fontSize: 64 }}
              />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const targetUser = getTargetUser(order);
                const canRate = canRateOrder(order);
                const productImage = order.product.images?.[0]?.url;

                return (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="shrink-0">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={order.product.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <InventoryIcon className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {order.product.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Order #{order.id} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {formatPrice(order.finalPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {activeTab === "buyer" ? "Seller:" : "Buyer:"}
                            </span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {targetUser.fullName}
                            </span>
                          </div>
                        </div>

                        {/* Shipment Information */}
                        {orderShipments[order.id] && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <LocalShippingIcon
                                className="text-blue-600"
                                fontSize="small"
                              />
                              <span className="text-sm font-semibold text-blue-900">
                                Shipment Tracking
                              </span>
                            </div>
                            <div className="text-xs text-blue-800 space-y-1">
                              <div>
                                <span className="font-medium">Carrier:</span>{" "}
                                {orderShipments[order.id].carrier}
                              </div>
                              <div>
                                <span className="font-medium">Tracking:</span>{" "}
                                <span className="font-mono">
                                  {orderShipments[order.id].trackingNumber}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {/* Pay Now button for buyers with pending orders */}
                          {activeTab === "buyer" &&
                            order.status === "PENDING" && (
                              <button
                                onClick={() =>
                                  navigate(`/orders/${order.id}/complete`)
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                              >
                                <PaymentIcon fontSize="small" />
                                Pay Now
                              </button>
                            )}
                          {/* View/Complete Order button */}
                          {(order.status !== "PENDING" ||
                            activeTab === "seller") && (
                            <button
                              onClick={() =>
                                navigate(`/orders/${order.id}/complete`)
                              }
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              View Order
                            </button>
                          )}
                          <button
                            onClick={() => setChatOrderId(order.id)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <MessageIcon fontSize="small" />
                            Chat
                          </button>
                          {canRate && (
                            <button
                              onClick={() => handleRateClick(order)}
                              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <RateReviewIcon fontSize="small" />
                              Rate {activeTab === "buyer" ? "Seller" : "Buyer"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {selectedOrder && (
        <RatingModal
          open={ratingModalOpen}
          orderId={selectedOrder.id}
          isBuyer={activeTab === "buyer"}
          targetUserName={getTargetUser(selectedOrder).fullName}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleRatingSubmit}
          loading={false}
        />
      )}

      {/* Chat Window */}
      {chatOrderId &&
        (() => {
          const order = orders.find((o) => o.id === chatOrderId);
          if (!order) return null;
          return (
            <ChatWindow
              orderId={order.id}
              buyerId={order.buyer.id}
              sellerId={order.seller.id}
              isOpen={chatOrderId !== null}
              onClose={() => setChatOrderId(null)}
            />
          );
        })()}
    </div>
  );
}
