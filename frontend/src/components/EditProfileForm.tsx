/**
 * Edit Profile Form Component
 * Form for editing user profile information
 */

import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { setUser } from "../features/auth/authSlice";
import {
  userService,
  type UpdateProfileRequest,
} from "../features/user/userService";
import { useToast } from "../hooks/useToast";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface EditProfileFormProps {
  user: {
    email: string;
    fullName: string;
    phoneNumber?: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({
  user: initialUser,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    email: initialUser.email,
    fullName: initialUser.fullName,
    phoneNumber: initialUser.phoneNumber || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    phoneNumber?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email must be valid";
    }

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be less than 100 characters";
    }

    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = "Phone number must be less than 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await userService.updateProfile(formData);
      dispatch(setUser(updatedUser as any));
      success("Profile updated successfully!");
      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to update profile";
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => {
            setFormData({ ...formData, phoneNumber: e.target.value });
            if (errors.phoneNumber) {
              setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          maxLength={20}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <SaveIcon fontSize="small" />
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <CancelIcon fontSize="small" />
          Cancel
        </button>
      </div>
    </form>
  );
}
