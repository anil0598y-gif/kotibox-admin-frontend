import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  X,
  Music,
  Video,
  FolderOpen,
  File,
} from "lucide-react";

import "./MediaPicker.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

function MediaPicker({
  mediaFiles = [],
  selectedMedia = null,
  mediaType = "All",
  onSelect,
  onUpload,
  onClose,
}) {
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState(
    selectedMedia || null
  );

  /* ========================================
     CURRENT MEDIA TYPE
  ======================================== */

  const currentType = mediaType || "All";

  /* ========================================
     GET MEDIA TYPE
  ======================================== */

  const getMediaType = (media) => {
    if (!media) return "";

    const type = String(media.type || "").toLowerCase();

    const fileType = String(
      media.fileType || ""
    ).toLowerCase();

    const fileName = String(
      media.fileName ||
        media.name ||
        media.title ||
        ""
    ).toLowerCase();

    /* IMAGE */

    if (
      type === "image" ||
      type.startsWith("image/") ||
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName)
    ) {
      return "Image";
    }

    /* VIDEO */

    if (
      type === "video" ||
      type.startsWith("video/") ||
      fileType.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(fileName)
    ) {
      return "Video";
    }

    /* AUDIO */

    if (
      type === "audio" ||
      type.startsWith("audio/") ||
      fileType.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName)
    ) {
      return "Audio";
    }

    return "";
  };

  /* ========================================
     MEDIA URL
  ======================================== */

  const getMediaUrl = (media) => {
    if (!media) return "";

    return (
      media.url ||
      media.preview ||
      media.previewUrl ||
      media.src ||
      ""
    );
  };

  /* ========================================
     MEDIA TITLE
  ======================================== */

  const getMediaTitle = (media) => {
    return (
      media?.title ||
      media?.name ||
      media?.fileName ||
      "Untitled Media"
    );
  };

  /* ========================================
     FILTER BY TYPE
  ======================================== */

  const typeFiles = mediaFiles.filter((media) => {
    const detectedType = getMediaType(media);

    if (currentType === "All") {
      return ["Image", "Audio", "Video"].includes(
        detectedType
      );
    }

    return detectedType === currentType;
  });

  /* ========================================
     SEARCH FILTER
  ======================================== */

  const filteredMedia = typeFiles.filter((media) => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return true;
    }

    const title = String(
      media.title || media.name || ""
    ).toLowerCase();

    const fileName = String(
      media.fileName || ""
    ).toLowerCase();

    const type = getMediaType(media).toLowerCase();

    return (
      title.includes(text) ||
      fileName.includes(text) ||
      type.includes(text)
    );
  });

  /* ========================================
     FILE SIZE
  ======================================== */

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  /* ========================================
     SELECT MEDIA CARD
  ======================================== */

  const handleCardSelect = (media) => {
    setTempSelected(media);
  };

  /* ========================================
     CONFIRM SELECTION
  ======================================== */

  const handleConfirm = () => {
    /* ✅ alert → notify.warning */
    if (!tempSelected) {
      notify.warning(
        "Please select a media file first."
      );
      return;
    }

    if (onSelect) {
      onSelect(tempSelected);
    }

    if (onClose) {
      onClose();
    }
  };

  /* ========================================
     UPLOAD NEW FILE
  ======================================== */

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();

    let uploadedType = "";

    /* DETECT IMAGE */

    if (
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName)
    ) {
      uploadedType = "Image";
    }

    /* DETECT VIDEO */

    else if (
      file.type.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(fileName)
    ) {
      uploadedType = "Video";
    }

    /* DETECT AUDIO */

    else if (
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName)
    ) {
      uploadedType = "Audio";
    }

    /* INVALID FILE */

    /* ✅ alert → notify.warning */
    if (!uploadedType) {
      notify.warning(
        "Please select a valid image, audio, or video file."
      );

      event.target.value = "";
      return;
    }

    /* CHECK SELECTED TYPE */

    /* ✅ alert → notify.warning */
    if (
      currentType !== "All" &&
      uploadedType !== currentType
    ) {
      notify.warning(
        `Please select a valid ${currentType.toLowerCase()} file.`
      );

      event.target.value = "";
      return;
    }

    /* CREATE OBJECT URL */

    const mediaUrl = URL.createObjectURL(file);

    /* FILE FORMAT */

    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toUpperCase()
      : "";

    /* MEDIA TITLE */

    const title = file.name.replace(/\.[^/.]+$/, "");

    /* CREATE MEDIA OBJECT */

    const newMedia = {
      id: Date.now() + Math.floor(Math.random() * 1000),

      title,

      name: file.name,

      fileName: file.name,

      type: uploadedType,

      fileType: file.type,

      format: extension,

      size: formatFileSize(file.size),

      sizeBytes: file.size,

      duration: "",

      artist: "",
      album: "",
      genre: "",
      language: "",

      usedFor:
        uploadedType === "Image"
          ? "Album Cover"
          : uploadedType === "Audio"
          ? "Song"
          : "Other",

      status: "Active",

      uploadDate: new Date().toISOString().split("T")[0],

      url: mediaUrl,
      preview: mediaUrl,
      previewUrl: mediaUrl,
      src: mediaUrl,

      fileObject: file,
    };

    /* SEND MEDIA TO PARENT */

    let uploadedMedia = newMedia;

    if (onUpload) {
      const result = onUpload(newMedia);

      if (result) {
        uploadedMedia = result;
      }
    }

    /* SELECT UPLOADED MEDIA */

    setTempSelected(uploadedMedia);

    event.target.value = "";
  };

  /* ========================================
     SELECTED CHECK
  ======================================== */

  const isSelected = (media) => {
    if (!tempSelected) {
      return false;
    }

    if (tempSelected.id && media.id) {
      return tempSelected.id === media.id;
    }

    return (
      getMediaUrl(tempSelected) ===
      getMediaUrl(media)
    );
  };

  /* ========================================
     PREVIEW
  ======================================== */

  const renderPreview = (media) => {
    const type = getMediaType(media);

    const url = getMediaUrl(media);

    if (type === "Image") {
      if (url) {
        return (
          <img
            src={url}
            alt={getMediaTitle(media)}
          />
        );
      }

      return <ImageIcon size={42} />;
    }

    if (type === "Video") {
      if (url) {
        return (
          <video
            src={url}
            muted
            preload="metadata"
          />
        );
      }

      return <Video size={42} />;
    }

    if (type === "Audio") {
      return (
        <div className="media-picker-audio-preview">
          <Music size={42} />
        </div>
      );
    }

    return <File size={42} />;
  };

  /* ========================================
     HEADER ICON
  ======================================== */

  const getTypeIcon = () => {
    if (currentType === "Image") {
      return <ImageIcon size={21} />;
    }

    if (currentType === "Video") {
      return <Video size={21} />;
    }

    if (currentType === "Audio") {
      return <Music size={21} />;
    }

    return <FolderOpen size={21} />;
  };

  /* ========================================
     HEADER TEXT
  ======================================== */

  const getHeaderTitle = () => {
    if (currentType === "All") {
      return "Select Media";
    }

    return `Select ${currentType}`;
  };

  const getHeaderDescription = () => {
    if (currentType === "All") {
      return "Select an existing media file or upload a new one.";
    }

    return `Select an existing ${currentType.toLowerCase()} or upload a new one.`;
  };

  const getUploadText = () => {
    if (currentType === "All") {
      return "Upload New Media";
    }

    return `Upload New ${currentType}`;
  };

  const getEmptyText = () => {
    if (currentType === "All") {
      return "No media files found";
    }

    return `No ${currentType.toLowerCase()} files found`;
  };

  /* ========================================
     ACCEPT FILE TYPES
  ======================================== */

  const getAcceptTypes = () => {
    if (currentType === "Image") {
      return "image/*";
    }

    if (currentType === "Video") {
      return "video/*";
    }

    if (currentType === "Audio") {
      return "audio/*";
    }

    return "image/*,audio/*,video/*";
  };

  /* ========================================
     FOLDER TITLE
  ======================================== */

  const folderTitle =
    currentType === "All"
      ? "Local Media"
      : `Local ${currentType}`;

  return (
    <div className="media-picker-overlay">
      <div className="media-picker">
        {/* HEADER */}
        <div className="media-picker-header">
          <div className="media-picker-title">
            <div className="media-picker-title-icon">
              {getTypeIcon()}
            </div>

            <div>
              <h2>{getHeaderTitle()}</h2>

              <p>{getHeaderDescription()}</p>
            </div>
          </div>

          <button
            type="button"
            className="media-picker-close"
            onClick={onClose}
            title="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="media-picker-toolbar">
          <div className="media-picker-search">
            <Search size={18} />

            <input
              type="text"
              placeholder={
                currentType === "All"
                  ? "Search media files..."
                  : `Search ${currentType.toLowerCase()} files...`
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="media-picker-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />

            {getUploadText()}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept={getAcceptTypes()}
            onChange={handleUpload}
          />
        </div>

        {/* LOCAL FOLDER HEADER */}
        <div className="media-picker-folder-header">
          <div className="media-folder-name">
            <FolderOpen size={20} />

            <strong>{folderTitle}</strong>
          </div>

          <span>{filteredMedia.length} files</span>
        </div>

        {/* CONTENT */}
        <div className="media-picker-content">
          {filteredMedia.length === 0 ? (
            <div className="media-picker-empty">
              {getTypeIcon()}

              <h3>{getEmptyText()}</h3>

              <p>
                {currentType === "All"
                  ? "Upload a new image, audio, or video from your device."
                  : `Upload a new ${currentType.toLowerCase()} from your device.`}
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={17} />

                {currentType === "All"
                  ? "Upload Media"
                  : `Upload ${currentType}`}
              </button>
            </div>
          ) : (
            <div className="media-picker-grid">
              {filteredMedia.map((media) => {
                const selected = isSelected(media);

                const type = getMediaType(media);

                return (
                  <div
                    key={
                      media.id ||
                      `${getMediaTitle(
                        media
                      )}-${getMediaUrl(media)}`
                    }
                    className={`media-picker-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => handleCardSelect(media)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " "
                      ) {
                        e.preventDefault();

                        handleCardSelect(media);
                      }
                    }}
                  >
                    {/* PREVIEW */}
                    <div className="media-picker-image">
                      {renderPreview(media)}

                      {selected && (
                        <div className="media-picker-selected">
                          <Check size={22} />
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="media-picker-info">
                      <h4>{getMediaTitle(media)}</h4>

                      <p>
                        {media.fileName ||
                          media.name ||
                          `${type} file`}
                      </p>

                      <span>
                        {media.size ||
                          (media.sizeBytes
                            ? formatFileSize(
                                media.sizeBytes
                              )
                            : "Unknown size")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="media-picker-footer">
          <span>
            {filteredMedia.length}{" "}
            {currentType === "All"
              ? "media"
              : currentType.toLowerCase()}{" "}
            {filteredMedia.length !== 1
              ? "files"
              : "file"}{" "}
            available
          </span>

          <div className="media-picker-footer-actions">
            <button
              type="button"
              className="media-picker-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="media-picker-select"
              disabled={!tempSelected}
              onClick={handleConfirm}
            >
              <Check size={17} />

              {currentType === "All"
                ? "Select Media"
                : `Select ${currentType}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaPicker;