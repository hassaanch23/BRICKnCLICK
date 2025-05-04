// src/components/SocketProvider.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import socket from "../socket";

const SocketProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      // Connect if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Join the user's room
      socket.emit("join", currentUser._id);
      console.log("📡 Joined socket room:", currentUser._id);
    }

    // Disconnect on logout or unmount
    return () => {
      if (!currentUser) {
        socket.disconnect();
      }
    };
  }, [currentUser]);

  return children;
};

export default SocketProvider;
