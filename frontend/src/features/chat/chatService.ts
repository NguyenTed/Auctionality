/**
 * Chat Service
 * Axios API calls for chat feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface ChatThread {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  threadId: number;
  senderId: number;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageRequest {
  threadId: number; // This is actually orderId - backend will resolve thread
  content: string;
  messageType?: string;
}

export const chatService = {
  createThread: async (
    orderId: number,
    buyerId: number,
    sellerId: number
  ): Promise<ChatThread> => {
    const response = await axiosInstance.post<ChatThread>(
      `/chat/thread?orderId=${orderId}&buyerId=${buyerId}&sellerId=${sellerId}`
    );
    return response.data;
  },

  getMessages: async (threadId: number): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get<ChatMessage[]>(
      `/chat/messages/${threadId}`
    );
    return response.data;
  },

  sendMessage: async (orderId: number, content: string): Promise<ChatMessage> => {
    const response = await axiosInstance.post<ChatMessage>(
      `/chat/messages`,
      { threadId: orderId, content } // threadId is actually orderId
    );
    return response.data;
  },
};
