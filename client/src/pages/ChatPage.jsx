import React from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";

const ChatPage = () => {
  const { listingId, receiverId } = useParams();

  return <Chat listingId={listingId} receiverId={receiverId} />;
};

export default ChatPage;
