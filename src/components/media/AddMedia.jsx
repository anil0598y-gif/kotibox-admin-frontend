import { useRef, useState } from "react";

import {
  Upload,
  Music,
  Image as ImageIcon,
  Video,
  X,
  Save,
  FolderOpen,
} from "lucide-react";

import MediaPicker from "./MediaPicker";
import "./AddMedia.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "");

/* ========================================
   ADD MEDIA
======================================== */

function AddMedia({
  setActivePage,
  addMedia,
  mediaFiles = [],
}) {
  const fileInputRef = useRef(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

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
     MEDIA TYPE DETECTION
  ======================================== */

  const detectMediaType = (file) => {
    if (!file) return "";

    const fileName = String(
      file.name || ""
    ).toLowerCase();

    const fileType = String(
      file.type || ""
    ).toLowerCase();

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
      /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(
        fileName
      )
    ) {
      return "Video";
    }

    if (
      fileType.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(
        fileName
      )
    ) {
      return "Audio";
    }

    return "";
  };

  /* ========================================
     FORMAT SIZE
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
     PROCESS FILE
  ======================================== */

  const processFile = (file) => {
    if (!file) return;

    const detectedType = detectMediaType(file);

    /* ✅ alert → notify.warning */
    if (!detectedType) {
      notify.warning(
        "Please select a valid Image, Video or Audio file."
      );
      return;
    }

    const extension =
      file.name?.split(".").pop()?.toUpperCase() || "";

    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);

    setFormData((prev) => ({
      ...prev,

      title:
        file.name?.replace(/\.[^/.]+$/, "") || "",

      type: detectedType,

      format: extension,

      size: formatSize(file.size),

      usedFor:
        detectedType === "Image"
          ? "Album Cover"
          : detectedType === "Audio"
          ? "Song"
          : "Video",
    }));
  };

  /* ========================================
     FILE INPUT
  ======================================== */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      processFile(file);
    }

    e.target.value = "";
  };

  /* ========================================
     DRAG OVER / LEAVE / DROP
  ======================================== */

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
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
     SELECT EXISTING MEDIA
  ======================================== */

  const handleSelectExistingMedia = (media) => {
    if (!media) return;

    const mediaUrl =
      media.url ||
      media.preview ||
      media.previewUrl ||
      media.src ||
      "";

    setSelectedFile(media.fileObject || null);

    setPreviewUrl(getMediaUrl(mediaUrl));

    let detectedType = media.type || "";

    if (!detectedType) {
      if (media.fileType?.startsWith("image/")) {
        detectedType = "Image";
      } else if (
        media.fileType?.startsWith("video/")
      ) {
        detectedType = "Video";
      } else {
        detectedType = "Audio";
      }
    }

    setFormData((prev) => ({
      ...prev,

      title:
        media.title ||
        media.name ||
        media.fileName ||
        "",

      type: detectedType,

      format:
        media.format ||
        media.fileName
          ?.split(".")
          .pop()
          ?.toUpperCase() ||
        "",

      size: media.size || "",

      duration: media.duration || "",

      artist: media.artist || "",

      album: media.album || "",

      genre: media.genre || "",

      language: media.language || "",

      usedFor: media.usedFor || "Other",

      status: media.status || "Active",
    }));

    setShowMediaPicker(false);
  };

  /* ========================================
     UPLOAD FROM PICKER
  ======================================== */

  const handleUploadFromPicker = (newMedia) => {
    if (!newMedia) return;

    const mediaUrl =
      newMedia.url ||
      newMedia.preview ||
      newMedia.previewUrl ||
      newMedia.src ||
      "";

    setSelectedFile(newMedia.fileObject || null);

    setPreviewUrl(getMediaUrl(mediaUrl));

    setFormData((prev) => ({
      ...prev,

      title:
        newMedia.title ||
        newMedia.name ||
        newMedia.fileName ||
        "",

      type: newMedia.type || "Audio",

      format: newMedia.format || "",

      size: newMedia.size || "",

      duration: newMedia.duration || "",

      artist: newMedia.artist || "",

      album: newMedia.album || "",

      genre: newMedia.genre || "",

      language: newMedia.language || "",

      usedFor: newMedia.usedFor || "Other",

      status: newMedia.status || "Active",
    }));

    setShowMediaPicker(false);
  };

  /* ========================================
     REMOVE FILE
  ======================================== */

  const removeFile = () => {
    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    setFormData((prev) => ({
      ...prev,
      title: "",
      format: "",
      size: "",
      duration: "",
    }));
  };

  /* ========================================
     SUBMIT
  ======================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    /* ✅ alert → notify.warning */
    if (!selectedFile) {
      notify.warning(
        "Please upload a file from your computer."
      );
      return;
    }

    /* ✅ alert → notify.warning */
    if (!formData.title.trim()) {
      notify.warning("Please enter media title.");
      return;
    }

    /* ✅ alert → notify.error */
    if (typeof addMedia !== "function") {
      notify.error(
        "addMedia handler missing. Please reload the page."
      );
      return;
    }

    try {
      setIsSaving(true);

      await addMedia({
        file: selectedFile,
        fileObject: selectedFile,

        title: formData.title.trim(),
        type: formData.type,
        format: formData.format,
        size: formData.size,
        duration: formData.duration,
        artist: formData.artist,
        album: formData.album,
        genre: formData.genre,
        language: formData.language,
        usedFor: formData.usedFor,
        status: formData.status,
      });

      if (
        previewUrl &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl("");

      setFormData({
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
    } catch (error) {
      console.error("Media upload error:", error);

      /* ✅ alert → notify.error */
      notify.error(
        error.message || "Media upload failed."
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

    setActivePage("media");
  };

  /* ========================================
     UI
  ======================================== */

  return (
    <div className="add-media-page">
      {/* HEADER */}
      <div className="add-media-header">
        <div>
          <h1>Add Media</h1>

          <p>
            Upload a new image, video or audio
            file to your media library.
          </p>
        </div>

        <button
          type="button"
          className="add-media-back-btn"
          onClick={handleCancel}
        >
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* FORM */}
      <form
        className="add-media-form"
        onSubmit={handleSubmit}
      >
        {/* FILE SECTION */}
        <div className="add-media-card">
          <div className="add-media-card-header">
            <div>
              <h2>Media File</h2>

              <p>
                Upload a new file or select one from
                your Media Library.
              </p>
            </div>

            <button
              type="button"
              className="add-media-library-btn"
              onClick={() => setShowMediaPicker(true)}
            >
              <FolderOpen size={18} />
              Select from Media Library
            </button>
          </div>

          <div className="add-media-upload-area">
            {!selectedFile && !previewUrl ? (
              <div
                className={`add-media-dropzone ${
                  isDragging ? "dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <div className="add-media-upload-icon">
                  <Upload size={30} />
                </div>

                <h3>Drop your file here</h3>

                <p>
                  or click to browse from your
                  computer
                </p>

                <span>
                  Supports JPG, PNG, WEBP, MP3, WAV,
                  MP4, WEBM and more
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,audio/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="add-media-selected-file">
                <div className="add-media-preview">
                  {formData.type === "Image" &&
                  previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                    />
                  ) : formData.type === "Video" &&
                    previewUrl ? (
                    <video
                      src={previewUrl}
                      controls
                    />
                  ) : (
                    <div className="add-media-audio-preview">
                      <Music size={48} />
                    </div>
                  )}
                </div>

                <div className="add-media-file-info">
                  <div className="add-media-file-icon">
                    {getTypeIcon()}
                  </div>

                  <div>
                    <h3>
                      {formData.title ||
                        selectedFile?.name ||
                        "Selected Media"}
                    </h3>

                    <p>
                      {selectedFile?.name ||
                        "Media Library file"}
                    </p>

                    <span>
                      {formData.type} •{" "}
                      {formData.format} •{" "}
                      {formData.size}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="add-media-remove-btn"
                  onClick={removeFile}
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="add-media-card">
          <div className="add-media-card-heading">
            <h2>Basic Information</h2>

            <p>
              Add information about this media.
            </p>
          </div>

          <div className="add-media-grid">
            {/* TITLE */}
            <div className="add-media-field full">
              <label>
                Title <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter media title"
              />
            </div>

            {/* TYPE */}
            <div className="add-media-field">
              <label>Media Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Audio">Audio</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
              </select>
            </div>

            {/* FORMAT */}
            <div className="add-media-field">
              <label>Format</label>

              <input
                type="text"
                name="format"
                value={formData.format}
                onChange={handleChange}
                placeholder="MP3 / JPG / MP4"
              />
            </div>

            {/* SIZE */}
            <div className="add-media-field">
              <label>File Size</label>

              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="2.50 MB"
              />
            </div>

            {/* DURATION */}
            <div className="add-media-field">
              <label>Duration</label>

              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="04:25"
              />
            </div>

            {/* ARTIST */}
            <div className="add-media-field">
              <label>Artist</label>

              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Artist name"
              />
            </div>

            {/* ALBUM */}
            <div className="add-media-field">
              <label>Album</label>

              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleChange}
                placeholder="Album name"
              />
            </div>

            {/* GENRE */}
            <div className="add-media-field">
              <label>Genre</label>

              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Genre"
              />
            </div>

            {/* LANGUAGE */}
            <div className="add-media-field">
              <label>Language</label>

              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="Hindi"
              />
            </div>

            {/* USED FOR */}
            <div className="add-media-field">
              <label>Used For</label>

              <select
                name="usedFor"
                value={formData.usedFor}
                onChange={handleChange}
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
            <div className="add-media-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="add-media-actions">
          <button
            type="button"
            className="add-media-cancel"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-media-save"
            disabled={isSaving}
          >
            <Save size={18} />

            {isSaving ? "Uploading..." : "Save Media"}
          </button>
        </div>
      </form>

      {/* MEDIA PICKER */}
      {showMediaPicker && (
        <MediaPicker
          mediaFiles={mediaFiles}
          mediaType="All"
          selectedMedia={null}
          onSelect={handleSelectExistingMedia}
          onUpload={handleUploadFromPicker}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

export default AddMedia;