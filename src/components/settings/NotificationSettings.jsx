import React, { useState } from "react";
import {
  FiBell,
  FiSave,
  FiMail,
  FiUser,
  FiMusic,
  FiList,
  FiSettings,
  FiVolume2,
} from "react-icons/fi";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

import "./NotificationSettings.css";

const SETTINGS_KEY = "notificationSettings";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  newUserAlert: true,
  newSongAlert: true,
  playlistAlert: false,
  systemNotifications: true,
  notificationSound: true,
};

const NotificationSettings = () => {
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
      console.error(
        "Failed to load notification settings:",
        error
      );
    }

    return { ...DEFAULT_SETTINGS };
  });

  const [saving, setSaving] = useState(false);

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
     SAVE
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
        "notificationEmail",
        String(settings.emailNotifications)
      );

      localStorage.setItem(
        "notificationNewUser",
        String(settings.newUserAlert)
      );

      localStorage.setItem(
        "notificationNewSong",
        String(settings.newSongAlert)
      );

      localStorage.setItem(
        "notificationPlaylist",
        String(settings.playlistAlert)
      );

      localStorage.setItem(
        "notificationSystem",
        String(settings.systemNotifications)
      );

      localStorage.setItem(
        "notificationSound",
        String(settings.notificationSound)
      );

      setTimeout(() => {
        setSaving(false);

        /* ✅ alert → notify.success */
        notify.success(
          "Settings Saved",
          "Notification settings saved successfully."
        );
      }, 300);
    } catch (error) {
      console.error(
        "Failed to save notification settings:",
        error
      );

      setSaving(false);

      /* ✅ alert → notify.error */
      notify.error(
        "Save Failed",
        "Notification settings save nahi hui."
      );
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const handleReset = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset Notification Settings?",
      "Kya aap Notification Settings ko default par reset karna chahte hain?",
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
      "notificationEmail",
      String(resetSettings.emailNotifications)
    );

    localStorage.setItem(
      "notificationNewUser",
      String(resetSettings.newUserAlert)
    );

    localStorage.setItem(
      "notificationNewSong",
      String(resetSettings.newSongAlert)
    );

    localStorage.setItem(
      "notificationPlaylist",
      String(resetSettings.playlistAlert)
    );

    localStorage.setItem(
      "notificationSystem",
      String(resetSettings.systemNotifications)
    );

    localStorage.setItem(
      "notificationSound",
      String(resetSettings.notificationSound)
    );

    /* ✅ alert → notify.success */
    notify.success(
      "Reset Complete",
      "Notification settings reset ho gayi."
    );
  };

  /* =========================================
     SETTING ROW
  ========================================= */

  const SettingRow = ({
    icon,
    title,
    description,
    settingName,
  }) => {
    const enabled = settings[settingName];

    return (
      <div className="notification-setting-row">
        <div className="notification-setting-info">
          <div className="notification-setting-title">
            <span className="notification-row-icon">
              {icon}
            </span>

            <h4>{title}</h4>
          </div>

          <p>{description}</p>
        </div>

        <button
          type="button"
          className={`notification-toggle ${
            enabled ? "active" : ""
          }`}
          onClick={() => handleToggle(settingName)}
          aria-label={`Toggle ${title}`}
          aria-pressed={enabled}
        >
          <span />
        </button>
      </div>
    );
  };

  return (
    <div className="notification-settings">
      {/* HEADER */}
      <div className="settings-page-header">
        <div>
          <h2>
            <FiBell />
            Notification Settings
          </h2>

          <p>
            Control alerts and notifications
            received by administrators.
          </p>
        </div>
      </div>

      <form
        className="notification-settings-form"
        onSubmit={handleSubmit}
      >
        {/* EMAIL NOTIFICATIONS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMail />
            </div>

            <div>
              <h3>Email Notifications</h3>

              <p>
                Manage email-based notifications.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiMail />}
            title="Email Notifications"
            description="Enable email notifications for important admin events."
            settingName="emailNotifications"
          />
        </div>

        {/* USER ALERTS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiUser />
            </div>

            <div>
              <h3>User Alerts</h3>

              <p>
                Receive notifications when
                user-related events occur.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiUser />}
            title="New User Alert"
            description="Notify when a new user is registered."
            settingName="newUserAlert"
          />
        </div>

        {/* MUSIC ALERTS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Music Alerts</h3>

              <p>
                Receive notifications about music
                activity.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiMusic />}
            title="New Song Alert"
            description="Notify when a new song is added to the library."
            settingName="newSongAlert"
          />
        </div>

        {/* PLAYLIST ALERTS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiList />
            </div>

            <div>
              <h3>Playlist Alerts</h3>

              <p>
                Receive notifications for playlist
                activity.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiList />}
            title="Playlist Alert"
            description="Notify when playlist-related activity occurs."
            settingName="playlistAlert"
          />
        </div>

        {/* SYSTEM NOTIFICATIONS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiSettings />
            </div>

            <div>
              <h3>System Notifications</h3>

              <p>
                Manage important application and
                system notifications.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiSettings />}
            title="System Notifications"
            description="Show important system-level notifications."
            settingName="systemNotifications"
          />
        </div>

        {/* SOUND */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiVolume2 />
            </div>

            <div>
              <h3>Notification Sound</h3>

              <p>
                Control notification sounds in the
                application.
              </p>
            </div>
          </div>

          <SettingRow
            icon={<FiVolume2 />}
            title="Notification Sound"
            description="Play a sound when an enabled notification is triggered."
            settingName="notificationSound"
          />
        </div>

        {/* STATUS SUMMARY */}
        <div className="settings-card notification-summary-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiBell />
            </div>

            <div>
              <h3>Notification Status</h3>

              <p>
                Current notification configuration.
              </p>
            </div>
          </div>

          <div className="notification-summary">
            <div className="notification-summary-item">
              <span>Email</span>

              <strong
                className={
                  settings.emailNotifications
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.emailNotifications
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="notification-summary-item">
              <span>New Users</span>

              <strong
                className={
                  settings.newUserAlert
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.newUserAlert
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="notification-summary-item">
              <span>New Songs</span>

              <strong
                className={
                  settings.newSongAlert
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.newSongAlert
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="notification-summary-item">
              <span>Playlists</span>

              <strong
                className={
                  settings.playlistAlert
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.playlistAlert
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="notification-summary-item">
              <span>System</span>

              <strong
                className={
                  settings.systemNotifications
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.systemNotifications
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="notification-summary-item">
              <span>Sound</span>

              <strong
                className={
                  settings.notificationSound
                    ? "enabled"
                    : "disabled"
                }
              >
                {settings.notificationSound
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

export default NotificationSettings;