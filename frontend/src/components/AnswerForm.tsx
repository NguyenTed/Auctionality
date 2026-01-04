/**
 * Answer Form Component
 * Form for sellers to answer questions
 */

import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { createAnswerAsync, fetchAnswersByQuestionIdAsync } from "../features/qa/qaSlice";
import { useToast } from "../hooks/useToast";
import SendIcon from "@mui/icons-material/Send";

interface AnswerFormProps {
  questionId: number;
  isSubmitting: boolean;
}

export default function AnswerForm({ questionId, isSubmitting }: AnswerFormProps) {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!content.trim()) {
      setValidationError("Answer content is required");
      return;
    }

    if (content.trim().length < 10) {
      setValidationError("Answer must be at least 10 characters");
      return;
    }

    if (content.trim().length > 1000) {
      setValidationError("Answer must be at most 1000 characters");
      return;
    }

    try {
      const result = await dispatch(
        createAnswerAsync({
          questionId,
          answer: { content: content.trim() },
        })
      );

      if (createAnswerAsync.fulfilled.match(result)) {
        success("Answer submitted successfully!");
        setContent("");
        // Refresh answers to show the new answer immediately
        dispatch(fetchAnswersByQuestionIdAsync(questionId));
      } else {
        const errorMessage = result.payload as string || "Failed to submit answer";
        error(errorMessage);
      }
    } catch (err) {
      error("An unexpected error occurred. Please try again.");
      console.error("Failed to submit answer:", err);
    }
  };

  return (
    <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white">
      <h4 className="font-semibold text-sm text-gray-900 mb-2">Answer this question</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setValidationError("");
          }}
          placeholder="Type your answer here (minimum 10 characters)..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm"
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          <div>
            {validationError && (
              <p className="text-xs text-red-600">{validationError}</p>
            )}
            <p className="text-xs text-gray-500">
              {content.length}/1000 characters
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || content.trim().length < 10}
            className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon fontSize="small" />
                Submit Answer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

