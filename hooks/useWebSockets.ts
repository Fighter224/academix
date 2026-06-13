import { useEffect, useRef, useState, useCallback } from 'react';
import { DirectChatMessage, MessageStatus } from '../types/academic';
import { db, directMessagesTable } from '../services/database';

interface WebSocketMessage {
  channel: string;
  event: string;
  payload: any;
}

export function useWebSockets(chatId?: string, onIncomingMessage?: (msg: DirectChatMessage) => void, onStatusUpdate?: (msgId: string, status: MessageStatus) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect WebSocket
  useEffect(() => {
    // Attempt connection to a default local server
    // We fall back gracefully to our rich simulation loop if server is offline
    const socketUrl = 'ws://localhost:8080';
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connection established.');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.channel === 'direct_chat_v1') {
          if (data.event === 'new_private_msg' && chatId === data.payload.chat_id) {
            const newMsg: DirectChatMessage = {
              id: data.payload.message_id || `msg_ws_${Date.now()}`,
              chatId: data.payload.chat_id,
              senderId: data.payload.sender_id,
              messageBody: data.payload.message_body,
              status: 'sent',
              createdAt: new Date().toISOString(),
            };
            if (onIncomingMessage) onIncomingMessage(newMsg);
          } else if (data.event === 'msg_status_ack' && chatId === data.payload.chat_id) {
            if (onStatusUpdate) {
              onStatusUpdate(data.payload.message_id, data.payload.status);
            }
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message', err);
      }
    };

    ws.onerror = (e) => {
      console.log('WS connection offline. Fallback to automated simulator active.');
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [chatId, onIncomingMessage, onStatusUpdate]);

  // Dispatch message
  const sendMessage = useCallback((chatId: string, messageBody: string) => {
    const payload = {
      channel: 'direct_chat_v1',
      event: 'send_private_msg',
      payload: {
        chat_id: chatId,
        sender_id: db.currentUser.id,
        message_body: messageBody,
      }
    };

    // If WebSocket is open, send over TCP socket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }

    // Always feed the simulator for outstanding local UX visual loops
    // Simulate Delivery Pipeline: sent -> delivered (1.2s) -> read (2.4s)
    db.sendDirectMessage(chatId, messageBody).then((newMsg) => {
      if (onIncomingMessage) onIncomingMessage(newMsg);

      // 1. Deliver Tick
      setTimeout(() => {
        const msg = directMessagesTable.find(m => m.id === newMsg.id);
        if (msg) msg.status = 'delivered';
        if (onStatusUpdate) onStatusUpdate(newMsg.id, 'delivered');

        // 2. Read Tick (unless DND is enabled on the recipient side)
        setTimeout(() => {
          const recipientId = chatId.split('_').find(id => id !== db.currentUser.id) || '';
          const recipient = db.currentUser.id === 'usr_teacher_01' ? db.currentUser : null; // Mock DND check

          // Simulating recipient reading the message
          const msgLatest = directMessagesTable.find(m => m.id === newMsg.id);
          if (msgLatest) msgLatest.status = 'read';
          if (onStatusUpdate) onStatusUpdate(newMsg.id, 'read');

          // Trigger automated mock response helper
          triggerAutomatedResponse(chatId, messageBody);
        }, 1200);

      }, 1000);
    });
  }, [onIncomingMessage, onStatusUpdate]);

  // Handle mock responses
  const triggerAutomatedResponse = (chatId: string, userMsg: string) => {
    const recipientId = chatId.split('_').find(id => id !== db.currentUser.id) || '';
    const recipient = db.currentUser.id === 'usr_teacher_01' ? { name: 'Marcus Reynolds', role: 'parent' } : { name: 'Dr. Evelyn Carter', role: 'teacher' };
    
    // Do not respond if recipient has DND enabled
    if (db.currentUser.dndEnabled) return;

    // Trigger mock response
    setTimeout(() => {
      const responseBody = getMockReply(userMsg, recipient.name);
      const replyMsg: DirectChatMessage = {
        id: `msg_reply_${Date.now()}`,
        chatId,
        senderId: recipientId,
        messageBody: responseBody,
        status: 'read',
        createdAt: new Date().toISOString(),
      };
      
      directMessagesTable.push(replyMsg);
      if (onIncomingMessage) onIncomingMessage(replyMsg);
    }, 2000);
  };

  const getMockReply = (userMsg: string, senderName: string): string => {
    const msg = userMsg.toLowerCase();
    if (msg.includes('hello') || msg.includes('hi')) {
      return `Hello! This is ${senderName}. How can I assist you today?`;
    }
    if (msg.includes('project') || msg.includes('science')) {
      return 'I am currently reviewing the science fair details! Will get back to you shortly.';
    }
    if (msg.includes('call') || msg.includes('webrtc')) {
      return 'Let me know when you are free to do a quick video call. You can tap the call icon above.';
    }
    return `Got your message! Thanks for reaching out. - ${senderName}`;
  };

  const sendWebRTCSignaling = useCallback((targetUserId: string, type: 'offer' | 'answer' | 'candidate', sdp: string) => {
    const payload = {
      channel: 'webrtc_signaling',
      event: 'peer_handshake_payload',
      payload: {
        target_user_id: targetUserId,
        type,
        sdp
      }
    };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
    console.log('Dispatched WebRTC signaling payload:', type);
  }, []);

  return {
    isConnected,
    sendMessage,
    sendWebRTCSignaling,
  };
}
