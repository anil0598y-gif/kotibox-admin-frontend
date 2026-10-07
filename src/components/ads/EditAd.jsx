import { useEffect, useState } from "react";
import {
  Save,
  X,
} from "lucide-react";

import notify from "../../utils/notify";

import "./EditAd.css";

function EditAd({
  ad,
  setActivePage,
  updateAd,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "video",
    title: "",
    description: "",
    advertiser: "",
    targetUrl: "",
    duration: 30,
    skipAfter: 5,
    startDate: "",
    endDate: "",
    priority: 1,
    status: "active",
  });

  const [mediaFile, setMediaFile] =
    useState(null);

  const [thumbnailFile, setThumbnailFile] =
    useState(null);

  useEffect(() => {
    if (!ad) return;

    setFormData({
      name: ad.name || "",
      type: ad.type || "video",
      title: ad.title || "",
      description:
        ad.description || "",
      advertiser:
        ad.advertiser || "",
      targetUrl:
        ad.targetUrl || "",
      duration:
        Number(ad.duration || 30),
      skipAfter:
        Number(ad.skipAfter || 5),
      startDate:
        ad.startDate || "",
      endDate:
        ad.endDate || "",
      priority:
        Number(ad.priority || 1),
      status:
        ad.status || "active",
    });

    setMediaFile(null);
    setThumbnailFile(null);
  }, [ad]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ad) {
      notify.warning("No advertisement selected to update.");
      return;
    }

    if (!formData.name.trim()) {
      notify.warning("Please enter Ad Name.");
      return;
    }

    if (
      Number(formData.skipAfter) >
      Number(formData.duration)
    ) {
      notify.warning(
        "Skip After cannot be greater than Duration."
      );
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      notify.warning("End Date cannot be before Start Date.");
      return;
    }

    if (formData.targetUrl.trim()) {
      try {
        new URL(formData.targetUrl.trim());
      } catch {
        notify.warning("Please enter a valid Target URL.");
        return;
      }
    }

    const updatedAd = {
      ...ad,

      ...formData,

      duration:
        Number(formData.duration),

      skipAfter:
        Number(formData.skipAfter),

      priority:
        Number(formData.priority),

      ...(mediaFile
        ? { mediaFile }
        : {}),

      ...(thumbnailFile
        ? { thumbnailFile }
        : {}),

      updatedAt:
        new Date().toISOString(),
    };

    if (typeof updateAd === "function") {
      updateAd(updatedAd);
    }

    setActivePage("ads");
  };

  if (!ad) {
    return null;
  }

  return (
    <div className="ads-page">

      <div className="ads-header">

        <div>
          <h1>
            Edit Advertisement
          </h1>

          <p>
            Update advertisement details
          </p>
        </div>

        <button
          className="ad-secondary-btn"
          onClick={() =>
            setActivePage("ads")
          }
        >
          <X size={18} />
          Cancel
        </button>

      </div>

      <form
        className="ad-form"
        onSubmit={handleSubmit}
      >

        <div className="ad-form-grid">

          <div className="ad-field">
            <label>Ad Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>Ad Type</label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="video">
                Video
              </option>

              <option value="image">
                Image
              </option>

              <option value="audio">
                Audio
              </option>
            </select>
          </div>

          <div className="ad-field">
            <label>Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>Advertiser / Brand</label>

            <input
              type="text"
              name="advertiser"
              value={formData.advertiser}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field ad-full">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="ad-field ad-full">
            <label>Replace Ad File</label>

            <input
              type="file"
              accept={
                formData.type === "video"
                  ? "video/*"
                  : formData.type === "image"
                  ? "image/*"
                  : "audio/*"
              }
              onChange={(e) =>
                setMediaFile(
                  e.target.files?.[0] ||
                  null
                )
              }
            />

            {!mediaFile && (
              <small>
                Current advertisement
                file will remain unchanged.
              </small>
            )}
          </div>

          <div className="ad-field ad-full">
            <label>
              Replace Thumbnail
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setThumbnailFile(
                  e.target.files?.[0] ||
                  null
                )
              }
            />

            {!thumbnailFile && (
              <small>
                Current thumbnail will
                remain unchanged.
              </small>
            )}
          </div>

          <div className="ad-field ad-full">
            <label>Target URL</label>

            <input
              type="url"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>
              Duration (seconds)
            </label>

            <input
              type="number"
              name="duration"
              min="1"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>
              Skip After (seconds)
            </label>

            <input
              type="number"
              name="skipAfter"
              min="0"
              value={formData.skipAfter}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>Start Date</label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>End Date</label>

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>Priority</label>

            <input
              type="number"
              name="priority"
              min="1"
              value={formData.priority}
              onChange={handleChange}
            />
          </div>

          <div className="ad-field">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>

        </div>

        <div className="ad-form-actions">

          <button
            type="button"
            className="ad-secondary-btn"
            onClick={() =>
              setActivePage("ads")
            }
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="submit"
            className="ad-primary-btn"
          >
            <Save size={18} />
            Update Advertisement
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditAd;