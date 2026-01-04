/**
 * ChatWindow Component
 * Chat interface for order-related conversations
 */

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectUser } from "../features/auth/authSlice";
import {
  createThreadAsync,
  fetchMessagesAsync,
  sendMessageAsync,
  selectChatMessages,
  selectChatLoading,
  selectChatSending,
  selectChatError,
  selectChatThread,
} from "../features/chat/chatSlice";
import { useToast } from "../hooks/useToast";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

interface ChatWindowProps {
  orderId: number;
  buyerId: number;
  sellerId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({
  orderId,
  buyerId,
  sellerId,
  isOpen,
  onClose,
}: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const thread = useAppSelector(selectChatThread(orderId));
  const messages = useAppSelector(selectChatMessages(thread?.id || 0));
  const isLoading = useAppSelector(selectChatLoading);
  const isSending = useAppSelector(selectChatSending);
  const error = useAppSelector(selectChatError);
  const { error: showError } = useToast();

  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      // Create or get thread
      dispatch(createThreadAsync({ orderId, buyerId, sellerId }));
    }
  }, [isOpen, orderId, buyerId, sellerId, dispatch]);

  useEffect(() => {
    if (thread?.id && isOpen) {
      dispatch(fetchMessagesAsync(thread.id));
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        dispatch(fetchMessagesAsync(thread.id));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [thread?.id, isOpen, dispatch]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || isSending) return;

    try {
      await dispatch(
        sendMessageAsync({ orderId, content: messageContent.trim() })
      ).unwrap();
      setMessageContent("");
      // Refresh messages
      if (thread?.id) {
        dispatch(fetchMessagesAsync(thread.id));
      }
    } catch (err) {
      // Error already handled by slice
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary text-white rounded-t-lg">
        <div>
          <h3 className="font-semibold">Chat</h3>
          <p className="text-xs text-white/80">Order #{orderId}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close chat"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? "bg-primary text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || isSending}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}
