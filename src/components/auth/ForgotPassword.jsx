import React, { useState } from "react";

import {
  Music2,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

import Swal from "sweetalert2";

import logo from "../../assets/download.png";

import "./ForgotPassword.css";

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const adminEmail = "anil0598y@gmail.com";

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your admin email.",
        confirmButtonText: "Okay",
      });

      return;
    }

    if (!email.includes("@")) {
      Swal.fire({
        icon: "error",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonText: "Try again",
      });

      return;
    }

    if (email.trim().toLowerCase() !== adminEmail) {
      Swal.fire({
        icon: "error",
        title: "Email not found",
        text: "This email is not registered as an admin account.",
        confirmButtonText: "Try again",
      });

      return;
    }

    if (!newPassword.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Password required",
        text: "Please enter your new password.",
        confirmButtonText: "Okay",
      });

      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Password must contain at least 6 characters.",
        confirmButtonText: "Okay",
      });

      return;
    }

    if (!confirmPassword.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Confirm password",
        text: "Please confirm your new password.",
        confirmButtonText: "Okay",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        text: "New password and confirm password must be the same.",
        confirmButtonText: "Try again",
      });

      return;
    }

    setLoading(true);

    setTimeout(() => {
      /*
        Backend nahi hai, isliye password
        localStorage me save ho raha hai.
      */

      localStorage.setItem(
        "adminPassword",
        newPassword
      );

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "Your admin password has been changed successfully.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        if (onBack) {
          onBack();
        }
      });
    }, 700);
  };

  return (
    <div className="forgot-page">

      {/* BACKGROUND */}

      <div className="forgot-bg">

        <div className="forgot-orb forgot-orb-one"></div>

        <div className="forgot-orb forgot-orb-two"></div>

        <div className="forgot-grid"></div>

      </div>

      {/* MAIN */}

      <div className="forgot-container">

        {/* BRAND */}

        <div className="forgot-brand">

          <div className="forgot-brand-icon">

            <img
              src={logo}
              alt="Music Admin"
              className="forgot-logo-image"
            />

          </div>

          <div className="forgot-brand-text">

            <strong>
              Kotibox
            </strong>

            <span>
               Music Admin
            </span>

          </div>

        </div>

        {/* CARD */}

        <div className="forgot-card">

          {/* ICON */}

          <div className="forgot-main-icon">

            <KeyRound size={28} />

          </div>

          {/* HEADING */}

          <div className="forgot-heading">

            <h1>
              Reset your password
            </h1>

            <p>
              Enter your admin email and create
              a new password for your account.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleResetPassword}
            className="forgot-form"
          >

            {/* EMAIL */}

            <div className="forgot-form-group">

              <label htmlFor="forgot-email">
                Admin email
              </label>

              <div className="forgot-input-wrapper">

                <Mail
                  size={19}
                  className="forgot-input-icon"
                />

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

                {email &&
                  email.includes("@") && (
                    <CheckCircle2
                      size={18}
                      className="forgot-input-success"
                    />
                  )}

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div className="forgot-form-group">

              <label htmlFor="new-password">
                New password
              </label>

              <div className="forgot-input-wrapper">

                <LockKeyhole
                  size={19}
                  className="forgot-input-icon"
                />

                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="forgot-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

              <span className="password-help">
                Minimum 6 characters
              </span>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="forgot-form-group">

              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <div className="forgot-input-wrapper">

                <LockKeyhole
                  size={19}
                  className="forgot-input-icon"
                />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="forgot-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>

            {/* RESET BUTTON */}

            <button
              type="submit"
              className="reset-password-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="reset-spinner"></span>

                  Updating password...
                </>
              ) : (
                <>
                  <KeyRound size={18} />

                  Update password
                </>
              )}

            </button>

          </form>

          {/* SECURITY */}

          <div className="forgot-security">

            <ShieldCheck size={17} />

            <span>
              Your password is stored securely
              on this device.
            </span>

          </div>

          {/* BACK */}

          <button
            type="button"
            className="back-login-button"
            onClick={onBack}
          >

            <ArrowLeft size={17} />

            Back to Login

          </button>

        </div>

        {/* FOOTER */}

        <div className="forgot-footer">

          <span>
            © 2026 Music Admin
          </span>

          <span>
            •
          </span>

          <span>
            Secure Control Center
          </span>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;