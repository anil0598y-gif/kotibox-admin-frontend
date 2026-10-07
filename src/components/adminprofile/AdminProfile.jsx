import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Edit3,
  Lock,
  LogOut,
  Save,
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";

import "./AdminProfile.css";

/* ✅ apiRequest import */
import {
  apiRequest,
  API_BASE_URL,
} from "../../utils/apiRequest";

const ADMIN_PROFILE_KEY = "adminProfile";
const ADMIN_PROFILE_IMAGE_KEY = "adminProfileImage";

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
  email: "admin@musicadmin.com",
  phone: "+91 98765 43210",
  role: "Administrator",
  status: "Active",
  accountId: "ADM-100001",
  joinedDate: "01 September 2026",
  lastLogin: "Today, 10:24 AM",
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

function AdminProfile({ setActivePage, onLogout }) {
  const fileInputRef = useRef(null);

  const [admin, setAdmin] = useState(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(DEFAULT_PROFILE);

  const [profileImage, setProfileImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [loadingImage, setLoadingImage] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        /* 1️⃣ localStorage से instant load */
        const savedProfile =
          localStorage.getItem(ADMIN_PROFILE_KEY);

        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);

            const mergedProfile = {
              ...DEFAULT_PROFILE,
              ...parsedProfile,
            };

            setAdmin(mergedProfile);
            setEditData(mergedProfile);
          } catch (e) {
            console.warn("Bad cached profile:", e);
          }
        }

        /* 2️⃣ localStorage से image load */
        const savedImage = localStorage.getItem(
          ADMIN_PROFILE_IMAGE_KEY
        );

        if (savedImage) {
          setProfileImage(savedImage);
        }

        /* 3️⃣ Backend से fresh data */
        const token = localStorage.getItem("adminToken");

        if (!token) {
          console.warn(
            "⚠️ Admin token not found. Using local profile."
          );
          return;
        }

        try {
          /* ✅ apiRequest use */
          const response = await apiRequest(
            `${API_BASE_URL}/admin/me`
          );

          if (response.ok) {
            const payload = await response.json();
            const backendAdmin = payload?.data ?? payload;

            if (backendAdmin) {
              const merged = {
                ...DEFAULT_PROFILE,
                ...backendAdmin,
                name:
                  backendAdmin.name ||
                  DEFAULT_PROFILE.name,
                username:
                  backendAdmin.username ||
                  DEFAULT_PROFILE.username,
                email:
                  backendAdmin.email ||
                  DEFAULT_PROFILE.email,
                phone:
                  backendAdmin.phone ||
                  DEFAULT_PROFILE.phone,
                lastLogin: backendAdmin.lastLogin
                  ? new Date(
                      backendAdmin.lastLogin
                    ).toLocaleString()
                  : DEFAULT_PROFILE.lastLogin,
                joinedDate: backendAdmin.createdAt
                  ? new Date(
                      backendAdmin.createdAt
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : DEFAULT_PROFILE.joinedDate,
              };

              setAdmin(merged);
              setEditData(merged);

              localStorage.setItem(
                ADMIN_PROFILE_KEY,
                JSON.stringify(merged)
              );

              const backendImage =
                backendAdmin.avatar ||
                backendAdmin.profileImage ||
                "";

              if (backendImage) {
                const fullImageUrl =
                  toServerUrl(backendImage);

                setProfileImage(fullImageUrl);

                /* ✅ localStorage में save — Settings → Profile sync */
                localStorage.setItem(
                  ADMIN_PROFILE_IMAGE_KEY,
                  fullImageUrl
                );
              } else if (!savedImage) {
                setProfileImage("");
              }
            }
          }
        } catch (fetchError) {
          if (fetchError.message !== "Session expired") {
            console.warn(
              "Backend profile fetch failed, using local profile:",
              fetchError
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load admin profile:",
          error
        );
      } finally {
        setLoadingImage(false);
      }
    };

    loadProfile();
  }, []);

  /* =====================================================
     EDIT / CANCEL / INPUT
  ===================================================== */

  const handleEditProfile = () => {
    setEditData(admin);
    setSelectedImage(null);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditData(admin);
    setSelectedImage(null);
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     IMAGE SELECT / REMOVE
  ===================================================== */

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid image",
        text: "Please select a valid image file.",
        confirmButtonColor: "#111",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Image too large",
        text: "Please select an image smaller than 5 MB.",
        confirmButtonColor: "#111",
      });

      e.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = async () => {
    try {
      setSelectedImage(null);
      setProfileImage("");

      localStorage.removeItem(ADMIN_PROFILE_IMAGE_KEY);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      Swal.fire({
        icon: "success",
        title: "Profile image removed",
        text: "Your profile image has been removed. Save changes to apply.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Failed to remove profile image:",
        error
      );
    }
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSaveProfile = async () => {
    if (!editData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter your name.",
      });
      return;
    }

    if (!editData.username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Username required",
        text: "Please enter your username.",
      });
      return;
    }

    if (!editData.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email.",
      });
      return;
    }

    setSaving(true);

    try {
      /* 1️⃣ IMAGE → BASE64 (localStorage fallback) */
      let imageDataUrl = profileImage;

      if (selectedImage) {
        imageDataUrl = await fileToBase64(selectedImage);

        try {
          localStorage.setItem(
            ADMIN_PROFILE_IMAGE_KEY,
            imageDataUrl
          );
        } catch (storageError) {
          console.warn(
            "localStorage image save failed:",
            storageError
          );
        }
      }

      /* 2️⃣ Updated profile object */
      const updatedProfile = {
        ...admin,
        name: editData.name.trim(),
        username: editData.username.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
      };

      /* 3️⃣ localStorage में instant save */
      localStorage.setItem(
        ADMIN_PROFILE_KEY,
        JSON.stringify(updatedProfile)
      );

      setAdmin(updatedProfile);
      setEditData(updatedProfile);

      if (selectedImage) {
        setProfileImage(imageDataUrl);
        setSelectedImage(null);
      }

      /* 4️⃣ BACKEND पर SAVE — FormData (image file) */
      const token = localStorage.getItem("adminToken");

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Session expired",
          text: "Please login again to save changes.",
        });
        setSaving(false);
        return;
      }

      try {
        const formData = new FormData();

        formData.append("name", updatedProfile.name);
        formData.append("username", updatedProfile.username);
        formData.append("email", updatedProfile.email);
        formData.append("phone", updatedProfile.phone);

        if (selectedImage) {
          formData.append("avatar", selectedImage);
        }

        /* ✅ apiRequest use — FormData support */
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

        if (!response.ok) {
          console.warn(
            "⚠️ Backend profile update failed:",
            result?.message || `Status ${response.status}`
          );

          Swal.fire({
            icon: "error",
            title: "Save failed",
            text:
              result?.message ||
              "Backend could not save your profile.",
          });

          setSaving(false);
          return;
        }

        const backendAdmin = result?.data ?? result;

        if (backendAdmin) {
          const merged = {
            ...updatedProfile,
            ...backendAdmin,
          };

          setAdmin(merged);
          setEditData(merged);

          localStorage.setItem(
            ADMIN_PROFILE_KEY,
            JSON.stringify(merged)
          );

          const backendImage =
            backendAdmin.avatar ||
            backendAdmin.profileImage;

          if (backendImage) {
            const fullImageUrl =
              toServerUrl(backendImage);

            setProfileImage(fullImageUrl);

            /* ✅ localStorage में save — Settings → Profile sync */
            localStorage.setItem(
              ADMIN_PROFILE_IMAGE_KEY,
              fullImageUrl
            );
          }
        }

        console.log("✅ Backend profile updated");
      } catch (backendError) {
        if (backendError.message !== "Session expired") {
          console.warn(
            "⚠️ Backend profile update error:",
            backendError
          );

          Swal.fire({
            icon: "error",
            title: "Network error",
            text: "Could not connect to server. Saved locally only.",
          });

          setSaving(false);
          return;
        } else {
          return;
        }
      }

      setEditMode(false);

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your profile has been saved successfully.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to save admin profile:", error);

      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: error?.message || "Unable to save your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CHANGE PASSWORD / LOGOUT
  ===================================================== */

  const handleChangePassword = () => {
    localStorage.setItem("settingsSection", "security");

    if (setActivePage) {
      setActivePage("settings");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    /* ✅ सारी admin keys clear */
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUserId");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("adminProfile");
    localStorage.removeItem("adminProfileImage");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("rememberAdmin");

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.reload();
  };

  /* =====================================================
     IMAGE PREVIEW
  ===================================================== */

  const imagePreview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : profileImage;

  /* =====================================================
     EDIT MODE
  ===================================================== */

  if (editMode) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-header">
          <div>
            <div className="admin-profile-breadcrumb">
              Dashboard / Admin Profile / Edit Profile
            </div>

            <h1>Edit Profile</h1>

            <p>
              Update your administrator profile
              information.
            </p>
          </div>

          <button
            className="admin-profile-cancel-btn"
            onClick={handleCancelEdit}
          >
            <X size={18} />
            Cancel
          </button>
        </div>

        <div className="admin-profile-edit-container">
          <div className="admin-profile-image-section">
            <div className="admin-profile-image-title">
              <Camera size={20} />
              <div>
                <h2>Profile Image</h2>
                <p>
                  Upload your administrator profile
                  picture.
                </p>
              </div>
            </div>

            <div className="admin-profile-image-editor">
              <div className="admin-profile-image-preview">
                {loadingImage ? (
                  <div className="admin-profile-image-loading">
                    Loading...
                  </div>
                ) : imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Admin profile"
                  />
                ) : (
                  <div className="admin-profile-image-placeholder">
                    <User size={55} />
                  </div>
                )}
              </div>

              <div className="admin-profile-image-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  className="admin-profile-upload-image-btn"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <Upload size={17} />
                  {profileImage
                    ? "Change Image"
                    : "Upload Image"}
                </button>

                {(profileImage || selectedImage) && (
                  <button
                    type="button"
                    className="admin-profile-remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 size={17} />
                    Remove Image
                  </button>
                )}

                <span>
                  JPG, PNG, WEBP • Maximum 5 MB
                </span>
              </div>
            </div>
          </div>

          <div className="admin-profile-form-section">
            <div className="admin-profile-form-grid">
              <div className="admin-profile-form-group">
                <label>Full Name</label>

                <div className="admin-profile-input-wrapper">
                  <User size={18} />

                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="admin-profile-form-group">
                <label>Username</label>

                <div className="admin-profile-input-wrapper">
                  <User size={18} />

                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="admin-profile-form-group">
                <label>Email Address</label>

                <div className="admin-profile-input-wrapper">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="admin-profile-form-group">
                <label>Phone Number</label>

                <div className="admin-profile-input-wrapper">
                  <Phone size={18} />

                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-profile-account-info">
            <div className="admin-profile-account-info-title">
              <Shield size={20} />

              <div>
                <h2>Account Information</h2>
                <p>These details cannot be edited.</p>
              </div>
            </div>

            <div className="admin-profile-readonly-grid">
              <div>
                <span>Role</span>
                <strong>{admin.role}</strong>
              </div>

              <div>
                <span>Status</span>

                <strong className="admin-profile-active-status">
                  <CheckCircle size={16} />
                  {admin.status}
                </strong>
              </div>

              <div>
                <span>Account ID</span>
                <strong>{admin.accountId}</strong>
              </div>

              <div>
                <span>Joined Date</span>
                <strong>{admin.joinedDate}</strong>
              </div>
            </div>
          </div>

          <div className="admin-profile-form-footer">
            <button
              type="button"
              className="admin-profile-cancel-footer-btn"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="button"
              className="admin-profile-save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <Save size={18} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     NORMAL PROFILE VIEW
  ===================================================== */

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <div>
          <div className="admin-profile-breadcrumb">
            Dashboard / Admin Profile
          </div>

          <h1>Admin Profile</h1>

          <p>
            Manage your administrator account and
            profile information.
          </p>
        </div>

        <button
          className="admin-profile-edit-btn"
          onClick={handleEditProfile}
        >
          <Edit3 size={18} />
          Edit Profile
        </button>
      </div>

      <div className="admin-profile-hero">
        <div className="admin-profile-avatar-large">
          {profileImage ? (
            <img src={profileImage} alt={admin.name} />
          ) : (
            <User size={58} />
          )}
        </div>

        <div className="admin-profile-hero-info">
          <h2>{admin.name}</h2>

          <p>@{admin.username}</p>

          <span className="admin-profile-role-badge">
            <Shield size={14} />
            {admin.role}
          </span>
        </div>

        <div className="admin-profile-status-badge">
          <CheckCircle size={15} />
          {admin.status}
        </div>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-card-header">
          <div>
            <h2>Profile Information</h2>
            <p>Your personal account information.</p>
          </div>
        </div>

        <div className="admin-profile-info-grid">
          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <User size={19} />
            </div>

            <div>
              <span>Full Name</span>
              <strong>{admin.name}</strong>
            </div>
          </div>

          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <User size={19} />
            </div>

            <div>
              <span>Username</span>
              <strong>@{admin.username}</strong>
            </div>
          </div>

          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <Mail size={19} />
            </div>

            <div>
              <span>Email Address</span>
              <strong>{admin.email}</strong>
            </div>
          </div>

          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <Phone size={19} />
            </div>

            <div>
              <span>Phone Number</span>
              <strong>{admin.phone}</strong>
            </div>
          </div>

          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <Shield size={19} />
            </div>

            <div>
              <span>Role</span>
              <strong>{admin.role}</strong>
            </div>
          </div>

          <div className="admin-profile-info-item">
            <div className="admin-profile-info-icon">
              <CheckCircle size={19} />
            </div>

            <div>
              <span>Status</span>
              <strong>{admin.status}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-card-header">
          <div>
            <h2>Account Activity</h2>
            <p>Important account information.</p>
          </div>
        </div>

        <div className="admin-profile-activity-grid">
          <div className="admin-profile-activity-item">
            <Calendar size={20} />

            <div>
              <span>Joined Date</span>
              <strong>{admin.joinedDate}</strong>
            </div>
          </div>

          <div className="admin-profile-activity-item">
            <Clock size={20} />

            <div>
              <span>Last Login</span>
              <strong>{admin.lastLogin}</strong>
            </div>
          </div>

          <div className="admin-profile-activity-item">
            <Shield size={20} />

            <div>
              <span>Account ID</span>
              <strong>{admin.accountId}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-security-card">
        <div className="admin-profile-security-icon">
          <Lock size={23} />
        </div>

        <div className="admin-profile-security-content">
          <h3>Account Security</h3>

          <p>
            Keep your account secure by using a strong
            password and regularly reviewing your
            security settings.
          </p>
        </div>

        <button
          onClick={handleChangePassword}
          className="admin-profile-security-btn"
        >
          <Lock size={17} />
          Change Password
        </button>
      </div>

      <div className="admin-profile-danger-card">
        <div>
          <h3>Logout</h3>

          <p>
            Sign out from your administrator account.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="admin-profile-logout-btn"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminProfile;