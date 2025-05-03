import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { FaPaperPlane, FaTrashAlt } from "react-icons/fa";
import socketIOClient from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { FaReply } from "react-icons/fa";


const Chat = ({ listingId, receiverId }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const socketInstance = socketIOClient("http://localhost:5000");
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
      socket.emit("deleteMessage", msgId);
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete the message.");
    }
  };

  return (
    <div className="h-[85vh] mt-2 flex flex-col max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
        <h2 className="font-semibold text-lg">Chat</h2>
      </div>

      {error && <p className="text-red-500 text-center text-sm mt-1">{error}</p>}

      {/* ✅ Scrollable Messages Box */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className={`flex items-start gap-2 ${msg.senderId._id === currentUser._id ? "justify-end flex-row-reverse" : "justify-start"}`}>
            <img
              src={msg.senderId.photo}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-100 p-2 rounded-lg relative max-w-[75%]">
                <p className="text-sm">{msg.message}</p>
                <span className="text-xs text-gray-500 block mt-1">
                {moment(msg.createdAt).calendar()}
                </span>
                {msg.senderId === currentUser._id && (
                  <div className="absolute top-1 right-1">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full hover:bg-gray-200">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                      </Menu.Button>

                      <Menu.Items className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => console.log("Replying to", msg.message)}
                                className={`${
                                  active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              >
                                <FaReply className="mr-2" /> Reply
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteMessage(msg._id, msg.createdAt)}
                                className={`${
                                  active ? 'bg-red-500 text-white' : 'text-gray-900'
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              >
                                <FaTrashAlt className="mr-2" /> Delete
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </div>
                )}

              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

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
