import React, { useState } from "react";

import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
  FiMusic,
  FiHeart,
  FiList,
  FiEdit2,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import notify from "../../utils/notify";

import "./UserDetails.css";

const SERVER_URL = "http://localhost:5000";

const UserDetails = ({
  user = null,
  setActivePage,
  openEditUser,
}) => {

  /* =========================================
     NAVIGATION HELPERS
  ========================================= */

  const goToUsers = () => {
    if (setActivePage) {
      setActivePage("users");
    }
  };

  const handleEditUser = () => {
    if (!user) {
      notify.warning("User not found. Cannot edit.");
      return;
    }

    if (openEditUser) {
      openEditUser(user);
      return;
    }

    if (setActivePage) {
      setActivePage("edit-user");
    }
  };

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!user) {
    return (
      <div className="user-details-empty">

        <FiUser className="empty-user-icon" />

        <h2>User Not Found</h2>

        <p>
          The selected user could not be found.
        </p>

        <button
          type="button"
          className="back-users-btn"
          onClick={goToUsers}
        >
          <FiArrowLeft />
          Back to Users
        </button>

      </div>
    );
  }

  /* =========================================
     HELPERS
  ========================================= */

  const getInitials = (name = "") => {
    const cleanName = String(name).trim();

    if (!cleanName) {
      return "U";
    }

    return cleanName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /* =========================================
     IMAGE URL HELPER
  ========================================= */

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const imageValue = String(image).trim();

    if (!imageValue) {
      return "";
    }

    /* Already complete URL */
    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    /* Blob URL */
    if (imageValue.startsWith("blob:")) {
      return imageValue;
    }

    /* Backend upload path */
    if (imageValue.startsWith("/uploads/")) {
      return `${SERVER_URL}${imageValue}`;
    }

    /* Backend image path */
    if (imageValue.startsWith("/images/")) {
      return `${SERVER_URL}${imageValue}`;
    }

    /* Relative uploads path without / */
    if (imageValue.startsWith("uploads/")) {
      return `${SERVER_URL}/${imageValue}`;
    }

    /* Relative images path without / */
    if (imageValue.startsWith("images/")) {
      return `${SERVER_URL}/${imageValue}`;
    }

    /* Any other relative path */
    if (imageValue.startsWith("/")) {
      return `${SERVER_URL}${imageValue}`;
    }

    return imageValue;
  };

  /* =========================================
     USER IMAGE
  ========================================= */

  const userImage =
    user.avatar ||
    user.profileImage ||
    "";

  const imageUrl = getImageUrl(userImage);

  const [imageError, setImageError] = useState(false);

  /* =========================================
     USER DATA
  ========================================= */

  const userName =
    user.name ||
    user.userName ||
    "Unknown User";

  const username =
    user.username ||
    user.userName ||
    "user";

  const email =
    user.email ||
    "-";

  const phone =
    user.phone ||
    user.mobile ||
    "-";

  const role =
    user.role ||
    "User";

  const plan =
    user.plan ||
    user.planName ||
    "Free";

  const status =
    user.status ||
    "Inactive";

  const userId =
    user._id ||
    user.id ||
    user.userId ||
    "-";

  const joinedDate =
    user.joined ||
    user.joinedDate ||
    user.createdAt ||
    "-";

  const lastLogin =
    user.lastLogin ||
    "-";

  const songsPlayed =
    Number(user.songsPlayed) || 0;

  const likedSongs =
    Number(user.likedSongs) || 0;

  const playlists =
    Number(user.playlists) || 0;

  /* =========================================
     ROLE CLASS
  ========================================= */

  const getRoleClass = (value) => {
    if (value === "Premium User") {
      return "premium-role";
    }

    if (value === "Admin") {
      return "admin-role";
    }

    return "user-role";
  };

  /* =========================================
     PLAN CLASS
  ========================================= */

  const getPlanClass = (value) => {
    if (value === "Premium") {
      return "premium-plan";
    }

    if (value === "Family") {
      return "family-plan";
    }

    return "free-plan";
  };

  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (value) => {
    if (value === "Active") {
      return "active-status";
    }

    if (value === "Suspended") {
      return "suspended-status";
    }

    return "inactive-status";
  };

  const isActive = status === "Active";

  return (
    <div className="user-details-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="user-details-header">

        <button
          type="button"
          className="user-back-btn"
          onClick={goToUsers}
        >
          <FiArrowLeft />
          Back to Users
        </button>

        <div className="user-header-actions">

          <button
            type="button"
            className="user-edit-btn"
            onClick={handleEditUser}
          >
            <FiEdit2 />
            Edit User
          </button>

        </div>

      </div>

      {/* =========================================
          PROFILE CARD
      ========================================= */}

      <div className="user-profile-card">

        <div className="user-profile-left">

          {/* AVATAR */}

          <div className="user-large-avatar">

            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={userName}
                onError={() => {
                  setImageError(true);
                  notify.warning("Failed to load user avatar.");
                }}
              />
            ) : (
              <span>
                {getInitials(userName)}
              </span>
            )}

          </div>

          {/* PROFILE INFO */}

          <div className="user-profile-info">

            <h1>
              {userName}
            </h1>

            <p className="user-username">
              @{username}
            </p>

            <div className="user-profile-badges">

              {/* ROLE */}

              <span
                className={`user-role-badge ${getRoleClass(
                  role
                )}`}
              >

                {role === "Premium User" ? (
                  <FiStar />
                ) : role === "Admin" ? (
                  <FiShield />
                ) : (
                  <FiUser />
                )}

                {role}

              </span>

              {/* PLAN */}

              <span
                className={`user-plan-badge ${getPlanClass(
                  plan
                )}`}
              >

                {plan === "Premium" ||
                plan === "Family" ? (
                  <FiStar />
                ) : (
                  <FiUser />
                )}

                {plan}

              </span>

              {/* STATUS */}

              <span
                className={`user-status-badge ${getStatusClass(
                  status
                )}`}
              >

                {isActive ? (
                  <FiCheckCircle />
                ) : (
                  <FiXCircle />
                )}

                {status}

              </span>

            </div>

          </div>

        </div>

        {/* USER ID */}

        <div className="user-profile-id">

          <span>
            User ID
          </span>

          <strong>
            #{userId}
          </strong>

        </div>

      </div>

      {/* =========================================
          STATISTICS
      ========================================= */}

      <div className="user-stats-grid">

        {/* SONGS */}

        <div className="user-stat-card">

          <div className="user-stat-icon">
            <FiMusic />
          </div>

          <div>

            <span>
              Songs Played
            </span>

            <strong>
              {songsPlayed}
            </strong>

          </div>

        </div>

        {/* LIKED SONGS */}

        <div className="user-stat-card">

          <div className="user-stat-icon">
            <FiHeart />
          </div>

          <div>

            <span>
              Liked Songs
            </span>

            <strong>
              {likedSongs}
            </strong>

          </div>

        </div>

        {/* PLAYLISTS */}

        <div className="user-stat-card">

          <div className="user-stat-icon">
            <FiList />
          </div>

          <div>

            <span>
              Playlists
            </span>

            <strong>
              {playlists}
            </strong>

          </div>

        </div>

        {/* SUBSCRIPTION */}

        <div className="user-stat-card">

          <div className="user-stat-icon">
            <FiStar />
          </div>

          <div>

            <span>
              Subscription
            </span>

            <strong>
              {plan}
            </strong>

          </div>

        </div>

      </div>

      {/* =========================================
          MAIN DETAILS
      ========================================= */}

      <div className="user-details-grid">

        {/* =====================================
            PERSONAL INFORMATION
        ===================================== */}

        <div className="user-info-card">

          <div className="user-card-title">

            <div className="user-title-icon">
              <FiUser />
            </div>

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                User's basic account information
              </p>

            </div>

          </div>

          <div className="user-info-list">

            {/* FULL NAME */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiUser />

                <span>
                  Full Name
                </span>

              </div>

              <strong>
                {userName}
              </strong>

            </div>

            {/* USERNAME */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiUser />

                <span>
                  Username
                </span>

              </div>

              <strong>
                @{username}
              </strong>

            </div>

            {/* EMAIL */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiMail />

                <span>
                  Email
                </span>

              </div>

              <strong>
                {email}
              </strong>

            </div>

            {/* PHONE */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiPhone />

                <span>
                  Phone
                </span>

              </div>

              <strong>
                {phone}
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================
            ACCOUNT INFORMATION
        ===================================== */}

        <div className="user-info-card">

          <div className="user-card-title">

            <div className="user-title-icon">
              <FiShield />
            </div>

            <div>

              <h2>
                Account Information
              </h2>

              <p>
                Account status and access details
              </p>

            </div>

          </div>

          <div className="user-info-list">

            {/* ROLE */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiShield />

                <span>
                  Role
                </span>

              </div>

              <span
                className={`details-value-badge ${getRoleClass(
                  role
                )}`}
              >
                {role}
              </span>

            </div>

            {/* PLAN */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiStar />

                <span>
                  Plan
                </span>

              </div>

              <span
                className={`details-value-badge ${getPlanClass(
                  plan
                )}`}
              >
                {plan}
              </span>

            </div>

            {/* STATUS */}

            <div className="user-info-row">

              <div className="user-info-label">

                {isActive ? (
                  <FiCheckCircle />
                ) : (
                  <FiXCircle />
                )}

                <span>
                  Status
                </span>

              </div>

              <span
                className={`details-value-badge ${getStatusClass(
                  status
                )}`}
              >
                {status}
              </span>

            </div>

          </div>

        </div>

        {/* =====================================
            ACCOUNT ACTIVITY
        ===================================== */}

        <div className="user-info-card">

          <div className="user-card-title">

            <div className="user-title-icon">
              <FiClock />
            </div>

            <div>

              <h2>
                Account Activity
              </h2>

              <p>
                User registration and login activity
              </p>

            </div>

          </div>

          <div className="user-info-list">

            {/* JOINED */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiCalendar />

                <span>
                  Joined Date
                </span>

              </div>

              <strong>
                {joinedDate}
              </strong>

            </div>

            {/* LAST LOGIN */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiClock />

                <span>
                  Last Login
                </span>

              </div>

              <strong>
                {lastLogin}
              </strong>

            </div>

            {/* MUSIC ACTIVITY */}

            <div className="user-info-row">

              <div className="user-info-label">

                <FiMusic />

                <span>
                  Music Activity
                </span>

              </div>

              <strong>
                {songsPlayed} songs
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================
            MUSIC ACTIVITY
        ===================================== */}

        <div className="user-info-card">

          <div className="user-card-title">

            <div className="user-title-icon">
              <FiMusic />
            </div>

            <div>

              <h2>
                Music Activity
              </h2>

              <p>
                User's music usage information
              </p>

            </div>

          </div>

          <div className="music-activity-list">

            {/* SONGS */}

            <div className="music-activity-item">

              <div className="music-activity-icon">
                <FiMusic />
              </div>

              <div className="music-activity-content">

                <span>
                  Total Songs Played
                </span>

                <strong>
                  {songsPlayed}
                </strong>

              </div>

            </div>

            {/* LIKES */}

            <div className="music-activity-item">

              <div className="music-activity-icon">
                <FiHeart />
              </div>

              <div className="music-activity-content">

                <span>
                  Liked Songs
                </span>

                <strong>
                  {likedSongs}
                </strong>

              </div>

            </div>

            {/* PLAYLISTS */}

            <div className="music-activity-item">

              <div className="music-activity-icon">
                <FiList />
              </div>

              <div className="music-activity-content">

                <span>
                  Created Playlists
                </span>

                <strong>
                  {playlists}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          FOOTER ACTIONS
      ========================================= */}

      <div className="user-details-footer">

        <button
          type="button"
          className="footer-back-btn"
          onClick={goToUsers}
        >
          <FiArrowLeft />
          Back to Users
        </button>

        <button
          type="button"
          className="footer-edit-btn"
          onClick={handleEditUser}
        >
          <FiEdit2 />
          Edit User
        </button>

      </div>

    </div>
  );
};

export default UserDetails;