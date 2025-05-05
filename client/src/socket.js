import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Or from env

export default socket;
