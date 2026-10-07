import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Check,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

import MediaPicker from "../media/MediaPicker";

import notify from "../../utils/notify";

import "./AddAlbum.css";

const API_BASE_URL = "http://localhost:5000";

/* =========================================
   GET RECORD ID — ✅ FIXED
========================================= */

const getRecordId = (item) => {
  if (!item) return "";

  /* String ID */
  if (typeof item === "string") {
    return item.trim();
  }

  /* Number ID */
  if (typeof item === "number") {
    return String(item);
  }

  if (typeof item !== "object") {
    return "";
  }

  /* Direct $oid */
  if (item.$oid) {
    return String(item.$oid).trim();
  }

  /* _id.$oid (nested) */
  if (item._id && item._id.$oid) {
    return String(item._id.$oid).trim();
  }

  /* id.$oid (nested) */
  if (item.id && item.id.$oid) {
    return String(item.id.$oid).trim();
  }

  /* _id as string */
  if (item._id) {
    return String(item._id).trim();
  }

  /* id as string */
  if (item.id) {
    return String(item.id).trim();
  }

  /* songId / song_id */
  if (item.songId) {
    return String(item.songId).trim();
  }

  if (item.song_id) {
    return String(item.song_id).trim();
  }

  return "";
};

/* =========================================
   GET IMAGE URL
========================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  const imageUrl = String(image).trim();

  if (!imageUrl) return "";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
};

/* =========================================
   GET MEDIA URL
========================================= */

const getMediaUrl = (media) => {
  if (!media) return "";

  if (typeof media === "string") {
    return getImageUrl(media);
  }

  const url =
    media.url ||
    media.preview ||
    media.src ||
    media.coverUrl ||
    media.coverImage ||
    media.image ||
    media.imageUrl ||
    media.imageURL ||
    "";

  return getImageUrl(url);
};

/* =========================================
   GET FILE NAME
========================================= */

const getFileName = (media, fallback = "album-cover.jpg") => {
  if (!media) return fallback;

  if (typeof media === "string") {
    const parts = media.split("/");
    const fileName = parts[parts.length - 1];

    return fileName || fallback;
  }

  return (
    media.fileName ||
    media.name ||
    media.originalName ||
    fallback
  );
};

/* =========================================
   ADD ALBUM COMPONENT
========================================= */

