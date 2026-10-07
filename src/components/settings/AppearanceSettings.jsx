import { useEffect, useState } from "react";
import {
  FiMonitor,
  FiSun,
  FiMoon,
  FiSidebar,
  FiType,
  FiCheck,
  FiSave,
  FiRefreshCw,
  FiLayout,
} from "react-icons/fi";

/* ✅ NAYA: Swal → notify */
import notify from "../../utils/notify";

import "./AppearanceSettings.css";

const APPEARANCE_KEY = "appearanceSettings";

const DEFAULT_SETTINGS = {
  theme: "light",
  sidebarStyle: "expanded",
  fontSize: "medium",
  compactMode: false,
  accentColor: "black",
};

const ACCENT_COLORS = [
  { id: "black", name: "Black", color: "#111827" },
  { id: "blue", name: "Blue", color: "#2563eb" },
  { id: "green", name: "Green", color: "#16a34a" },
  { id: "purple", name: "Purple", color: "#9333ea" },
  { id: "red", name: "Red", color: "#dc2626" },
  { id: "orange", name: "Orange", color: "#ea580c" },
];

const ACCENT_VALUES = {
  black: {
    main: "#111827",
    hover: "#000000",
    light: "#f3f4f6",
    border: "#d1d5db",
  },
  blue: {
    main: "#2563eb",
    hover: "#1d4ed8",
    light: "#eff6ff",
    border: "#bfdbfe",
  },
  green: {
    main: "#16a34a",
    hover: "#15803d",
    light: "#f0fdf4",
    border: "#bbf7d0",
  },
  purple: {
    main: "#9333ea",
    hover: "#7e22ce",
    light: "#faf5ff",
    border: "#e9d5ff",
  },
  red: {
    main: "#dc2626",
    hover: "#b91c1c",
    light: "#fef2f2",
    border: "#fecaca",
  },
  orange: {
    main: "#ea580c",
    hover: "#c2410c",
    light: "#fff7ed",
    border: "#fed7aa",
  },
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem(APPEARANCE_KEY);

    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Appearance settings load error:", error);

    return { ...DEFAULT_SETTINGS };
  }
}

function applyAppearance(settings) {
  const root = document.documentElement;

  /* THEME */
  root.classList.remove(
    "theme-light",
    "theme-dark",
    "theme-system"
  );
  root.classList.add(`theme-${settings.theme}`);
  root.setAttribute("data-theme", settings.theme);

  /* ACCENT COLOR */
  const accent =
    ACCENT_VALUES[settings.accentColor] ||
    ACCENT_VALUES.black;

  root.style.setProperty("--accent-color", accent.main);
  root.style.setProperty("--accent-hover", accent.hover);
  root.style.setProperty("--accent-light", accent.light);
  root.style.setProperty("--accent-border", accent.border);

  root.setAttribute("data-accent", settings.accentColor);

  /* FONT SIZE */
  root.classList.remove(
    "font-small",
    "font-medium",
    "font-large"
  );
  root.classList.add(`font-${settings.fontSize}`);
  root.setAttribute("data-font-size", settings.fontSize);

  /* COMPACT MODE */
  root.classList.toggle(
    "compact-mode",
    settings.compactMode === true
  );
  root.setAttribute(
    "data-compact-mode",
    String(settings.compactMode)
  );

  /* SIDEBAR STYLE */
  root.classList.remove(
    "sidebar-expanded",
    "sidebar-collapsed",
    "sidebar-mini"
  );
  root.classList.add(`sidebar-${settings.sidebarStyle}`);
  root.setAttribute(
    "data-sidebar-style",
    settings.sidebarStyle
  );
}

