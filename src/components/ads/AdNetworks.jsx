import { useEffect, useState } from "react";
import {
  Save,
  Globe,
  Smartphone,
  Info,
  CheckCircle2,
} from "lucide-react";

import notify from "../../utils/notify";

import "./AdNetworks.css";

const SETTINGS_KEY = "adNetworkSettings";

const DEFAULT_SETTINGS = {
  adsense: {
    publisherId: "",
    displayAdSlotId: "",
  },

  admob: {
    publisherId: "",
    androidAppId: "",
    iosAppId: "",
    androidBannerAdUnit: "",
    iosBannerAdUnit: "",
  },
};

function AdNetworks() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(
        SETTINGS_KEY
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        return {
          adsense: {
            ...DEFAULT_SETTINGS.adsense,
            ...(parsed.adsense || {}),
          },

          admob: {
            ...DEFAULT_SETTINGS.admob,
            ...(parsed.admob || {}),
          },
        };
      }
    } catch (error) {
      console.error(
        "Ad network settings load error:",
        error
      );
    }

    return DEFAULT_SETTINGS;
  });

  const [savedMessage, setSavedMessage] =
    useState(false);

  /* =========================================
     LOAD SETTINGS
  ========================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        SETTINGS_KEY
      );

      if (!saved) return;

      const parsed = JSON.parse(saved);

      setSettings({
        adsense: {
          ...DEFAULT_SETTINGS.adsense,
          ...(parsed.adsense || {}),
        },

        admob: {
          ...DEFAULT_SETTINGS.admob,
          ...(parsed.admob || {}),
        },
      });
    } catch (error) {
      console.error(
        "Ad network settings load error:",
        error
      );
    }
  }, []);

  /* =========================================
     HANDLE ADSENSE CHANGE
  ========================================= */

  const handleAdsenseChange = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,

      adsense: {
        ...prev.adsense,
        [field]: value,
      },
    }));

    setSavedMessage(false);
  };

  /* =========================================
     HANDLE ADMOB CHANGE
  ========================================= */

  const handleAdmobChange = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,

      admob: {
        ...prev.admob,
        [field]: value,
      },
    }));

    setSavedMessage(false);
  };

  /* =========================================
     SAVE
  ========================================= */

  const handleSave = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSavedMessage(true);

      notify.success("Ad network settings saved successfully.");

      setTimeout(() => {
        setSavedMessage(false);
      }, 2200);
    } catch (error) {
      console.error(
        "Ad network settings save error:",
        error
      );

      notify.error(
        "Unable to save ad network settings."
      );
    }
  };

  return (
    <div className="ad-networks-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="ad-networks-header">

        <div className="ad-networks-heading">

          <h1>
            Ad Networks
          </h1>

          <p>
            Configure your advertising network
            settings
          </p>

        </div>

        <div className="ad-networks-header-actions">

          {savedMessage && (
            <div className="ad-network-saved-message">
              <CheckCircle2 size={16} />
              Settings saved
            </div>
          )}

          <button
            type="button"
            className="ad-network-save-btn"
            onClick={handleSave}
          >
            <Save size={17} />
            Save Settings
          </button>

        </div>

      </div>


      {/* =========================================
          GOOGLE ADSENSE
      ========================================= */}

      <section className="ad-network-card">

        <div className="ad-network-card-header">

          <div className="ad-network-title-wrap">

            <div className="ad-network-icon adsense-icon">
              <Globe size={21} />
            </div>

            <div>
              <h2>
                Google AdSense
                <span>
                  Website
                </span>
              </h2>

              <p>
                Display advertisements on your
                website
              </p>
            </div>

          </div>

        </div>


        <div className="ad-network-divider"></div>


        <div className="ad-network-fields">

          {/* PUBLISHER ID */}

          <div className="ad-network-field">

            <label htmlFor="adsense-publisher-id">
              Publisher / Client ID
            </label>

            <input
              id="adsense-publisher-id"
              type="text"
              value={
                settings.adsense.publisherId
              }
              onChange={(e) =>
                handleAdsenseChange(
                  "publisherId",
                  e.target.value
                )
              }
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              autoComplete="off"
            />

            <div className="ad-network-help">

              <Info size={14} />

              <span>
                From AdSense → Account →
                Account information.
                Format: ca-pub-...
              </span>

            </div>

          </div>


          {/* DISPLAY SLOT ID */}

          <div className="ad-network-field">

            <label htmlFor="adsense-slot-id">
              Display Ad Unit Slot ID
            </label>

            <input
              id="adsense-slot-id"
              type="text"
              value={
                settings.adsense
                  .displayAdSlotId
              }
              onChange={(e) =>
                handleAdsenseChange(
                  "displayAdSlotId",
                  e.target.value
                )
              }
              placeholder="1234567890"
              autoComplete="off"
            />

            <div className="ad-network-help">

              <Info size={14} />

              <span>
                Create a Display ad unit in
                AdSense and paste the
                data-ad-slot number here.
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          GOOGLE ADMOB
      ========================================= */}

      <section className="ad-network-card">

        <div className="ad-network-card-header">

          <div className="ad-network-title-wrap">

            <div className="ad-network-icon admob-icon">
              <Smartphone size={21} />
            </div>

            <div>
              <h2>
                Google AdMob
                <span>
                  Mobile Apps
                </span>
              </h2>

              <p>
                Configure advertisements for
                Android and iOS applications
              </p>
            </div>

          </div>

        </div>


        <div className="ad-network-divider"></div>


        <div className="ad-network-fields">

          {/* PUBLISHER ID */}

          <div className="ad-network-field">

            <label htmlFor="admob-publisher-id">
              Publisher ID
            </label>

            <input
              id="admob-publisher-id"
              type="text"
              value={
                settings.admob.publisherId
              }
              onChange={(e) =>
                handleAdmobChange(
                  "publisherId",
                  e.target.value
                )
              }
              placeholder="pub-xxxxxxxxxxxxxxxx"
              autoComplete="off"
            />

          </div>


          {/* ANDROID APP ID */}

          <div className="ad-network-field">

            <label htmlFor="android-app-id">
              Android App ID
            </label>

            <input
              id="android-app-id"
              type="text"
              value={
                settings.admob
                  .androidAppId
              }
              onChange={(e) =>
                handleAdmobChange(
                  "androidAppId",
                  e.target.value
                )
              }
              placeholder="ca-app-pub-xxx~xxx"
              autoComplete="off"
            />

          </div>


          {/* IOS APP ID */}

          <div className="ad-network-field">

            <label htmlFor="ios-app-id">
              iOS App ID
            </label>

            <input
              id="ios-app-id"
              type="text"
              value={
                settings.admob.iosAppId
              }
              onChange={(e) =>
                handleAdmobChange(
                  "iosAppId",
                  e.target.value
                )
              }
              placeholder="ca-app-pub-xxx~xxx"
              autoComplete="off"
            />

          </div>


          {/* ANDROID BANNER */}

          <div className="ad-network-field">

            <label htmlFor="android-banner-ad-unit">
              Android Banner Ad Unit
            </label>

            <input
              id="android-banner-ad-unit"
              type="text"
              value={
                settings.admob
                  .androidBannerAdUnit
              }
              onChange={(e) =>
                handleAdmobChange(
                  "androidBannerAdUnit",
                  e.target.value
                )
              }
              placeholder="ca-app-pub-xxx/xxx"
              autoComplete="off"
            />

          </div>


          {/* IOS BANNER */}

          <div className="ad-network-field">

            <label htmlFor="ios-banner-ad-unit">
              iOS Banner Ad Unit
            </label>

            <input
              id="ios-banner-ad-unit"
              type="text"
              value={
                settings.admob
                  .iosBannerAdUnit
              }
              onChange={(e) =>
                handleAdmobChange(
                  "iosBannerAdUnit",
                  e.target.value
                )
              }
              placeholder="ca-app-pub-xxx/xxx"
              autoComplete="off"
            />

          </div>

        </div>

      </section>


      {/* =========================================
          BOTTOM SAVE
      ========================================= */}

      <div className="ad-network-bottom-actions">

        <button
          type="button"
          className="ad-network-save-btn"
          onClick={handleSave}
        >
          <Save size={17} />
          Save Settings
        </button>

      </div>

    </div>
  );
}

export default AdNetworks;