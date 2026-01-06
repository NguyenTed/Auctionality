/**
 * Order Completion Page
 * Complete order flow: payment, shipping address, shipment, delivery
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectUser } from "../../features/auth/authSlice";
import {
  orderService,
  type OrderDto,
  type ShippingAddressDto,
  type ShipmentDto,
} from "../../features/order/orderService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import ShippingAddressForm from "../../components/ShippingAddressForm";
import ShippingAddressDisplay from "../../components/ShippingAddressDisplay";
import ShipmentDisplay from "../../components/ShipmentDisplay";
import ChatWindow from "../../components/ChatWindow";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MessageIcon from "@mui/icons-material/Message";
import { formatUSD, convertUSDToVND, formatVND } from "../../utils/currencyUtils";

export default function OrderCompletionPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { toasts, success, error, removeToast } = useToast();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressDto | null>(null);
  const [shipment, setShipment] = useState<ShipmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setIsLoading(true);
      if (!orderId) {
        error("Order ID is required");
        navigate("/orders");
        return;
      }

      // Fetch order by ID
      const fetchedOrder = await orderService.getOrderById(parseInt(orderId));
      setOrder(fetchedOrder);

      // Try to load shipping address
      try {
        const address = await orderService.getShippingAddress(fetchedOrder.id);
        setShippingAddress(address);
      } catch (err) {
        // Shipping address not found, that's okay
        setShippingAddress(null);
      }

      // Try to load shipment
      try {
        const shipmentData = await orderService.getShipment(fetchedOrder.id);
        setShipment(shipmentData);
      } catch (err) {
        // Shipment not found, that's okay
        setShipment(null);
      }
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to load order");
      navigate("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    
    try {
      setIsSubmitting(true);
      // Navigate to payment page which will fetch payment URL
      navigate(`/payment/${order.product.id}`);
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingAddressSubmit = async (data: any) => {
    if (!order) return;

    try {
      setIsSubmitting(true);
      await orderService.createShippingAddress(order.id, data);
      success("Shipping address saved successfully!");
      await loadOrderData();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to save shipping address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;

    try {
      setIsSubmitting(true);
      await orderService.shipOrder(order.id);
      success("Order marked as shipped!");
      // Reload order data to get updated status and shipment
      await loadOrderData();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to ship order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      setIsSubmitting(true);
      await orderService.confirmDelivery(order.id);
      success("Delivery confirmed!");
      await loadOrderData();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Order not found</p>
          <Link to="/orders" className="text-primary hover:text-primary/80 font-medium">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyer.id;
  const isSeller = user?.id === order.seller.id;
  const productImage = order.product.images?.[0]?.url;
  const vndAmount = convertUSDToVND(order.finalPrice);

  const getStatusInfo = () => {
    switch (order.status) {
      case "PENDING":
        return {
          icon: <PaymentIcon className="text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-700",
          message: "Payment pending",
        };
      case "PAID":
        return {
          icon: <CheckCircleIcon className="text-green-500" />,
          color: "bg-green-100 text-green-700",
          message: "Payment received",
        };
      case "CONFIRMED":
        return {
          icon: <InventoryIcon className="text-blue-500" />,
          color: "bg-blue-100 text-blue-700",
          message: "Order confirmed",
        };
      case "SHIPPING":
        return {
          icon: <LocalShippingIcon className="text-orange-500" />,
          color: "bg-orange-100 text-orange-700",
          message: "Order in transit",
        };
      case "DELIVERED":
        return {
          icon: <CheckCircleIcon className="text-green-600" />,
          color: "bg-green-100 text-green-700",
          message: "Order delivered",
        };
      case "COMPLETED":
        return {
          icon: <CheckCircleIcon className="text-green-600" />,
          color: "bg-green-100 text-green-700",
          message: "Order completed",
        };
      default:
        return {
          icon: <InventoryIcon className="text-gray-500" />,
          color: "bg-gray-100 text-gray-700",
          message: order.status,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.id}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.message}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="shrink-0">
              {productImage ? (
                <img
                  src={productImage}
                  alt={order.product.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <InventoryIcon className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {order.product.title}
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {formatUSD(order.finalPrice)} ({formatVND(vndAmount)})
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    {isBuyer ? "Seller:" : "Buyer:"}
                  </span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {isBuyer ? order.seller.fullName : order.buyer.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          {/* Payment Section - Buyer only, PENDING status */}
          {isBuyer && order.status === "PENDING" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complete Payment
              </h3>
              <p className="text-gray-600 mb-4">
                Please complete your payment to proceed with the order.
              </p>
              <button
                onClick={handlePayNow}
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PaymentIcon />
                Pay Now ({formatVND(vndAmount)})
              </button>
            </div>
          )}

          {/* Shipping Address Section - Buyer only, PAID status */}
          {isBuyer && order.status === "PAID" && !shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ShippingAddressForm
                onSubmit={handleShippingAddressSubmit}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Shipping Address Display */}
          {shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ShippingAddressDisplay address={shippingAddress} />
            </div>
          )}

          {/* Shipment Display */}
          {shipment && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ShipmentDisplay shipment={shipment} />
            </div>
          )}

          {/* Ship Order Section - Seller only, PAID status */}
          {isSeller && order.status === "PAID" && shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ship Order
              </h3>
              <p className="text-gray-600 mb-4">
                Mark this order as shipped once you have sent the item.
              </p>
              <button
                onClick={handleShipOrder}
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <LocalShippingIcon />
                Mark as Shipped
              </button>
            </div>
          )}

          {/* Confirm Delivery Section - Buyer only, SHIPPING status */}
          {isBuyer && order.status === "SHIPPING" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delivery
              </h3>
              <p className="text-gray-600 mb-4">
                Please confirm when you have received the item.
              </p>
              <button
                onClick={handleConfirmDelivery}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircleIcon />
                Confirm Delivery
              </button>
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Communication
              </h3>
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <MessageIcon fontSize="small" />
                {showChat ? "Hide Chat" : "Open Chat"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          orderId={order.id}
          buyerId={order.buyer.id}
          sellerId={order.seller.id}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

