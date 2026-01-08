/**
 * Shipping Address Form Component
 * Form for creating/updating shipping address
 */

import { useState } from "react";
import type { ShippingAddressRequest } from "../features/order/orderService";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

interface ShippingAddressFormProps {
  onSubmit: (data: ShippingAddressRequest) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<ShippingAddressRequest>;
}

export default function ShippingAddressForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ShippingAddressFormProps) {
  const [formData, setFormData] = useState<ShippingAddressRequest>({
    receiverName: initialData?.receiverName || "",
    phone: initialData?.phone || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    country: initialData?.country || "",
    postalCode: initialData?.postalCode || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddressRequest, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddressRequest, string>> = {};

    if (!formData.receiverName.trim()) {
      newErrors.receiverName = "Receiver name is required";
    } else if (formData.receiverName.length > 100) {
      newErrors.receiverName = "Receiver name must be at most 100 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{9,12}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain 9 to 12 digits";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    } else if (formData.addressLine1.length > 255) {
      newErrors.addressLine1 = "Address line 1 must be at most 255 characters";
    }

    if (formData.addressLine2 && formData.addressLine2.length > 255) {
      newErrors.addressLine2 = "Address line 2 must be at most 255 characters";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.length > 100) {
      newErrors.city = "City must be at most 100 characters";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.length > 100) {
      newErrors.country = "Country must be at most 100 characters";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (formData.postalCode.length > 20) {
      newErrors.postalCode = "Postal code must be at most 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof ShippingAddressRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      setSubmitError(null);
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.error || "Failed to save shipping address"
      );
    }
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <LocalShippingIcon className="text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shipping Address
        </h3>
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Receiver Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="receiverName"
          value={formData.receiverName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        {errors.receiverName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.receiverName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-sm text-red-600">
            {errors.addressLine1}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2 || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        {errors.addressLine2 && (
          <p className="mt-1 text-sm text-red-600">
            {errors.addressLine2}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">
              {errors.country}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        {errors.postalCode && (
          <p className="mt-1 text-sm text-red-600">
            {errors.postalCode}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Saving..." : "Save Shipping Address"}
      </button>
    </form>
  );
}

