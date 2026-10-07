import React, { useState } from "react";
import {
  FiMusic,
  FiSave,
  FiCheck,
  FiX,
} from "react-icons/fi";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

import "./MusicSettings.css";

const SETTINGS_KEY = "musicSettings";

const DEFAULT_SETTINGS = {
  audioQuality: "320 kbps",
  maxUploadSize: "50",
  defaultGenre: "Pop",
  defaultLanguage: "Hindi",
  autoPublish: false,
  allowExplicitContent: false,
};

const DEFAULT_FORMATS = ["MP3", "WAV", "FLAC", "AAC"];

const AVAILABLE_FORMATS = [
  "MP3",
  "WAV",
  "FLAC",
  "AAC",
  "OGG",
];

const MusicSettings = () => {
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
      console.error("Failed to load music settings:", error);
    }

    return DEFAULT_SETTINGS;
  });

  /* =========================================
     LOAD SAVED FORMATS
  ========================================= */

  const [formats, setFormats] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "musicAllowedFormats"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error(
        "Failed to load audio formats:",
        error
      );
    }

    return DEFAULT_FORMATS;
  });

  const [saving, setSaving] = useState(false);

  /* =========================================
     NORMAL INPUT CHANGE
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
     AUDIO FORMAT CHANGE
  ========================================= */

  const handleFormatChange = (format) => {
    setFormats((prev) => {
      if (prev.includes(format)) {
        return prev.filter((item) => item !== format);
      }

      return [...prev, format];
    });
  };

  /* =========================================
     SAVE SETTINGS
  ========================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    /* ✅ alert → notify.warning */
    if (formats.length === 0) {
      notify.warning(
        "At least one audio format must be selected."
      );
      return;
    }

    const uploadSize = Number(settings.maxUploadSize);

    /* ✅ alert → notify.warning */
    if (
      !Number.isFinite(uploadSize) ||
      uploadSize <= 0
    ) {
      notify.warning(
        "Maximum upload size must be greater than 0 MB."
      );
      return;
    }

    try {
      setSaving(true);

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      localStorage.setItem(
        "musicAllowedFormats",
        JSON.stringify(formats)
      );

      localStorage.setItem(
        "musicAudioQuality",
        settings.audioQuality
      );

      localStorage.setItem(
        "musicMaxUploadSize",
        String(settings.maxUploadSize)
      );

      localStorage.setItem(
        "musicDefaultGenre",
        settings.defaultGenre
      );

      localStorage.setItem(
        "musicDefaultLanguage",
        settings.defaultLanguage
      );

      localStorage.setItem(
        "musicAutoPublish",
        String(settings.autoPublish)
      );

      localStorage.setItem(
        "musicAllowExplicitContent",
        String(settings.allowExplicitContent)
      );

      setTimeout(() => {
        setSaving(false);

        /* ✅ alert → notify.success */
        notify.success(
          "Settings Saved",
          "Music settings saved successfully."
        );
      }, 300);
    } catch (error) {
      console.error(
        "Failed to save music settings:",
        error
      );

      setSaving(false);

      /* ✅ alert → notify.error */
      notify.error(
        "Save Failed",
        "Music settings save nahi hui. Please try again."
      );
    }
  };

  /* =========================================
     RESET SETTINGS
  ========================================= */

  const handleReset = async () => {
    /* ✅ window.confirm → notify.confirm */
    const confirmed = await notify.confirm(
      "Reset Music Settings?",
      "Kya aap Music Settings ko default par reset karna chahte hain?",
      "Yes, Reset",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    setSettings({ ...DEFAULT_SETTINGS });

    setFormats([...DEFAULT_FORMATS]);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );

    localStorage.setItem(
      "musicAllowedFormats",
      JSON.stringify(DEFAULT_FORMATS)
    );

    localStorage.setItem(
      "musicAudioQuality",
      DEFAULT_SETTINGS.audioQuality
    );

    localStorage.setItem(
      "musicMaxUploadSize",
      DEFAULT_SETTINGS.maxUploadSize
    );

    localStorage.setItem(
      "musicDefaultGenre",
      DEFAULT_SETTINGS.defaultGenre
    );

    localStorage.setItem(
      "musicDefaultLanguage",
      DEFAULT_SETTINGS.defaultLanguage
    );

    localStorage.setItem(
      "musicAutoPublish",
      String(DEFAULT_SETTINGS.autoPublish)
    );

    localStorage.setItem(
      "musicAllowExplicitContent",
      String(DEFAULT_SETTINGS.allowExplicitContent)
    );

    /* ✅ alert → notify.success */
    notify.success(
      "Reset Complete",
      "Music settings reset ho gayi."
    );
  };

  return (
    <div className="music-settings">
      {/* HEADER */}
      <div className="settings-page-header">
        <div>
          <h2>
            <FiMusic />
            Music Settings
          </h2>

          <p>
            Configure audio upload and publishing
            preferences.
          </p>
        </div>
      </div>

      <form
        className="music-settings-form"
        onSubmit={handleSubmit}
      >
        {/* AUDIO QUALITY */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Audio Quality</h3>

              <p>
                Select the default audio quality for
                uploaded music.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="audioQuality">
              Default Audio Quality
            </label>

            <select
              id="audioQuality"
              name="audioQuality"
              value={settings.audioQuality}
              onChange={handleChange}
            >
              <option value="128 kbps">128 kbps</option>
              <option value="192 kbps">192 kbps</option>
              <option value="256 kbps">256 kbps</option>
              <option value="320 kbps">320 kbps</option>
            </select>

            <small>
              This setting is used as the default
              quality preference for music uploads.
            </small>
          </div>
        </div>

        {/* AUDIO FORMATS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Allowed Audio Formats</h3>

              <p>
                Select which audio file formats users
                can upload.
              </p>
            </div>
          </div>

          <div className="format-options">
            {AVAILABLE_FORMATS.map((format) => {
              const isSelected = formats.includes(format);

              return (
                <button
                  key={format}
                  type="button"
                  className={`format-option ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleFormatChange(format)}
                >
                  <span className="format-checkbox">
                    {isSelected ? <FiCheck /> : <FiX />}
                  </span>

                  <span>{format}</span>
                </button>
              );
            })}
          </div>

          <small className="format-help">
            At least one audio format must be
            selected.
          </small>
        </div>

        {/* UPLOAD SIZE */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Upload Settings</h3>

              <p>
                Configure the maximum music upload
                size.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="maxUploadSize">
              Maximum Upload Size
            </label>

            <div className="input-with-unit">
              <input
                id="maxUploadSize"
                type="number"
                name="maxUploadSize"
                min="1"
                max="5000"
                value={settings.maxUploadSize}
                onChange={handleChange}
              />

              <span>MB</span>
            </div>

            <small>
              Maximum allowed size for an uploaded
              audio file.
            </small>
          </div>
        </div>

        {/* DEFAULT VALUES */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Default Music Values</h3>

              <p>
                These values can be used when adding
                new songs.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            {/* GENRE */}
            <div className="form-group">
              <label htmlFor="defaultGenre">
                Default Genre
              </label>

              <select
                id="defaultGenre"
                name="defaultGenre"
                value={settings.defaultGenre}
                onChange={handleChange}
              >
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Classical">Classical</option>
                <option value="Jazz">Jazz</option>
                <option value="Electronic">Electronic</option>
                <option value="Bollywood">Bollywood</option>
                <option value="Devotional">Devotional</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="form-group">
              <label htmlFor="defaultLanguage">
                Default Language
              </label>

              <select
                id="defaultLanguage"
                name="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={handleChange}
              >
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* PUBLISHING SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FiMusic />
            </div>

            <div>
              <h3>Publishing Settings</h3>

              <p>
                Control how new music is published.
              </p>
            </div>
          </div>

          {/* AUTO PUBLISH */}
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <h4>Auto Publish</h4>

              <p>
                Automatically publish newly added
                songs.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.autoPublish ? "active" : ""
              }`}
              onClick={() => handleToggle("autoPublish")}
              aria-label="Toggle auto publish"
              aria-pressed={settings.autoPublish}
            >
              <span />
            </button>
          </div>

          {/* EXPLICIT CONTENT */}
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <h4>Allow Explicit Content</h4>

              <p>
                Allow songs containing explicit
                content.
              </p>
            </div>

            <button
              type="button"
              className={`toggle-switch ${
                settings.allowExplicitContent
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleToggle("allowExplicitContent")
              }
              aria-label="Toggle explicit content"
              aria-pressed={
                settings.allowExplicitContent
              }
            >
              <span />
            </button>
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

export default MusicSettings;