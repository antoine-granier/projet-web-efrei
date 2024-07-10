import { io } from 'socket.io-client';

export const createSocket = (token: string) => {
  return io(import.meta.env.VITE_CHAT_URL, {
    autoConnect: false,
    extraHeaders: {
      authorization: `Bearer ${token}`,
    },
  });
};