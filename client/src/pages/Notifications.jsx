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
    console.log("Current User:", currentUser);
    if (!currentUser) return;
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

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-br from-orange-300 to-blue-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6 text-center">
          <MdNotificationsActive className="text-3xl text-blue-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800">
            Your Notifications
          </h2>
        </div>

        {loading && (
          <div className="col-span-full flex justify-center items-center">
            <div
              className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"
              style={{ animationDuration: "3s" }}
            ></div>
          </div>
        )}

        {!loading && notifications.length === 0 ? (
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
                  } border border-white px-10 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] rounded-full p-4 transition-all duration-300 cursor-pointer group transform`}
                >
                  <div className="flex items-start gap-4">
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
