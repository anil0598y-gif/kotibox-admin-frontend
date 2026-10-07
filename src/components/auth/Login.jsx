import React, { useState } from "react";

import {
  Music2,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Headphones,
  BarChart3,
  Users,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Swal from "sweetalert2";

import ForgotPassword from "./ForgotPassword";

import logo from "../../assets/download.png";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  /* =========================================================
     FORGOT PASSWORD PAGE
  ========================================================= */

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  /* =========================================================
     SAVE ADMIN SESSION (with JWT token)
  ========================================================= */

  const saveAdminSession = (adminUser, token) => {
    /* ✅ Login flags */
    localStorage.setItem("isAdminLoggedIn", "true");
    localStorage.setItem("adminLoggedIn", "true");

    /* ✅ JWT token save करो */
    if (token) {
      localStorage.setItem("adminToken", token);
    }

    /* ✅ Admin ID save करो */
    const adminId = String(
      adminUser._id || adminUser.id || ""
    );

    if (adminId) {
      localStorage.setItem("adminId", adminId);
      localStorage.setItem("adminUserId", adminId);
    }

    /* ✅ Admin profile cache करो */
    try {
      localStorage.setItem(
        "adminProfile",
        JSON.stringify({
          _id: adminId,
          id: adminId,
          name: adminUser.name || "Admin",
          username: adminUser.username || "admin",
          email: adminUser.email || "",
          phone: adminUser.phone || "",
          role: adminUser.role || "Administrator",
          status: adminUser.status || "Active",
          avatar:
            adminUser.avatar ||
            adminUser.profileImage ||
            "",
          profileImage:
            adminUser.profileImage ||
            adminUser.avatar ||
            "",
        })
      );
    } catch (e) {
      console.warn("adminProfile save failed:", e);
    }

    /* ✅ Remember me */
    if (rememberMe) {
      localStorage.setItem("rememberAdmin", "true");
    } else {
      localStorage.removeItem("rememberAdmin");
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please enter your email and password.",
        confirmButtonText: "Okay",
        customClass: {
          popup: "login-swal-popup",
          confirmButton: "login-swal-button",
        },
      });

      return;
    }

    if (!email.includes("@")) {
      Swal.fire({
        icon: "error",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonText: "Try again",
        customClass: {
          popup: "login-swal-popup",
          confirmButton: "login-swal-button",
        },
      });

      return;
    }

    setLoading(true);

    try {
      /* ✅ Backend login API call */
      const res = await fetch(
        `${API_BASE_URL}/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const payload = await res
        .json()
        .catch(() => ({}));

      /* ✅ Success */
      if (
        res.ok &&
        payload?.success !== false &&
        payload?.token
      ) {
        const adminUser = payload.data || payload;

        saveAdminSession(adminUser, payload.token);

        Swal.fire({
          icon: "success",
          title: "Welcome back!",
          text: "Admin login successful.",
          timer: 1200,
          showConfirmButton: false,
          customClass: {
            popup: "login-swal-popup",
          },
        }).then(() => {
          if (onLogin) {
            onLogin();
          }
        });
      } else {
        /* ❌ Wrong credentials */
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text:
            payload?.message ||
            "Email or password is incorrect.",
          confirmButtonText: "Try again",
          customClass: {
            popup: "login-swal-popup",
            confirmButton: "login-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: "Login error",
        text:
          error?.message ||
          "Unable to connect to server. Please try again.",
        confirmButtonText: "Okay",
        customClass: {
          popup: "login-swal-popup",
          confirmButton: "login-swal-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="login-page">
      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="login-bg">
        <div className="login-orb login-orb-one"></div>
        <div className="login-orb login-orb-two"></div>
        <div className="login-orb login-orb-three"></div>
        <div className="login-orb login-orb-four"></div>

        <div className="login-grid"></div>

        <div className="floating-icon floating-icon-one">
          <Music2 size={22} />
        </div>

        <div className="floating-icon floating-icon-two">
          <Headphones size={21} />
        </div>

        <div className="floating-icon floating-icon-three">
          <Music2 size={18} />
        </div>

        <div className="floating-icon floating-icon-four">
          <BarChart3 size={20} />
        </div>

        <div className="floating-icon floating-icon-five">
          <Sparkles size={19} />
        </div>

        <div className="floating-icon floating-icon-six">
          <Music2 size={17} />
        </div>

        <span className="music-particle particle-one"></span>
        <span className="music-particle particle-two"></span>
        <span className="music-particle particle-three"></span>
        <span className="music-particle particle-four"></span>
        <span className="music-particle particle-five"></span>
        <span className="music-particle particle-six"></span>
        <span className="music-particle particle-seven"></span>
        <span className="music-particle particle-eight"></span>
      </div>

      {/* =====================================================
          LOGIN CONTAINER
      ===================================================== */}

      <div className="login-container">
        {/* ===================================================
            LEFT SHOWCASE
        =================================================== */}

        <div className="login-showcase">
          <div className="showcase-top">
            <div className="brand-mark">
              <img
                src={logo}
                alt="Music Admin"
                className="login-logo-image"
              />
            </div>

            <div className="brand-text">
              <strong>Kotibox</strong>
              <span>Music Admin</span>
            </div>
          </div>

          <div className="showcase-content">
            <div className="showcase-badge">
              <Sparkles size={16} />
              <span>Premium Music Management</span>
            </div>

            <h1>
              Your music.
              <br />
              <span>Your control.</span>
            </h1>

            <p>
              Manage your entire music platform
              from one powerful, intelligent and
              beautifully designed admin workspace.
            </p>

            <div className="showcase-features">
              <div className="showcase-feature">
                <div className="feature-icon">
                  <Music2 size={19} />
                </div>

                <div>
                  <strong>Music Management</strong>
                  <span>
                    Control songs, albums and playlists
                  </span>
                </div>

                <CheckCircle2
                  size={18}
                  className="feature-check"
                />
              </div>

              <div className="showcase-feature">
                <div className="feature-icon">
                  <BarChart3 size={19} />
                </div>

                <div>
                  <strong>Smart Analytics</strong>
                  <span>
                    Track your platform performance
                  </span>
                </div>

                <CheckCircle2
                  size={18}
                  className="feature-check"
                />
              </div>

              <div className="showcase-feature">
                <div className="feature-icon">
                  <Users size={19} />
                </div>

                <div>
                  <strong>User Control</strong>
                  <span>
                    Manage your growing music community
                  </span>
                </div>

                <CheckCircle2
                  size={18}
                  className="feature-check"
                />
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="secure-status">
              <span className="status-dot"></span>
              <span>System operational</span>
            </div>

            <span>v1.0.0</span>
          </div>
        </div>

        {/* ===================================================
            RIGHT LOGIN CARD
        =================================================== */}

        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="mobile-brand">
              <div className="brand-mark">
                <img
                  src={logo}
                  alt="Music Admin"
                  className="login-logo-image"
                />
              </div>

              <div className="brand-text">
                <strong>Music Admin</strong>
                <span>Control Center</span>
              </div>
            </div>

            <div className="login-heading">
              <div className="login-icon">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h2>Welcome back</h2>
                <p>
                  Sign in to access your admin workspace.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleLogin}
              className="login-form"
            >
              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="admin-email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail
                    size={20}
                    className="input-icon"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                  />

                  {email && email.includes("@") && (
                    <CheckCircle2
                      size={18}
                      className="input-success"
                    />
                  )}
                </div>
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="admin-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      setShowForgotPassword(true)
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole
                    size={20}
                    className="input-icon"
                  />

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}

              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span className="custom-checkbox">
                    <CheckCircle2 size={13} />
                  </span>

                  <span>Remember me</span>
                </label>

                <div className="secure-login">
                  <ShieldCheck size={16} />
                  <span>Secure login</span>
                </div>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="login-spinner"
                    />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* BOTTOM */}

            <div className="login-bottom">
              <div className="bottom-line"></div>
              <span>Administrator access only</span>
              <div className="bottom-line"></div>
            </div>

            {/* COPYRIGHT */}

            <div className="copyright">
              <span>© 2026 Music Admin</span>
              <span className="copyright-dot">•</span>
              <span>Secure Control Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;