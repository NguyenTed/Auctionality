/**
 * ChatWindow Component
 * Chat interface for order-related conversations
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectUser } from "../features/auth/authSlice";
import {
  createThreadAsync,
  fetchMessagesAsync,
  selectChatMessages,
  selectChatLoading,
  selectChatError,
  selectChatThread,
  addMessage,
} from "../features/chat/chatSlice";
import { useToast } from "../hooks/useToast";
import {
  connectWebSocket,
  subscribeToThread,
  sendMessageViaWebSocket,
  getStompClient,
} from "../utils/websocket";
import type { StompSubscription } from "@stomp/stompjs";
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
  // FIX: Only use thread.id if it exists, otherwise use 0 (which will return empty array)
  // This ensures messages from different threads don't mix
  const allMessages = useAppSelector(selectChatMessages(thread?.id ?? 0));
  // Only show messages if thread exists and matches - memoized to avoid re-renders
  const messages = useMemo(() => {
    return thread?.id ? allMessages : [];
  }, [thread?.id, allMessages]);
  const isLoading = useAppSelector(selectChatLoading);
  const error = useAppSelector(selectChatError);
  const { error: showError } = useToast();

  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const connectionStateRef = useRef(false);

  // Initialize thread when chat opens
  useEffect(() => {
    if (isOpen && orderId) {
      dispatch(createThreadAsync({ orderId, buyerId, sellerId }));
    }
  }, [isOpen, orderId, buyerId, sellerId, dispatch]);

  // Connect WebSocket and set up subscriptions
  useEffect(() => {
    if (!isOpen || !thread?.id) {
      // Don't set state here - use a separate effect to handle connection state
      return;
    }

    let isMounted = true;
    console.log("ChatWindow: Setting up WebSocket for thread", thread.id);

    // Check if already connected
    const existingClient = getStompClient();
    if (existingClient?.connected) {
      console.log(
        "ChatWindow: WebSocket already connected, setting up subscriptions"
      );
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        if (!connectionStateRef.current) {
          connectionStateRef.current = true;
          setIsConnected(true);
        }
      }, 0);
      // Fetch initial messages
      dispatch(fetchMessagesAsync(thread.id));
      // Subscribe to this order's messages (using orderId, not threadId)
      const subscription = subscribeToThread(orderId, (message) => {
        console.log("ChatWindow: Received message via WebSocket", message);
        dispatch(addMessage({ threadId: thread.id, message }));
      });
      if (subscription) {
        subscriptionRef.current = subscription;
      }
    } else {
      // Connect WebSocket
      const client = connectWebSocket(
        () => {
          if (!isMounted) {
            console.log(
              "ChatWindow: Component unmounted, skipping WebSocket setup"
            );
            return;
          }

          console.log(
            "ChatWindow: WebSocket connected, setting up subscriptions for thread",
            thread.id
          );
          if (!connectionStateRef.current) {
            connectionStateRef.current = true;
            setIsConnected(true);
          }

          // On connect: fetch initial messages and subscribe to order
          dispatch(fetchMessagesAsync(thread.id));

          // Subscribe to this order's messages (using orderId, not threadId)
          const subscription = subscribeToThread(orderId, (message) => {
            console.log("ChatWindow: Received message via WebSocket", message);
            // Add incoming message to Redux store
            dispatch(addMessage({ threadId: thread.id, message }));
          });

          if (subscription) {
            subscriptionRef.current = subscription;
            console.log("ChatWindow: Subscribed to thread", thread.id);
          } else {
            console.error(
              "ChatWindow: Failed to subscribe to thread",
              thread.id
            );
            if (connectionStateRef.current) {
              connectionStateRef.current = false;
              setIsConnected(false);
            }
          }
        },
        (error) => {
          if (!isMounted) return;
          console.error("ChatWindow: WebSocket connection error:", error);
          if (connectionStateRef.current) {
            connectionStateRef.current = false;
            setIsConnected(false);
          }
          showError("Failed to connect to chat. Please refresh the page.");
        }
      );

      if (!client) {
        console.error("ChatWindow: Failed to create WebSocket client");
        setTimeout(() => {
          if (connectionStateRef.current) {
            connectionStateRef.current = false;
            setIsConnected(false);
          }
        }, 0);
      }
    }

    // Cleanup: unsubscribe
    return () => {
      isMounted = false;
      console.log(
        "ChatWindow: Cleaning up WebSocket subscription for thread",
        thread.id
      );
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // Don't disconnect WebSocket here - it might be used by other chat windows
      // Only disconnect when all chat windows are closed (handled globally)
      // Don't set isConnected to false here as it might be used by other windows
    };
  }, [isOpen, thread?.id, orderId, dispatch, showError]);

  // Update connection state when thread or isOpen changes - use setTimeout to avoid synchronous setState
  useEffect(() => {
    if (!isOpen || !thread?.id) {
      const timer = setTimeout(() => {
        if (connectionStateRef.current) {
          connectionStateRef.current = false;
          setIsConnected(false);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, thread?.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || isSending || !thread?.id) return;

    console.log("ChatWindow: Attempting to send message", {
      orderId,
      threadId: thread.id,
      isConnected,
    });

    // Check if WebSocket is connected
    const client = getStompClient();
    const clientConnected = client?.connected ?? false;

    console.log("ChatWindow: WebSocket client state", {
      exists: !!client,
      connected: clientConnected,
      state: client?.state,
      isConnectedState: isConnected,
    });

    if (!client || !clientConnected || !isConnected) {
      console.error(
        "ChatWindow: WebSocket not connected, cannot send message",
        {
          clientExists: !!client,
          clientConnected,
          isConnected,
        }
      );
      showError("WebSocket not connected. Please wait a moment and try again.");
      return;
    }

    setIsSending(true);
    const content = messageContent.trim();
    setMessageContent("");

    // Send via WebSocket (orderId is used as threadId in WebSocket)
    const success = sendMessageViaWebSocket(orderId, content);
    console.log("ChatWindow: Message send result", {
      success,
      orderId,
      content,
    });

    if (!success) {
      // Fallback to REST API if WebSocket fails
      console.error("ChatWindow: Failed to send message via WebSocket");
      showError("Failed to send message. Please try again.");
      setMessageContent(content); // Restore message content
    }

    setIsSending(false);
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
        {!thread?.id ? (
          <div className="text-center text-gray-500 py-8">
            Loading thread...
          </div>
        ) : isLoading && messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          messages
            .filter((message) => message.threadId === thread?.id) // Extra safety: filter by threadId
            .map((message) => {
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
        {!isConnected && (
          <div className="mb-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            Connecting to chat...
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none disabled:bg-gray-100"
            disabled={isSending || !isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || isSending || !isConnected}
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