function AppearanceSettings() {
  const [settings, setSettings] = useState(getSavedSettings);
  const [saving, setSaving] = useState(false);

  /* APPLY ON LOAD */
  useEffect(() => {
    applyAppearance(settings);
  }, []);

  /* SAVE STATE AUTOMATICALLY */
  useEffect(() => {
    try {
      localStorage.setItem(
        APPEARANCE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        "Appearance settings save error:",
        error
      );
    }
  }, [settings]);

  /* UPDATE SETTING */
  const updateSetting = (key, value) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    applyAppearance(updatedSettings);

    window.dispatchEvent(
      new CustomEvent("appearanceSettingsChanged", {
        detail: updatedSettings,
      })
    );
  };

  /* =========================================
     SAVE
  ========================================= */

  const handleSave = async () => {
    setSaving(true);

    try {
      localStorage.setItem(
        APPEARANCE_KEY,
        JSON.stringify(settings)
      );

      localStorage.setItem("adminTheme", settings.theme);
      localStorage.setItem(
        "sidebarStyle",
        settings.sidebarStyle
      );
      localStorage.setItem("fontSize", settings.fontSize);
      localStorage.setItem(
        "compactMode",
        String(settings.compactMode)
      );
      localStorage.setItem(
        "accentColor",
        settings.accentColor
      );

      applyAppearance(settings);

      window.dispatchEvent(
        new CustomEvent("appearanceSettingsChanged", {
          detail: settings,
        })
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      /* ✅ Swal → notify.success */
      notify.success(
        "Appearance Saved",
        "Appearance settings successfully save ho gayi hain."
      );
    } catch (error) {
      console.error("Appearance save error:", error);

      /* ✅ Swal → notify.error */
      notify.error(
        "Save Failed",
        "Appearance settings save nahi ho paayi."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const handleReset = async () => {
    /* ✅ Swal → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset Appearance?",
      "Appearance settings default values par aa jayengi.",
      "Yes, Reset",
      "Cancel",
      "warning"
    );

    if (!confirmed) {
      return;
    }

    const resetSettings = { ...DEFAULT_SETTINGS };

    setSettings(resetSettings);

    localStorage.setItem(
      APPEARANCE_KEY,
      JSON.stringify(resetSettings)
    );

    localStorage.setItem(
      "adminTheme",
      resetSettings.theme
    );
    localStorage.setItem(
      "sidebarStyle",
      resetSettings.sidebarStyle
    );
    localStorage.setItem(
      "fontSize",
      resetSettings.fontSize
    );
    localStorage.setItem(
      "compactMode",
      String(resetSettings.compactMode)
    );
    localStorage.setItem(
      "accentColor",
      resetSettings.accentColor
    );

    applyAppearance(resetSettings);

    window.dispatchEvent(
      new CustomEvent("appearanceSettingsChanged", {
        detail: resetSettings,
      })
    );

    /* ✅ Swal → notify.success */
    notify.success(
      "Reset Complete",
      "Appearance settings default par reset ho gayi hain."
    );
  };

  return (
    <div className="appearance-settings">
      {/* HEADER */}
      <div className="appearance-page-header">
        <h2>
          <FiMonitor />
          Appearance Settings
        </h2>

        <p>
          Customize the appearance and layout of
          your admin panel.
        </p>
      </div>

      <div className="appearance-form">
        {/* THEME */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiMonitor />
            </div>

            <div>
              <h3>Theme</h3>

              <p>
                Choose how the admin panel should
                look.
              </p>
            </div>
          </div>

          <div className="appearance-options-grid">
            <button
              type="button"
              className={`appearance-option ${
                settings.theme === "light"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("theme", "light")
              }
            >
              <div className="theme-preview light-preview">
                <div className="preview-sidebar" />

                <div className="preview-content">
                  <div />
                  <div />
                  <div />
                </div>
              </div>

              <div className="appearance-option-content">
                <strong>
                  <FiSun />
                  Light
                </strong>

                <span>
                  Bright and clean interface
                </span>
              </div>

              {settings.theme === "light" && (
                <div className="selected-check">
                  <FiCheck />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`appearance-option ${
                settings.theme === "dark"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("theme", "dark")
              }
            >
              <div className="theme-preview dark-preview">
                <div className="preview-sidebar" />

                <div className="preview-content">
                  <div />
                  <div />
                  <div />
                </div>
              </div>

              <div className="appearance-option-content">
                <strong>
                  <FiMoon />
                  Dark
                </strong>

                <span>
                  Dark and comfortable interface
                </span>
              </div>

              {settings.theme === "dark" && (
                <div className="selected-check">
                  <FiCheck />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`appearance-option ${
                settings.theme === "system"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("theme", "system")
              }
            >
              <div className="theme-preview system-preview">
                <div className="system-half-light" />
                <div className="system-half-dark" />
              </div>

              <div className="appearance-option-content">
                <strong>
                  <FiMonitor />
                  System
                </strong>

                <span>
                  Follow your device theme
                </span>
              </div>

              {settings.theme === "system" && (
                <div className="selected-check">
                  <FiCheck />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* SIDEBAR STYLE */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiSidebar />
            </div>

            <div>
              <h3>Sidebar Style</h3>

              <p>
                Select how the navigation sidebar
                should appear.
              </p>
            </div>
          </div>

          <div className="sidebar-options">
            <button
              type="button"
              className={`sidebar-option ${
                settings.sidebarStyle === "expanded"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "sidebarStyle",
                  "expanded"
                )
              }
            >
              <div className="sidebar-preview expanded-preview">
                <div className="sidebar-preview-left">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="sidebar-preview-main" />
              </div>

              <strong>Expanded</strong>

              <span>Full sidebar with labels</span>

              {settings.sidebarStyle === "expanded" && (
                <div className="sidebar-selected-check">
                  <FiCheck />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-option ${
                settings.sidebarStyle === "collapsed"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "sidebarStyle",
                  "collapsed"
                )
              }
            >
              <div className="sidebar-preview collapsed-preview">
                <div className="sidebar-preview-left">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="sidebar-preview-main" />
              </div>

              <strong>Collapsed</strong>

              <span>Smaller sidebar with icons</span>

              {settings.sidebarStyle === "collapsed" && (
                <div className="sidebar-selected-check">
                  <FiCheck />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-option ${
                settings.sidebarStyle === "mini"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting(
                  "sidebarStyle",
                  "mini"
                )
              }
            >
              <div className="sidebar-preview mini-preview">
                <div className="sidebar-preview-left">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="sidebar-preview-main" />
              </div>

              <strong>Mini</strong>

              <span>Minimal navigation sidebar</span>

              {settings.sidebarStyle === "mini" && (
                <div className="sidebar-selected-check">
                  <FiCheck />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* FONT SIZE */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiType />
            </div>

            <div>
              <h3>Font Size</h3>

              <p>
                Change the overall text size of
                the admin panel.
              </p>
            </div>
          </div>

          <div className="font-size-options">
            <button
              type="button"
              className={`font-size-option ${
                settings.fontSize === "small"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("fontSize", "small")
              }
            >
              <div className="font-sample font-sample-small">
                Aa
              </div>

              <div className="font-option-text">
                <strong>Small</strong>
                <small>Compact text</small>
              </div>

              {settings.fontSize === "small" && (
                <FiCheck />
              )}
            </button>

            <button
              type="button"
              className={`font-size-option ${
                settings.fontSize === "medium"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("fontSize", "medium")
              }
            >
              <div className="font-sample font-sample-medium">
                Aa
              </div>

              <div className="font-option-text">
                <strong>Medium</strong>
                <small>Default text</small>
              </div>

              {settings.fontSize === "medium" && (
                <FiCheck />
              )}
            </button>

            <button
              type="button"
              className={`font-size-option ${
                settings.fontSize === "large"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                updateSetting("fontSize", "large")
              }
            >
              <div className="font-sample font-sample-large">
                Aa
              </div>

              <div className="font-option-text">
                <strong>Large</strong>
                <small>Easy-to-read text</small>
              </div>

              {settings.fontSize === "large" && (
                <FiCheck />
              )}
            </button>
          </div>
        </div>

        {/* COMPACT MODE */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiLayout />
            </div>

            <div>
              <h3>Compact Mode</h3>

              <p>
                Reduce spacing to display more
                content on the screen.
              </p>
            </div>
          </div>

          <div className="compact-setting-row">
            <div className="compact-info">
              <div className="compact-title">
                <strong>Compact Layout</strong>

                <span
                  className={
                    settings.compactMode
                      ? "status-on"
                      : "status-off"
                  }
                >
                  {settings.compactMode ? "ON" : "OFF"}
                </span>
              </div>

              <p>
                Use smaller spacing and tighter
                components throughout the panel.
              </p>
            </div>

            <button
              type="button"
              className={`appearance-toggle ${
                settings.compactMode ? "active" : ""
              }`}
              onClick={() =>
                updateSetting(
                  "compactMode",
                  !settings.compactMode
                )
              }
              aria-pressed={settings.compactMode}
            >
              <span />
            </button>
          </div>
        </div>

        {/* ACCENT COLOR */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiMonitor />
            </div>

            <div>
              <h3>Accent Color</h3>

              <p>
                Choose the primary color used
                across the admin panel.
              </p>
            </div>
          </div>

          <div className="accent-colors">
            {ACCENT_COLORS.map((accent) => (
              <button
                type="button"
                key={accent.id}
                className={`accent-color-option ${
                  settings.accentColor === accent.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "accentColor",
                    accent.id
                  )
                }
              >
                <span
                  className="accent-color-circle"
                  style={{
                    backgroundColor: accent.color,
                  }}
                >
                  {settings.accentColor ===
                    accent.id && <FiCheck />}
                </span>

                <span>{accent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CURRENT CONFIGURATION */}
        <div className="appearance-card">
          <div className="appearance-card-header">
            <div className="appearance-card-icon">
              <FiCheck />
            </div>

            <div>
              <h3>Current Configuration</h3>

              <p>
                Your currently selected appearance
                settings.
              </p>
            </div>
          </div>

          <div className="appearance-summary">
            <div>
              <span>Theme</span>
              <strong>{settings.theme}</strong>
            </div>

            <div>
              <span>Sidebar</span>
              <strong>{settings.sidebarStyle}</strong>
            </div>

            <div>
              <span>Font Size</span>
              <strong>{settings.fontSize}</strong>
            </div>

            <div>
              <span>Compact Mode</span>
              <strong>
                {settings.compactMode ? "On" : "Off"}
              </strong>
            </div>

            <div>
              <span>Accent</span>
              <strong>{settings.accentColor}</strong>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="appearance-actions">
          <button
            type="button"
            className="appearance-reset-btn"
            onClick={handleReset}
          >
            <FiRefreshCw />
            Reset
          </button>

          <button
            type="button"
            className="appearance-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppearanceSettings;