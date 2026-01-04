/**
 * Extra Description Section Component
 * Allows sellers to add additional descriptions to their products
 */

import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "../hooks/useToast";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";

interface ExtraDescription {
  id: number;
  content: string;
  createdAt: string;
}

interface ExtraDescriptionSectionProps {
  productId: number;
  isSeller: boolean;
}

export default function ExtraDescriptionSection({
  productId,
  isSeller,
}: ExtraDescriptionSectionProps) {
  const { success, error: toastError } = useToast();
  const [extraDescriptions, setExtraDescriptions] = useState<ExtraDescription[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExtraDescriptions();
  }, [productId]);

  const loadExtraDescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ExtraDescription[]>(
        `/products/${productId}/descriptions`
      );
      setExtraDescriptions(response.data);
    } catch (err: any) {
      console.error("Failed to load extra descriptions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDescription = async () => {
    const plainText = newDescription.replace(/<[^>]*>/g, "").trim();
    if (!plainText || plainText.length < 10) {
      toastError("Description must be at least 10 characters");
      return;
    }
    if (plainText.length > 10000) {
      toastError("Description must not exceed 10000 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post(`/products/${productId}/descriptions`, {
        content: newDescription,
      });
      success("Extra description added successfully!");
      setNewDescription("");
      setShowAddForm(false);
      loadExtraDescriptions();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to add extra description";
      toastError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DescriptionIcon className="text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Information
          </h3>
        </div>
        {isSeller && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <AddIcon fontSize="small" />
            Add Information
          </button>
        )}
      </div>

      {showAddForm && isSeller && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Description
          </label>
          <RichTextEditor
            value={newDescription}
            onChange={setNewDescription}
            placeholder="Add additional information about your product..."
            style={{ minHeight: "150px" }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {newDescription.replace(/<[^>]*>/g, "").length}/10000 characters
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddDescription}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Description"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewDescription("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {extraDescriptions.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No additional information available.
        </p>
      ) : (
        <div className="space-y-4">
          {extraDescriptions.map((desc, index) => (
            <div
              key={desc.id}
              className="border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  Update #{index + 1} • {formatDate(desc.createdAt)}
                </span>
              </div>
              <div
                className="text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: desc.content }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

