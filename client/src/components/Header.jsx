import React from "react";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaBell,
  FaHeart,
  FaChartBar,
  FaUser,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import socket from "../socket";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [unread, setUnread] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromURL = urlParams.get("searchTerm");
    if (searchTermFromURL) {
      setSearchTerm(searchTermFromURL);
    }
  });

  useEffect(() => {
    if (!currentUser) return;

    // Only join if not already connected to the currentUser's socket
    if (!socket.connected) {
      socket.connect(); // This should only happen if not already connected
    }

    socket.emit("join", currentUser._id);

    socket.on("newNotification", (notif) => {
      setUnread(true);
      setNotifications((prev) => [...prev, notif]);
    });

    return () => socket.off("newNotification");
  }, [currentUser]);

  const handleNotificationClick = () => {
    setUnread(false);
    navigate("/notifications");
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-700 shadow-md">
  <div className="relative flex items-center justify-between p-3 max-w-8xl mx-auto">
    {/* Left Side: Logo */}
    <Link to="/">
      <h1 className="text-sm sm:text-2xl flex flex-wrap italic font-extrabold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent tracking-wide">
        <span className="px-1">BRicK</span>
        <span className="px-1 text-blue-50">&</span>
        <span className="px-1">CLicK</span>
      </h1>
    </Link>

    <ul className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 md:gap-15 text-sm font-semibold text-gray-50">
    <Link to="/">
              <li className="flex flex-col items-center group hover:text-orange-400 transition">
                <FaHome className="text-2xl" />
                <span className="text-xs text-gray-300 group-hover:text-orange-400">
                  Home
                </span>
              </li>
            </Link>
            <Link to="/about">
              <li className="flex flex-col items-center group hover:text-orange-400 transition">
                <FaInfoCircle className="text-2xl" />
                <span className="text-xs text-gray-300 group-hover:text-orange-400">
                  About
                </span>
              </li>
            </Link>
            <li
              onClick={handleNotificationClick}
              className="flex flex-col items-center group cursor-pointer hover:text-orange-400 transition"
            >
              <FaBell className="text-2xl" />
              <span className="text-xs text-gray-300 group-hover:text-orange-400">
                Notifications
              </span>
              {unread && (
                <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              )}
            </li>
            <Link to="/favourites">
              <li className="flex flex-col items-center group hover:text-orange-400 transition">
                <FaHeart className="text-2xl" />
                <span className="text-xs text-gray-300 group-hover:text-orange-400">
                  Favourites
                </span>
              </li>
            </Link>
            <Link to="/analytics">
              <li className="flex flex-col items-center group hover:text-orange-400 transition">
                <FaChartBar className="text-2xl" />
                <span className="text-xs text-gray-300 group-hover:text-orange-400">
                  Analytics
                </span>
              </li>
            </Link>
            <Link to="/search">
              <li className="flex flex-col items-center group hover:text-orange-400 transition">
                <FaSearch className="text-2xl" />
                <span className="text-xs text-gray-300 group-hover:text-orange-400">
                  Search
                </span>
              </li>
            </Link>
            <li className="flex items-center">
              <Link to="/profile">
                {currentUser ? (
                  <motion.img
                    key={currentUser?.avatar || "default"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={
                      currentUser?.avatar
                        ? currentUser.avatar.startsWith("http")
                          ? currentUser.avatar
                          : `http://localhost:3000${currentUser.avatar}`
                        : "/default.png"
                    }
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="flex flex-col items-center group hover:text-orange-400 transition">
                    <FaUser className="text-2xl" />
                    <span className="text-xs text-gray-300 group-hover:text-orange-400">
                      Sign In
                    </span>
                  </span>
                )}
              </Link>
            </li>
          </ul>
  

      {/* Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="text-white text-2xl sm:hidden focus:outline-none ml-auto"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-12 right-0 w-2/3 max-w-3xs bg-gray-800 text-white shadow-lg  py-6 space-y-6 z-40 rounded-l-lg">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaHome className="text-white text-2xl" />
            <span className="text-sm text-gray-300">Home</span>
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaInfoCircle className="text-white text-2xl" />
            <span className="text-sm text-gray-300">About</span>
          </Link>
          <Link
            to="/notifications"
            onClick={() => {
              handleNotificationClick();
              setIsMobileMenuOpen(false);
            }}
            className="flex flex-col items-center relative"
          >
            <FaBell className="text-white text-2xl" />
            {unread && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
            <span className="text-sm text-gray-300">Notifications</span>
          </Link>
          <Link
            to="/favourites"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaHeart className="text-white text-2xl" />
            <span className="text-sm text-gray-300">Favourites</span>
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaChartBar className="text-white text-2xl" />
            <span className="text-sm text-gray-300">Analytics</span>
          </Link>
          <Link
            to="/search"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaSearch className="text-white text-2xl" />
            <span className="text-sm text-gray-300">Search</span>
          </Link>
          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col items-center"
          >
            <FaUser className="text-white text-2xl" />
            <span className="text-sm text-gray-300">
              {currentUser ? "Profile" : "Sign In"}
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
