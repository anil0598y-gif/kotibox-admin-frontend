import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, X } from "lucide-react";

import notify from "../../utils/notify";

import "./ViewAd.css";

const SERVER_URL = "http://localhost:5000";

/* =========================================
   GET MEDIA URL
   Relative path को full URL बनाता है
========================================= */

const getMediaUrl = (url) => {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  /* Already full URL */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  /* Relative path */
  if (value.startsWith("/")) {
    return `${SERVER_URL}${value}`;
  }

  return `${SERVER_URL}/${value}`;
};

function ViewAd({
  ad,
  setActivePage,
  closeViewAd,
  openEditAd,
}) {
  const mediaRef = useRef(null);
  const imageTimerRef = useRef(null);

  const [elapsed, setElapsed] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [finished, setFinished] = useState(false);

  /* ✅ mediaUrl — Component के top पर define — scope fix */
  const mediaUrl = getMediaUrl(ad?.mediaUrl || "");

  /* =========================================
     IMAGE TIMER
  ========================================= */

  useEffect(() => {
    setElapsed(0);
    setCanSkip(false);
    setFinished(false);

    if (imageTimerRef.current) {
      clearInterval(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    if (!ad || ad.type !== "image") {
      return undefined;
    }

    const startedAt = Date.now();

    imageTimerRef.current = setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000;

      setElapsed(seconds);

      if (seconds >= Number(ad.skipAfter || 0)) {
        setCanSkip(true);
      }

      if (
        ad.duration &&
        seconds >= Number(ad.duration)
      ) {
        setFinished(true);

        clearInterval(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    }, 100);

    return () => {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current);
      }
    };
  }, [ad]);

  /* =========================================
     AUDIO / VIDEO EVENTS
  ========================================= */

  useEffect(() => {
    const media = mediaRef.current;

    if (!media || !ad || ad.type === "image") {
      return undefined;
    }

    const onTimeUpdate = () => {
      setElapsed(media.currentTime || 0);

      setCanSkip(
        (media.currentTime || 0) >=
          Number(ad.skipAfter || 0)
      );
    };

    const onEnded = () => {
      setFinished(true);
    };

    const onError = (e) => {
      console.error(
        "❌ Ad media failed to load:",
        mediaUrl
      );
      console.error("   Error event:", e);

      notify.error(
        "Failed to load advertisement media."
      );
    };

    const onLoadedData = () => {
      console.log(
        "✅ Ad media loaded:",
        mediaUrl
      );
    };

    media.addEventListener(
      "timeupdate",
      onTimeUpdate
    );
    media.addEventListener("ended", onEnded);
    media.addEventListener("error", onError);
    media.addEventListener(
      "loadeddata",
      onLoadedData
    );

    return () => {
      media.removeEventListener(
        "timeupdate",
        onTimeUpdate
      );
      media.removeEventListener(
        "ended",
        onEnded
      );
      media.removeEventListener(
        "error",
        onError
      );
      media.removeEventListener(
        "loadeddata",
        onLoadedData
      );
    };
  }, [ad, mediaUrl]);

  /* =========================================
     NO AD
  ========================================= */

  if (!ad) {
    return (
      <div className="view-ad-page">
        <div className="view-ad-empty">
          <h2>Advertisement not found</h2>

          <button
            className="ad-primary-btn"
            onClick={closeViewAd}
          >
            <ArrowLeft size={18} />
            Back to Ads
          </button>
        </div>
      </div>
    );
  }

  const duration = Number(ad.duration || 0);
  const skipAfter = Number(ad.skipAfter || 0);

  const remaining = Math.max(
    0,
    Math.ceil(duration - elapsed)
  );

  /* =========================================
     HANDLERS
  ========================================= */

  const handleSkip = () => {
    if (!canSkip) return;

    setFinished(true);

    if (
      mediaRef.current &&
      ad.type !== "image"
    ) {
      mediaRef.current.pause();
    }
  };

  const handleBack = () => {
    if (closeViewAd) closeViewAd();
    else setActivePage("ads");
  };

  const handleImageError = () => {
    console.error(
      "❌ Ad image failed to load:",
      mediaUrl
    );

    notify.error(
      "Failed to load advertisement image."
    );
  };

  const handleEditClick = () => {
    if (typeof openEditAd === "function") {
      openEditAd(ad);
      return;
    }

    notify.warning(
      "Edit action is not available right now."
    );
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="view-ad-page">
      <div className="view-ad-header">
        <button
          className="ad-secondary-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back to Ads
        </button>

        <div className="view-ad-header-actions">
          <button
            className="ad-secondary-btn"
            onClick={handleEditClick}
          >
            <Pencil size={17} />
            Edit Ad
          </button>

          <button
            className="view-ad-close"
            onClick={handleBack}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="view-ad-layout">
        <section className="view-ad-player-card">
          <div className="view-ad-player">
            {/* 🔍 DEBUG INFO — जब काम हो जाए तो हटा दें */}
            <div
              style={{
                fontSize: "11px",
                color: "#888",
                marginBottom: "8px",
                wordBreak: "break-all",
                padding: "4px 8px",
                background: "rgba(0,0,0,0.05)",
                borderRadius: "4px",
              }}
            >
              Debug URL: {mediaUrl || "(empty)"}
            </div>

            {!mediaUrl ? (
              <div className="view-ad-no-media">
                No advertisement media available
              </div>
            ) : ad.type === "image" ? (
              <img
                src={mediaUrl}
                alt={
                  ad.title ||
                  ad.name ||
                  "Advertisement"
                }
                onError={handleImageError}
              />
            ) : ad.type === "audio" ? (
              <div className="view-ad-audio">
                <VolumeIcon />

                <audio
                  ref={mediaRef}
                  src={mediaUrl}
                  controls
                  autoPlay
                />
              </div>
            ) : (
              <video
                ref={mediaRef}
                src={mediaUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                onError={(e) =>
                  console.error(
                    "❌ <video> element error:",
                    mediaUrl,
                    e
                  )
                }
              />
            )}

            {!finished && (
              <div className="view-ad-overlay">
                <span>
                  {duration > 0
                    ? `${remaining}s remaining`
                    : "Advertisement"}
                </span>

                <button
                  className={`view-ad-skip ${
                    canSkip ? "enabled" : ""
                  }`}
                  disabled={!canSkip}
                  onClick={handleSkip}
                >
                  {canSkip
                    ? "Skip Ad"
                    : `Skip after ${Math.max(
                        0,
                        Math.ceil(
                          skipAfter - elapsed
                        )
                      )}s`}
                </button>
              </div>
            )}

            {finished && (
              <div className="view-ad-finished">
                <span>Ad finished</span>

                <button
                  className="ad-primary-btn"
                  onClick={handleBack}
                >
                  <ArrowLeft size={17} />
                  Back to Ads
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="view-ad-info">
          <span
            className={`ad-status ad-status-${ad.status}`}
          >
            {ad.status}
          </span>

          <h1>{ad.title || ad.name}</h1>

          {ad.description && <p>{ad.description}</p>}

          <div className="view-ad-details">
            <div>
              <strong>Ad Name</strong>
              <span>{ad.name || "-"}</span>
            </div>

            <div>
              <strong>Type</strong>
              <span>{ad.type || "-"}</span>
            </div>

            <div>
              <strong>Duration</strong>
              <span>{duration}s</span>
            </div>

            <div>
              <strong>Skip After</strong>
              <span>{skipAfter}s</span>
            </div>

            <div>
              <strong>Advertiser</strong>
              <span>
                {ad.advertiser || ad.brand || "-"}
              </span>
            </div>

            <div>
              <strong>Media URL</strong>
              <span
                style={{
                  fontSize: "11px",
                  wordBreak: "break-all",
                  color: "#888",
                }}
              >
                {ad.mediaUrl || "-"}
              </span>
            </div>
          </div>

          {ad.targetUrl && (
            <a
              className="view-ad-target"
              href={ad.targetUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Target URL
              <ExternalLink size={16} />
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

/* =========================================
   VOLUME ICON
========================================= */

function VolumeIcon() {
  return (
    <div
      className="view-ad-audio-icon"
      aria-hidden="true"
    >
      🔊
    </div>
  );
}

export default ViewAd;