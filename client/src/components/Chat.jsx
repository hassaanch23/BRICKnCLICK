import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { FaPaperPlane } from "react-icons/fa";
import socketIOClient from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { io } from "socket.io-client";



const Chat = ({ listingId, receiverId }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState(null);

  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(socketInstance);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/chat/${currentUser._id}/${receiverId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessages(res.data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Error fetching messages. Please try again.");
      }
    };

    fetchMessages();

    return () => socketInstance.disconnect();
  }, [listingId]);

  useEffect(() => {
    if (socket) {
      socket.on("getMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("deleteMessage", (msgId) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
      });
    }
  }, [socket]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const messageData = {
        senderId: currentUser._id,
        receiverId: receiverId,
        message: newMessage,
      };
  
      try {
        // Send the message to the backend
        const res = await axios.post("/api/chat/send", messageData, {

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        // Emit the message through socket.io
        socket.emit("sendMessage", res.data);
  
        // Update the messages state to include the new message
        setMessages((prevMessages) => [...prevMessages, res.data]); // NOT messageData
  
        setNewMessage(""); // Clear the input field
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Error sending message. Please try again.");
      }
    }
  };
  
  const handleDeleteMessage = async (msgId, timestamp) => {
    const timePassed = moment().diff(moment(timestamp), "minutes");
    if (timePassed > 5) return alert("You can only delete messages within 5 minutes.");

    try {
      await axios.delete(`/api/chat/delete/${msgId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
      socket.emit("deleteMessage", msgId);
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete the message.");
    }
  };
;
  return (
    <div className="h-[85vh] mt-2 flex flex-col max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
        <h2 className="font-semibold text-lg">Chat</h2>
      </div>

      {error && <p className="text-red-500 text-center text-sm mt-1">{error}</p>}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isSender = msg.senderId._id === currentUser._id || msg.senderId === currentUser._id;

            return (
              <div key={msg._id} className={`flex items-start gap-2 ${isSender ? "justify-end flex-row-reverse" : "justify-start"}`}>
                {/* Profile Picture */}
                <img
                  src={msg.senderId.photo}
                  alt="User"
                  className={`w-8 h-8 rounded-full object-cover ${isSender ? "order-last" : ""}`}
                />
                {/* Message Box */}
                <div className={`p-2 rounded-lg relative max-w-[75%] ${isSender ? "bg-lightgreen" : "bg-lightblue"}`}>
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    {moment(msg.createdAt).calendar()}
                  </span>
                  {isSender && moment().diff(moment(msg.createdAt), "minutes") <= 5 && (
                    <button
                      onClick={() => setConfirmDeleteMsgId(msg._id)}
                      className="absolute top-1 right-0 text-red-500 hover:text-red-700 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                          
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {confirmDeleteMsgId && (
          <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-blue-200 rounded-lg p-6 shadow-md w-80">
              <h2 className="text-lg font-semibold mb-3">Delete Message?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this message for both users?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteMsgId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const msg = messages.find(m => m._id === confirmDeleteMsgId);
                    if (msg) {
                      handleDeleteMessage(msg._id, msg.createdAt);
                    }
                    setConfirmDeleteMsgId(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ✅ Input Bar */}
      <div className="flex items-center gap-2 border-t p-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center"
        >
          <FaPaperPlane className="mr-1" /> Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
