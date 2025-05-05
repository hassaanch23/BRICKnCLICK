import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Connect to the server

socket.on('connect', () => {
  console.log('Connected to server');
});

// To listen to events like messages:
socket.on('message', (message) => {
  console.log('New message:', message);
});

export default socket;