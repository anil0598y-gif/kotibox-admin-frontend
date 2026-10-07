import { useEffect, useState } from "react";

import {
  FiArrowLeft,
  FiUser,
  FiUploadCloud,
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

import "./EditUser.css";

const SERVER_URL = "http://localhost:5000";

/* =========================================
   GET USER ID
========================================= */

const getUserId = (user) => {
  return (
    user?._id ||
    user?.id ||
    user?.userId ||
    ""
  );
};

/* =========================================
   GET IMAGE URL
========================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("blob:")) {
    return image;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SERVER_URL}${image}`;
  }

  return `${SERVER_URL}/${image}`;
};

function EditUser({
  setActivePage,
  user,
  updateUser,
}) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "User",
    plan: "Free",
    status: "Active",
    password: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  /* =========================================
     LOAD USER DATA
  ========================================= */

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "User",
      plan: user.plan || "Free",
      status: user.status || "Active",
      password: "",
      confirmPassword: "",
    });

    const existingImage =
      user.avatar ||
      user.profileImage ||
      user.avatarUrl ||
      "";

    setPreview(getImageUrl(existingImage));

    setImageFile(null);
    setImageRemoved(false);
    setErrors({});
  }, [user]);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================
     IMAGE VALIDATION
  ========================================= */

  const validateImage = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image:
          "Only JPG, PNG, WEBP or GIF images are allowed.",
      }));

      notify.warning(
        "Invalid image",
        "Only JPG, PNG, WEBP or GIF images are allowed."
      );

      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5 MB.",
      }));

      notify.warning(
        "Image too large",
        "Image size must be less than 5 MB."
      );

      return false;
    }

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));

    return true;
  };

  /* =========================================
     HANDLE IMAGE
  ========================================= */

  const handleImage = (file) => {
    if (!file) return;

    if (!validateImage(file)) return;

    const imageUrl = URL.createObjectURL(file);

    setPreview((oldPreview) => {
      if (
        oldPreview &&
        oldPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(oldPreview);
      }

      return imageUrl;
    });

    setImageFile(file);

    setImageRemoved(false);
  };

  /* =========================================
     FILE INPUT
  ========================================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImage(file);
    }

    e.target.value = "";
  };

  /* =========================================
     DRAG & DROP
  ========================================= */

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleImage(file);
    }
  };

  /* =========================================
     REMOVE IMAGE
  ========================================= */

  const removeImage = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setImageFile(null);

    setImageRemoved(true);

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* =========================================
     FORM VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (
      formData.password &&
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      notify.warning(
        "Validation Error",
        newErrors[errorKeys[0]]
      );
    }

    return errorKeys.length === 0;
  };

  /* =========================================
     SUBMIT — ✅ FIXED
     अब सिर्फ App.jsx के updateUser को call करता है
     (कोई double fetch नहीं)
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      notify.warning("No user selected.");
      return;
    }

    if (isSaving) return;

    if (!validateForm()) return;

    const userId = getUserId(user);

    if (!userId) {
      notify.warning("User ID not found.");
      return;
    }

    if (typeof updateUser !== "function") {
      notify.error("Update user action not available.");
      return;
    }

    try {
      setIsSaving(true);

      /* ✅ App.jsx के updateUser को data दो
         वो खुद Backend को PUT करेगा */
      const payload = {
        _id: userId,
        id: userId,

        name: formData.name.trim(),
        username: formData.username
          .trim()
          .replace(/^@/, ""),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        plan: formData.plan,
        status: formData.status,

        /* Password सिर्फ तभी भेजो जब user ने नया डाला हो */
        ...(formData.password
          ? { password: formData.password }
          : {}),

        /* ✅ Image file — दोनों field names */
        imageFile,
        profileImage: imageFile,

        /* ✅ Image remove flag */
        imageRemoved,
      };

      console.log("📤 EditUser → updateUser");
      console.log("   userId:", userId);
      console.log("   imageFile:", imageFile?.name);
      console.log("   imageRemoved:", imageRemoved);

      const updated = await updateUser(payload);

      /* अगर App.jsx ने null return किया → error already handled */
      if (!updated) {
        return;
      }

      notify.success(
        "User Updated",
        "User updated successfully."
      );

      setActivePage("users");
    } catch (error) {
      console.error("Update User Error:", error);

      notify.error(
        "Update Failed",
        error.message ||
          "Something went wrong while updating the user."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================
     NO USER SELECTED
  ========================================= */

  if (!user) {
    return (
      <div className="edit-user-page">
        <div className="edit-user-empty">
          <FiUser size={45} />

          <h2>No User Selected</h2>

          <p>
            Please select a user from the users
            list.
          </p>

          <button
            type="button"
            className="back-button"
            onClick={() => setActivePage("users")}
          >
            <FiArrowLeft />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="edit-user-page">
      {/* HEADER */}
      <div className="edit-user-header">
        <div>
          <button
            type="button"
            className="back-link"
            onClick={() => setActivePage("users")}
            disabled={isSaving}
          >
            <FiArrowLeft />
            Back to Users
          </button>

          <h1>Edit User</h1>

          <p>
            Update user profile and account
            information.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        className="edit-user-form"
        onSubmit={handleSubmit}
      >
        {/* PROFILE IMAGE */}
        <div className="edit-user-card">
          <div className="section-header">
            <div className="section-icon">
              <FiImage />
            </div>

            <div>
              <h2>Profile Image</h2>

              <p>Update user's profile picture.</p>
            </div>
          </div>

          <div
            className={`edit-image-upload ${
              dragActive ? "drag-active" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="edit-image-preview">
                <img
                  src={preview}
                  alt={user.name || "User"}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

                <button
                  type="button"
                  className="remove-image"
                  onClick={removeImage}
                  title="Remove image"
                  disabled={isSaving}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <FiUploadCloud size={42} />

                <h3>Upload Profile Image</h3>

                <p>Drag & drop your image here</p>

                <span>or</span>

                <label className="choose-image">
                  Choose Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                </label>

                <small>
                  JPG, PNG, WEBP or GIF • Max 5 MB
                </small>
              </div>
            )}

            {preview && (
              <label className="change-image">
                <FiUploadCloud />
                Change Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={isSaving}
                />
              </label>
            )}
          </div>

          {errors.image && (
            <div className="field-error image-error">
              {errors.image}
            </div>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <div className="edit-user-card">
          <div className="section-header">
            <div className="section-icon">
              <FiUser />
            </div>

            <div>
              <h2>Basic Information</h2>

              <p>
                Update user's personal information.
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
                  onChange={handleChange}
                  placeholder="Enter full name"
                  disabled={isSaving}
                />
              </div>

              {errors.name && (
                <div className="field-error">
                  {errors.name}
                </div>
              )}
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
                  onChange={handleChange}
                  placeholder="Enter username"
                  disabled={isSaving}
                />
              </div>

              {errors.username && (
                <div className="field-error">
                  {errors.username}
                </div>
              )}
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
                  onChange={handleChange}
                  placeholder="Enter email address"
                  disabled={isSaving}
                />
              </div>

              {errors.email && (
                <div className="field-error">
                  {errors.email}
                </div>
              )}
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
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT SECURITY */}
        <div className="edit-user-card">
          <div className="section-header">
            <div className="section-icon">
              <FiLock />
            </div>

            <div>
              <h2>Account Security</h2>

              <p>Change password if required.</p>
            </div>
          </div>

          <div className="form-grid">
            {/* PASSWORD */}
            <div className="form-group">
              <label>New Password</label>

              <div className="input-wrapper">
                <FiLock />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  disabled={isSaving}
                />
              </div>

              {errors.password && (
                <div className="field-error">
                  {errors.password}
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label>Confirm New Password</label>

              <div className="input-wrapper">
                <FiLock />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={isSaving}
                />
              </div>

              {errors.confirmPassword && (
                <div className="field-error">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="edit-user-card">
          <div className="section-header">
            <div className="section-icon">
              <FiShield />
            </div>

            <div>
              <h2>Account Settings</h2>

              <p>
                Manage role, subscription and account
                status.
              </p>
            </div>
          </div>

          <div className="form-grid">
            {/* ROLE */}
            <div className="form-group">
              <label>User Role</label>

              <div className="input-wrapper select-wrapper">
                <FiShield />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="User">User</option>
                  <option value="Premium User">
                    Premium User
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">
                    Moderator
                  </option>
                </select>
              </div>
            </div>

            {/* PLAN */}
            <div className="form-group">
              <label>Subscription Plan</label>

              <div className="input-wrapper select-wrapper">
                <FiStar />

                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>

            {/* STATUS */}
            <div className="form-group">
              <label>Account Status</label>

              <div className="input-wrapper select-wrapper">
                <FiShield />

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">
                    Suspended
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="edit-form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setActivePage("users")}
            disabled={isSaving}
          >
            <FiX />
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={isSaving}
          >
            <FiSave />

            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;