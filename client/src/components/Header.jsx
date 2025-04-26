import React from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <header className="bg-gray-700 shadow-md">
      <div className="flex justify-between items-center p-3 max-w-8xl mx-auto">
        <Link to="/">
          <h1 className=" text-sm sm:text-2xl flex flex-wrap italic font-extrabold bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent tracking-wide">
            <span className="px-1">BRicK</span>
            <span className="px-1 text-blue-50"> & </span>
            <span className="px-1"> CLicK</span>
          </h1>
        </Link>

        <ul className="flex gap-4 text-gray-50 md:gap-8 text-sm sm:text-base font-semibold ">
          <Link to="/">
            <li className="relative group hidden sm:inline">
              <span className="group-hover:text-orange-400 transition duration-300">
                Home
              </span>
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300"></span>
            </li>
          </Link>
          <Link to="/about">
            <li className="relative group hidden sm:inline">
              <span className="group-hover:text-orange-400 transition duration-300">
                About
              </span>
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300"></span>
            </li>
          </Link>

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
              <li className="relative group">
                <span className="group-hover:text-orange-400 transition duration-300">
                  Sign in
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300"></span>
              </li>
            )}
          </Link>
        </ul>

        <form className="bg-gray-300 rounded-lg p-2 flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none rounded-md w-24 sm:w-40 md:w-60 pr-3"
          />
          <FaSearch className="text-gray-800" />
        </form>
      </div>
    </header>
  );
}
