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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={20}
        />
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
