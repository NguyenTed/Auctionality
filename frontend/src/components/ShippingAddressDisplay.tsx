/**
 * Shipping Address Display Component
 * Read-only display of shipping address information
 */

import type { ShippingAddressDto } from "../features/order/orderService";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

interface ShippingAddressDisplayProps {
  address: ShippingAddressDto;
}

export default function ShippingAddressDisplay({
  address,
}: ShippingAddressDisplayProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <LocalShippingIcon className="text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shipping Address
        </h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-600">Receiver:</span>
          <span className="ml-2 text-gray-900">{address.receiverName}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Phone:</span>
          <span className="ml-2 text-gray-900">{address.phone}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Address:</span>
          <div className="ml-2 text-gray-900">
            <div>{address.addressLine1}</div>
            {address.addressLine2 && <div>{address.addressLine2}</div>}
            <div>
              {address.city}, {address.country} {address.postalCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