function AddAlbum({
  setActivePage,
  addAlbum,
  songs = [],
  mediaFiles = [],
  addMediaFileToLibrary,
}) {
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    genre: "",
    language: "",
    releaseDate: "",
    description: "",
    status: "Active",
  });

  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [songSearch, setSongSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================================
     CLEANUP PREVIEW
  ========================================= */

  useEffect(() => {
    return () => {
      if (coverImage && coverImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(coverImage);
        } catch (error) {
          console.error("Failed to cleanup preview:", error);
        }
      }
    };
  }, [coverImage]);

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================
     SELECT EXISTING MEDIA IMAGE
  ========================================= */

  const handleExistingImage = (media) => {
    if (!media) return;

    const imageUrl = getMediaUrl(media);

    if (!imageUrl) {
      notify.warning(
        "This image does not have a valid preview."
      );
      return;
    }

    if (coverImage && coverImage.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(coverImage);
      } catch (error) {
        console.error("Failed to revoke old preview:", error);
      }
    }

    setSelectedMedia(media);
    setCoverFile(null);
    setCoverImage(imageUrl);
    setShowMediaPicker(false);
    setError("");
  };

  /* =========================================
     UPLOAD NEW IMAGE
  ========================================= */

  const handleUploadNewImage = async (fileOrMedia) => {
    if (!fileOrMedia) return null;

    let file = fileOrMedia;

    if (fileOrMedia?.target && fileOrMedia.target.files) {
      file = fileOrMedia.target.files[0];
    }

    if (typeof FileList !== "undefined" && file instanceof FileList) {
      file = file[0];
    }

    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) return null;

    if (
      typeof file === "object" &&
      !(file instanceof File) &&
      !(file instanceof Blob)
    ) {
      const imageUrl = getMediaUrl(file);

      if (imageUrl) {
        handleExistingImage(file);
        return file;
      }
    }

    const isFile =
      typeof File !== "undefined" && file instanceof File;

    const isBlob =
      typeof Blob !== "undefined" && file instanceof Blob;

    if (!isFile && !isBlob) {
      notify.warning("Please select a valid image file.");
      return null;
    }

    const fileType = file.type || "";
    const fileName = file.name || "";

    const validImageExtensions =
      /\.(jpg|jpeg|png|webp|gif|bmp|svg|avif)$/i;

    const isImage =
      fileType.startsWith("image/") ||
      validImageExtensions.test(fileName);

    if (!isImage) {
      notify.warning(
        "Please select a valid image file. Supported: JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, AVIF"
      );
      return null;
    }

    let imageUrl = "";

    try {
      imageUrl = URL.createObjectURL(file);
    } catch (error) {
      console.error("Failed to create preview:", error);

      notify.error("Unable to preview this image.");
      return null;
    }

    if (coverImage && coverImage.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(coverImage);
      } catch (error) {
        console.error("Failed to revoke old preview:", error);
      }
    }

    setCoverFile(file);
    setCoverImage(imageUrl);
    setSelectedMedia(null);
    setShowMediaPicker(false);
    setError("");

    if (addMediaFileToLibrary && isFile) {
      try {
        const newImage = await addMediaFileToLibrary(
          file,
          "Album Cover",
          {
            title:
              formData.name ||
              fileName.replace(/\.[^/.]+$/, "") ||
              "Album Cover",

            artist: formData.artist || "",
            album: formData.name || "",
            genre: formData.genre || "",
            language: formData.language || "",
          }
        );

        if (newImage) {
          console.log("📤 Added to Media Library:", newImage);
        }
      } catch (error) {
        console.error(
          "Failed to add album cover to Media Library:",
          error
        );
      }
    }

    return file;
  };

  /* =========================================
     CONVERT EXISTING MEDIA TO FILE
  ========================================= */

  const convertMediaToFile = async (media) => {
    if (!media) {
      throw new Error("Selected album cover not found.");
    }

    if (typeof File !== "undefined" && media instanceof File) {
      return media;
    }

    const imageUrl = getMediaUrl(media);

    if (!imageUrl) {
      throw new Error("Selected image URL not found.");
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Unable to load selected album cover.");
    }

    const blob = await response.blob();

    const fileName = getFileName(media, "album-cover.jpg");

    return new File([blob], fileName, {
      type: blob.type || "image/jpeg",
    });
  };

  /* =========================================
     REMOVE COVER
  ========================================= */

  const handleRemoveCover = () => {
    if (coverImage && coverImage.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(coverImage);
      } catch (error) {
        console.error("Failed to revoke preview:", error);
      }
    }

    setCoverImage("");
    setCoverFile(null);
    setSelectedMedia(null);
    setError("");
  };

  /* =========================================
     GET SONG ID
  ========================================= */

  const getSongId = (song) => {
    return getRecordId(song);
  };

  /* =========================================
     SONG TOGGLE
  ========================================= */

  const handleSongToggle = (songId) => {
    const normalizedId = String(songId);

    if (!normalizedId) return;

    setSelectedSongs((prev) => {
      const normalizedPrev = prev.map((id) => String(id));

      if (normalizedPrev.includes(normalizedId)) {
        return normalizedPrev.filter(
          (id) => id !== normalizedId
        );
      }

      return [...normalizedPrev, normalizedId];
    });

    if (error) {
      setError("");
    }
  };

  /* =========================================
     SEARCH SONGS
  ========================================= */

  const filteredSongs = songs.filter((song) => {
    const text = songSearch.toLowerCase().trim();

    if (!text) return true;

    return (
      song.title?.toLowerCase().includes(text) ||
      song.artist?.toLowerCase().includes(text) ||
      song.album?.toLowerCase().includes(text)
    );
  });

  /* =========================================
     SELECT ALL SONGS
  ========================================= */

  const handleSelectAll = () => {
    const allIds = filteredSongs
      .map((song) => getSongId(song))
      .filter(Boolean)
      .map((id) => String(id));

    setSelectedSongs((prev) => [
      ...new Set([
        ...prev.map((id) => String(id)),
        ...allIds,
      ]),
    ]);
  };

  /* =========================================
     CLEAR ALL SONGS
  ========================================= */

  const handleClearAll = () => {
    setSelectedSongs([]);
  };

  /* =========================================
     REMOVE SONG
  ========================================= */

  const removeSong = (songId) => {
    const normalizedId = String(songId);

    setSelectedSongs((prev) =>
      prev.filter((id) => String(id) !== normalizedId)
    );
  };

  /* =========================================
     ✅ SUBMIT — FIXED
     Songs सिर्फ IDs के रूप में भेजें
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    const albumName = formData.name.trim();
    const artistName = formData.artist.trim();

    if (!albumName) {
      setError("Album name is required.");
      return;
    }

    if (!artistName) {
      setError("Artist name is required.");
      return;
    }

    if (!coverImage) {
      setError("Please select an album cover.");
      return;
    }

    if (!addAlbum || typeof addAlbum !== "function") {
      setError(
        "Album save function is not connected in App.jsx."
      );
      return;
    }

    setSaving(true);

    try {
      let actualCoverFile = coverFile;

      if (!actualCoverFile) {
        if (!selectedMedia) {
          throw new Error("Please select an album cover.");
        }

        actualCoverFile = await convertMediaToFile(
          selectedMedia
        );
      }

      /* ✅ SONGS — सिर्फ IDs */
      const albumSongs = selectedSongs
        .map(String)
        .map((id) => id.trim())
        .filter(Boolean);

      console.log(
        "🎵 Album songs being saved (IDs only):",
        albumSongs
      );

      /* Cover image relative path */
      let coverValue = coverImage || "";

      if (coverValue.startsWith(API_BASE_URL)) {
        coverValue = coverValue.replace(
          API_BASE_URL,
          ""
        );
      }

      const newAlbum = {
        name: albumName,
        artist: artistName,
        genre: formData.genre || "Bollywood",
        language: formData.language || "Hindi",
        country: "India",
        releaseDate: formData.releaseDate || "",
        description: formData.description.trim(),
        status: formData.status || "Active",

        coverFile: actualCoverFile,
        imageFile: actualCoverFile,

        coverImage: coverValue,
        coverUrl: coverValue,
        image: coverValue,

        coverMedia: selectedMedia || null,

        /* ✅ सिर्फ IDs भेजें */
        songs: albumSongs,

        createdDate: new Date()
          .toISOString()
          .split("T")[0],
      };

      console.log(
        "📤 Calling addAlbum with songs:",
        albumSongs.length
      );

      await addAlbum(newAlbum);

      console.log("✅ addAlbum completed successfully");
    } catch (error) {
      console.error("❌ CREATE ALBUM ERROR:", error);

      const msg =
        error?.message ||
        "Album could not be created. Please try again.";

      setError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="add-album-page">
      {/* HEADER */}
      <div className="add-album-header">
        <div>
          <button
            type="button"
            className="add-album-back"
            onClick={() => setActivePage("albums")}
            disabled={saving}
          >
            <ArrowLeft size={18} />
            Back to Albums
          </button>

          <h1>Create New Album</h1>
          <p>Create a new music album</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="add-album-error">{error}</div>
      )}

      {/* FORM */}
      <form
        className="add-album-form"
        onSubmit={handleSubmit}
      >
        {/* ALBUM COVER */}
        <section className="add-album-section">
          <div className="add-album-section-title">
            <h2>Album Cover</h2>
          </div>

          <div className="add-album-cover-area">
            {coverImage ? (
              <div className="add-album-cover-preview">
                <img
                  src={coverImage}
                  alt={formData.name || "Album cover"}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="add-album-remove-cover"
                  disabled={saving}
                >
                  <Trash2 size={17} />
                  Remove
                </button>
              </div>
            ) : (
              <div className="add-album-cover-empty">
                <ImageIcon size={48} />

                <h3>No album cover selected</h3>

                <p>
                  Select an existing image or upload a new one.
                </p>
              </div>
            )}

            <button
              type="button"
              className="add-album-select-image"
              onClick={() => setShowMediaPicker(true)}
              disabled={saving}
            >
              <Plus size={18} />

              {coverImage ? "Change Image" : "Select Image"}
            </button>
          </div>
        </section>

        {/* ALBUM INFORMATION */}
        <section className="add-album-section">
          <div className="add-album-section-title">
            <h2>Album Information</h2>
          </div>

          <div className="add-album-fields">
            <div className="add-album-field">
              <label>Album Name *</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter album name"
                disabled={saving}
              />
            </div>

            <div className="add-album-field">
              <label>Artist *</label>

              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Enter artist name"
                disabled={saving}
              />
            </div>

            <div className="add-album-field">
              <label>Genre</label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select Genre</option>
                <option value="Bollywood">Bollywood</option>
                <option value="Romantic">Romantic</option>
                <option value="Pop">Pop</option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="Rock">Rock</option>
                <option value="Classical">Classical</option>
              </select>
            </div>

            <div className="add-album-field">
              <label>Language</label>

              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select Language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>

            <div className="add-album-field">
              <label>Release Date</label>

              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="add-album-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="add-album-field add-album-full">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter album description"
                rows="4"
                disabled={saving}
              />
            </div>
          </div>
        </section>

        {/* ALBUM SONGS */}
        <section className="add-album-section">
          <div className="add-album-section-title">
            <h2>
              Album Songs
              <span>{selectedSongs.length}</span>
            </h2>
          </div>

          <div className="add-album-song-toolbar">
            <input
              type="text"
              placeholder="Search songs..."
              value={songSearch}
              onChange={(e) =>
                setSongSearch(e.target.value)
              }
              disabled={saving}
            />

            <div>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={
                  saving || filteredSongs.length === 0
                }
              >
                <Check size={16} />
                Select All
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={
                  saving || selectedSongs.length === 0
                }
              >
                Clear All
              </button>
            </div>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="add-album-no-songs">
              No songs found.
            </div>
          ) : (
            <div className="add-album-songs-list">
              {filteredSongs.map((song) => {
                const songId = getSongId(song);

                const checked = selectedSongs.includes(
                  String(songId)
                );

                return (
                  <div
                    key={songId || song.title}
                    className={`add-album-song-item ${
                      checked ? "selected" : ""
                    }`}
                    onClick={() => {
                      if (!saving) {
                        handleSongToggle(songId);
                      }
                    }}
                  >
                    <div className="add-album-song-check">
                      {checked && <Check size={15} />}
                    </div>

                    <div className="add-album-song-info">
                      <strong>
                        {song.title || "Untitled Song"}
                      </strong>

                      <span>
                        {song.artist || "Unknown Artist"}
                        {" • "}
                        {song.album || "Single"}
                      </span>
                    </div>

                    <span>
                      {song.duration || "0:00"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ACTIONS */}
        <div className="add-album-actions">
          <button
            type="button"
            onClick={() => setActivePage("albums")}
            disabled={saving}
          >
            <X size={18} />
            Cancel
          </button>

          <button type="submit" disabled={saving}>
            <Save size={18} />

            {saving ? "Creating..." : "Create Album"}
          </button>
        </div>
      </form>

      {/* MEDIA PICKER */}
      {showMediaPicker && (
        <MediaPicker
          mediaFiles={mediaFiles}
          selectedMedia={selectedMedia}
          onSelect={handleExistingImage}
          onUpload={handleUploadNewImage}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

export default AddAlbum;