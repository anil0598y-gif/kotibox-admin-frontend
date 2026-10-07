import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiSettings,
  FiMusic,
  FiUsers,
  FiBell,
  FiShield,
  FiMonitor,
} from "react-icons/fi";

import Profile from "./Profile";
import GeneralSettings from "./GeneralSettings";
import MusicSettings from "./MusicSettings";
import UserSettings from "./UserSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";

import "./Settings.css";

const Settings = ({ setActivePage, onLogout }) => {
  /* Refresh ke baad bhi selected settings section same rahega */
  const [activeSetting, setActiveSetting] = useState(() => {
    return localStorage.getItem("settingsSection") || "profile";
  });

  /* Jab bhi Settings section change ho, localStorage me save karo */
  useEffect(() => {
    localStorage.setItem("settingsSection", activeSetting);
  }, [activeSetting]);

  const settingsMenu = [
    {
      id: "profile",
      title: "Profile",
      description: "Manage your admin profile",
      icon: FiUser,
    },
    {
      id: "general",
      title: "General",
      description: "Basic application settings",
      icon: FiSettings,
    },
    {
      id: "music",
      title: "Music",
      description: "Music and audio settings",
      icon: FiMusic,
    },
    {
      id: "users",
      title: "Users",
      description: "Manage user preferences",
      icon: FiUsers,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Notification preferences",
      icon: FiBell,
    },
    {
      id: "security",
      title: "Security",
      description: "Security and login settings",
      icon: FiShield,
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize admin panel",
      icon: FiMonitor,
    },
  ];

  const handleSettingChange = (settingId) => {
    setActiveSetting(settingId);

    /* Extra safety: immediately save */
    localStorage.setItem("settingsSection", settingId);
  };

  const renderSettingContent = () => {
    switch (activeSetting) {
      case "profile":
        return (
          <Profile setActivePage={setActivePage} />
        );

      case "general":
        return <GeneralSettings />;

      case "music":
        return <MusicSettings />;

      case "users":
        return <UserSettings />;

      case "notifications":
        return <NotificationSettings />;

      case "security":
        return (
          <SecuritySettings onLogout={onLogout} />
        );

      case "appearance":
        return <AppearanceSettings />;

      default:
        return (
          <Profile setActivePage={setActivePage} />
        );
    }
  };

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="settings-page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your admin panel settings and
            preferences.
          </p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="settings-layout">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-title">
            Settings
          </div>

          <div className="settings-menu">
            {settingsMenu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`settings-menu-item ${
                    activeSetting === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSettingChange(item.id)
                  }
                >
                  <div className="settings-menu-icon">
                    <Icon />
                  </div>

                  <div className="settings-menu-text">
                    <span>{item.title}</span>

                    <small>{item.description}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {renderSettingContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;