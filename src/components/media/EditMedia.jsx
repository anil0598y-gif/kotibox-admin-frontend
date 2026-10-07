import { useEffect, useRef, useState } from "react";

import {
  Upload,
  Music,
  Image as ImageIcon,
  Video,
  Save,
  X,
  FolderOpen,
  FileAudio,
} from "lucide-react";

import MediaPicker from "./MediaPicker";
import "./EditMedia.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "");

/* ========================================
   EDIT MEDIA
======================================== */

function EditMedia({
  media,
  setActivePage,
  updateMedia,
  mediaFiles = [],
}) {
  const fileInputRef = useRef(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Audio",
    format: "",
    size: "",
    duration: "",
    artist: "",
    album: "",
    genre: "",
    language: "",
    usedFor: "Song",
    status: "Active",
  });

  /* ========================================
     GET RECORD ID
  ======================================== */

  const getMediaId = (item) => {
    if (!item) return "";

    if (
      item._id !== undefined &&
      item._id !== null
    ) {
      return String(item._id);
    }

    if (
      item.id !== undefined &&
      item.id !== null
    ) {
      return String(item.id);
    }

    return "";
  };

  /* ========================================
     GET SERVER MEDIA URL
  ======================================== */

  const getMediaUrl = (url) => {
    if (!url) {
      return "";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("blob:")
    ) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${SERVER_BASE_URL}${url}`;
    }

    return `${SERVER_BASE_URL}/${url}`;
  };

  /* ========================================
     INITIAL DATA
  ======================================== */

  useEffect(() => {
    if (!media) return;

    setFormData({
      title: media.title || "",
      type: media.type || "Audio",
      format: media.format || "",
      size: media.size || "",
      duration: media.duration || "",
      artist: media.artist || "",
      album: media.album || "",
      genre: media.genre || "",
      language: media.language || "",
      usedFor: media.usedFor || "Song",
      status: media.status || "Active",
    });

    setPreviewUrl(
      getMediaUrl(
        media.url || media.filePath || ""
      )
    );

    setSelectedFile(null);
  }, [media]);

  /* ========================================
     CLEAN BLOB PREVIEW
  ======================================== */

  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ========================================
     TYPE ICON
  ======================================== */

  const getTypeIcon = () => {
    if (formData.type === "Image") {
      return <ImageIcon size={34} />;
    }

    if (formData.type === "Video") {
      return <Video size={34} />;
    }

    return <Music size={34} />;
  };

  /* ========================================
     FILE SIZE
  ======================================== */

  const formatSize = (bytes) => {
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
     DETECT TYPE
  ======================================== */

  const detectMediaType = (file) => {
    if (!file) return "";

    const fileName = String(file.name || "").toLowerCase();

    const fileType = String(file.type || "").toLowerCase();

    if (
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
        fileName
      )
    ) {
      return "Image";
    }

    if (
      fileType.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(fileName)
    ) {
      return "Video";
    }

    if (
      fileType.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName)
    ) {
      return "Audio";
    }

    return "";
  };

  /* ========================================
     REPLACE FILE FROM DEVICE
  ======================================== */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const detectedType = detectMediaType(file);

    /* ✅ alert → notify.warning */
    if (!detectedType) {
      notify.warning(
        "Please select a valid Image, Video or Audio file."
      );

      e.target.value = "";
      return;
    }

    /* ✅ alert → notify.warning */
    if (
      media?.type &&
      detectedType !== media.type
    ) {
      notify.warning(
        `Please select a ${media.type.toLowerCase()} file.`
      );

      e.target.value = "";
      return;
    }

    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    const newUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newUrl);

    setFormData((prev) => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, ""),
      format:
        file.name
          .split(".")
          .pop()
          ?.toUpperCase() || "",
      size: formatSize(file.size),
    }));

    e.target.value = "";
  };

  /* ========================================
     FORM CHANGE
  ======================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ========================================
     SELECT MEDIA FROM LIBRARY
  ======================================== */

  const handleSelectExistingMedia = (selectedMedia) => {
    if (!selectedMedia) return;

    /* ✅ alert → notify.warning */
    if (
      selectedMedia.type &&
      media?.type &&
      selectedMedia.type !== media.type
    ) {
      notify.warning(
        `Please select a ${media.type.toLowerCase()} file.`
      );
      return;
    }

    const selectedUrl =
      selectedMedia.url ||
      selectedMedia.filePath ||
      selectedMedia.preview ||
      selectedMedia.previewUrl ||
      selectedMedia.src ||
      "";

    setSelectedFile(selectedMedia.fileObject || null);

    setPreviewUrl(getMediaUrl(selectedUrl));

    setFormData((prev) => ({
      ...prev,

      title:
        selectedMedia.title ||
        selectedMedia.name ||
        selectedMedia.fileName ||
        prev.title,

      format:
        selectedMedia.format ||
        selectedMedia.fileName
          ?.split(".")
          .pop()
          ?.toUpperCase() ||
        prev.format,

      size: selectedMedia.size || prev.size,

      duration: selectedMedia.duration || prev.duration,

      artist: selectedMedia.artist || prev.artist,

      album: selectedMedia.album || prev.album,

      genre: selectedMedia.genre || prev.genre,

      language: selectedMedia.language || prev.language,

      usedFor: selectedMedia.usedFor || prev.usedFor,

      status: selectedMedia.status || prev.status,
    }));

    setShowMediaPicker(false);
  };

  /* ========================================
     UPLOAD NEW FROM PICKER
  ======================================== */

  const handleUploadFromPicker = (newMedia) => {
    if (!newMedia) return;

    /* ✅ alert → notify.warning */
    if (
      newMedia.type &&
      media?.type &&
      newMedia.type !== media.type
    ) {
      notify.warning(
        `Please select a ${media.type.toLowerCase()} file.`
      );
      return;
    }

    const newUrl =
      newMedia.url ||
      newMedia.filePath ||
      newMedia.preview ||
      newMedia.previewUrl ||
      newMedia.src ||
      "";

    setSelectedFile(newMedia.fileObject || null);

    setPreviewUrl(getMediaUrl(newUrl));

    setFormData((prev) => ({
      ...prev,

      title:
        newMedia.title ||
        newMedia.name ||
        newMedia.fileName ||
        prev.title,

      format:
        newMedia.format ||
        newMedia.fileName
          ?.split(".")
          .pop()
          ?.toUpperCase() ||
        prev.format,

      size: newMedia.size || prev.size,

      duration: newMedia.duration || prev.duration,

      artist: newMedia.artist || prev.artist,

      album: newMedia.album || prev.album,

      genre: newMedia.genre || prev.genre,

      language: newMedia.language || prev.language,

      usedFor: newMedia.usedFor || prev.usedFor,

      status: newMedia.status || prev.status,
    }));

    setShowMediaPicker(false);
  };

  /* ========================================
     PREVIEW
  ======================================== */

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <div className="edit-media-empty-preview">
          {getTypeIcon()}
        </div>
      );
    }

    if (formData.type === "Image") {
      return (
        <img
          src={previewUrl}
          alt={formData.title || "Media Preview"}
        />
      );
    }

    if (formData.type === "Video") {
      return <video src={previewUrl} controls />;
    }

    return (
      <div className="edit-media-audio-preview">
        <Music size={48} />
      </div>
    );
  };

  /* ========================================
     SUBMIT
  ======================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media) {
      return;
    }

    const mediaId = getMediaId(media);

    /* ✅ alert → notify.warning */
    if (!mediaId) {
      notify.warning("Media ID not found.");
      return;
    }

    /* ✅ alert → notify.warning */
    if (!formData.title.trim()) {
      notify.warning("Please enter media title.");
      return;
    }

    try {
      setIsSaving(true);

      const uploadData = new FormData();

      if (selectedFile) {
        uploadData.append("file", selectedFile);
      }

      uploadData.append(
        "title",
        formData.title.trim()
      );

      uploadData.append("type", formData.type);
      uploadData.append("format", formData.format);
      uploadData.append("size", formData.size);
      uploadData.append("duration", formData.duration);
      uploadData.append("artist", formData.artist);
      uploadData.append("album", formData.album);
      uploadData.append("genre", formData.genre);
      uploadData.append("language", formData.language);
      uploadData.append("usedFor", formData.usedFor);
      uploadData.append("status", formData.status);

      const response = await fetch(
        `${API_BASE_URL}/media/${mediaId}`,
        {
          method: "PUT",
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Media update failed."
        );
      }

      const updatedBackendMedia =
        result.data || {
          ...media,
          ...formData,
        };

      if (typeof updateMedia === "function") {
        await updateMedia(updatedBackendMedia);
      }

      /* ✅ alert → notify.success */
      notify.success(
        "Updated!",
        "Media updated successfully."
      );

      if (
        previewUrl &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl("");

      setActivePage("media");
    } catch (error) {
      console.error("Media update error:", error);

      /* ✅ alert → notify.error */
      notify.error(
        error.message || "Media update failed."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ========================================
     CANCEL
  ======================================== */

  const handleCancel = () => {
    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setActivePage("media");
  };

  /* ========================================
     MEDIA NOT FOUND
  ======================================== */

  if (!media) {
    return (
      <div className="edit-media-page">
        <div className="edit-media-not-found">
          <FileAudio size={40} />

          <h2>Media not found</h2>

          <button
            type="button"
            onClick={() => setActivePage("media")}
          >
            Back to Media Library
          </button>
        </div>
      </div>
    );
  }

  /* ========================================
     UI
  ======================================== */

  return (
    <div className="edit-media-page">
      {/* HEADER */}
      <div className="edit-media-header">
        <div>
          <h1>Edit Media</h1>

          <p>
            Update media information or replace
            the existing file.
          </p>
        </div>

        <button
          type="button"
          className="edit-media-cancel-top"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* FORM */}
      <form
        className="edit-media-form"
        onSubmit={handleSubmit}
      >
        {/* FILE CARD */}
        <div className="edit-media-card">
          <div className="edit-media-card-header">
            <div>
              <h2>Media File</h2>

              <p>
                Replace this file from your
                computer or Media Library.
              </p>
            </div>

            <div className="edit-media-file-actions">
              <button
                type="button"
                className="edit-media-library-btn"
                onClick={() => setShowMediaPicker(true)}
                disabled={isSaving}
              >
                <FolderOpen size={18} />
                Select from Media Library
              </button>

              <button
                type="button"
                className="edit-media-upload-btn"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isSaving}
              >
                <Upload size={18} />
                Upload New
              </button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={
                  media.type === "Image"
                    ? "image/*"
                    : media.type === "Video"
                    ? "video/*"
                    : "audio/*"
                }
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="edit-media-file-preview">
            <div className="edit-media-preview-box">
              {renderPreview()}
            </div>

            <div className="edit-media-current-info">
              <div className="edit-media-type-icon">
                {getTypeIcon()}
              </div>

              <div>
                <h3>
                  {formData.title ||
                    media.fileName ||
                    "Untitled Media"}
                </h3>

                <p>
                  {selectedFile?.name ||
                    media.originalFileName ||
                    media.fileName ||
                    "Media file"}
                </p>

                <span>
                  {formData.type} •{" "}
                  {formData.format || "Unknown"} •{" "}
                  {formData.size || "Unknown size"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="edit-media-card">
          <div className="edit-media-heading">
            <h2>Basic Information</h2>

            <p>
              Update information related to this
              media file.
            </p>
          </div>

          <div className="edit-media-grid">
            {/* TITLE */}
            <div className="edit-media-field full">
              <label>
                Title <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter media title"
                disabled={isSaving}
              />
            </div>

            {/* TYPE */}
            <div className="edit-media-field">
              <label>Media Type</label>

              <input
                type="text"
                value={formData.type}
                readOnly
              />
            </div>

            {/* FORMAT */}
            <div className="edit-media-field">
              <label>Format</label>

              <input
                type="text"
                name="format"
                value={formData.format}
                onChange={handleChange}
                placeholder="MP3 / JPG / MP4"
                disabled={isSaving}
              />
            </div>

            {/* SIZE */}
            <div className="edit-media-field">
              <label>File Size</label>

              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="2.50 MB"
                disabled={isSaving}
              />
            </div>

            {/* DURATION */}
            <div className="edit-media-field">
              <label>Duration</label>

              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="04:25"
                disabled={isSaving}
              />
            </div>

            {/* ARTIST */}
            <div className="edit-media-field">
              <label>Artist</label>

              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Artist name"
                disabled={isSaving}
              />
            </div>

            {/* ALBUM */}
            <div className="edit-media-field">
              <label>Album</label>

              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleChange}
                placeholder="Album name"
                disabled={isSaving}
              />
            </div>

            {/* GENRE */}
            <div className="edit-media-field">
              <label>Genre</label>

              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Genre"
                disabled={isSaving}
              />
            </div>

            {/* LANGUAGE */}
            <div className="edit-media-field">
              <label>Language</label>

              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="Hindi"
                disabled={isSaving}
              />
            </div>

            {/* USED FOR */}
            <div className="edit-media-field">
              <label>Used For</label>

              <select
                name="usedFor"
                value={formData.usedFor}
                onChange={handleChange}
                disabled={isSaving}
              >
                <option value="Song">Song</option>
                <option value="Album Cover">
                  Album Cover
                </option>
                <option value="Artist Image">
                  Artist Image
                </option>
                <option value="Playlist Cover">
                  Playlist Cover
                </option>
                <option value="Video">Video</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="edit-media-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSaving}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* FILE DETAILS */}
        <div className="edit-media-card">
          <div className="edit-media-heading">
            <h2>File Details</h2>

            <p>Current media file information.</p>
          </div>

          <div className="edit-media-details">
            <div>
              <span>File Name</span>

              <strong>
                {selectedFile?.name ||
                  media.originalFileName ||
                  media.fileName ||
                  "-"}
              </strong>
            </div>

            <div>
              <span>Media Type</span>

              <strong>{formData.type}</strong>
            </div>

            <div>
              <span>Format</span>

              <strong>{formData.format || "-"}</strong>
            </div>

            <div>
              <span>File Size</span>

              <strong>{formData.size || "-"}</strong>
            </div>

            <div>
              <span>Upload Date</span>

              <strong>
                {media.uploadDate || media.createdAt
                  ? new Date(
                      media.uploadDate ||
                        media.createdAt
                    ).toLocaleDateString("en-IN")
                  : "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="edit-media-actions">
          <button
            type="button"
            className="edit-media-cancel-btn"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-media-save-btn"
            disabled={isSaving}
          >
            <Save size={18} />

            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* MEDIA PICKER */}
      {showMediaPicker && (
        <MediaPicker
          mediaFiles={mediaFiles}
          mediaType={media.type}
          selectedMedia={media}
          onSelect={handleSelectExistingMedia}
          onUpload={handleUploadFromPicker}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

export default EditMedia;