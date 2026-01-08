/**
 * Q&A Section Component
 * Displays questions and answers for a product
 */

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchQuestionsByProductIdAsync,
  fetchAnswersByQuestionIdAsync,
  selectQuestionsByProductId,
  selectAnswersByQuestionId,
  selectQALoading,
  selectSubmittingQuestion,
  selectSubmittingAnswer,
} from "../features/qa/qaSlice";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSlice";
import type { ProductQuestionDto } from "../features/qa/qaService";
import QuestionForm from "./QuestionForm";
import AnswerForm from "./AnswerForm";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface QASectionProps {
  productId: number;
  sellerId?: number;
}

export default function QASection({ productId, sellerId }: QASectionProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectUser);
  const questions = useAppSelector(selectQuestionsByProductId(productId));
  const loading = useAppSelector(selectQALoading(productId));
  const submittingQuestion = useAppSelector(
    selectSubmittingQuestion(productId)
  );

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Check if current user is the seller
  const isSeller =
    isAuthenticated && currentUser && sellerId === currentUser.id;

  // Fetch questions on mount
  useEffect(() => {
    dispatch(fetchQuestionsByProductIdAsync(productId));
  }, [dispatch, productId]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleQuestionSubmitted = () => {
    setShowQuestionForm(false);
    // Questions will be refreshed automatically via the slice
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <QuestionAnswerIcon className="text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">
          Questions & Answers
        </h2>
      </div>

      {/* Ask Question Button */}
      {isAuthenticated && !isSeller && (
        <div className="mb-6">
          {!showQuestionForm ? (
            <button
              onClick={() => setShowQuestionForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer"
            >
              Ask a Question
            </button>
          ) : (
            <QuestionForm
              productId={productId}
              onSubmit={handleQuestionSubmitted}
              onCancel={() => setShowQuestionForm(false)}
              isSubmitting={submittingQuestion}
            />
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      )}

      {/* No Questions */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-8">
          <QuestionAnswerIcon
            className="text-gray-400 mx-auto mb-3"
            style={{ fontSize: 48 }}
          />
          <p className="text-gray-500">
            {isAuthenticated && !isSeller
              ? "No questions yet. Be the first to ask!"
              : "No questions yet."}
          </p>
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              isSeller={isSeller ?? false}
              sellerId={sellerId}
              isExpanded={expandedQuestions.has(question.id)}
              onToggle={() => toggleQuestion(question.id)}
              onExpand={() => {
                if (!expandedQuestions.has(question.id)) {
                  dispatch(fetchAnswersByQuestionIdAsync(question.id));
                }
                toggleQuestion(question.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Question Item Component
interface QuestionItemProps {
  question: ProductQuestionDto;
  isSeller: boolean;
  sellerId?: number;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

function QuestionItem({
  question,
  isSeller,
  sellerId,
  isExpanded,
  onToggle,
  onExpand,
}: QuestionItemProps) {
  const dispatch = useAppDispatch();
  const answers = useAppSelector(selectAnswersByQuestionId(question.id));
  const submittingAnswer = useAppSelector(selectSubmittingAnswer(question.id));

  useEffect(() => {
    if (isExpanded) {
      dispatch(fetchAnswersByQuestionIdAsync(question.id));
    }
  }, [dispatch, question.id, isExpanded]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PersonIcon className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">
              {question.asker.fullName || question.asker.email}
              {isSeller && question.asker.id === sellerId && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Seller
                </span>
              )}
            </p>
            <span className="text-xs text-gray-500">
              {formatDate(question.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{question.content}</p>

          {/* Answers Section */}
          {isExpanded && (
            <div className="mt-4 space-y-3">
              {answers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No answers yet.</p>
              ) : (
                answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="bg-gray-50 rounded-lg p-3 border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {isSeller && answer.responderId === sellerId
                          ? "Seller"
                          : "Response"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(answer.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{answer.content}</p>
                  </div>
                ))
              )}

              {/* Answer Form (for seller) */}
              {isSeller && (
                <AnswerForm
                  questionId={question.id}
                  isSubmitting={submittingAnswer}
                />
              )}
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={isExpanded ? onToggle : onExpand}
            className="mt-2 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ExpandLessIcon fontSize="small" />
                Hide {answers.length > 0 ? `${answers.length} ` : ""}Answer
                {answers.length !== 1 ? "s" : ""}
              </>
            ) : (
              <>
                <ExpandMoreIcon fontSize="small" />
                View {answers.length > 0 ? `${answers.length} ` : ""}Answer
                {answers.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
