import React, { useState } from "react";
import {
  FiUsers,
  FiSave,
  FiUserPlus,
  FiMail,
  FiEdit3,
  FiAtSign,
  FiCheck,
} from "react-icons/fi";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

import "./UserSettings.css";

const SETTINGS_KEY = "userSettings";

const DEFAULT_SETTINGS = {
  defaultRole: "User",
  registration: true,
  emailVerification: true,
  profileEditing: true,
  usernameChange: false,
  defaultStatus: "Active",
};

const UserSettings = () => {
  /* =========================================
     LOAD SAVED SETTINGS
  ========================================= */

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }

    return { ...DEFAULT_SETTINGS };
  });

  const [saving, setSaving] = useState(false);

  /* =========================================
     NORMAL CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     TOGGLE CHANGE
  ========================================= */

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  /* =========================================
     SAVE SETTINGS
  ========================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      localStorage.setItem(
        "userDefaultRole",
        settings.defaultRole
      );

      localStorage.setItem(
        "userRegistration",
        String(settings.registration)
      );

      localStorage.setItem(
        "userEmailVerification",
        String(settings.emailVerification)
      );

      localStorage.setItem(
        "userProfileEditing",
        String(settings.profileEditing)
      );

      localStorage.setItem(
        "userUsernameChange",
        String(settings.usernameChange)
      );

      localStorage.setItem(
        "userDefaultStatus",
        settings.defaultStatus
      );

      setTimeout(() => {
        setSaving(false);

        /* ✅ alert → notify.success */
        notify.success(
          "Settings Saved",
          "User settings saved successfully."
        );
      }, 300);
    } catch (error) {
      console.error("Failed to save user settings:", error);

      setSaving(false);

      /* ✅ alert → notify.error */
      notify.error(
        "Save Failed",
        "User settings save nahi hui. Please try again."
      );
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const handleReset = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset User Settings?",
      "Kya aap User Settings ko default par reset karna chahte hain?",
      "Yes, Reset",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    const resetSettings = { ...DEFAULT_SETTINGS };

    setSettings(resetSettings);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(resetSettings)
    );

    localStorage.setItem(
      "userDefaultRole",
      resetSettings.defaultRole
    );

    localStorage.setItem(
      "userRegistration",
      String(resetSettings.registration)
    );

    localStorage.setItem(
      "userEmailVerification",
      String(resetSettings.emailVerification)
    );

    localStorage.setItem(
      "userProfileEditing",
      String(resetSettings.profileEditing)
    );

    localStorage.setItem(
      "userUsernameChange",
      String(resetSettings.usernameChange)
    );

    localStorage.setItem(
      "userDefaultStatus",
      resetSettings.defaultStatus
    );

    /* ✅ alert → notify.success */
    notify.success(
      "Reset Complete",
      "User settings reset ho gayi."
    );
  };

  return (
    <div className="user-settings">
      {/* HEADER */}
      <div className="settings-page-header">
        <div>
          <h2>
            <FiUsers />
            User Settings
          </h2>

          <p>
            Manage user registration, profiles and
            default user preferences.
          </p>
        </div>
      </div>

      <form
        className="user-settings-form"
        onSubmit={handleSubmit}
      >
        {/* DEFAULT USER SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiUsers />
            </div>

            <div>
              <h3>Default User Settings</h3>

              <p>
                Choose the default role and status
                for newly created users.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* DEFAULT ROLE */}
            <div className="form-group">
              <label htmlFor="defaultRole">
                Default Role
              </label>

              <select
                id="defaultRole"
                name="defaultRole"
                value={settings.defaultRole}
                onChange={handleChange}
              >
                <option value="User">User</option>
                <option value="Artist">Artist</option>
                <option value="Editor">Editor</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>

              <small>
                Role automatically selected for new
                users.
              </small>
            </div>

            {/* DEFAULT STATUS */}
            <div className="form-group">
              <label htmlFor="defaultStatus">
                Default Status
              </label>

              <select
                id="defaultStatus"
                name="defaultStatus"
                value={settings.defaultStatus}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>

              <small>
                Status automatically selected for new
                users.
              </small>
            </div>
          </div>
        </div>

        {/* REGISTRATION */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiUserPlus />
            </div>

            <div>
              <h3>Registration</h3>

              <p>
                Control whether new users can
                register for the application.
              </p>
            </div>
          </div>

          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-title-row">
                <FiUserPlus />

                <h4>User Registration</h4>
              </div>

              <p>
                Allow new users to create an account.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.registration ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("registration")
              }
              aria-label="Toggle user registration"
              aria-pressed={settings.registration}
            >
              <span />
            </button>
          </div>
        </div>

        {/* EMAIL VERIFICATION */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMail />
            </div>

            <div>
              <h3>Email Verification</h3>

              <p>
                Configure email verification for
                registered users.
              </p>
            </div>
          </div>

          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-title-row">
                <FiMail />

                <h4>Require Email Verification</h4>
              </div>

              <p>
                Users must verify their email before
                accessing the application.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.emailVerification
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleToggle("emailVerification")
              }
              aria-label="Toggle email verification"
              aria-pressed={settings.emailVerification}
            >
              <span />
            </button>
          </div>
        </div>

        {/* PROFILE SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiEdit3 />
            </div>

            <div>
              <h3>Profile Settings</h3>

              <p>
                Control what users can change in
                their profiles.
              </p>
            </div>
          </div>

          {/* PROFILE EDITING */}
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-title-row">
                <FiEdit3 />

                <h4>Profile Editing</h4>
              </div>

              <p>
                Allow users to edit their profile
                information.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.profileEditing ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("profileEditing")
              }
              aria-label="Toggle profile editing"
              aria-pressed={settings.profileEditing}
            >
              <span />
            </button>
          </div>

          {/* USERNAME CHANGE */}
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-title-row">
                <FiAtSign />

                <h4>Username Change</h4>
              </div>

              <p>
                Allow users to change their username
                after registration.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.usernameChange ? "active" : ""
              }`}
              onClick={() =>
                handleToggle("usernameChange")
              }
              aria-label="Toggle username change"
              aria-pressed={settings.usernameChange}
            >
              <span />
            </button>
          </div>
        </div>

        {/* CURRENT SETTINGS SUMMARY */}
        <div className="settings-card settings-summary-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiCheck />
            </div>

            <div>
              <h3>Current Configuration</h3>

              <p>
                Current values of your user settings.
              </p>
            </div>
          </div>

          <div className="settings-summary">
            <div className="summary-item">
              <span>Default Role</span>

              <strong>{settings.defaultRole}</strong>
            </div>

            <div className="summary-item">
              <span>Default Status</span>

              <strong>{settings.defaultStatus}</strong>
            </div>

            <div className="summary-item">
              <span>Registration</span>

              <strong
                className={
                  settings.registration
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.registration
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Email Verification</span>

              <strong
                className={
                  settings.emailVerification
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.emailVerification
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Profile Editing</span>

              <strong
                className={
                  settings.profileEditing
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.profileEditing
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="summary-item">
              <span>Username Change</span>

              <strong
                className={
                  settings.usernameChange
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.usernameChange
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="settings-actions">
          <button
            type="button"
            className="reset-settings-btn"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="submit"
            className="save-settings-btn"
            disabled={saving}
          >
            <FiSave />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;