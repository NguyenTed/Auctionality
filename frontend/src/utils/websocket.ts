/**
 * WebSocket Utility
 * Handles STOMP over SockJS connection for chat
 */

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import type { ChatMessage } from "../features/chat/chatService";

let stompClient: Client | null = null;

// Store connection callbacks for when connection is established
let pendingCallbacks: Array<() => void> = [];

export const connectWebSocket = (
  onConnect: () => void,
  onError: (error: unknown) => void
): Client | null => {
  console.log("connectWebSocket: Called", { 
    hasStompClient: !!stompClient, 
    isConnected: stompClient?.connected,
    state: stompClient?.state 
  });

  // If already connected, call onConnect immediately and return
  if (stompClient?.connected) {
    console.log("connectWebSocket: Already connected, calling onConnect immediately");
    onConnect();
    return stompClient;
  }

  // Add callback to pending callbacks if not connected yet
  if (stompClient && !stompClient.connected) {
    console.log("connectWebSocket: Client exists but not connected yet, queuing callback", {
      state: stompClient.state
    });
    pendingCallbacks.push(onConnect);
    return stompClient;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("connectWebSocket: No access token found");
    onError("No access token found");
    return null;
  }

  // Clear any pending callbacks
  pendingCallbacks = [];
  pendingCallbacks.push(onConnect);

  // Create SockJS connection
  // Use environment variable or default to localhost
  const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:8081/ws-chat";
  console.log("connectWebSocket: Creating new connection", { wsUrl });
  
  // Add a timeout to detect if connection hangs
  let connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Create SockJS socket first (matching reference implementation exactly)
  const sockJSSocket = new SockJS(wsUrl);
  
  // Create STOMP client with SockJS (matching reference implementation)
  // Note: webSocketFactory is called when activate() is called
  console.log("connectWebSocket: Creating STOMP client with SockJS");
  
  stompClient = new Client({
    webSocketFactory: () => {
      // Return the same socket instance (matching reference)
      console.log("connectWebSocket: webSocketFactory called, returning SockJS socket");
      return sockJSSocket as WebSocket;
    },
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // Disable automatic reconnection for now to debug
    // reconnectDelay: 0 means no auto-reconnect
    debug: (str) => {
      // Log all STOMP debug messages to help diagnose connection issues
      console.log("STOMP Debug:", str);
      // Check for CONNECTED frame specifically
      if (str.includes("CONNECTED")) {
        console.log("connectWebSocket: CONNECTED frame detected in debug output!");
      }
    },
    onConnect: (frame) => {
      console.log("connectWebSocket: onConnect callback fired!", frame);
      console.log("connectWebSocket: Connected frame details:", JSON.stringify(frame, null, 2));
      // Clear timeout on successful connection
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      // Call all pending callbacks
      const callbacks = [...pendingCallbacks];
      pendingCallbacks = [];
      console.log("connectWebSocket: Calling", callbacks.length, "pending callbacks");
      callbacks.forEach(cb => {
        try {
          cb();
        } catch (error) {
          console.error("connectWebSocket: Error in callback", error);
        }
      });
    },
    onStompError: (frame) => {
      console.error("connectWebSocket: STOMP error", frame);
      // Clear timeout on error
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      pendingCallbacks = [];
      onError(frame);
    },
    onWebSocketError: (event) => {
      console.error("connectWebSocket: WebSocket error", event);
      // Clear timeout on error
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      pendingCallbacks = [];
      onError(event);
    },
    onDisconnect: () => {
      console.log("connectWebSocket: WebSocket disconnected");
      // Clear timeout on disconnect
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      pendingCallbacks = [];
    },
  });

  // Add event listeners for debugging (after creating client)
  sockJSSocket.onopen = () => {
    console.log("connectWebSocket: SockJS socket opened, readyState:", sockJSSocket.readyState);
  };
  
  sockJSSocket.onclose = (event) => {
    console.log("connectWebSocket: SockJS socket closed", { 
      code: event.code, 
      reason: event.reason, 
      wasClean: event.wasClean 
    });
  };
  
  sockJSSocket.onerror = (error) => {
    console.error("connectWebSocket: SockJS socket error", error);
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    pendingCallbacks = [];
    onError(error);
  };
  
  sockJSSocket.onmessage = (event) => {
    console.log("connectWebSocket: SockJS socket message received", event.data);
  };

  console.log("connectWebSocket: Activating STOMP client");
  
  // Set timeout after creating client but before activating
  connectionTimeout = setTimeout(() => {
    if (stompClient && !stompClient.connected) {
      console.error("connectWebSocket: Connection timeout - WebSocket did not connect within 10 seconds");
      console.error("connectWebSocket: Current client state:", stompClient.state);
      console.error("connectWebSocket: SockJS readyState:", sockJSSocket.readyState);
      console.error("connectWebSocket: SockJS protocol:", sockJSSocket.protocol);
      pendingCallbacks = [];
      onError("Connection timeout - WebSocket server may not be responding");
    }
  }, 10000); // 10 second timeout
  
  try {
    stompClient.activate();
    console.log("connectWebSocket: STOMP client activated, waiting for connection...");
  } catch (error) {
    console.error("connectWebSocket: Error activating STOMP client", error);
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    pendingCallbacks = [];
    onError(error);
    return null;
  }
  
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient?.connected) {
    stompClient.deactivate();
  }
  stompClient = null;
};

export const subscribeToThread = (
  orderId: number, // Changed from threadId to orderId to match backend
  onMessage: (message: ChatMessage) => void
): StompSubscription | null => {
  if (!stompClient?.connected) {
    console.error("WebSocket not connected");
    return null;
  }

  const subscription = stompClient.subscribe(
    `/topic/chat/${orderId}`, // Use orderId instead of threadId to match backend
    (message: IMessage) => {
      try {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        onMessage(chatMessage);
      } catch (error) {
        console.error("Error parsing chat message:", error);
      }
    }
  );

  return subscription;
};

export const sendMessageViaWebSocket = (
  orderId: number, // WebSocket uses orderId, not threadId
  content: string
): boolean => {
  // Check if client exists and is connected
  if (!stompClient) {
    console.error("WebSocket client not initialized");
    return false;
  }

  if (!stompClient.connected) {
    console.error("WebSocket not connected. Current state:", stompClient.state);
    return false;
  }

  // Get token for this message
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found");
    return false;
  }

  try {
    stompClient.publish({
      destination: `/app/chat.send/${orderId}`,
      body: JSON.stringify({ content }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error sending message via WebSocket:", error);
    return false;
  }
};

export const getStompClient = (): Client | null => {
  return stompClient;
};

export interface AuctionEndNotification {
  productId: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  finalPrice: number;
  message: string;
}

export const subscribeToAuctionEnd = (
  productId: number,
  onNotification: (notification: AuctionEndNotification) => void
): StompSubscription | null => {
  if (!stompClient?.connected) {
    console.error("WebSocket not connected");
    return null;
  }

  const subscription = stompClient.subscribe(
    `/topic/auction-end/${productId}`,
    (message: IMessage) => {
      try {
        const notification: AuctionEndNotification = JSON.parse(message.body);
        onNotification(notification);
      } catch (error) {
        console.error("Error parsing auction end notification:", error);
      }
    }
  );

  return subscription;
};

