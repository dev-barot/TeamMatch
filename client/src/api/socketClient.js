import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

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
