import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:4000' : (typeof window !== 'undefined' ? window.location.origin : ''));

let socketInstance = null;

export function getSocket() {
  return socketInstance;
}

export function connectSocket(token) {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!token) return null;

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socketInstance.on('connect', () => {
    // console.log('[Socket] Connected to TeamMatch realtime gateway');
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[Socket] Connection warning:', err.message);
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
