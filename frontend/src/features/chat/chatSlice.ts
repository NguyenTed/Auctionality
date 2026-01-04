/**
 * Chat Slice
 * Redux Toolkit slice for chat state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import {
  chatService,
  type ChatThread,
  type ChatMessage,
} from "./chatService";

interface ChatState {
  threads: Record<number, ChatThread>; // orderId -> thread
  messages: Record<number, ChatMessage[]>; // threadId -> messages
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  threads: {},
  messages: {},
  isLoading: false,
  isSending: false,
  error: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const createThreadAsync = createAppAsyncThunk(
  "chat/createThread",
  async (
    {
      orderId,
      buyerId,
      sellerId,
    }: { orderId: number; buyerId: number; sellerId: number },
    { rejectWithValue }
  ) => {
    try {
      const thread = await chatService.createThread(orderId, buyerId, sellerId);
      // Store thread by orderId for easy lookup
      return { orderId, thread };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create chat thread"
      );
    }
  }
);

export const fetchMessagesAsync = createAppAsyncThunk(
  "chat/fetchMessages",
  async (threadId: number, { rejectWithValue }) => {
    try {
      const messages = await chatService.getMessages(threadId);
      return { threadId, messages };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessageAsync = createAppAsyncThunk(
  "chat/sendMessage",
  async (
    { orderId, content }: { orderId: number; content: string },
    { rejectWithValue }
  ) => {
    try {
      const message = await chatService.sendMessage(orderId, content);
      // Find threadId from orderId - we'll need to get it from the thread
      // For now, we'll store messages by orderId
      return { orderId, message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to send message"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action: { payload: { threadId: number; message: ChatMessage } }) => {
      const { threadId, message } = action.payload;
      if (!state.messages[threadId]) {
        state.messages[threadId] = [];
      }
      state.messages[threadId].push(message);
    },
  },
  extraReducers: (builder) => {
    // Create Thread
    builder
      .addCase(createThreadAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createThreadAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { orderId, thread } = action.payload;
        state.threads[orderId] = thread;
        state.error = null;
      })
      .addCase(createThreadAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Messages
    builder
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { threadId, messages } = action.payload;
        state.messages[threadId] = messages;
        state.error = null;
      })
      .addCase(fetchMessagesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send Message
    builder
      .addCase(sendMessageAsync.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.isSending = false;
        const { message } = action.payload;
        // Find threadId from the message
        const threadId = message.threadId;
        if (!state.messages[threadId]) {
          state.messages[threadId] = [];
        }
        state.messages[threadId].push(message);
        state.error = null;
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addMessage } = chatSlice.actions;

// Memoized empty array to avoid creating new references
const EMPTY_ARRAY: ChatMessage[] = [];

export const selectChatThread = (orderId: number) => (state: RootState) =>
  state.chat.threads[orderId] || null;
export const selectChatMessages = (threadId: number) => (state: RootState) =>
  state.chat.messages[threadId] || EMPTY_ARRAY;
export const selectChatLoading = (state: RootState) => state.chat.isLoading;
export const selectChatSending = (state: RootState) => state.chat.isSending;
export const selectChatError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;
