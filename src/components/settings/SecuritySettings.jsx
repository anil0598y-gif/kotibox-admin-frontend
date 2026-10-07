import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiLock,
  FiClock,
  FiAlertTriangle,
  FiKey,
  FiSave,
  FiRefreshCw,
  FiLogOut,
  FiTrash2,
  FiMonitor,
  FiSmartphone,
  FiMapPin,
} from "react-icons/fi";

/* ✅ Swal → notify */
import notify from "../../utils/notify";

import "./SecuritySettings.css";

/* ✅ apiRequest import */
import {
  apiRequest,
  API_BASE_URL,
} from "../../utils/apiRequest";

const SETTINGS_KEY = "securitySettings";

const DEFAULT_SETTINGS = {
  minPasswordLength: "8",
  passwordExpiry: "90",
  sessionTimeout: "60",
  maxLoginAttempts: "5",
  twoFactorAuth: false,
  loginAlerts: true,
  forceStrongPassword: true,
  accountLockout: true,
};

const SecuritySettings = ({ onLogout }) => {
  /* =========================================
     SETTINGS STATE
  ========================================= */

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);

      if (saved) {
        return {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        };
      }
    } catch (error) {
      console.error(
        "Failed to load security settings:",
        error
      );
    }

    return { ...DEFAULT_SETTINGS };
  });

  const [saving, setSaving] = useState(false);

  /* =========================================
     LOGIN HISTORY STATE
  ========================================= */

  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  /* =========================================
     LOAD LOGIN HISTORY
  ========================================= */

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);

        const token = localStorage.getItem("adminToken");

        if (!token) {
          setLoadingHistory(false);
          return;
        }

        const response = await apiRequest(
          `${API_BASE_URL}/admin/login-history`
        );

        if (response.ok) {
          const payload = await response.json();
          setLoginHistory(payload?.data || []);
        }
      } catch (error) {
        if (error.message !== "Session expired") {
          console.error(
            "Failed to load login history:",
            error
          );
        }
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     TOGGLE
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

    const minPasswordLength = Number(
      settings.minPasswordLength
    );

    const passwordExpiry = Number(
      settings.passwordExpiry
    );

    const sessionTimeout = Number(
      settings.sessionTimeout
    );

    const maxLoginAttempts = Number(
      settings.maxLoginAttempts
    );

    /* ✅ alert → notify.warning */
    if (
      !Number.isInteger(minPasswordLength) ||
      minPasswordLength < 6
    ) {
      notify.warning(
        "Minimum password length kam se kam 6 characters honi chahiye."
      );
      return;
    }

    if (
      !Number.isInteger(passwordExpiry) ||
      passwordExpiry < 0
    ) {
      notify.warning(
        "Password expiry valid number hona chahiye."
      );
      return;
    }

    if (
      !Number.isInteger(sessionTimeout) ||
      sessionTimeout < 1
    ) {
      notify.warning(
        "Session timeout kam se kam 1 minute hona chahiye."
      );
      return;
    }

    if (
      !Number.isInteger(maxLoginAttempts) ||
      maxLoginAttempts < 1
    ) {
      notify.warning(
        "Maximum login attempts kam se kam 1 hona chahiye."
      );
      return;
    }

    const finalSettings = {
      ...settings,
      minPasswordLength: String(minPasswordLength),
      passwordExpiry: String(passwordExpiry),
      sessionTimeout: String(sessionTimeout),
      maxLoginAttempts: String(maxLoginAttempts),
    };

    try {
      setSaving(true);

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(finalSettings)
      );

      localStorage.setItem(
        "securityMinPasswordLength",
        finalSettings.minPasswordLength
      );
      localStorage.setItem(
        "securityPasswordExpiry",
        finalSettings.passwordExpiry
      );
      localStorage.setItem(
        "securitySessionTimeout",
        finalSettings.sessionTimeout
      );
      localStorage.setItem(
        "securityMaxLoginAttempts",
        finalSettings.maxLoginAttempts
      );
      localStorage.setItem(
        "securityTwoFactorAuth",
        String(finalSettings.twoFactorAuth)
      );
      localStorage.setItem(
        "securityLoginAlerts",
        String(finalSettings.loginAlerts)
      );
      localStorage.setItem(
        "securityForceStrongPassword",
        String(finalSettings.forceStrongPassword)
      );
      localStorage.setItem(
        "securityAccountLockout",
        String(finalSettings.accountLockout)
      );

      setSettings(finalSettings);

      setTimeout(() => {
        setSaving(false);

        /* ✅ Swal → notify.success */
        notify.success(
          "Saved",
          "Security settings saved successfully."
        );
      }, 300);
    } catch (error) {
      console.error(
        "Failed to save security settings:",
        error
      );

      setSaving(false);

      /* ✅ Swal → notify.error */
      notify.error(
        "Save failed",
        "Security settings save nahi hui."
      );
    }
  };

  /* =========================================
     RESET SETTINGS
  ========================================= */

  const handleReset = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset Security Settings?",
      "Kya aap Security Settings ko default par reset karna chahte hain?",
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

    /* ✅ alert → notify.success */
    notify.success(
      "Reset Complete",
      "Security settings reset ho gayi."
    );
  };

  /* =========================================
     LOGOUT ALL DEVICES
  ========================================= */

  const handleLogoutAll = async () => {
    /* ✅ Swal → notify.confirm */
    const confirmed = await notify.confirm(
      "Logout from all devices?",
      "You will be logged out from every device. Continue?",
      "Yes, Logout All",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/logout-all`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        /* सारी keys clear करो */
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminUserId");
        localStorage.removeItem("adminProfile");
        localStorage.removeItem("adminProfileImage");
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("rememberAdmin");

        /* ✅ Swal → notify.success */
        notify.success(
          "Logged out",
          "All sessions have been terminated."
        );

        setTimeout(() => {
          if (onLogout) onLogout();
        }, 800);
      } else {
        /* ✅ Swal → notify.error */
        notify.error(
          "Failed",
          "Could not logout from all devices."
        );
      }
    } catch (error) {
      if (error.message !== "Session expired") {
        console.error(error);

        /* ✅ Swal → notify.error */
        notify.error("Error", "Network error");
      }
    }
  };

  /* =========================================
     DEACTIVATE ACCOUNT
  ========================================= */

  const handleDeactivate = async () => {
    /* ✅ Swal input → notify.prompt */
    const password = await notify.prompt(
      "Deactivate Account",
      "This will disable your account. Enter your password to confirm.",
      "password",
      "Enter your password",
      "Deactivate",
      "Cancel",
      "warning"
    );

    if (!password) return;

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/deactivate`,
        {
          method: "PUT",
          body: JSON.stringify({ password }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (response.ok) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminUserId");
        localStorage.removeItem("adminProfile");
        localStorage.removeItem("adminProfileImage");
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("rememberAdmin");

        /* ✅ Swal → notify.success */
        notify.success(
          "Account deactivated",
          "You have been logged out."
        );

        setTimeout(() => {
          if (onLogout) onLogout();
        }, 800);
      } else {
        /* ✅ Swal → notify.error */
        notify.error(
          "Failed",
          result?.message ||
            "Could not deactivate account."
        );
      }
    } catch (error) {
      if (error.message !== "Session expired") {
        console.error(error);

        /* ✅ Swal → notify.error */
        notify.error("Error", "Network error");
      }
    }
  };

  /* =========================================
     CLEAR LOGIN HISTORY
  ========================================= */

  const handleClearHistory = async () => {
    /* ✅ Swal → notify.confirm */
    const confirmed = await notify.confirm(
      "Clear login history?",
      "This will permanently delete all login records.",
      "Yes, Clear",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/admin/login-history`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setLoginHistory([]);

        /* ✅ Swal → notify.success */
        notify.success("Cleared");
      }
    } catch (error) {
      if (error.message !== "Session expired") {
        console.error(error);

        /* ✅ Swal → notify.error */
        notify.error(
          "Error",
          "Could not clear history."
        );
      }
    }
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================
     TOGGLE ROW COMPONENT
  ========================================= */

  const ToggleRow = ({
    icon,
    title,
    description,
    name,
  }) => {
    const enabled = settings[name];

    return (
      <div className="security-toggle-row">
        <div className="security-toggle-info">
          <div className="security-toggle-title">
            <span className="security-row-icon">
              {icon}
            </span>
            <h4>{title}</h4>
          </div>

          <p>{description}</p>
        </div>

        <button
          type="button"
          className={`security-toggle ${
            enabled ? "active" : ""
          }`}
          onClick={() => handleToggle(name)}
          aria-pressed={enabled}
        >
          <span />
        </button>
      </div>
    );
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="security-settings">
      {/* HEADER */}
      <div className="security-page-header">
        <div>
          <h2>
            <FiShield />
            Security Settings
          </h2>

          <p>
            Manage password, login and account
            security settings.
          </p>
        </div>
      </div>

      <form
        className="security-settings-form"
        onSubmit={handleSubmit}
      >
        {/* PASSWORD POLICY */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="security-card-icon">
              <FiLock />
            </div>

            <div>
              <h3>Password Policy</h3>
              <p>
                Configure password requirements for
                users.
              </p>
            </div>
          </div>

          <div className="security-fields-grid">
            <div className="security-field">
              <label htmlFor="minPasswordLength">
                Minimum Password Length
              </label>

              <input
                id="minPasswordLength"
                type="number"
                name="minPasswordLength"
                min="6"
                max="128"
                value={settings.minPasswordLength}
                onChange={handleChange}
              />

              <small>
                Minimum number of characters required.
              </small>
            </div>

            <div className="security-field">
              <label htmlFor="passwordExpiry">
                Password Expiry
              </label>

              <div className="security-input-with-text">
                <input
                  id="passwordExpiry"
                  type="number"
                  name="passwordExpiry"
                  min="0"
                  value={settings.passwordExpiry}
                  onChange={handleChange}
                />

                <span>days</span>
              </div>

              <small>
                Set 0 to disable password expiry.
              </small>
            </div>
          </div>

          <div className="security-toggle-list">
            <ToggleRow
              icon={<FiKey />}
              title="Force Strong Password"
              description="Require users to create stronger passwords."
              name="forceStrongPassword"
            />
          </div>
        </div>

        {/* LOGIN SECURITY */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="security-card-icon">
              <FiAlertTriangle />
            </div>

            <div>
              <h3>Login Security</h3>
              <p>
                Control login attempts and account
                protection.
              </p>
            </div>
          </div>

          <div className="security-fields-grid">
            <div className="security-field">
              <label htmlFor="maxLoginAttempts">
                Maximum Login Attempts
              </label>

              <input
                id="maxLoginAttempts"
                type="number"
                name="maxLoginAttempts"
                min="1"
                max="20"
                value={settings.maxLoginAttempts}
                onChange={handleChange}
              />

              <small>
                Number of failed attempts before
                protection is triggered.
              </small>
            </div>

            <div className="security-field">
              <label htmlFor="sessionTimeout">
                Session Timeout
              </label>

              <div className="security-input-with-text">
                <input
                  id="sessionTimeout"
                  type="number"
                  name="sessionTimeout"
                  min="1"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                />

                <span>minutes</span>
              </div>

              <small>
                Automatic session timeout duration.
              </small>
            </div>
          </div>

          <div className="security-toggle-list">
            <ToggleRow
              icon={<FiLock />}
              title="Account Lockout"
              description="Protect accounts after repeated failed login attempts."
              name="accountLockout"
            />

            <ToggleRow
              icon={<FiAlertTriangle />}
              title="Login Alerts"
              description="Notify when a login-related security event occurs."
              name="loginAlerts"
            />
          </div>
        </div>

        {/* 2FA */}
        <div className="security-card">
          <div className="security-card-header">
            <div className="security-card-icon">
              <FiShield />
            </div>

            <div>
              <h3>Two-Factor Authentication</h3>
              <p>
                Add an additional security layer to
                administrator accounts.
              </p>
            </div>
          </div>

          <ToggleRow
            icon={<FiShield />}
            title="Two-Factor Authentication"
            description="Require an additional verification step during login."
            name="twoFactorAuth"
          />
        </div>

        {/* SAVE BUTTONS */}
        <div className="security-actions">
          <button
            type="button"
            className="security-reset-btn"
            onClick={handleReset}
          >
            <FiRefreshCw />
            Reset
          </button>

          <button
            type="submit"
            className="security-save-btn"
            disabled={saving}
          >
            <FiSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ACTIVE SESSIONS */}
      <div className="security-card security-sessions-card">
        <div className="security-card-header">
          <div className="security-card-icon">
            <FiLogOut />
          </div>

          <div>
            <h3>Active Sessions</h3>
            <p>
              Manage all devices where you're logged
              in.
            </p>
          </div>
        </div>

        <div className="security-actions-grid">
          <button
            type="button"
            className="security-action-btn"
            onClick={handleLogoutAll}
          >
            <FiLogOut />
            <div>
              <strong>Logout All Devices</strong>
              <span>Sign out from every device</span>
            </div>
          </button>

          <button
            type="button"
            className="security-action-btn danger"
            onClick={handleDeactivate}
          >
            <FiAlertTriangle />
            <div>
              <strong>Deactivate Account</strong>
              <span>
                Temporarily disable your account
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* LOGIN HISTORY */}
      <div className="security-card security-history-card">
        <div className="security-card-header">
          <div className="security-card-icon">
            <FiClock />
          </div>

          <div>
            <h3>Login History</h3>
            <p>
              Recent login activity on your account.
            </p>
          </div>

          {loginHistory.length > 0 && (
            <button
              type="button"
              className="security-clear-btn"
              onClick={handleClearHistory}
            >
              <FiTrash2 />
              Clear
            </button>
          )}
        </div>

        {loadingHistory ? (
          <div className="security-loading">
            Loading history...
          </div>
        ) : loginHistory.length === 0 ? (
          <div className="security-empty">
            <FiClock size={32} />
            <p>No login history yet</p>
          </div>
        ) : (
          <div className="login-history-list">
            {loginHistory.map((entry) => (
              <div
                key={entry._id}
                className="login-history-item"
              >
                <div className="login-history-icon">
                  {entry.device === "Mobile" ? (
                    <FiSmartphone />
                  ) : (
                    <FiMonitor />
                  )}
                </div>

                <div className="login-history-content">
                  <div className="login-history-row">
                    <strong>
                      {entry.browser} on {entry.os}
                    </strong>

                    <span
                      className={`login-status login-status-${entry.status}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="login-history-meta">
                    <span>
                      <FiMonitor size={13} />
                      {entry.device}
                    </span>

                    {entry.ip && (
                      <span>
                        <FiMapPin size={13} />
                        {entry.ip}
                      </span>
                    )}

                    <span>
                      <FiClock size={13} />
                      {formatDate(entry.loginAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;