import React, { useEffect, useRef, useState } from "react";

import {
  User,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Music2,
  Loader2,
} from "lucide-react";

import {
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

import "./EditArtist.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

const API_BASE_URL = "http://localhost:5000";

/* =========================================
   GET RECORD ID
========================================= */

const getRecordId = (item) => {
  if (!item) {
    return "";
  }

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

/* =========================================
   GET ARTIST IMAGE
========================================= */

const getArtistImage = (artist) => {
  if (!artist) {
    return "";
  }

  const image =
    artist.imageUrl ||
    artist.image ||
    artist.imageURL ||
    artist.photoUrl ||
    artist.photo ||
    "";

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${API_BASE_URL}${
    image.startsWith("/") ? "" : "/"
  }${image}`;
};

/* =========================================
   EDIT ARTIST
========================================= */

function EditArtist({
  artist,
  setActivePage,
  updateArtist,
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Singer",
    genre: "Bollywood",
    language: "Hindi",
    country: "India",
    bio: "",
    instagram: "",
    youtube: "",
    spotify: "",
    followers: 0,
    status: "Active",
  });

  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =========================================
     LOAD ARTIST DATA
  ========================================= */

  useEffect(() => {
    if (!artist) {
      return;
    }

    setFormData({
      name: artist.name || "",
      type: artist.type || "Singer",
      genre: artist.genre || "Bollywood",
      language: artist.language || "Hindi",
      country: artist.country || "India",
      bio: artist.bio || "",
      instagram: artist.instagram || "",
      youtube: artist.youtube || "",
      spotify: artist.spotify || "",
      followers: artist.followers ?? 0,
      status: artist.status || "Active",
    });

    const serverImage = getArtistImage(artist);

    setExistingImage(serverImage);
    setImagePreview(serverImage);
    setImageFile(null);
    setImageRemoved(false);
  }, [artist]);

  /* =========================================
     CLEANUP BLOB IMAGE
  ========================================= */

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     IMAGE SELECT
  ========================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* ✅ alert → notify.warning */
    if (!file.type.startsWith("image/")) {
      notify.warning(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
    setImageRemoved(false);

    event.target.value = "";
  };

  /* =========================================
     REMOVE IMAGE
  ========================================= */

  const handleRemoveImage = () => {
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
    setImageRemoved(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================
     OPEN FILE PICKER
  ========================================= */

  const openFilePicker = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  /* =========================================
     CANCEL
  ========================================= */

  const handleCancel = () => {
    if (saving) {
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    if (setActivePage) {
      setActivePage("artists");
    }
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const artistId = getRecordId(artist);

    /* ✅ alert → notify.warning */
    if (!artistId) {
      notify.warning("Artist ID nahi mila.");
      return;
    }

    /* ✅ alert → notify.warning */
    if (!formData.name.trim()) {
      notify.warning("Artist name is required.");
      return;
    }

    try {
      setSaving(true);

      const updatedArtist = {
        _id: artistId,

        name: formData.name.trim(),

        type: formData.type,

        genre: formData.genre,

        language: formData.language,

        country: formData.country,

        bio: formData.bio.trim(),

        instagram: formData.instagram.trim(),

        youtube: formData.youtube.trim(),

        spotify: formData.spotify.trim(),

        followers: Number(formData.followers) || 0,

        status: formData.status,

        imageFile: imageFile || null,

        imageRemoved: imageRemoved,
      };

      if (!updateArtist) {
        throw new Error(
          "Update Artist function is not available."
        );
      }

      await updateArtist(updatedArtist);
    } catch (error) {
      console.error("EDIT ARTIST ERROR:", error);

      /* ✅ alert → notify.error */
      notify.error(
        error?.message ||
          "Artist update nahi ho paya."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     NO ARTIST SELECTED
  ========================================= */

  if (!artist) {
    return (
      <div className="edit-artist-page">
        <div className="edit-artist-empty">
          <User size={42} />

          <h2>No Artist Selected</h2>

          <p>Please select an artist to edit.</p>

          <button
            type="button"
            onClick={() => setActivePage("artists")}
          >
            Back to Artists
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN JSX
  ========================================= */

  return (
    <div className="edit-artist-page">
      {/* HEADER */}
      <div className="edit-artist-header">
        <div>
          <h1>Edit Artist</h1>

          <p>
            Update artist information and profile
            image.
          </p>
        </div>

        <button
          type="button"
          className="edit-artist-close-btn"
          onClick={handleCancel}
          disabled={saving}
        >
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* FORM */}
      <form
        className="edit-artist-form"
        onSubmit={handleSubmit}
      >
        {/* PROFILE IMAGE */}
        <div className="edit-artist-card">
          <div className="edit-artist-card-header">
            <div>
              <h2>Artist Image</h2>

              <p>
                Upload a new image or remove the
                current image.
              </p>
            </div>
          </div>

          <div className="edit-artist-image-section">
            <div className="edit-artist-image-preview">
              {imagePreview && !imageRemoved ? (
                <img
                  src={imagePreview}
                  alt={formData.name || "Artist"}
                />
              ) : (
                <div className="edit-artist-image-placeholder">
                  <ImageIcon size={42} />
                  <span>No Image</span>
                </div>
              )}
            </div>

            <div className="edit-artist-image-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                disabled={saving}
              />

              <button
                type="button"
                className="edit-artist-upload-btn"
                onClick={openFilePicker}
                disabled={saving}
              >
                <Upload size={18} />

                {imagePreview && !imageRemoved
                  ? "Change Image"
                  : "Upload Image"}
              </button>

              {(imagePreview || existingImage) &&
                !imageRemoved && (
                  <button
                    type="button"
                    className="edit-artist-remove-btn"
                    onClick={handleRemoveImage}
                    disabled={saving}
                  >
                    <X size={18} />
                    Remove Image
                  </button>
                )}

              {imageRemoved && (
                <p className="edit-artist-remove-note">
                  Image will be removed after
                  saving.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="edit-artist-card">
          <div className="edit-artist-card-header">
            <div>
              <h2>Basic Information</h2>

              <p>
                Enter the artist's basic details.
              </p>
            </div>
          </div>

          <div className="edit-artist-grid">
            {/* ARTIST NAME */}
            <div className="edit-artist-field">
              <label>
                Artist Name
                <span>*</span>
              </label>

              <div className="edit-artist-input-icon">
                <User size={18} />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter artist name"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            {/* ARTIST TYPE */}
            <div className="edit-artist-field">
              <label>Artist Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Singer">Singer</option>
                <option value="Band">Band</option>
                <option value="DJ">DJ</option>
                <option value="Producer">Producer</option>
                <option value="Composer">Composer</option>
                <option value="Music Director">
                  Music Director
                </option>
                <option value="Rapper">Rapper</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* GENRE */}
            <div className="edit-artist-field">
              <label>Genre</label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Bollywood">Bollywood</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Classical">Classical</option>
                <option value="Indie">Indie</option>
                <option value="Devotional">Devotional</option>
                <option value="Electronic">
                  Electronic
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="edit-artist-field">
              <label>Language</label>

              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Hindi">Hindi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* COUNTRY */}
            <div className="edit-artist-field">
              <label>Country</label>

              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                disabled={saving}
              />
            </div>

            {/* FOLLOWERS */}
            <div className="edit-artist-field">
              <label>Followers</label>

              <input
                type="number"
                name="followers"
                value={formData.followers}
                onChange={handleChange}
                min="0"
                placeholder="0"
                disabled={saving}
              />
            </div>

            {/* STATUS */}
            <div className="edit-artist-field">
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
          </div>

          {/* BIO */}
          <div className="edit-artist-field edit-artist-full-field">
            <label>Bio</label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write artist biography..."
              rows="5"
              disabled={saving}
            />
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="edit-artist-card">
          <div className="edit-artist-card-header">
            <div>
              <h2>Social &amp; Streaming Links</h2>

              <p>
                Add artist social media and music
                platform links.
              </p>
            </div>
          </div>

          <div className="edit-artist-social-grid">
            {/* INSTAGRAM */}
            <div className="edit-artist-field">
              <label>
                <FaInstagram size={16} />
                Instagram
              </label>

              <div className="edit-artist-input-icon">
                <FaInstagram size={18} />

                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/artist"
                  disabled={saving}
                />
              </div>
            </div>

            {/* YOUTUBE */}
            <div className="edit-artist-field">
              <label>
                <FaYoutube size={16} />
                YouTube
              </label>

              <div className="edit-artist-input-icon">
                <FaYoutube size={18} />

                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@artist"
                  disabled={saving}
                />
              </div>
            </div>

            {/* SPOTIFY */}
            <div className="edit-artist-field">
              <label>
                <Music2 size={16} />
                Spotify
              </label>

              <div className="edit-artist-input-icon">
                <Music2 size={18} />

                <input
                  type="url"
                  name="spotify"
                  value={formData.spotify}
                  onChange={handleChange}
                  placeholder="https://open.spotify.com/artist/..."
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="edit-artist-actions">
          <button
            type="button"
            className="edit-artist-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="submit"
            className="edit-artist-save-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="edit-artist-spinner"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditArtist;