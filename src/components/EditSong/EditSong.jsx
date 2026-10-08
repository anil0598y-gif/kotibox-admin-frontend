import { useEffect, useState } from "react";

import {
  Music,
  Upload,
  Calendar,
  Clock,
  Save,
  X,
  Loader2,
  FileText,
} from "lucide-react";

import "./EditSong.css";

import notify from "../../utils/notify";

/* ✅ FIX: Hardcoded URL hata diya, ab env se aayega */
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

/* =========================================
   GET SONG ID
========================================= */

const getSongId = (song) => {
  return song?._id || song?.id || song?.songId || "";
};

/* =========================================
   GET IMAGE URL
========================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  const value = String(image).trim();

  if (!value) return "";

  /* ✅ FIX: Purane localhost URLs ko live server URL me convert karo */
  if (value.includes("localhost:5000")) {
    const relativePath = value.split("localhost:5000")[1];
    return `${SERVER_URL}${relativePath}`;
  }

  if (value.includes("127.0.0.1:5000")) {
    const relativePath = value.split("127.0.0.1:5000")[1];
    return `${SERVER_URL}${relativePath}`;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${SERVER_URL}${value}`;
  }

  return `${SERVER_URL}/${value}`;
};

/* =========================================
   TEXTAREA STYLES
========================================= */

const textareaStyles = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(150, 150, 150, 0.3)",
  background: "#ffffff",
  color: "#111111",
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: "14px",
  lineHeight: "1.7",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
};

function EditSong({ song, setActivePage, updateSong }) {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    language: "",
    releaseDate: "",
    duration: "",
    status: "Active",
    lyrics: "",
    syncedLyrics: "",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [saving, setSaving] = useState(false);

  /* =================================
     SET SONG DATA
  ================================= */

  useEffect(() => {
    if (!song) return;

    setFormData({
      title: song.title || "",
      artist: song.artist || "",
      album: song.album || "",
      genre: song.genre || "",
      language: song.language || "",
      releaseDate: song.releaseDate || "",
      duration: song.duration || "",
      status: song.status || "Active",
      lyrics: song.lyrics || "",
      syncedLyrics: song.syncedLyrics || "",
    });

    setAudioFile(null);
    setCoverImage(null);

    setCoverPreview((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return "";
    });
  }, [song]);

  /* =================================
     HANDLE CHANGE
  ================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =================================
     AUDIO CHANGE
  ================================= */

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      notify.warning("Please select a valid audio file.");
      e.target.value = "";
      return;
    }

    setAudioFile(file);
  };

  /* =================================
     COVER CHANGE
  ================================= */

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.warning("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  /* =================================
     REMOVE NEW COVER
  ================================= */

  const removeNewCover = () => {
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverImage(null);
    setCoverPreview("");
  };

  /* =================================
     SUBMIT
  ================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const songId = getSongId(song);

    if (!songId) {
      notify.error("Song ID not found. Cannot update.");
      return;
    }

    if (!formData.title.trim()) {
      notify.warning("Please enter song title.");
      return;
    }

    if (!formData.artist.trim()) {
      notify.warning("Please enter artist name.");
      return;
    }

    if (!formData.genre) {
      notify.warning("Please select genre.");
      return;
    }

    if (!formData.language) {
      notify.warning("Please select language.");
      return;
    }

    try {
      setSaving(true);

      const cleanedArtist = formData.artist
        .trim()
        .replace(/\s*,\s*/g, ", ");

      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("artist", cleanedArtist);
      data.append("album", formData.album);
      data.append("genre", formData.genre);
      data.append("language", formData.language);
      data.append("releaseDate", formData.releaseDate);
      data.append("duration", formData.duration);
      data.append("status", formData.status);

      data.append("lyrics", formData.lyrics || "");
      data.append("syncedLyrics", formData.syncedLyrics || "");

      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      if (audioFile) {
        data.append("audioFile", audioFile);
      }

      const response = await fetch(`${API_URL}/songs/${songId}`, {
        method: "PUT",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Song update failed");
      }

      const updatedSong = result.data || result.song || result;

      /* ✅ Sirf state update karo — API call already ho chuki hai */
      if (typeof updateSong === "function") {
        updateSong(updatedSong);
      }

      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      notify.success("Updated!", "Song updated successfully.");

      setActivePage("songs");
    } catch (error) {
      console.error("❌ Update error:", error);

      notify.error(
        "Update Failed",
        error.message || "Song update nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================
     CANCEL
  ================================= */

  const handleCancel = () => {
    if (saving) return;

    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setActivePage("songs");
  };

  /* =================================
     NOT FOUND
  ================================= */

  if (!song) {
    return (
      <div className="edit-song-page">
        <div className="edit-song-not-found">
          <Music size={40} />
          <h2>Song Not Found</h2>
          <p>The song you are trying to edit does not exist.</p>
          <button onClick={() => setActivePage("songs")}>
            Back to Song Library
          </button>
        </div>
      </div>
    );
  }

  /* =================================
     CURRENT COVER URL
  ================================= */

  const currentCoverUrl = getImageUrl(
    song.imageUrl || song.coverImage || song.coverImageUrl || ""
  );

  /* =================================
     MAIN UI
  ================================= */

  return (
    <div className="edit-song-page">
      <div className="edit-song-header">
        <div>
          <h1>Edit Song</h1>
          <p>Update the information of your song</p>
        </div>
      </div>

      <form className="edit-song-form" onSubmit={handleSubmit}>
        {/* Song Files */}
        <div className="edit-song-section">
          <div className="edit-section-heading">
            <div className="edit-section-icon">
              <Upload size={19} />
            </div>
            <div>
              <h2>Song Files</h2>
              <p>Update cover image and audio file</p>
            </div>
          </div>

          <div className="edit-upload-grid">
            {/* Cover Image */}
            <div className="edit-form-field">
              <label>Cover Image</label>
              <div className="edit-upload-box">
                <input
                  type="file"
                  id="editCoverImage"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
                <Music size={30} />
                <strong>
                  {coverImage ? coverImage.name : "Change Cover Image"}
                </strong>
                <span>JPG, PNG or WEBP</span>
              </div>

              {coverImage && coverPreview && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={coverPreview}
                    alt="New cover"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #10b981",
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeNewCover}
                    style={{
                      display: "block",
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ✕ Remove new image
                  </button>
                </div>
              )}

              {!coverImage && currentCoverUrl && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={currentCoverUrl}
                    alt="Current cover"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      opacity: 0.7,
                    }}
                  />
                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#6b7280",
                    }}
                  >
                    Current image
                  </small>
                </div>
              )}
            </div>

            {/* Audio File */}
            <div className="edit-form-field">
              <label>Audio File</label>
              <div className="edit-upload-box">
                <input
                  type="file"
                  id="editAudioFile"
                  accept=".mp3,.wav,.ogg,audio/*"
                  onChange={handleAudioChange}
                />
                <Upload size={30} />
                <strong>
                  {audioFile ? audioFile.name : "Change Audio File"}
                </strong>
                <span>MP3, WAV or OGG</span>
              </div>

              {song.audioFileName && !audioFile && (
                <small>Current file: {song.audioFileName}</small>
              )}
            </div>
          </div>
        </div>

        {/* Basic Song Details */}
        <div className="edit-song-section">
          <div className="edit-section-heading">
            <div className="edit-section-icon">
              <Music size={19} />
            </div>
            <div>
              <h2>Basic Song Details</h2>
              <p>Update the basic information about the song</p>
            </div>
          </div>

          <div className="edit-song-grid">
            <div className="edit-form-field">
              <label htmlFor="title">
                Song Title <span>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter song title"
                required
              />
            </div>

            <div className="edit-form-field">
              <label htmlFor="artist">
                Artist / Singer <span>*</span>
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Arijit Singh, Shreya Ghoshal"
                required
              />
              <small>Multiple artists: comma se separate karein.</small>
            </div>

            <div className="edit-form-field">
              <label htmlFor="album">Album</label>
              <input
                type="text"
                id="album"
                name="album"
                value={formData.album}
                onChange={handleChange}
                placeholder="Enter album name"
              />
            </div>

            <div className="edit-form-field">
              <label htmlFor="genre">
                Genre <span>*</span>
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              >
                <option value="">Select genre</option>
                <option value="Bollywood">Bollywood</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Classical">Classical</option>
                <option value="Devotional">Devotional</option>
                <option value="Romantic">Romantic</option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="edit-form-field">
              <label htmlFor="language">
                Language <span>*</span>
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
              >
                <option value="">Select language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="edit-form-field">
              <label htmlFor="releaseDate">Release Date</label>
              <div className="input-with-icon">
                <Calendar size={17} />
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-form-field">
              <label htmlFor="duration">Duration</label>
              <div className="input-with-icon">
                <Clock size={17} />
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="03:45"
                />
              </div>
            </div>

            <div className="edit-form-field">
              <label htmlFor="status">
                Status <span>*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="edit-song-section">
          <div className="edit-section-heading">
            <div className="edit-section-icon">
              <FileText size={19} />
            </div>
            <div>
              <h2>Lyrics</h2>
              <p>
                Song lyrics — user app me lyrics button click karne pe dikhenge
              </p>
            </div>
          </div>

          <div className="edit-form-field" style={{ marginBottom: "20px" }}>
            <label
              htmlFor="lyrics"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              📝 Lyrics (Plain Text)
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              placeholder={`Paste song lyrics here...\n\nExample:\nTera naam...\nTere bina...\nTere sang...`}
              rows="12"
              style={textareaStyles}
            />
            <small
              style={{
                display: "block",
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              💡 Hindi / English songs ke lyrics yahan paste karo.
            </small>
          </div>

          <div className="edit-form-field">
            <label
              htmlFor="syncedLyrics"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              🎵 Synced Lyrics (Optional)
            </label>
            <textarea
              id="syncedLyrics"
              name="syncedLyrics"
              value={formData.syncedLyrics}
              onChange={handleChange}
              placeholder={`[00:12.34] First line\n[00:15.67] Second line`}
              rows="8"
              style={textareaStyles}
            />
            <small
              style={{
                display: "block",
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              💡 Format: [MM:SS.mm] Line text
            </small>
          </div>
        </div>

        {/* Actions */}
        <div className="edit-song-actions">
          <button
            type="button"
            className="edit-cancel-button"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            className="edit-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={17} className="song-loading-icon" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSong;