import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false, // Don't connect immediately
  withCredentials: true,
  transports: ['websocket'], // fallback prevention
});

  

export default socket;
