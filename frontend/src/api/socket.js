import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (!socketInstance) {
    const backendUrl = import.meta.env.VITE_SOCKET_URL || undefined;
    socketInstance = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to ServiceHub WebSocket server');
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error (falling back to REST):', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

