import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Music2,
} from "lucide-react";

import "./AddPlaylist.css";

import notify from "../../utils/notify";

function AddPlaylist({
  setActivePage,
  addPlaylist,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genre: "Bollywood",
    status: "Active",
    coverImage: "",
    createdBy: "Admin",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const playlistName = formData.name.trim();

    if (!playlistName) {
      notify.warning("Please enter playlist name.");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    /* ✅ सभी image fields भेजें */
    const coverUrl = formData.coverImage.trim();

    const newPlaylist = {
      id: `playlist-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      name: playlistName,
      description: formData.description.trim(),
      genre: formData.genre,
      status: formData.status,
      createdBy: formData.createdBy,

      /* ✅ सभी possible field names */
      coverImage: coverUrl,
      coverUrl: coverUrl,
      imageUrl: coverUrl,
      image: coverUrl,

      coverBlobId: "",

      duration: "0 min",
      songs: [],
    };

    console.log("📤 Sending new playlist:");
    console.log("   coverImage:", coverUrl);
    console.log("   coverUrl:", coverUrl);
    console.log("   imageUrl:", coverUrl);

    try {
      if (addPlaylist) {
        await addPlaylist(newPlaylist);
      }

      setActivePage("playlists");
    } catch (error) {
      notify.error(
        error?.message ||
          "Playlist create nahi ho payi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;

    setActivePage("playlists");
  };

  return (
    <div className="add-playlist-page">
      {/* Header */}
      <div className="add-playlist-header">
        <div>
          <button
            type="button"
            className="add-playlist-back-btn"
            onClick={handleCancel}
          >
            <ArrowLeft size={18} />
            Back to Playlists
          </button>

          <h1>Create Playlist</h1>

          <p>Create a new music playlist</p>
        </div>
      </div>

      {/* Form */}
      <form
        className="add-playlist-form"
        onSubmit={handleSubmit}
      >
        <div className="playlist-form-card">
          {/* Form Title */}
          <div className="playlist-form-title">
            <Music2 size={21} />

            <div>
              <h2>Playlist Information</h2>

              <p>
                Enter the basic details of your
                playlist
              </p>
            </div>
          </div>

          <div className="form-grid">
            {/* Playlist Name */}
            <div className="form-group full-width">
              <label>Playlist Name *</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bollywood Hits"
                maxLength={100}
                autoComplete="off"
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter playlist description..."
                rows="4"
                maxLength={500}
              />
            </div>

            {/* Genre */}
            <div className="form-group">
              <label>Genre</label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
              >
                <option value="Bollywood">
                  Bollywood
                </option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">
                  Hip Hop
                </option>
                <option value="Classical">
                  Classical
                </option>
                <option value="Devotional">
                  Devotional
                </option>
                <option value="Romantic">
                  Romantic
                </option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* Cover Image */}
            <div className="form-group full-width">
              <label>Cover Image URL</label>

              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/playlist.jpg"
              />
            </div>

            {/* Cover Preview */}
            {formData.coverImage && (
              <div className="form-group full-width">
                <label>Cover Preview</label>

                <div className="playlist-cover-preview">
                  <img
                    src={formData.coverImage}
                    alt="Playlist cover preview"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="add-playlist-actions">
          <button
            type="button"
            className="cancel-playlist-btn"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-playlist-btn"
            disabled={isSaving}
          >
            <Save size={18} />

            {isSaving
              ? "Creating..."
              : "Create Playlist"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlaylist;