import { useEffect } from "react";
import { useSelector } from "react-redux";
import socket from "../socket";

const SocketProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      // Connect the socket only if not connected
      if (!socket.connected) {
        socket.connect();
      }

      // Join the user's socket room
      socket.emit("join", currentUser._id);
      console.log("📡 Joined socket room:", currentUser._id);
    }

    // Clean up: disconnect socket on logout or user change
    return () => {
      if (!currentUser) {
        socket.disconnect();
        console.log("📡 Disconnected socket");
      }
    };
  }, [currentUser]);

  return children;
};

export default SocketProvider;
