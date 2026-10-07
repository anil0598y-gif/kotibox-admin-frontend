import { useMemo, useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Code2,
  FileVideo,
  Globe,
  Image as ImageIcon,
  Link2,
  MonitorPlay,
  Plus,
  Upload,
  Video,
  X,
} from "lucide-react";

import notify from "../../utils/notify";

import "./AddAd.css";

const DRAFT_KEY = "musicAdminAddAdDraft";
const EDIT_DRAFT_KEY = "musicAdminEditAdDraft";

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addOneYear = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  date.setFullYear(date.getFullYear() + 1);

  return getDateString(date);
};

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  if (difference < 0) return 0;

  return Math.floor(difference / (1000 * 60 * 60 * 24));
};

function AddAd({
  setActivePage,
  addAd,
  updateAd,
  editingAd = null,
}) {
  const isEditMode = Boolean(editingAd);

  const fileInputRef = useRef(null);

  const today = useMemo(() => getDateString(new Date()), []);

  /* =====================================================
     INITIAL FORM DATA
  ===================================================== */

  const [formData, setFormData] = useState(() => {
    /* ✅ EDIT MODE: existing ad से form भरो */
    if (isEditMode && editingAd) {
      return {
        name: editingAd.name || "",
        type: editingAd.type || "video",
        title: editingAd.title || "",
        contentType: editingAd.contentType || "All Content",
        targetTitles: Array.isArray(editingAd.targetTitles)
          ? editingAd.targetTitles
          : [],
        targetUrl: editingAd.targetUrl || "",
        startDate: editingAd.startDate || today,
        endDate: editingAd.endDate || addOneYear(today),
        placements: Array.isArray(editingAd.placements)
          ? editingAd.placements
          : ["video-player"],
        status:
          editingAd.status === "active" ||
          editingAd.status === true
            ? true
            : false,
        customScript: editingAd.customScript || "",
      };
    }

    /* ADD MODE: draft load या blank form */
    try {
      const saved = localStorage.getItem(DRAFT_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        return {
          name: parsed.name || "",
          type: parsed.type || "video",
          title: parsed.title || "",
          contentType: parsed.contentType || "All Content",
          targetTitles: Array.isArray(parsed.targetTitles)
            ? parsed.targetTitles
            : [],
          targetUrl: parsed.targetUrl || "",
          startDate: parsed.startDate || today,
          endDate: parsed.endDate || addOneYear(today),
          placements: Array.isArray(parsed.placements)
            ? parsed.placements
            : ["video-player"],
          status: parsed.status !== undefined ? parsed.status : true,
          customScript: parsed.customScript || "",
        };
      }
    } catch (error) {
      console.error("Failed to load advertisement draft:", error);
    }

    return {
      name: "",
      type: "video",
      title: "",
      contentType: "All Content",
      targetTitles: [],
      targetUrl: "",
      startDate: today,
      endDate: addOneYear(today),
      placements: ["video-player"],
      status: true,
      customScript: "",
    };
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaFileName, setMediaFileName] = useState(
    isEditMode && editingAd?.mediaFileName
      ? editingAd.mediaFileName
      : ""
  );
  const [targetTitleInput, setTargetTitleInput] = useState("");
  const [saving, setSaving] = useState(false);

  /* =====================================================
     SAVE FORM DRAFT (only in add mode)
  ===================================================== */

  useEffect(() => {
    if (isEditMode) return;

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(formData)
      );
    } catch (error) {
      console.error("Failed to save advertisement draft:", error);
    }
  }, [formData, isEditMode]);

  /* =====================================================
     CHANGE HANDLER
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     AD TYPE
  ===================================================== */

  const selectAdType = (type) => {
    setFormData((previous) => ({
      ...previous,
      type,
    }));

    setMediaFile(null);
    setMediaFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      notify.warning("File too large. Max 100MB allowed.");
      return;
    }

    setMediaFile(file);
    setMediaFileName(file.name);
  };

  /* =====================================================
     REMOVE FILE
  ===================================================== */

  const removeMediaFile = () => {
    setMediaFile(null);
    setMediaFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     TARGET TITLES
  ===================================================== */

  const addTargetTitle = () => {
    const title = targetTitleInput.trim();

    if (!title) return;

    if (
      formData.targetTitles.some(
        (item) => item.toLowerCase() === title.toLowerCase()
      )
    ) {
      setTargetTitleInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      targetTitles: [
        ...previous.targetTitles,
        title,
      ],
    }));

    setTargetTitleInput("");
  };

  const removeTargetTitle = (title) => {
    setFormData((previous) => ({
      ...previous,
      targetTitles: previous.targetTitles.filter(
        (item) => item !== title
      ),
    }));
  };

  const handleTargetTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTargetTitle();
    }
  };

  /* =====================================================
     PLACEMENT
  ===================================================== */

  const togglePlacement = (placement) => {
    setFormData((previous) => {
      const exists = previous.placements.includes(placement);

      if (exists) {
        return {
          ...previous,
          placements: previous.placements.filter(
            (item) => item !== placement
          ),
        };
      }

      return {
        ...previous,
        placements: [
          ...previous.placements,
          placement,
        ],
      };
    });
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const toggleStatus = () => {
    setFormData((previous) => ({
      ...previous,
      status: !previous.status,
    }));
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!formData.name.trim()) {
      notify.warning("Please enter Ad Name.");
      return;
    }

    /* File upload सिर्फ add mode में mandatory है
       (edit mode में पुरानी file रहेगी) */
    if (
      !isEditMode &&
      formData.type !== "custom" &&
      !mediaFile
    ) {
      notify.warning("Please upload an advertisement file.");
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
        notify.warning("Please enter a valid Redirect URL.");
        return;
      }
    }

    if (formData.placements.length === 0) {
      notify.warning("Please select at least one placement.");
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();

      const baseData = {
        name: formData.name.trim(),
        type: formData.type,
        title: formData.title.trim(),
        description: "",
        advertiser: "",
        targetUrl: formData.targetUrl.trim(),
        contentType: formData.contentType,
        targetTitles: formData.targetTitles,
        placements: formData.placements,
        placement: formData.placements[0] || "",
        customScript:
          formData.type === "custom"
            ? formData.customScript
            : "",
        duration:
          formData.type === "video" ? 30 : 0,
        skipAfter:
          formData.type === "video" ? 5 : 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: 1,
        status: formData.status ? "active" : "paused",
        mediaFile:
          formData.type === "custom" ? null : mediaFile,
        mediaFileName: mediaFileName,
        thumbnailFile: null,
        updatedAt: now,
      };

      /* ✅ EDIT MODE */
      if (isEditMode && editingAd) {
        const editData = {
          ...editingAd,
          ...baseData,
          _id: editingAd._id || editingAd.id,
          id: editingAd._id || editingAd.id,
          mediaUrl: editingAd.mediaUrl || "",
        };

        if (typeof updateAd === "function") {
          await updateAd(editData);
        }

        if (typeof setActivePage === "function") {
          setActivePage("ads");
        }

        return;
      }

      /* ✅ ADD MODE */
      const newAd = {
        ...baseData,
        createdAt: now,
      };

      if (typeof addAd === "function") {
        await addAd(newAd);
      }

      localStorage.removeItem(DRAFT_KEY);

      setMediaFile(null);
      setMediaFileName("");

      if (typeof setActivePage === "function") {
        setActivePage("ads");
      }
    } catch (error) {
      console.error(
        "❌ Failed to save advertisement:",
        error
      );

      notify.error(
        `Advertisement could not be ${
          isEditMode ? "updated" : "created"
        }. ` +
          (error?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CAMPAIGN DURATION
  ===================================================== */

  const campaignDays = calculateDays(
    formData.startDate,
    formData.endDate
  );

  /* =====================================================
     ACCEPT FILE TYPE
  ===================================================== */

  const getAcceptType = () => {
    if (formData.type === "video") {
      return "video/*,.m3u8";
    }

    if (formData.type === "image") {
      return "image/*";
    }

    return "";
  };

  /* =====================================================
     BACK / CANCEL HANDLER
  ===================================================== */

  const handleBack = () => {
    if (isEditMode && editingAd) {
      setActivePage("view-ad");
    } else {
      setActivePage("ads");
    }
  };

  return (
    <div className="add-ad-page">
      {/* HEADER */}

      <div className="add-ad-topbar">
        <div className="add-ad-heading">
          <button
            type="button"
            className="add-ad-back-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1>
              {isEditMode
                ? "Edit Advertisement"
                : "Add Advertisement"}
            </h1>
            <p>
              {isEditMode
                ? "Update the advertisement details"
                : "Create and configure a new advertisement"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-ad-cancel-top"
          onClick={handleBack}
        >
          <X size={17} />
          Cancel
        </button>
      </div>

      <form
        className="add-ad-form"
        onSubmit={handleSubmit}
      >
        <div className="add-ad-grid">
          {/* LEFT COLUMN */}

          <div className="add-ad-column">
            {/* AD IDENTITY */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>AD IDENTITY</h2>
              </div>

              <div className="add-ad-field">
                <label>
                  Ad Name <b>*</b>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Sale Banner"
                />
              </div>
            </section>

            {/* AD TYPE */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>AD TYPE</h2>
              </div>

              <div className="ad-type-list">
                <button
                  type="button"
                  className={`ad-type-option ${
                    formData.type === "video"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectAdType("video")}
                >
                  <div className="ad-type-icon">
                    <Video size={20} />
                  </div>

                  <div>
                    <strong>Video Ad</strong>
                    <small>
                      MP4 or HLS video pre-roll
                    </small>
                  </div>

                  {formData.type === "video" && (
                    <Check size={18} />
                  )}
                </button>

                <button
                  type="button"
                  className={`ad-type-option ${
                    formData.type === "image"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectAdType("image")}
                >
                  <div className="ad-type-icon">
                    <ImageIcon size={20} />
                  </div>

                  <div>
                    <strong>Image Ad</strong>
                    <small>
                      Static banner or interstitial
                    </small>
                  </div>

                  {formData.type === "image" && (
                    <Check size={18} />
                  )}
                </button>

                <button
                  type="button"
                  className={`ad-type-option ${
                    formData.type === "custom"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectAdType("custom")}
                >
                  <div className="ad-type-icon">
                    <Code2 size={20} />
                  </div>

                  <div>
                    <strong>Custom / Script</strong>
                    <small>
                      Google Ads or custom HTML
                    </small>
                  </div>

                  {formData.type === "custom" && (
                    <Check size={18} />
                  )}
                </button>
              </div>
            </section>

            {/* CREATIVE / MEDIA */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>CREATIVE / MEDIA</h2>
              </div>

              {formData.type !== "custom" ? (
                <>
                  <div className="creative-buttons">
                    <button
                      type="button"
                      className="creative-upload-btn"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <Upload size={17} />
                      {isEditMode && !mediaFile
                        ? "Replace File"
                        : "Upload File"}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept={getAcceptType()}
                      onChange={handleFileChange}
                    />
                  </div>

                  <div
                    className={`creative-dropzone ${
                      mediaFile || mediaFileName
                        ? "has-file"
                        : ""
                    }`}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    {mediaFile ? (
                      <>
                        <div className="creative-file-icon">
                          {formData.type === "image" ? (
                            <ImageIcon size={27} />
                          ) : (
                            <FileVideo size={27} />
                          )}
                        </div>

                        <strong>{mediaFileName}</strong>

                        <small>
                          File selected successfully
                        </small>

                        <button
                          type="button"
                          className="creative-remove-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeMediaFile();
                          }}
                        >
                          <X size={15} />
                          Remove
                        </button>
                      </>
                    ) : isEditMode && mediaFileName ? (
                      <>
                        <div className="creative-file-icon">
                          {formData.type === "image" ? (
                            <ImageIcon size={27} />
                          ) : (
                            <FileVideo size={27} />
                          )}
                        </div>

                        <strong>{mediaFileName}</strong>

                        <small>
                          Current file — upload new to replace
                        </small>

                        <button
                          type="button"
                          className="creative-remove-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeMediaFile();
                          }}
                        >
                          <X size={15} />
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="creative-upload-icon">
                          <Upload size={27} />
                        </div>

                        <strong>
                          Upload your creative
                        </strong>

                        <small>
                          Click Upload File to select
                          your {formData.type} ad
                        </small>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="add-ad-field">
                    <label>
                      Custom Script / HTML
                    </label>

                    <textarea
                      name="customScript"
                      value={formData.customScript}
                      onChange={handleChange}
                      placeholder="<script>...</script>"
                      rows={7}
                    />
                  </div>

                  <div className="creative-custom-preview">
                    <Code2 size={25} />

                    <strong>
                      Paste your ad script or HTML above
                    </strong>

                    <p>
                      Supports Google AdSense tags,
                      custom HTML banners and JavaScript
                      ad scripts.
                    </p>
                  </div>
                </>
              )}
            </section>

            {/* TARGETING */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>TARGETING</h2>
              </div>

              <div className="add-ad-field">
                <label>Content Type</label>

                <div className="select-wrapper">
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                  >
                    <option value="All Content">
                      All Content
                    </option>

                    <option value="Movies">Movies</option>

                    <option value="Web Series">
                      Web Series
                    </option>

                    <option value="Music">Music</option>

                    <option value="Live">Live</option>
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="add-ad-field">
                <label>
                  Target Titles{" "}
                  <span>(Optional)</span>
                </label>

                <div className="target-title-box">
                  {formData.targetTitles.map((title) => (
                    <span
                      className="target-chip"
                      key={title}
                    >
                      {title}

                      <button
                        type="button"
                        onClick={() =>
                          removeTargetTitle(title)
                        }
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={targetTitleInput}
                    onChange={(event) =>
                      setTargetTitleInput(event.target.value)
                    }
                    onKeyDown={handleTargetTitleKeyDown}
                    placeholder={
                      formData.targetTitles.length
                        ? "Add another title"
                        : "Select or type a target title"
                    }
                  />

                  <button
                    type="button"
                    className="target-add-btn"
                    onClick={addTargetTitle}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* MIDDLE COLUMN */}

          <div className="add-ad-column">
            {/* CLICK DESTINATION */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>CLICK DESTINATION</h2>
              </div>

              <div className="add-ad-field">
                <label>
                  <Link2 size={15} />
                  Redirect URL
                </label>

                <div className="input-icon-wrapper">
                  <Globe size={17} />

                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/offer"
                  />
                </div>

                <small className="field-help">
                  Where users are sent when they click
                  on the ad
                </small>
              </div>
            </section>

            {/* PLACEMENT */}

            <section className="add-ad-card">
              <div className="add-ad-card-title">
                <span />
                <h2>PLACEMENT</h2>
              </div>

              <div className="placement-list">
                <button
                  type="button"
                  className={`placement-option ${
                    formData.placements.includes(
                      "video-player"
                    )
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    togglePlacement("video-player")
                  }
                >
                  <div className="placement-icon">
                    <MonitorPlay size={20} />
                  </div>

                  <div>
                    <strong>Video Player</strong>
                    <small>
                      Pre-roll or mid-roll in player
                    </small>
                  </div>

                  {formData.placements.includes(
                    "video-player"
                  ) && <Check size={18} />}
                </button>

                <button
                  type="button"
                  className={`placement-option ${
                    formData.placements.includes(
                      "home-page"
                    )
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    togglePlacement("home-page")
                  }
                >
                  <div className="placement-icon">
                    <Globe size={20} />
                  </div>

                  <div>
                    <strong>Home Page</strong>
                    <small>
                      Shown on the streaming home
                    </small>
                  </div>

                  {formData.placements.includes(
                    "home-page"
                  ) && <Check size={18} />}
                </button>

                <button
                  type="button"
                  className={`placement-option ${
                    formData.placements.includes("banner")
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    togglePlacement("banner")
                  }
                >
                  <div className="placement-icon">
                    <ImageIcon size={20} />
                  </div>

                  <div>
                    <strong>Banner</strong>
                    <small>
                      Full-width banner overlay
                    </small>
                  </div>

                  {formData.placements.includes(
                    "banner"
                  ) && <Check size={18} />}
                </button>
              </div>
            </section>

            {/* STATUS */}

            <section className="add-ad-card status-card">
              <div className="add-ad-card-title">
                <span />
                <h2>STATUS</h2>
              </div>

              <div className="status-row">
                <div>
                  <strong>Ad Active</strong>

                  <p>
                    Toggle to enable or pause this ad
                  </p>
                </div>

                <div className="status-control">
                  <span
                    className={
                      formData.status
                        ? "status-active-text"
                        : "status-paused-text"
                    }
                  >
                    {formData.status ? "Active" : "Paused"}
                  </span>

                  <button
                    type="button"
                    className={`status-toggle ${
                      formData.status ? "active" : ""
                    }`}
                    onClick={toggleStatus}
                    aria-label="Toggle advertisement status"
                  >
                    <span />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <div className="add-ad-column">
            {/* CAMPAIGN SCHEDULE */}

            <section className="add-ad-card schedule-card">
              <div className="add-ad-card-title">
                <span />
                <h2>CAMPAIGN SCHEDULE</h2>
              </div>

              <div className="add-ad-field">
                <label>
                  <CalendarDays size={15} />
                  Start Date <b>*</b>
                </label>

                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(event) => {
                      const value = event.target.value;

                      setFormData((previous) => ({
                        ...previous,
                        startDate: value,
                        endDate:
                          previous.endDate &&
                          previous.endDate >= value
                            ? previous.endDate
                            : addOneYear(value),
                      }));
                    }}
                  />

                  <CalendarDays size={17} />
                </div>
              </div>

              <div className="add-ad-field">
                <label>
                  <CalendarDays size={15} />
                  End Date <b>*</b>
                </label>

                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={handleChange}
                  />

                  <CalendarDays size={17} />
                </div>
              </div>

              <div className="campaign-duration">
                <span>Campaign duration</span>

                <strong>{campaignDays} days</strong>
              </div>
            </section>

            {/* SAVE BUTTON */}

            <button
              type="submit"
              className="create-ad-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="create-ad-spinner" />
                  {isEditMode
                    ? "Updating..."
                    : "Creating..."}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {isEditMode ? "Update Ad" : "Create Ad"}
                </>
              )}
            </button>

            <button
              type="button"
              className="bottom-cancel-btn"
              onClick={handleBack}
            >
              <X size={17} />
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddAd;