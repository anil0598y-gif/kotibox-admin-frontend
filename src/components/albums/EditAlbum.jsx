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

import "./EditAlbum.css";

import notify from "../../utils/notify";

const API_BASE_URL = "http://localhost:5000";

function EditAlbum({
  album,
  setActivePage,
  updateAlbum,
  songs = [],
  mediaFiles = [],
  addImageToMediaLibrary,
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

  const [selectedMedia, setSelectedMedia] = useState(null);

  const [selectedSongs, setSelectedSongs] = useState([]);

  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [songSearch, setSongSearch] = useState("");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const [coverRemoved, setCoverRemoved] = useState(false);

  /* =========================================
     IMAGE URL HELPER
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

    return getImageUrl(
      media.url ||
        media.preview ||
        media.src ||
        media.coverUrl ||
        media.imageUrl ||
        media.image ||
        media.fileUrl ||
        ""
    );
  };

  /* =========================================
     ✅ GET SONG ID — IMPROVED
  ========================================= */

  const getSongId = (song) => {
    if (!song) return "";

    if (
      typeof song === "string" ||
      typeof song === "number"
    ) {
      return String(song);
    }

    if (typeof song !== "object") {
      return "";
    }

    /* Handle ObjectId objects */
    if (song.$oid) {
      return String(song.$oid);
    }

    if (song._id && song._id.$oid) {
      return String(song._id.$oid);
    }

    return String(
      song._id ||
        song.id ||
        song.songId ||
        song.song_id ||
        ""
    );
  };

  /* =========================================
     LOAD ALBUM DATA
  ========================================= */

  useEffect(() => {
    if (!album) return;

    setFormData({
      name: album.name || album.title || "",
      artist: album.artist || "",
      genre: album.genre || "",
      language: album.language || "",
      releaseDate: album.releaseDate || "",
      description: album.description || "",
      status: album.status || "Active",
    });

    const existingCover =
      album.coverImage ||
      album.coverUrl ||
      album.image ||
      album.imageUrl ||
      "";

    const fullCoverUrl = getImageUrl(existingCover);

    setCoverImage(fullCoverUrl);
    setCoverFile(null);
    setCoverRemoved(false);

    const existingMedia =
      mediaFiles.find((media) => {
        const mediaUrl = getMediaUrl(media);

        return (
          mediaUrl &&
          fullCoverUrl &&
          mediaUrl === fullCoverUrl
        );
      }) ||
      album.coverMedia ||
      null;

    setSelectedMedia(existingMedia);

    const existingSongIds = Array.isArray(album.songs)
      ? album.songs
          .map((song) => getSongId(song))
          .filter(Boolean)
      : [];

    console.log(
      "📀 Loaded album songs:",
      existingSongIds
    );

    setSelectedSongs(existingSongIds);

    setError("");
  }, [album, mediaFiles]);

  /* =========================================
     HANDLE INPUT
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
     SELECT EXISTING IMAGE
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

    setCoverRemoved(false);
    setCoverFile(null);
    setSelectedMedia(media);
    setCoverImage(imageUrl);
    setShowMediaPicker(false);
    setError("");
  };

  /* =========================================
     UPLOAD NEW IMAGE
  ========================================= */

  const handleUploadNewImage = async (fileOrMedia) => {
    if (!fileOrMedia) return null;

    if (
      typeof fileOrMedia === "object" &&
      !fileOrMedia.name &&
      (fileOrMedia.url ||
        fileOrMedia.preview ||
        fileOrMedia.src ||
        fileOrMedia.imageUrl)
    ) {
      const imageUrl = getMediaUrl(fileOrMedia);

      if (!imageUrl) {
        notify.warning(
          "This image does not have a valid preview."
        );
        return null;
      }

      setCoverRemoved(false);
      setCoverFile(null);
      setSelectedMedia(fileOrMedia);
      setCoverImage(imageUrl);
      setShowMediaPicker(false);
      setError("");

      return fileOrMedia;
    }

    const file =
      fileOrMedia.fileObject || fileOrMedia;

    if (
      !file ||
      !file.type ||
      !file.type.startsWith("image/")
    ) {
      notify.warning(
        "Please select a valid image file."
      );

      return null;
    }

    setCoverFile(file);
    setCoverRemoved(false);
    setSelectedMedia(null);

    const imageUrl = URL.createObjectURL(file);

    setCoverImage(imageUrl);
    setShowMediaPicker(false);
    setError("");

    if (addImageToMediaLibrary) {
      try {
        const newImage = await addImageToMediaLibrary(
          file,
          "Album Cover"
        );

        if (newImage) {
          setSelectedMedia(newImage);
        }
      } catch (error) {
        console.error(
          "Failed to add album cover to media library:",
          error
        );
      }
    }

    return file;
  };

  /* =========================================
     REMOVE COVER
  ========================================= */

  const handleRemoveCover = () => {
    if (coverImage && coverImage.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(coverImage);
      } catch (error) {
        console.error(
          "Failed to revoke image URL:",
          error
        );
      }
    }

    setCoverRemoved(true);
    setCoverImage("");
    setCoverFile(null);
    setSelectedMedia(null);
    setError("");
  };

  /* =========================================
     SONG TOGGLE
  ========================================= */

  const handleSongToggle = (songId) => {
    const normalizedId = String(songId);

    setSelectedSongs((prev) => {
      const normalizedPrev = prev.map(String);

      if (normalizedPrev.includes(normalizedId)) {
        return normalizedPrev.filter(
          (id) => id !== normalizedId
        );
      }

      return [...normalizedPrev, normalizedId];
    });
  };

  /* =========================================
     FILTER SONGS
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
    setSelectedSongs((prev) => {
      const existingIds = prev.map(String);

      const allIds = filteredSongs
        .map(getSongId)
        .filter(Boolean);

      return [
        ...new Set([...existingIds, ...allIds]),
      ];
    });
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
      prev
        .map(String)
        .filter((id) => id !== normalizedId)
    );
  };

  /* =========================================
     ✅ SUBMIT — FIXED
     Songs को clean format में भेजें
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!album) {
      setError("Album not found.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Album name is required.");
      return;
    }

    if (!formData.artist.trim()) {
      setError("Artist name is required.");
      return;
    }

    if (!coverImage && !coverRemoved) {
      setError("Please select an album cover.");
      return;
    }

    if (!Array.isArray(songs)) {
      setError("Song library could not be loaded.");
      return;
    }

    setSaving(true);

    try {
      /* ✅ Songs को clean IDs array में convert करें */
      const albumSongs = selectedSongs
        .map(String)
        .map((id) => id.trim())
        .filter(Boolean);

      console.log(
        "🎵 Album songs being saved:",
        albumSongs
      );

      /* ✅ Cover image — full URL नहीं, relative path भेजें */
      let coverValue = coverImage || "";

      /* अगर full URL है तो relative path बनाएँ */
      if (
        coverValue.startsWith(API_BASE_URL)
      ) {
        coverValue = coverValue.replace(
          API_BASE_URL,
          ""
        );
      }

      const updatedAlbum = {
        ...album,

        ...formData,

        id: album.id || album._id,
        _id: album._id || album.id,

        name: formData.name.trim(),
        artist: formData.artist.trim(),

        coverImage: coverValue,
        coverUrl: coverValue,
        image: coverValue,

        coverMedia: selectedMedia || null,
        coverFile: coverFile || null,

        coverRemoved,

        /* ✅ Songs — सिर्फ IDs */
        songs: albumSongs,

        updatedDate: new Date()
          .toISOString()
          .split("T")[0],
      };

      console.log(
        "💾 Updating album with songs:",
        albumSongs
      );

      const result = await updateAlbum(updatedAlbum);

      /* ✅ Success — अगर result null नहीं है */
      if (result !== null) {
        notify.success(
          "Album updated successfully!"
        );
      }
    } catch (error) {
      console.error(
        "Failed to update album:",
        error
      );

      const msg =
        error?.message ||
        "Album could not be updated. Please try again.";

      setError(msg);

      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     ALBUM NOT FOUND
  ========================================= */

  if (!album) {
    return (
      <div className="edit-album-not-found">
        <h2>Album not found</h2>

        <button
          type="button"
          onClick={() => setActivePage("albums")}
        >
          <ArrowLeft size={18} />
          Back to Albums
        </button>
      </div>
    );
  }

  return (
    <div className="edit-album-page">
      {/* HEADER */}
      <div className="edit-album-header">
        <div>
          <button
            type="button"
            className="edit-album-back"
            onClick={() => setActivePage("albums")}
          >
            <ArrowLeft size={18} />
            Back to Albums
          </button>

          <h1>Edit Album</h1>

          <p>
            Update album information, cover and
            songs.
          </p>
        </div>

        <button
          type="button"
          className="edit-album-cancel-top"
          onClick={() => setActivePage("albums")}
        >
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="edit-album-error">{error}</div>
      )}

      <form
        className="edit-album-form"
        onSubmit={handleSubmit}
      >
        {/* COVER IMAGE */}
        <section className="edit-album-section">
          <div className="edit-album-section-title">
            <h2>Album Cover</h2>
          </div>

          <div className="edit-album-cover-area">
            {coverImage ? (
              <div className="edit-album-cover-preview">
                <img
                  src={coverImage}
                  alt={formData.name || "Album cover"}
                  onError={(e) => {
                    console.error(
                      "Album image failed:",
                      coverImage
                    );
                  }}
                />

                <button
                  type="button"
                  className="edit-album-remove-cover"
                  onClick={handleRemoveCover}
                >
                  <Trash2 size={17} />
                  Remove
                </button>
              </div>
            ) : (
              <div className="edit-album-cover-empty">
                <ImageIcon size={48} />

                <h3>No album cover</h3>

                <p>
                  Select an existing image or upload
                  a new one.
                </p>
              </div>
            )}

            <button
              type="button"
              className="edit-album-select-image"
              onClick={() => setShowMediaPicker(true)}
            >
              <Plus size={18} />

              {coverImage ? "Change Image" : "Select Image"}
            </button>
          </div>
        </section>

        {/* ALBUM INFORMATION */}
        <section className="edit-album-section">
          <div className="edit-album-section-title">
            <h2>Album Information</h2>
          </div>

          <div className="edit-album-fields">
            <div className="edit-album-field">
              <label>Album Name *</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter album name"
              />
            </div>

            <div className="edit-album-field">
              <label>Artist *</label>

              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Enter artist name"
              />
            </div>

            <div className="edit-album-field">
              <label>Genre</label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="edit-album-normal-select"
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

            <div className="edit-album-field">
              <label>Language</label>

              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="edit-album-normal-select"
              >
                <option value="">Select Language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>

            <div className="edit-album-field">
              <label>Release Date</label>

              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="edit-album-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="edit-album-normal-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="edit-album-field edit-album-full">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter album description"
                rows="4"
              />
            </div>
          </div>
        </section>

        {/* ALBUM SONGS */}
        <section className="edit-album-section">
          <div className="edit-album-section-title">
            <h2>
              Album Songs
              <span>{selectedSongs.length}</span>
            </h2>
          </div>

          <div className="edit-album-song-toolbar">
            <input
              type="text"
              placeholder="Search songs..."
              value={songSearch}
              onChange={(e) =>
                setSongSearch(e.target.value)
              }
            />

            <div className="edit-album-song-toolbar-actions">
              <button
                type="button"
                onClick={handleSelectAll}
              >
                <Check size={16} />
                Select All
              </button>

              <button
                type="button"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="edit-album-no-songs">
              No songs found.
            </div>
          ) : (
            <div className="edit-album-songs-list">
              {filteredSongs.map((song) => {
                const songId = getSongId(song);

                const checked = selectedSongs.some(
                  (id) =>
                    String(id) === String(songId)
                );

                return (
                  <div
                    key={songId}
                    className={`edit-album-song-item ${
                      checked ? "selected" : ""
                    }`}
                    onClick={() =>
                      handleSongToggle(songId)
                    }
                  >
                    <div className="edit-album-song-check">
                      {checked && <Check size={15} />}
                    </div>

                    <div className="edit-album-song-info">
                      <strong>
                        {song.title || "Untitled Song"}
                      </strong>

                      <span>
                        {song.artist ||
                          "Unknown Artist"}
                        {" • "}
                        {song.album || "No Album"}
                      </span>
                    </div>

                    <span className="edit-album-song-duration">
                      {song.duration || "0:00"}
                    </span>

                    {checked && (
                      <button
                        type="button"
                        className="edit-album-song-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSong(songId);
                        }}
                        title="Remove from album"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ACTIONS */}
        <div className="edit-album-form-actions">
          <button
            type="button"
            className="edit-album-btn-secondary"
            onClick={() => setActivePage("albums")}
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="submit"
            className="edit-album-btn-primary"
            disabled={saving}
          >
            <Save size={18} />

            {saving ? "Updating..." : "Update Album"}
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

export default EditAlbum;