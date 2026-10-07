import React, { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiUser,
  FiImage,
  FiX,
  FiSave,
  FiLock,
  FiMail,
  FiPhone,
  FiAtSign,
  FiShield,
  FiStar,
} from "react-icons/fi";

import notify from "../../utils/notify";

import "./AddUser.css";

const AddUser = ({ setActivePage, addUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "User",
    plan: "Free",
    status: "Active",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================
     CLEANUP PREVIEW URL
  ========================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     IMAGE SELECT
  ========================= */

  const handleImageSelect = (file) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!validTypes.includes(file.type)) {
      notify.warning(
        "Invalid image",
        "Please select a valid image (JPG, PNG, WEBP or GIF)."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.warning(
        "Image too large",
        "Image size should be less than 5 MB."
      );
      return;
    }

    setProfileImage(file);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return URL.createObjectURL(file);
    });
  };

  /* =========================
     FILE CHANGE
  ========================= */

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      handleImageSelect(file);
    }
  };

  /* =========================
     DRAG OVER / LEAVE / DROP
  ========================= */

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      handleImageSelect(file);
    }
  };

  /* =========================
     REMOVE IMAGE
  ========================= */

  const handleRemoveImage = (e) => {
    e.stopPropagation();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfileImage(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     SUBMIT — ✅ FIXED
     अब सिर्फ App.jsx के addUser को call करता है (कोई double fetch नहीं)
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const name = formData.name.trim();
    const username = formData.username
      .trim()
      .replace(/^@/, "");
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) {
      notify.warning("Please enter full name.");
      return;
    }

    if (!username) {
      notify.warning("Please enter username.");
      return;
    }

    if (!email) {
      notify.warning("Please enter email address.");
      return;
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      notify.warning(
        "Password and Confirm Password do not match."
      );
      return;
    }

    if (formData.password.length < 6) {
      notify.warning(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (typeof addUser !== "function") {
      notify.error("Add user action is not available.");
      return;
    }

    try {
      setIsSubmitting(true);

      /* ✅ App.jsx के addUser को पूरा data दो
         वो खुद Backend को POST करेगा (सिर्फ 1 request) */
      const created = await addUser({
        name,
        username,
        email,
        phone,
        password: formData.password,
        role: formData.role,
        plan: formData.plan,
        status: formData.status,

        /* ✅ Image file — दोनों field names भेजें */
        profileImage,
        imageFile: profileImage,
      });

      /* अगर App.jsx ने null return किया → error already handled */
      if (!created) {
        return;
      }

      notify.success(
        "User Created",
        "User created successfully."
      );

      setActivePage("users");
    } catch (error) {
      console.error("Create User Error:", error);

      notify.error(
        "Create Failed",
        error.message ||
          "Something went wrong while creating the user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     CANCEL
  ========================= */

  const handleCancel = () => {
    setActivePage("users");
  };

  return (
    <div className="add-user-container">
      {/* HEADER */}
      <div className="add-user-header">
        <button
          type="button"
          className="add-user-back-btn"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        <div className="add-user-title">
          <div className="add-user-title-icon">
            <FiUser />
          </div>

          <div>
            <h1>Add User</h1>

            <p>Create a new user account</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form
        className="add-user-form"
        onSubmit={handleSubmit}
      >
        <div className="add-user-layout">
          {/* LEFT PROFILE CARD */}
          <div className="profile-upload-card">
            <div className="card-heading">
              <h3>Profile Image</h3>
              <span>Optional</span>
            </div>

            <div
              className={`profile-drop-zone ${
                isDragging ? "dragging" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                !isSubmitting &&
                fileInputRef.current?.click()
              }
            >
              {previewUrl ? (
                <div className="profile-preview-wrapper">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="profile-preview"
                  />

                  <button
                    type="button"
                    className="remove-profile-btn"
                    onClick={handleRemoveImage}
                    title="Remove image"
                    disabled={isSubmitting}
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="profile-placeholder">
                  <div className="profile-upload-icon">
                    <FiImage />
                  </div>

                  <strong>
                    Upload Profile Image
                  </strong>

                  <p>
                    Drag & drop or click to browse
                  </p>

                  <span>
                    JPG, PNG, WEBP or GIF
                  </span>

                  <span>Maximum size: 5 MB</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                hidden
                disabled={isSubmitting}
              />
            </div>

            {/* USER PREVIEW */}
            <div className="profile-user-preview">
              <div className="small-avatar">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={formData.name || "User"}
                  />
                ) : (
                  <FiUser />
                )}
              </div>

              <div>
                <strong>
                  {formData.name || "User Name"}
                </strong>

                <span>
                  {formData.email ||
                    "user@example.com"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT FORM CARD */}
          <div className="user-form-card">
            {/* BASIC INFORMATION */}
            <div className="form-section">
              <div className="section-heading">
                <div className="section-icon">
                  <FiUser />
                </div>

                <div>
                  <h3>Basic Information</h3>

                  <p>
                    Enter the user's personal
                    information
                  </p>
                </div>
              </div>

              <div className="form-grid">
                {/* FULL NAME */}
                <div className="form-group">
                  <label>
                    Full Name <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FiUser />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* USERNAME */}
                <div className="form-group">
                  <label>
                    Username <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FiAtSign />

                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label>
                    Email Address <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FiMail />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="form-group">
                  <label>Phone Number</label>

                  <div className="input-wrapper">
                    <FiPhone />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACCOUNT SECURITY */}
            <div className="form-section">
              <div className="section-heading">
                <div className="section-icon">
                  <FiLock />
                </div>

                <div>
                  <h3>Account Security</h3>

                  <p>Set the login password</p>
                </div>
              </div>

              <div className="form-grid">
                {/* PASSWORD */}
                <div className="form-group">
                  <label>
                    Password <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FiLock />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                      minLength="6"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="form-group">
                  <label>
                    Confirm Password <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <FiLock />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      minLength="6"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="form-section">
              <div className="section-heading">
                <div className="section-icon">
                  <FiShield />
                </div>

                <div>
                  <h3>Account Settings</h3>

                  <p>
                    Configure role, plan and status
                  </p>
                </div>
              </div>

              <div className="form-grid three-columns">
                {/* ROLE */}
                <div className="form-group">
                  <label>Role</label>

                  <div className="select-wrapper">
                    <FiShield />

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="User">User</option>
                      <option value="Premium User">
                        Premium User
                      </option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* PLAN */}
                <div className="form-group">
                  <label>Subscription Plan</label>

                  <div className="select-wrapper">
                    <FiStar />

                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">
                        Premium
                      </option>
                    </select>
                  </div>
                </div>

                {/* STATUS */}
                <div className="form-group">
                  <label>Status</label>

                  <div className="select-wrapper">
                    <FiUser />

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">
                        Inactive
                      </option>
                      <option value="Suspended">
                        Suspended
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="add-user-actions">
              <button
                type="button"
                className="add-user-cancel-btn"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <FiX />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="create-user-btn"
                disabled={isSubmitting}
              >
                <FiSave />

                <span>
                  {isSubmitting
                    ? "Creating..."
                    : "Create User"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;