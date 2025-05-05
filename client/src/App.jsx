import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import CreateListing from "./pages/CreateListing";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import ChatPage from "./pages/ChatPage";
import Notifications from "./pages/Notifications";

function App() {
  return ( 
    <>
      {" "}
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home></Home>} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/listing/:listingId" element={<Listing />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/create-listing" element={<CreateListing/>} />
            <Route path="/edit-listing/:listingId" element={<EditListing />} />
            <Route path="/chat/:listingId/:receiverId" element={<ChatPage />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
