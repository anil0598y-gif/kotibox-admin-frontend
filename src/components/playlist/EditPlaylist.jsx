import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Music2,
} from "lucide-react";

import "./EditPlaylist.css";

import notify from "../../utils/notify";

function EditPlaylist({
  playlist,
  setActivePage,
  updatePlaylist,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genre: "Bollywood",
    status: "Active",
    coverImage: "",
    createdBy: "Admin",
  });

  useEffect(() => {
    if (!playlist) return;

    setFormData({
      name: playlist.name || "",
      description: playlist.description || "",
      genre: playlist.genre || "Bollywood",
      status: playlist.status || "Active",

      coverImage:
        playlist.coverUrl ||
        playlist.coverImage ||
        playlist.imageUrl ||
        playlist.image ||
        "",

      createdBy: playlist.createdBy || "Admin",
    });
  }, [playlist]);

  if (!playlist) {
    return (
      <div className="edit-playlist-page">
        <button
          className="edit-playlist-back-btn"
          onClick={() =>
            setActivePage("playlists")
          }
        >
          <ArrowLeft size={18} />
          Back to Playlists
        </button>

        <div className="edit-playlist-not-found">
          <Music2 size={45} />

          <h2>Playlist Not Found</h2>

          <p>
            The playlist you are trying to edit
            does not exist.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.warning("Please enter playlist name.");
      return;
    }

    /* ✅ सभी image fields भेजें */
    const coverUrl = formData.coverImage.trim();

    const updatedPlaylist = {
      ...playlist,

      name: formData.name.trim(),
      description: formData.description.trim(),
      genre: formData.genre,
      status: formData.status,
      createdBy: formData.createdBy,

      /* ✅ सभी possible field names (backend + App.jsx के लिए) */
      coverImage: coverUrl,
      coverUrl: coverUrl,
      imageUrl: coverUrl,
      image: coverUrl,

      songs: Array.isArray(playlist.songs)
        ? playlist.songs
        : [],

      duration: playlist.duration || "0 min",
    };

    console.log("📤 Sending playlist update:");
    console.log("   coverImage:", coverUrl);
    console.log("   coverUrl:", coverUrl);
    console.log("   imageUrl:", coverUrl);

    try {
      await updatePlaylist(updatedPlaylist);
    } catch (error) {
      notify.error(
        error?.message ||
          "Playlist update nahi ho payi."
      );
    }
  };

  return (
    <div className="edit-playlist-page">
      <div className="edit-playlist-header">
        <div>
          <button
            className="edit-playlist-back-btn"
            onClick={() =>
              setActivePage("playlists")
            }
          >
            <ArrowLeft size={18} />
            Back to Playlists
          </button>

          <h1>Edit Playlist</h1>

          <p>Update your playlist information</p>
        </div>
      </div>

      <form
        className="edit-playlist-form"
        onSubmit={handleSubmit}
      >
        <div className="edit-playlist-card">
          <div className="edit-playlist-title">
            <Music2 size={21} />

            <div>
              <h2>Playlist Information</h2>

              <p>
                Update the details of your
                playlist
              </p>
            </div>
          </div>

          <div className="edit-playlist-grid">
            {/* Playlist Name */}
            <div className="edit-form-group full-width">
              <label>Playlist Name *</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter playlist name"
              />
            </div>

            {/* Description */}
            <div className="edit-form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter playlist description..."
                rows="4"
              />
            </div>

            {/* Genre */}
            <div className="edit-form-group">
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
            <div className="edit-form-group">
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
            <div className="edit-form-group full-width">
              <label>Cover Image URL</label>

              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/playlist.jpg"
              />

              {formData.coverImage && (
                <div className="cover-preview">
                  <img
                    src={formData.coverImage}
                    alt="Playlist Cover Preview"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div>
                    <strong>Cover Preview</strong>

                    <span>
                      Your playlist cover image
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="edit-playlist-actions">
          <button
            type="button"
            className="edit-cancel-btn"
            onClick={() =>
              setActivePage("playlists")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-save-btn"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPlaylist;