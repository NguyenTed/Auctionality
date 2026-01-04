/**
 * Q&A Service
 * Axios API calls for question and answer feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface AddQuestionRequest {
  content: string;
}

export interface AddAnswerRequest {
  content: string;
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ProductQuestionDto {
  id: number;
  content: string;
  createdAt: string;
  asker: UserDto;
  productId: number;
}

export interface ProductAnswerDto {
  id: number;
  questionId: number;
  responderId: number;
  content: string;
  createdAt: string;
}

export const qaService = {
  getQuestionsByProductId: async (productId: number): Promise<ProductQuestionDto[]> => {
    const response = await axiosInstance.get<ProductQuestionDto[]>(
      `/questions/products/${productId}`
    );
    return response.data;
  },

  createQuestion: async (
    productId: number,
    question: AddQuestionRequest
  ): Promise<ProductQuestionDto> => {
    const response = await axiosInstance.post<ProductQuestionDto>(
      `/questions?productId=${productId}`,
      question
    );
    return response.data;
  },

  getAnswersByQuestionId: async (questionId: number): Promise<ProductAnswerDto[]> => {
    const response = await axiosInstance.get<ProductAnswerDto[]>(
      `/questions/${questionId}/answers`
    );
    return response.data;
  },

  createAnswer: async (
    questionId: number,
    answer: AddAnswerRequest
  ): Promise<ProductAnswerDto> => {
    const response = await axiosInstance.post<ProductAnswerDto>(
      `/questions/${questionId}/answers`,
      answer
    );
    return response.data;
  },
};

