import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut, updateUser } from "../redux/user/userSlice";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import CustomConfirmDialog from "../components/CustomConfirmDialog";
import { Link } from "react-router-dom";

export default function Profile() {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
    avatar: null,
  });

  const [preview, setPreview] = useState(currentUser?.avatar || "/default.png");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  useEffect(() => {
    if (currentUser?.avatar) {
      const imageUrl = currentUser.avatar.startsWith("http")
        ? currentUser.avatar
        : `http://localhost:3000${currentUser.avatar}`;
      setPreview(imageUrl);
    } else {
      setPreview("/default.png");
    }
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      avatar: file,
    }));

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/sign-in");
  };

  const handleDeleteAccount = () => {
    setActionToConfirm("delete");
    setIsDialogOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.", {
        icon: "⚠️",
      });
      return;
    }

    if (formData.password) {
      setActionToConfirm("updateProfile");
      setIsDialogOpen(true);
      return;
    }

    await updateProfileOnServer();
  };

  const updateProfileOnServer = async () => {
    setIsSubmitting(true);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("username", formData.username);
    if (formData.avatar) formDataToSubmit.append("avatar", formData.avatar);
    if (formData.password) formDataToSubmit.append("password", formData.password);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: formDataToSubmit,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile.");
        setIsSubmitting(false);
        return;
      }

      if (data) {
        dispatch(updateUser({ username: data.username, avatar: data.avatar }));
      }

      if (formData.password) {
        toast.success("Password updated! Please sign in again.");
        dispatch(signOut());
        navigate("/sign-in");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    setIsDialogOpen(false);

    if (actionToConfirm === "delete") {
      try {
        const res = await fetch("/api/user/delete", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to delete account");

        toast.success("Account deleted successfully!");
        dispatch(signOut());
        navigate("/sign-in");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete account");
      }
    }

    if (actionToConfirm === "updateProfile") {
      await updateProfileOnServer();
    }
  };

  const handleCancelAction = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 to-blue-300 flex justify-center items-center px-4 sm:px-6 md:px-8 lg:px-10 py-10">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-6 sm:p-8 md:p-10 bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl animate-fade-in-down">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6 sm:mb-8">
          Profile
        </h1>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex justify-center mb-6">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <motion.img
              key={preview}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 25 }}
              onClick={() => fileInputRef.current.click()}
              src={preview || "/default.png"}
              alt="Profile"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover shadow-md border-4 border-white/60 cursor-pointer hover:scale-110 transition-transform duration-300"
              title="Click to change profile picture"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm sm:text-base"
            />
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              * Skip this if you don't want to change password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 sm:py-3 bg-orange-600 text-white font-semibold rounded-lg hover:text-black hover:shadow-2xs transition-all shadow-black uppercase text-sm sm:text-base text-center">
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>

          <Link
              to="/create-listing"
              className="w-full py-2 sm:py-3 bg-green-700 text-white font-semibold rounded-lg hover:text-black hover:shadow-2xs transition-all shadow-black uppercase text-sm sm:text-base text-center block">
              Create Listing
          </Link>
        </form>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-2 sm:space-y-0 sm:space-x-6 px-2">
          <span
            onClick={handleDeleteAccount}
            className="text-center text-sm sm:text-base text-red-600 hover:underline font-semibold hover:shadow-md transition-all cursor-pointer"
          >
            Delete Account
          </span>
          <span
            onClick={handleSignOut}
            className="text-center text-sm sm:text-base text-red-600 hover:underline font-semibold hover:shadow-md transition-all cursor-pointer"
          >
            Sign Out
          </span>
        </div>
      </div>

      <CustomConfirmDialog
        isOpen={isDialogOpen}
        message={
          actionToConfirm === "delete"
            ? "Are you sure you want to delete your account?"
            : "You are about to change your password. Are you sure?"
        }
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
}
