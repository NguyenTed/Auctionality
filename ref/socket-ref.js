import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WebSocketTest = ({ orderId = 1 }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClientRef = useRef(null);

  useEffect(() => {
    // 1️⃣ Tạo SockJS client
    const socket = new SockJS('http://localhost:8081/ws-chat'); // endpoint Spring
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
    });

    // 2️⃣ Khi connect thành công
    stompClient.onConnect = () => {
      console.log('Connected to WebSocket!');

      // 3️⃣ Subscribe topic chat với orderId
      stompClient.subscribe(/topic/chat/${orderId}, (message) => {
        console.log('Received:', message.body);
        setMessages((prev) => [...prev, message.body]);
      });
    };

    stompClient.activate();
    stompClientRef.current = stompClient; // lưu lại để send

    return () => {
      stompClient.deactivate();
    };
  }, [orderId]);

  const sendMessage = () => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.log('WebSocket not connected yet!');
      return;
    }

    // 4️⃣ Gửi message tới backend với orderId trong URL
    stompClientRef.current.publish({
      destination: /app/chat.send/${orderId},
      body: JSON.stringify({ content: input }),
    });

    setInput('');
  };

  return (
    <div>
      <h2>WebSocket Test (Thread {orderId})</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketTest;