/**
 * Change Password Form Component
 * Form for changing user password
 */

import { useState } from "react";
import { userService } from "../features/user/userService";
import { useToast } from "../hooks/useToast";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface ChangePasswordFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordForm({
  onCancel,
  onSuccess,
}: ChangePasswordFormProps) {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to change password";
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => {
            setFormData({ ...formData, currentPassword: e.target.value });
            if (errors.currentPassword) {
              setErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.currentPassword ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => {
            setFormData({ ...formData, newPassword: e.target.value });
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
            // Also clear confirm password error if passwords now match
            if (errors.confirmPassword && e.target.value === formData.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.newPassword ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 8 characters
        </p>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <SaveIcon fontSize="small" />
          Change Password
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
