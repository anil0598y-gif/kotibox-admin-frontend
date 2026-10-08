import React from "react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Music2,
  Video,
  FileText,
} from "lucide-react";
import "./MediaView.css";

import notify from "../../utils/notify";

/* ✅ FIX: SERVER_BASE_URL ab env se aata hai, localhost hardcoded nahi */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const toMediaUrl = (value) => {
  const url = String(value ?? "").trim();

  if (!url) return "";

  /* ✅ FIX: purane localhost URLs ko live server URL me convert karo */
  if (url.includes("localhost:5000")) {
    const relativePath = url.split("localhost:5000")[1];
    return `${SERVER_BASE_URL}${relativePath}`;
  }

  if (url.includes("127.0.0.1:5000")) {
    const relativePath = url.split("127.0.0.1:5000")[1];
    return `${SERVER_BASE_URL}${relativePath}`;
  }

  if (/^(https?:|blob:|data:)/i.test(url)) return url;

  return `${SERVER_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

const getMediaId = (media) =>
  media?.id ?? media?._id ?? media?.userId ?? "";

const MediaView = ({
  media,
  setActivePage,
  openEditMedia,
  deleteMedia,
}) => {
  if (!media) {
    return (
      <div className="media-view-container">
        <div className="empty-state">
          <h3>Media not found</h3>
          <p>
            Ye media delete ho chuki hai ya exist nahi
            karti.
          </p>
          <button
            type="button"
            onClick={() => setActivePage("media")}
          >
            <ArrowLeft size={17} />
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const mediaId = getMediaId(media);
  if (!mediaId) {
    return (
      <div className="media-view-container">
        <div className="empty-state">
          <h3>Media not found</h3>
          <p>Is media ka valid ID nahi mila.</p>
          <button
            type="button"
            onClick={() => setActivePage("media")}
          >
            <ArrowLeft size={17} />
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const mediaType = (() => {
    const type = String(media.type || "").toLowerCase();
    if (type === "image") return "Image";
    if (type === "audio") return "Audio";
    if (type === "video") return "Video";

    const fileType = String(media.fileType || "").toLowerCase();
    if (fileType.startsWith("image/")) return "Image";
    if (fileType.startsWith("audio/")) return "Audio";
    if (fileType.startsWith("video/")) return "Video";

    const fileName = String(media.fileName || "").toLowerCase();
    const extension = fileName.split(".").pop();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
        extension
      )
    ) {
      return "Image";
    }
    if (
      ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(extension)
    ) {
      return "Audio";
    }
    if (
      ["mp4", "webm", "mov", "mkv", "avi"].includes(extension)
    ) {
      return "Video";
    }
    return "File";
  })();

  /* ✅ FIX: URL nikalna */
  const mediaUrl = toMediaUrl(
    media.url || media.filePath || media.fileUrl
  );

  /* ✅ FIX: Cover image nikalo (audio ke liye bhi) */
  const coverImage = toMediaUrl(
    media.previewUrl ||
      media.imageUrl ||
      media.coverUrl ||
      media.coverImage ||
      ""
  );

  const isUploadedMedia = media.source === "media-library";

  /* =========================================================
     RENDER MEDIA PREVIEW
  ========================================================= */

  const renderMediaPreview = () => {
    /* ---------- IMAGE ---------- */
    if (mediaType === "Image") {
      if (!mediaUrl) {
        return (
          <div className="view-placeholder">
            <ImageIcon size={60} />
            <span>Image preview not available</span>
          </div>
        );
      }

      return (
        <div className="view-image-container">
          <img
            src={mediaUrl}
            alt={media.title || "Media"}
            className="view-media-image"
            onError={(event) => {
              const parent = event.currentTarget.parentElement;
              event.currentTarget.style.display = "none";
              if (parent) {
                parent.classList.add("media-error");
              }
            }}
          />
        </div>
      );
    }

    /* ---------- AUDIO ---------- */
    if (mediaType === "Audio") {
      if (!mediaUrl && !coverImage) {
        return (
          <div className="view-placeholder">
            <Music2 size={60} />
            <span>Audio preview not available</span>
          </div>
        );
      }

      return (
        <div className="view-audio-container">
          {/* ✅ FIX: Cover image show karo (agar hai toh) */}
          {coverImage ? (
            <img
              src={coverImage}
              alt={media.title || "Cover"}
              className="view-audio-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="view-audio-icon">
              <Music2 size={60} />
            </div>
          )}

          <h3 className="view-audio-title">
            {media.title || "Audio File"}
          </h3>

          {mediaUrl && (
            <audio
              controls
              className="view-audio-player"
              onError={() => {
                console.warn("Audio load failed:", mediaUrl);
              }}
            >
              <source
                src={mediaUrl}
                type={media.fileType || "audio/mpeg"}
              />
              Your browser does not support the audio player.
            </audio>
          )}
        </div>
      );
    }

    /* ---------- VIDEO ---------- */
    if (mediaType === "Video") {
      if (!mediaUrl) {
        return (
          <div className="view-placeholder">
            <Video size={60} />
            <span>Video preview not available</span>
          </div>
        );
      }

      return (
        <video
          controls
          className="view-media-video"
          poster={coverImage || undefined}
          onError={() => {
            console.warn("Video load failed:", mediaUrl);
          }}
        >
          <source
            src={mediaUrl}
            type={media.fileType || "video/mp4"}
          />
          Your browser does not support the video player.
        </video>
      );
    }

    return (
      <div className="view-placeholder">
        <FileText size={60} />
        <span>{media.type || "File"}</span>
      </div>
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!isUploadedMedia) {
      notify.warning(
        "Ye media original module ka record hai. Isko Song, Album, Artist, Playlist ya User module se change/delete karein."
      );
      return;
    }

    const id = getMediaId(media);

    if (!id) {
      notify.warning("Media ID nahi mili.");
      return;
    }

    const confirmed = await notify.confirmDelete(
      media.title || "this media"
    );

    if (!confirmed) return;

    if (deleteMedia) deleteMedia(id);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = () => {
    if (!isUploadedMedia) {
      notify.warning(
        "Ye media original module ka record hai. Isko Song, Album, Artist, Playlist ya User module se edit karein."
      );
      return;
    }

    if (openEditMedia) openEditMedia(media);
  };

  return (
    <div className="media-view-container">
      <div className="media-view-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => setActivePage("media")}
          title="Back to Library"
        >
          <ArrowLeft size={18} />
          Back to Library
        </button>

        <div className="media-view-actions">
          {isUploadedMedia && (
            <>
              <button
                type="button"
                className="edit-btn"
                title="Edit Media"
                onClick={handleEdit}
              >
                <Pencil size={17} />
              </button>

              <button
                type="button"
                className="delete-btn"
                title="Delete Media"
                onClick={handleDelete}
              >
                <Trash2 size={17} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="media-view-content">
        <div className="media-view-preview">
          {renderMediaPreview()}
        </div>

        <div className="media-view-info">
          <div className="media-view-info-header">
            <div className="media-type-icon">
              {mediaType === "Image" && (
                <ImageIcon size={22} />
              )}
              {mediaType === "Audio" && <Music2 size={22} />}
              {mediaType === "Video" && <Video size={22} />}
              {mediaType === "File" && (
                <FileText size={22} />
              )}
            </div>

            <div className="media-view-info-title">
              <h2 title={media.title || "Untitled Media"}>
                {media.title || "Untitled Media"}
              </h2>
              <span className="media-type-text">
                {mediaType}
              </span>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{mediaType}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Format</span>
              <span className="info-value">
                {media.format || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Size</span>
              <span className="info-value">
                {media.size || "-"}
              </span>
            </div>

            {media.duration && media.duration !== "-" && (
              <div className="info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">
                  {media.duration}
                </span>
              </div>
            )}

            {media.artist && (
              <div className="info-item">
                <span className="info-label">Artist</span>
                <span className="info-value">
                  {media.artist}
                </span>
              </div>
            )}

            {media.album && (
              <div className="info-item">
                <span className="info-label">Album</span>
                <span className="info-value">
                  {media.album}
                </span>
              </div>
            )}

            {media.genre && media.genre !== "-" && (
              <div className="info-item">
                <span className="info-label">Genre</span>
                <span className="info-value">
                  {media.genre}
                </span>
              </div>
            )}

            {media.language && media.language !== "-" && (
              <div className="info-item">
                <span className="info-label">Language</span>
                <span className="info-value">
                  {media.language}
                </span>
              </div>
            )}

            <div className="info-item">
              <span className="info-label">Used For</span>
              <span className="info-value">
                {media.usedFor || "-"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Status</span>
              <span
                className={`status-badge ${
                  String(
                    media.status || "Active"
                  ).toLowerCase() === "active" ||
                  String(
                    media.status || ""
                  ).toLowerCase() === "published"
                    ? "active"
                    : "inactive"
                }`}
              >
                {media.status || "Active"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Upload Date
              </span>
              <span className="info-value">
                {media.uploadDate || "-"}
              </span>
            </div>

            <div className="info-item info-item-full">
              <span className="info-label">File Name</span>
              <span
                className="info-value file-name"
                title={media.fileName || "-"}
              >
                {media.fileName || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaView;