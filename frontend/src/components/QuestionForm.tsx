/**
 * Question Form Component
 * Form for asking a question about a product
 */

import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { createQuestionAsync } from "../features/qa/qaSlice";
import { useToast } from "../hooks/useToast";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";

interface QuestionFormProps {
  productId: number;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function QuestionForm({
  productId,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionFormProps) {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!content.trim()) {
      setValidationError("Question content is required");
      return;
    }

    if (content.trim().length < 10) {
      setValidationError("Question must be at least 10 characters");
      return;
    }

    if (content.trim().length > 1000) {
      setValidationError("Question must be at most 1000 characters");
      return;
    }

    try {
      const result = await dispatch(
        createQuestionAsync({
          productId,
          question: { content: content.trim() },
        })
      );

      if (createQuestionAsync.fulfilled.match(result)) {
        success("Question submitted successfully!");
        setContent("");
        onSubmit();
      } else {
        const errorMessage = result.payload as string || "Failed to submit question";
        error(errorMessage);
      }
    } catch (err) {
      error("An unexpected error occurred. Please try again.");
      console.error("Failed to submit question:", err);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-3">Ask a Question</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setValidationError("");
            }}
            placeholder="Type your question here (minimum 10 characters)..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            disabled={isSubmitting}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {content.length}/1000 characters
            </p>
            {validationError && (
              <p className="text-xs text-red-600">{validationError}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || content.trim().length < 10}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon fontSize="small" />
                Submit Question
              </>
            )}
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
    </div>
  );
}

