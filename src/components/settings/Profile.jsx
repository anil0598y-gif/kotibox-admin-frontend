import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiUpload,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from "react-icons/fi";

/* ✅ Swal → notify */
import notify from "../../utils/notify";

import "./Profile.css";

/* ✅ apiRequest import */
import {
  apiRequest,
  API_BASE_URL,
} from "../../utils/apiRequest";

const PROFILE_KEY = "adminProfile";
const PROFILE_IMAGE_KEY = "adminProfileImage";

const SERVER_BASE_URL = API_BASE_URL.replace(
  /\/api\/?$/,
  ""
);

const toServerUrl = (url) => {
  if (!url) return "";

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  return `${SERVER_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

const DEFAULT_PROFILE = {
  name: "Admin",
  username: "admin",
  email: "admin@gmail.com",
  phone: "9876543210",
};

const DEFAULT_PASSWORD_DATA = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Profile = () => {
  /* =========================================
     PROFILE STATE
  ========================================= */

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);

      if (saved) {
        return {
          ...DEFAULT_PROFILE,
          ...JSON.parse(saved),
        };
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }

    return { ...DEFAULT_PROFILE };
  });

  const [profileImage, setProfileImage] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedImageFile, setSelectedImageFile] =
    useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  /* =========================================
     PASSWORD STATE
  ========================================= */

  const [passwordData, setPasswordData] = useState({
    ...DEFAULT_PASSWORD_DATA,
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  /* =========================================
     LOAD PROFILE FROM BACKEND + localStorage
  ========================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setImageLoading(true);

        /* 1️⃣ localStorage से instant load */
        const saved = localStorage.getItem(PROFILE_KEY);

        if (saved) {
          try {
            const parsed = JSON.parse(saved);

            setProfile({
              ...DEFAULT_PROFILE,
              ...parsed,
            });
          } catch (e) {
            console.warn("Bad cached profile:", e);
          }
        }

        /* 2️⃣ localStorage image */
        const savedLocalImage = localStorage.getItem(
          PROFILE_IMAGE_KEY
        );

        if (savedLocalImage) {
          setProfileImage(savedLocalImage);
        }

        /* 3️⃣ Backend */
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setImageLoading(false);
          return;
        }

        try {
          const response = await apiRequest(
            `${API_BASE_URL}/admin/me`
          );

          if (response.ok) {
            const payload = await response.json();
            const admin = payload?.data ?? payload;

            if (admin) {
              const merged = {
                name: admin.name || DEFAULT_PROFILE.name,
                username:
                  admin.username || DEFAULT_PROFILE.username,
                email: admin.email || DEFAULT_PROFILE.email,
                phone: admin.phone || DEFAULT_PROFILE.phone,
                avatar: admin.avatar || "",
                profileImage: admin.profileImage || "",
              };

              setProfile(merged);

              localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(merged)
              );

              const backendImage =
                admin.avatar || admin.profileImage;

              if (backendImage) {
                const fullImageUrl =
                  toServerUrl(backendImage);

                setProfileImage(fullImageUrl);

                localStorage.setItem(
                  PROFILE_IMAGE_KEY,
                  fullImageUrl
                );
              } else if (!savedLocalImage) {
                setProfileImage("");
              }
            }
          }
        } catch (fetchError) {
          if (fetchError.message !== "Session expired") {
            console.warn(
              "Backend fetch failed:",
              fetchError
            );
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setImageLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================================
     CHANGE HANDLERS
  ========================================= */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     IMAGE SELECT
  ========================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /* ✅ Swal → notify.error */
    if (!file.type.startsWith("image/")) {
      notify.error(
        "Invalid image",
        "Please select a valid image file."
      );
      return;
    }

    /* ✅ Swal → notify.error */
    if (file.size > 5 * 1024 * 1024) {
      notify.error(
        "Too large",
        "Image should be smaller than 5 MB."
      );
      return;
    }

    setSelectedImageFile(file);
    setImageRemoved(false);

    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    e.target.value = "";
  };

  /* =========================================
     REMOVE IMAGE
  ========================================= */

  const handleRemoveImage = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Remove Profile Image?",
      "Kya aap profile image remove karna chahte hain?",
      "Yes, Remove",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    setSelectedImageFile(null);
    setImageRemoved(true);
    setProfileImage("");
  };

  /* =========================================
     SAVE PROFILE
  ========================================= */

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    /* ✅ Swal → notify.warning */
    if (!profile.name.trim()) {
      notify.warning("Name required");
      return;
    }

    if (!profile.username.trim()) {
      notify.warning("Username required");
      return;
    }

    if (!profile.email.trim()) {
      notify.warning("Email required");
      return;
    }

    setSavingProfile(true);

    try {
      const token = localStorage.getItem("adminToken");

      /* ✅ Swal → notify.warning */
      if (!token) {
        notify.warning(
          "Session expired",
          "Please login again."
        );
        setSavingProfile(false);
        return;
      }

      const formData = new FormData();

      formData.append("name", profile.name.trim());
      formData.append("username", profile.username.trim());
      formData.append("email", profile.email.trim());
      formData.append(
        "phone",
        (profile.phone || "").trim()
      );

      if (selectedImageFile) {
        formData.append("avatar", selectedImageFile);
      }

      if (imageRemoved) {
        formData.append("removeImage", "true");
      }

      const response = await apiRequest(
        `${API_BASE_URL}/admin/me`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      /* ✅ Swal → notify.error */
      if (!response.ok) {
        notify.error(
          "Save failed",
          result?.message ||
            "Backend could not save."
        );
        setSavingProfile(false);
        return;
      }

      const updated = result?.data ?? result;

      const finalProfile = {
        name: updated.name || profile.name.trim(),
        username:
          updated.username || profile.username.trim(),
        email: updated.email || profile.email.trim(),
        phone: updated.phone || profile.phone.trim(),
        avatar: updated.avatar || "",
        profileImage: updated.profileImage || "",
      };

      setProfile(finalProfile);

      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(finalProfile)
      );

      const backendImage =
        finalProfile.avatar || finalProfile.profileImage;

      if (backendImage) {
        const fullImageUrl = toServerUrl(backendImage);

        setProfileImage(fullImageUrl);

        localStorage.setItem(
          PROFILE_IMAGE_KEY,
          fullImageUrl
        );
      } else if (imageRemoved) {
        setProfileImage("");
        localStorage.removeItem(PROFILE_IMAGE_KEY);
      }

      setSelectedImageFile(null);
      setImageRemoved(false);

      /* ✅ Swal → notify.success */
      notify.success(
        "Profile updated",
        "Your profile has been saved successfully."
      );
    } catch (error) {
      if (error.message !== "Session expired") {
        console.error("Save profile error:", error);

        /* ✅ Swal → notify.error */
        notify.error(
          "Save failed",
          error?.message || "Profile save nahi hui."
        );
      }
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================
     SAVE PASSWORD
  ========================================= */

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    /* ✅ Swal → notify.warning */
    if (!passwordData.currentPassword) {
      notify.warning("Current password required");
      return;
    }

    if (!passwordData.newPassword) {
      notify.warning("New password required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      notify.warning(
        "Password too short",
        "Kam se kam 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      notify.warning("Passwords don't match");
      return;
    }

    setSavingPassword(true);

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/change-password`,
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword:
              passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      /* ✅ Swal → notify.error */
      if (!response.ok) {
        notify.error(
          "Failed",
          result?.message || "Password change failed."
        );
        setSavingPassword(false);
        return;
      }

      if (result.token) {
        localStorage.setItem(
          "adminToken",
          result.token
        );
      }

      setPasswordData({ ...DEFAULT_PASSWORD_DATA });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      /* ✅ Swal → notify.success */
      notify.success(
        "Password updated",
        "All other sessions have been logged out."
      );
    } catch (error) {
      if (error.message !== "Session expired") {
        console.error("Password error:", error);

        /* ✅ Swal → notify.error */
        notify.error(
          "Failed",
          error?.message || "Password update nahi hua."
        );
      }
    } finally {
      setSavingPassword(false);
    }
  };

  /* =========================================
     RESET PROFILE FORM
  ========================================= */

  const handleResetProfile = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset Form?",
      "Reset form to saved values?",
      "Yes, Reset",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    try {
      const saved = localStorage.getItem(PROFILE_KEY);

      if (saved) {
        setProfile({
          ...DEFAULT_PROFILE,
          ...JSON.parse(saved),
        });
      } else {
        setProfile({ ...DEFAULT_PROFILE });
      }

      setSelectedImageFile(null);
      setImageRemoved(false);
    } catch {
      setProfile({ ...DEFAULT_PROFILE });
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="profile-settings">
      {/* HEADER */}
      <div className="profile-page-header">
        <div>
          <h2>
            <FiUser />
            Profile
          </h2>

          <p>
            Manage your administrator profile and
            account password.
          </p>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-card-icon">
            <FiUser />
          </div>

          <div>
            <h3>Profile Information</h3>
            <p>
              Update your personal and administrator
              information.
            </p>
          </div>
        </div>

        <form
          className="profile-form"
          onSubmit={handleProfileSubmit}
        >
          {/* IMAGE */}
          <div className="profile-image-section">
            <div className="profile-image-wrapper">
              {imageLoading ? (
                <div className="profile-image-loading">
                  Loading...
                </div>
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt="Admin Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  <FiUser />
                </div>
              )}
            </div>

            <div className="profile-image-content">
              <h4>Profile Image</h4>
              <p>
                JPG, PNG or WEBP. Recommended square
                image.
              </p>

              <div className="profile-image-actions">
                <label className="profile-upload-btn">
                  <FiUpload />
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>

                {(profileImage || selectedImageFile) && (
                  <button
                    type="button"
                    className="profile-remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    <FiX />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FIELDS */}
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">
                Full Name
              </label>

              <div className="profile-input-wrapper">
                <FiUser />

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-username">
                Username
              </label>

              <div className="profile-input-wrapper">
                <FiUser />

                <input
                  id="profile-username"
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">
                Email Address
              </label>

              <div className="profile-input-wrapper">
                <FiMail />

                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">
                Phone Number
              </label>

              <div className="profile-input-wrapper">
                <FiPhone />

                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="profile-actions">
            <button
              type="button"
              className="profile-reset-btn"
              onClick={handleResetProfile}
            >
              <FiRefreshCw />
              Reset
            </button>

            <button
              type="submit"
              className="profile-save-btn"
              disabled={savingProfile}
            >
              <FiSave />
              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* PASSWORD CARD */}
      <div className="profile-card password-card">
        <div className="profile-card-header">
          <div className="profile-card-icon">
            <FiLock />
          </div>

          <div>
            <h3>Change Password</h3>
            <p>
              Update your administrator account
              password.
            </p>
          </div>
        </div>

        <form
          className="password-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="profile-field">
            <label htmlFor="current-password">
              Current Password
            </label>

            <div className="profile-password-wrapper">
              <FiLock />

              <input
                id="current-password"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (prev) => !prev
                  )
                }
              >
                {showCurrentPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label htmlFor="new-password">
                New Password
              </label>

              <div className="profile-password-wrapper">
                <FiLock />

                <input
                  id="new-password"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showNewPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <div className="profile-password-wrapper">
                <FiLock />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="password-note">
            Password should contain at least 6
            characters.
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-save-btn"
              disabled={savingPassword}
            >
              <FiSave />
              {savingPassword
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;