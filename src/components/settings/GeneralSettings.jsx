import React, { useEffect, useRef, useState } from "react";
import {
  FiSettings,
  FiUpload,
  FiSave,
  FiGlobe,
  FiClock,
  FiCalendar,
  FiX,
} from "react-icons/fi";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

import "./GeneralSettings.css";

const SETTINGS_KEY = "generalSettings";
const LOGO_STORAGE_KEY = "adminGeneralLogo";

const DEFAULT_SETTINGS = {
  appName: "Music Admin",
  language: "English",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
};

/* ✅ NAYA: File → Base64 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

const GeneralSettings = () => {
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
      console.error("Failed to load general settings:", error);
    }

    return DEFAULT_SETTINGS;
  });

  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================================
     ✅ LOAD SAVED LOGO — localStorage (Base64)
  ========================================= */

  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem(
        LOGO_STORAGE_KEY
      );

      if (savedLogo) {
        setLogo(savedLogo);
      }
    } catch (error) {
      console.error("Failed to load saved logo:", error);
    }
  }, []);

  /* =========================================
     HANDLE TEXT SETTINGS
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     ✅ HANDLE LOGO — localStorage (Base64)
  ========================================= */

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    /* ✅ alert → notify.warning */
    if (!allowedTypes.includes(file.type)) {
      notify.warning(
        "Only JPG, PNG, WEBP and SVG images are allowed."
      );

      e.target.value = "";
      return;
    }

    /* ✅ alert → notify.warning */
    if (file.size > 5 * 1024 * 1024) {
      notify.warning("Logo size must be less than 5 MB.");

      e.target.value = "";
      return;
    }

    try {
      /* ✅ File → Base64 (localStorage के लिए) */
      const base64 = await fileToBase64(file);

      try {
        localStorage.setItem(LOGO_STORAGE_KEY, base64);
      } catch (storageError) {
        console.warn(
          "localStorage logo save failed (probably too large):",
          storageError
        );
      }

      setLogo(base64);
      setLogoFile(file);
    } catch (error) {
      console.error("Failed to save logo:", error);

      /* ✅ alert → notify.error */
      notify.error(
        "Logo save nahi ho paya. Please try again."
      );
    }

    e.target.value = "";
  };

  /* =========================================
     REMOVE LOGO
  ========================================= */

  const removeLogo = async () => {
    try {
      localStorage.removeItem(LOGO_STORAGE_KEY);

      setLogo("");
      setLogoFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      /* ✅ Success notify */
      notify.success("Logo removed successfully.");
    } catch (error) {
      console.error("Failed to remove logo:", error);

      /* ✅ alert → notify.error */
      notify.error("Logo remove nahi ho paya.");
    }
  };

  /* =========================================
     SAVE GENERAL SETTINGS
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      localStorage.setItem(
        "adminAppName",
        settings.appName
      );
      localStorage.setItem(
        "adminLanguage",
        settings.language
      );
      localStorage.setItem(
        "adminTimezone",
        settings.timezone
      );
      localStorage.setItem(
        "adminDateFormat",
        settings.dateFormat
      );

      /* ✅ alert → notify.success */
      notify.success(
        "Settings Saved",
        "General settings saved successfully."
      );
    } catch (error) {
      console.error("Failed to save general settings:", error);

      /* ✅ alert → notify.error */
      notify.error(
        "Save Failed",
        "Settings save nahi hui. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     RESET SETTINGS
  ========================================= */

  const handleReset = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset General Settings?",
      "Kya aap General Settings ko default par reset karna chahte hain?",
      "Yes, Reset",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );

    localStorage.setItem(
      "adminAppName",
      DEFAULT_SETTINGS.appName
    );
    localStorage.setItem(
      "adminLanguage",
      DEFAULT_SETTINGS.language
    );
    localStorage.setItem(
      "adminTimezone",
      DEFAULT_SETTINGS.timezone
    );
    localStorage.setItem(
      "adminDateFormat",
      DEFAULT_SETTINGS.dateFormat
    );

    /* ✅ alert → notify.success */
    notify.success(
      "Reset Complete",
      "General settings reset ho gayi."
    );
  };

  return (
    <div className="general-settings">
      {/* HEADER */}
      <div className="settings-page-header">
        <div>
          <h2>
            <FiSettings />
            General Settings
          </h2>

          <p>
            Manage your application's basic settings
            and branding.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        className="general-settings-form"
        onSubmit={handleSubmit}
      >
        {/* APPLICATION SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiSettings />
            </div>

            <div>
              <h3>Application Settings</h3>
              <p>
                Configure the basic information of
                your application.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* APP NAME */}
            <div className="form-group">
              <label htmlFor="appName">
                Application Name
              </label>

              <input
                id="appName"
                type="text"
                name="appName"
                value={settings.appName}
                onChange={handleChange}
                placeholder="Enter application name"
              />

              <small>
                This name will be used throughout the
                admin panel.
              </small>
            </div>

            {/* LANGUAGE */}
            <div className="form-group">
              <label htmlFor="language">
                <FiGlobe />
                Language
              </label>

              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            {/* TIMEZONE */}
            <div className="form-group">
              <label htmlFor="timezone">
                <FiClock />
                Timezone
              </label>

              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
              >
                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">
                  America/New_York
                </option>
                <option value="America/Los_Angeles">
                  America/Los_Angeles
                </option>
                <option value="Europe/London">
                  Europe/London
                </option>
                <option value="Europe/Paris">
                  Europe/Paris
                </option>
                <option value="Asia/Dubai">
                  Asia/Dubai
                </option>
                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>
                <option value="Asia/Tokyo">
                  Asia/Tokyo
                </option>
              </select>
            </div>

            {/* DATE FORMAT */}
            <div className="form-group">
              <label htmlFor="dateFormat">
                <FiCalendar />
                Date Format
              </label>

              <select
                id="dateFormat"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleChange}
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>
                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>
                <option value="YYYY-MM-DD">
                  YYYY-MM-DD
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* LOGO SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiUpload />
            </div>

            <div>
              <h3>Application Logo</h3>

              <p>
                Upload the logo that will be used in
                your admin panel.
              </p>
            </div>
          </div>

          <div className="logo-settings">
            {logo ? (
              <div className="logo-preview-container">
                <div className="logo-preview">
                  <img
                    src={logo}
                    alt="Application Logo"
                  />
                </div>

                <div className="logo-actions">
                  <button
                    type="button"
                    className="upload-logo-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <FiUpload />
                    Change Logo
                  </button>

                  <button
                    type="button"
                    className="remove-logo-btn"
                    onClick={removeLogo}
                  >
                    <FiX />
                    Remove Logo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="logo-upload-area"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <FiUpload />

                <strong>Upload Application Logo</strong>

                <span>
                  JPG, PNG, WEBP or SVG — Max 5 MB
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
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

export default GeneralSettings;