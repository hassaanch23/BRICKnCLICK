import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Current User:", currentUser); // Check if currentUser is available
    if (!currentUser) return; // Ensure no fetch if user is not defined
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`/api/notifications/${currentUser._id}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchNotifications();
    socket.on("newNotification", (notif) => {
      setNotifications((prev) => [...prev, notif]);
    });

    return () => socket.off("newNotification");
  }, [currentUser]);

  const handleNotificationClick = async (listingId, fromUserId, notifId) => {
    try {
      await axios.put(`/api/notifications/mark-read/${notifId}`);
      navigate(`/chat/${listingId}/${fromUserId}`);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="mx-auto px-4 py-6 bg-gradient-to-br from-orange-300 to-blue-300">
      <div className="max-w-3xl  mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6 text-center">
  <MdNotificationsActive className="text-3xl text-blue-500 animate-bounce" />
  <h2 className="text-2xl font-bold text-gray-800">
    Your Notifications
  </h2>
</div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No new notifications</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => {
              console.log("Listing ID in notif:", notif.listingId);
              return (
                <li
                  key={notif._id}
                  onClick={() =>
                    handleNotificationClick(
                      notif.listingId._id,
                      notif.fromUser._id,
                      notif._id
                    )
                  }
                  className={`${
                    notif.read ? "bg-gray-100" : "bg-transparent"
                  } border border-gray-200 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] rounded-xl p-4 transition-all duration-300 cursor-pointer group transform`}
                >
                  <div className="flex items-start gap-4">
                    <img
                          src={
                            notif.listingId.image?.startsWith("http")
                              ? notif.listingId.image
                              : `http://localhost:3000${notif.listingId.image}`
                          }
                          alt="Listing"
                          className="h-16 w-24 rounded-md object-cover border"
                        />

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                        {notif.propertyTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                          {notif.fromUser.username}
                        </span>{" "}
                        sent you a message.
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
