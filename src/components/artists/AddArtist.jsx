import React, { useEffect, useRef, useState } from "react";

import {
  User,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Music2,
} from "lucide-react";

import {
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

import "./AddArtist.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

function AddArtist({
  setActivePage,
  addArtist,
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
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================================
     CLEANUP IMAGE PREVIEW
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

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));

    setImagePreview(previewUrl);
  };

  /* =========================================
     REMOVE SELECTED IMAGE
  ========================================= */

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
    }));

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
     SUBMIT
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const artistName = formData.name.trim();

    /* ✅ alert → notify.warning */
    if (!artistName) {
      notify.warning("Please enter artist name.");
      return;
    }

    try {
      setSaving(true);

      const newArtist = {
        name: artistName,

        type: formData.type,

        genre: formData.genre,

        language: formData.language,

        country: formData.country,

        bio: formData.bio.trim(),

        instagram: formData.instagram.trim(),

        youtube: formData.youtube.trim(),

        spotify: formData.spotify.trim(),

        followers:
          Number(formData.followers) || 0,

        status: formData.status,

        imageFile:
          formData.imageFile || null,
      };

      if (!addArtist) {
        throw new Error(
          "Add Artist function is not available."
        );
      }

      await addArtist(newArtist);
    } catch (error) {
      console.error(
        "ADD ARTIST ERROR:",
        error
      );

      /* ✅ alert → notify.error */
      notify.error(
        error?.message ||
          "Artist create nahi ho paya."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     CANCEL
  ========================================= */

  const handleCancel = () => {
    if (saving) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    if (setActivePage) {
      setActivePage("artists");
    }
  };

  /* =========================================
     JSX
  ========================================= */

  return (
    <div className="add-artist-page">
      {/* HEADER */}
      <div className="add-artist-header">
        <div className="add-artist-header-left">
          <button
            type="button"
            className="add-artist-back-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={19} />
          </button>

          <div>
            <h1>Add Artist</h1>

            <p>
              Add a new artist to your music
              library
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form
        className="add-artist-form"
        onSubmit={handleSubmit}
      >
        {/* BASIC INFORMATION */}
        <div className="add-artist-card">
          <div className="add-artist-card-header">
            <div className="add-artist-card-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Basic Information</h2>

              <p>
                Enter the artist's basic
                information
              </p>
            </div>
          </div>

          <div className="add-artist-form-grid">
            {/* NAME */}
            <div className="add-artist-field full">
              <label>
                Artist Name
                <span>*</span>
              </label>

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

            {/* TYPE */}
            <div className="add-artist-field">
              <label>Artist Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Singer">Singer</option>
                <option value="Rapper">Rapper</option>
                <option value="Composer">Composer</option>
                <option value="Music Director">
                  Music Director
                </option>
                <option value="Band">Band</option>
                <option value="DJ">DJ</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* GENRE */}
            <div className="add-artist-field">
              <label>Genre</label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="Bollywood">
                  Bollywood
                </option>
                <option value="Punjabi">Punjabi</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Classical">
                  Classical
                </option>
                <option value="Indie">Indie</option>
                <option value="Electronic">
                  Electronic
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="add-artist-field">
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
            <div className="add-artist-field">
              <label>Country</label>

              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
                disabled={saving}
              />
            </div>

            {/* FOLLOWERS */}
            <div className="add-artist-field">
              <label>Followers</label>

              <input
                type="number"
                name="followers"
                min="0"
                value={formData.followers}
                onChange={handleChange}
                placeholder="0"
                disabled={saving}
              />
            </div>

            {/* STATUS */}
            <div className="add-artist-field">
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
        </div>

        {/* ARTIST IMAGE */}
        <div className="add-artist-card">
          <div className="add-artist-card-header">
            <div className="add-artist-card-icon">
              <ImageIcon size={20} />
            </div>

            <div>
              <h2>Artist Image</h2>

              <p>
                Upload the artist profile image
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="add-artist-hidden-file"
            disabled={saving}
          />

          {!imagePreview ? (
            <button
              type="button"
              className="add-artist-upload-box"
              onClick={openFilePicker}
              disabled={saving}
            >
              <div className="add-artist-upload-icon">
                <Upload size={25} />
              </div>

              <strong>Upload Artist Image</strong>

              <span>PNG, JPG, JPEG or WEBP</span>
            </button>
          ) : (
            <div className="add-artist-image-preview">
              <img
                src={imagePreview}
                alt={
                  formData.name || "Artist preview"
                }
              />

              <div className="add-artist-image-actions">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={saving}
                >
                  <Upload size={16} />
                  Change Image
                </button>

                <button
                  type="button"
                  className="remove"
                  onClick={handleRemoveImage}
                  disabled={saving}
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BIOGRAPHY */}
        <div className="add-artist-card">
          <div className="add-artist-card-header">
            <div className="add-artist-card-icon">
              <Music2 size={20} />
            </div>

            <div>
              <h2>Biography</h2>

              <p>
                Add information about the artist
              </p>
            </div>
          </div>

          <div className="add-artist-field">
            <label>Bio</label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write artist biography..."
              rows="6"
              disabled={saving}
            />
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="add-artist-card">
          <div className="add-artist-card-header">
            <div className="add-artist-card-icon">
              <FaInstagram size={20} />
            </div>

            <div>
              <h2>Social Links</h2>

              <p>
                Add artist social media profiles
              </p>
            </div>
          </div>

          <div className="add-artist-form-grid">
            {/* INSTAGRAM */}
            <div className="add-artist-field">
              <label>
                <FaInstagram size={15} />
                Instagram
              </label>

              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/artist"
                disabled={saving}
              />
            </div>

            {/* YOUTUBE */}
            <div className="add-artist-field">
              <label>
                <FaYoutube size={15} />
                YouTube
              </label>

              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@artist"
                disabled={saving}
              />
            </div>

            {/* SPOTIFY */}
            <div className="add-artist-field">
              <label>
                <Music2 size={15} />
                Spotify
              </label>

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

        {/* FORM ACTIONS */}
        <div className="add-artist-actions">
          <button
            type="button"
            className="add-artist-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="submit"
            className="add-artist-save-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="add-artist-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Artist
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddArtist;