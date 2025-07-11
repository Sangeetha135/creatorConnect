import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import "./Navbar.css";

import {
  AiOutlineHome,
  AiOutlineBell,
  AiOutlineMessage,
  AiOutlineUser,
  AiOutlineLogout,
} from "react-icons/ai";
import { BsBriefcase } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";

const AuthNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const defaultAvatar =
    "https://ui-avatars.com/api/?background=random&name=User";
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userAvatar = user?.profilePictureUrl || defaultAvatar;

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="logo">
            Influencer
          </Link>
          <form className="search-form" onSubmit={handleSearch}>
            <IoSearchOutline className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-center">
          <Link to="/" className="nav-link active">
            <AiOutlineHome />
            <span>Home</span>
          </Link>
          {user?.role === "brand" && (
            <Link to="/campaigns" className="nav-link">
              <BsBriefcase />
              <span>Create Campaign</span>
            </Link>
          )}
          {user?.role === "influencer" && (
            <Link to="/campaigns" className="nav-link">
              <BsBriefcase />
              <span>Browse Campaigns</span>
            </Link>
          )}
          <Link to="/messages" className="nav-link">
            <AiOutlineMessage />
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className="nav-link">
            <AiOutlineBell />
            <span>Notifications</span>
          </Link>
        </div>

        <div className="navbar-right">
          <Link to="/profile" className="profile-link">
            <img
              src={userAvatar}
              alt="Profile"
              className="profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <AiOutlineUser className="profile-icon" />
          </Link>
          <button onClick={handleLogout} className="logout-button">
            <AiOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
