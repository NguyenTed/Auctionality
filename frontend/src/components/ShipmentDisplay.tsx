/**
 * Shipment Display Component
 * Read-only display of shipment information
 */

import type { ShipmentDto } from "../features/order/orderService";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ShipmentDisplayProps {
  shipment: ShipmentDto;
}

export default function ShipmentDisplay({ shipment }: ShipmentDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <LocalShippingIcon className="text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shipment Information
        </h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-600">Carrier:</span>
          <span className="ml-2 text-gray-900">{shipment.carrier}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Tracking Number:</span>
          <span className="ml-2 text-gray-900 font-mono">
            {shipment.trackingNumber}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Shipped At:</span>
          <span className="ml-2 text-gray-900">
            {formatDate(shipment.shippedAt)}
          </span>
        </div>

        {shipment.deliveredAt && (
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="text-green-500" fontSize="small" />
            <div>
              <span className="font-medium text-gray-600">Delivered At:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(shipment.deliveredAt)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

