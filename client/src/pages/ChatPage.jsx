import React from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";

const ChatPage = () => {
  const { listingId, receiverId } = useParams();

  return (
     <div className="bg-gradient-to-br from-blue-100 to-orange-200 px-2">
      <Chat listingId={listingId} receiverId={receiverId} />
    </div>
  );
  
};

export default ChatPage;
