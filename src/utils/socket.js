import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL;
    socket = io(SOCKET_SERVER_URL, {
      auth: {
        token: token
      }
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const sendCodeToChat = (type, data) => {
  if (socket && socket.connected) {
    socket.emit('sendCodeToChat', { type, data });
    return true;
  }
  return false;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
