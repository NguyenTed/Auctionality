/**
 * Q&A Slice
 * Redux Toolkit slice for Q&A state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import {
  qaService,
  type ProductQuestionDto,
  type ProductAnswerDto,
  type AddQuestionRequest,
  type AddAnswerRequest,
} from "./qaService";

// Define the Q&A state interface
interface QAState {
  questions: Record<number, ProductQuestionDto[]>; // productId -> questions
  answers: Record<number, ProductAnswerDto[]>; // questionId -> answers
  loading: Record<number, boolean>; // productId -> loading state
  error: string | null;
  submittingQuestion: Record<number, boolean>; // productId -> submitting state
  submittingAnswer: Record<number, boolean>; // questionId -> submitting state
}

// Initial state
const initialState: QAState = {
  questions: {},
  answers: {},
  loading: {},
  error: null,
  submittingQuestion: {},
  submittingAnswer: {},
};

// Typed async thunk creator
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

// Async thunks
export const fetchQuestionsByProductIdAsync = createAppAsyncThunk(
  "qa/fetchQuestionsByProductId",
  async (productId: number, { rejectWithValue }) => {
    try {
      const questions = await qaService.getQuestionsByProductId(productId);
      return { productId, questions };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch questions"
      );
    }
  }
);

export const createQuestionAsync = createAppAsyncThunk(
  "qa/createQuestion",
  async (
    { productId, question }: { productId: number; question: AddQuestionRequest },
    { rejectWithValue }
  ) => {
    try {
      const newQuestion = await qaService.createQuestion(productId, question);
      return { productId, question: newQuestion };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create question"
      );
    }
  }
);

export const fetchAnswersByQuestionIdAsync = createAppAsyncThunk(
  "qa/fetchAnswersByQuestionId",
  async (questionId: number, { rejectWithValue }) => {
    try {
      const answers = await qaService.getAnswersByQuestionId(questionId);
      return { questionId, answers };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch answers"
      );
    }
  }
);

export const createAnswerAsync = createAppAsyncThunk(
  "qa/createAnswer",
  async (
    { questionId, answer }: { questionId: number; answer: AddAnswerRequest },
    { rejectWithValue }
  ) => {
    try {
      const newAnswer = await qaService.createAnswer(questionId, answer);
      return { questionId, answer: newAnswer };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create answer"
      );
    }
  }
);

// Slice
const qaSlice = createSlice({
  name: "qa",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch questions
    builder
      .addCase(fetchQuestionsByProductIdAsync.pending, (state, action) => {
        const productId = action.meta.arg;
        state.loading[productId] = true;
        state.error = null;
      })
      .addCase(fetchQuestionsByProductIdAsync.fulfilled, (state, action) => {
        const { productId, questions } = action.payload;
        state.questions[productId] = questions;
        state.loading[productId] = false;
        // Fetch answers for all questions
        questions.forEach((question) => {
          if (!state.answers[question.id]) {
            // Answers will be fetched when needed
          }
        });
      })
      .addCase(fetchQuestionsByProductIdAsync.rejected, (state, action) => {
        const productId = action.meta.arg;
        state.loading[productId] = false;
        state.error = action.payload as string;
      });

    // Create question
    builder
      .addCase(createQuestionAsync.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        state.submittingQuestion[productId] = true;
        state.error = null;
      })
      .addCase(createQuestionAsync.fulfilled, (state, action) => {
        const { productId, question } = action.payload;
        if (!state.questions[productId]) {
          state.questions[productId] = [];
        }
        state.questions[productId].unshift(question);
        state.submittingQuestion[productId] = false;
      })
      .addCase(createQuestionAsync.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        state.submittingQuestion[productId] = false;
        state.error = action.payload as string;
      });

    // Fetch answers
    builder
      .addCase(fetchAnswersByQuestionIdAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAnswersByQuestionIdAsync.fulfilled, (state, action) => {
        const { questionId, answers } = action.payload;
        state.answers[questionId] = answers;
      })
      .addCase(fetchAnswersByQuestionIdAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create answer
    builder
      .addCase(createAnswerAsync.pending, (state, action) => {
        const questionId = action.meta.arg.questionId;
        state.submittingAnswer[questionId] = true;
        state.error = null;
      })
      .addCase(createAnswerAsync.fulfilled, (state, action) => {
        const { questionId, answer } = action.payload;
        if (!state.answers[questionId]) {
          state.answers[questionId] = [];
        }
        state.answers[questionId].push(answer);
        state.submittingAnswer[questionId] = false;
      })
      .addCase(createAnswerAsync.rejected, (state, action) => {
        const questionId = action.meta.arg.questionId;
        state.submittingAnswer[questionId] = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectQuestionsByProductId = (productId: number) => (state: RootState) =>
  state.qa.questions[productId] || [];

export const selectAnswersByQuestionId = (questionId: number) => (state: RootState) =>
  state.qa.answers[questionId] || [];

export const selectQALoading = (productId: number) => (state: RootState) =>
  state.qa.loading[productId] || false;

export const selectSubmittingQuestion = (productId: number) => (state: RootState) =>
  state.qa.submittingQuestion[productId] || false;

export const selectSubmittingAnswer = (questionId: number) => (state: RootState) =>
  state.qa.submittingAnswer[questionId] || false;

export const selectQAError = (state: RootState) => state.qa.error;

// Actions
export const { clearError } = qaSlice.actions;

// Reducer
export default qaSlice.reducer;

