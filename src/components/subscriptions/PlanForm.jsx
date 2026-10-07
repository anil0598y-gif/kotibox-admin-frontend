import { useEffect, useState } from "react";
import {
  CreditCard,
  Save,
  X,
  Check,
  Volume2,
  Smartphone,
  Download,
  ListMusic,
  Megaphone,
} from "lucide-react";

import notify from "../../utils/notify";
import "./PlanForm.css";

function PlanForm({ plan = null, setActivePage, onSave }) {
  const isEditMode = Boolean(plan);

  const [formData, setFormData] = useState({
    _id: "",           // ✅ MongoDB ID (edit ke liye)
    planId: "",        // ✅ Human-readable ID (PLAN-XXXXXX)
    name: "",
    price: "",
    billingCycle: "Monthly",
    duration: "30",
    audioQuality: "320 kbps",
    ads: false,
    offlineDownload: true,
    unlimitedPlaylist: true,
    maxDevices: "3",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  /* =========================================
     LOAD PLAN FOR EDIT
  ========================================= */

  useEffect(() => {
    if (!plan) {
      setFormData({
        _id: "",
        planId: "",
        name: "",
        price: "",
        billingCycle: "Monthly",
        duration: "30",
        audioQuality: "320 kbps",
        ads: false,
        offlineDownload: true,
        unlimitedPlaylist: true,
        maxDevices: "3",
        status: "Active",
      });

      setErrors({});
      return;
    }

    setFormData({
      _id: plan._id || "",                              // ✅ MongoDB ID
      planId: plan.planId || "",                        // ✅ Human ID
      name: plan.name || plan.planName || "",
      price: plan.price ?? "",
      billingCycle: plan.billingCycle || "Monthly",
      duration: plan.duration ?? "30",
      audioQuality: plan.audioQuality || plan.maxQuality || "320 kbps",
      ads: plan.ads ?? plan.adsFree ?? false,
      offlineDownload: plan.offlineDownload ?? plan.downloads ?? true,
      unlimitedPlaylist: plan.unlimitedPlaylist ?? true,
      maxDevices: plan.maxDevices ?? "3",
      status: plan.status || "Active",
    });

    setErrors({});
  }, [plan]);

  /* =========================================
     CANCEL / CLOSE
  ========================================= */

  const handleCancel = () => {
    if (setActivePage) {
      setActivePage("plans");
    }
  };

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /* =========================================
     FEATURE TOGGLE
  ========================================= */

  const handleToggle = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  /* =========================================
     BILLING CYCLE
  ========================================= */

  const handleBillingChange = (e) => {
    const value = e.target.value;

    let duration = formData.duration;

    if (value === "Monthly") {
      duration = "30";
    }

    if (value === "Yearly") {
      duration = "365";
    }

    setFormData((prev) => ({
      ...prev,
      billingCycle: value,
      duration,
    }));
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter plan name.";
    }

    if (
      formData.price === "" ||
      formData.price === null ||
      Number(formData.price) < 0
    ) {
      newErrors.price = "Please enter a valid price.";
    }

    if (formData.duration === "" || Number(formData.duration) <= 0) {
      newErrors.duration = "Please enter a valid duration.";
    }

    if (
      formData.maxDevices === "" ||
      Number(formData.maxDevices) <= 0
    ) {
      newErrors.maxDevices = "Please enter valid device limit.";
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      notify.warning("Validation Error", newErrors[errorKeys[0]]);
    }

    return errorKeys.length === 0;
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now = new Date().toISOString();

    // ✅ Agar edit mode hai — MongoDB ka _id bhejo
    // ✅ Agar create mode hai — _id mat bhejo (MongoDB banayega)
    const savedPlan = {
      // ✅ Edit mode ke liye — original _id
      ...(isEditMode && formData._id
        ? { _id: formData._id }
        : {}),

      // ✅ Human-readable planId (naya banao agar nahi hai)
      planId:
        formData.planId ||
        `PLAN-${Date.now().toString().slice(-6)}`,

      name: formData.name.trim(),

      price: Number(formData.price),

      billingCycle: formData.billingCycle,

      duration: Number(formData.duration),

      audioQuality: formData.audioQuality,

      maxQuality: formData.audioQuality, // ✅ Backend compatibility

      ads: formData.ads,

      adsFree: formData.ads,             // ✅ Backend compatibility

      offlineDownload: formData.offlineDownload,

      downloads: formData.offlineDownload, // ✅ Backend compatibility

      unlimitedPlaylist: formData.unlimitedPlaylist,

      maxDevices: Number(formData.maxDevices),

      status: formData.status,

      createdAt: plan?.createdAt || now,

      updatedAt: now,
    };

    if (onSave) {
      onSave(savedPlan);
    }
  };

  return (
    <div className="plan-form-page">
      {/* HEADER */}
      <div className="plan-form-header">
        <div className="plan-form-heading">
          <div className="plan-form-heading-icon">
            <CreditCard size={23} />
          </div>

          <div>
            <h1>
              {isEditMode
                ? "Edit Subscription Plan"
                : "Create Subscription Plan"}
            </h1>

            <p>
              {isEditMode
                ? "Update the details and features of this plan."
                : "Create a new plan for your music platform."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="plan-form-close"
          onClick={handleCancel}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* FORM */}
      <form className="plan-form" onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
        <section className="plan-form-section">
          <div className="plan-form-section-header">
            <div>
              <h2>Basic Information</h2>
              <p>
                Enter the basic details of your subscription plan.
              </p>
            </div>
          </div>

          <div className="plan-form-grid">
            {/* PLAN NAME */}
            <div className="plan-form-group full">
              <label>
                Plan Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Premium"
                className={errors.name ? "form-error-input" : ""}
              />

              {errors.name && (
                <small className="form-error">{errors.name}</small>
              )}
            </div>

            {/* PRICE */}
            <div className="plan-form-group">
              <label>
                Price <span>*</span>
              </label>

              <div
                className={`price-input ${
                  errors.price ? "form-error-input" : ""
                }`}
              >
                <span>₹</span>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="199"
                  min="0"
                  step="1"
                />
              </div>

              {errors.price && (
                <small className="form-error">{errors.price}</small>
              )}
            </div>

            {/* BILLING */}
            <div className="plan-form-group">
              <label>
                Billing Cycle <span>*</span>
              </label>

              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleBillingChange}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* DURATION */}
            <div className="plan-form-group">
              <label>
                Duration <span>*</span>
              </label>

              <div
                className={`duration-input ${
                  errors.duration ? "form-error-input" : ""
                }`}
              >
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                />

                <span>Days</span>
              </div>

              {errors.duration && (
                <small className="form-error">
                  {errors.duration}
                </small>
              )}
            </div>

            {/* STATUS */}
            <div className="plan-form-group">
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
        </section>

        {/* AUDIO SETTINGS */}
        <section className="plan-form-section">
          <div className="plan-form-section-header">
            <div className="section-icon">
              <Volume2 size={18} />
            </div>

            <div>
              <h2>Audio Settings</h2>
              <p>
                Configure the audio quality available to subscribers.
              </p>
            </div>
          </div>

          <div className="plan-form-grid">
            <div className="plan-form-group">
              <label>Audio Quality</label>

              <select
                name="audioQuality"
                value={formData.audioQuality}
                onChange={handleChange}
              >
                <option value="128 kbps">128 kbps</option>
                <option value="192 kbps">192 kbps</option>
                <option value="256 kbps">256 kbps</option>
                <option value="320 kbps">320 kbps</option>
                <option value="Lossless">Lossless</option>
              </select>
            </div>
          </div>
        </section>

        {/* PLAN FEATURES */}
        <section className="plan-form-section">
          <div className="plan-form-section-header">
            <div>
              <h2>Plan Features</h2>
              <p>
                Choose which features are available with this plan.
              </p>
            </div>
          </div>

          <div className="plan-feature-settings">
            {/* ADS */}
            <div className="feature-setting">
              <div className="feature-setting-icon">
                <Megaphone size={18} />
              </div>

              <div className="feature-setting-content">
                <strong>Advertisements</strong>
                <span>
                  Allow advertisements while listening to music.
                </span>
              </div>

              <button
                type="button"
                className={`feature-toggle ${
                  formData.ads ? "on" : ""
                }`}
                onClick={() => handleToggle("ads")}
              >
                <span />
              </button>
            </div>

            {/* OFFLINE */}
            <div className="feature-setting">
              <div className="feature-setting-icon">
                <Download size={18} />
              </div>

              <div className="feature-setting-content">
                <strong>Offline Download</strong>
                <span>
                  Allow users to download music for offline listening.
                </span>
              </div>

              <button
                type="button"
                className={`feature-toggle ${
                  formData.offlineDownload ? "on" : ""
                }`}
                onClick={() => handleToggle("offlineDownload")}
              >
                <span />
              </button>
            </div>

            {/* PLAYLIST */}
            <div className="feature-setting">
              <div className="feature-setting-icon">
                <ListMusic size={18} />
              </div>

              <div className="feature-setting-content">
                <strong>Unlimited Playlists</strong>
                <span>
                  Allow users to create unlimited playlists.
                </span>
              </div>

              <button
                type="button"
                className={`feature-toggle ${
                  formData.unlimitedPlaylist ? "on" : ""
                }`}
                onClick={() => handleToggle("unlimitedPlaylist")}
              >
                <span />
              </button>
            </div>

            {/* MAX DEVICES */}
            <div className="feature-setting">
              <div className="feature-setting-icon">
                <Smartphone size={18} />
              </div>

              <div className="feature-setting-content">
                <strong>Maximum Devices</strong>
                <span>
                  Number of devices that can use this subscription.
                </span>
              </div>

              <div className="device-input">
                <input
                  type="number"
                  name="maxDevices"
                  value={formData.maxDevices}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className={
                    errors.maxDevices ? "form-error-input" : ""
                  }
                />
                <span>devices</span>
              </div>

              {errors.maxDevices && (
                <small className="form-error">
                  {errors.maxDevices}
                </small>
              )}
            </div>
          </div>
        </section>

        {/* PLAN PREVIEW */}
        <section className="plan-preview-section">
          <div className="plan-preview-card">
            <div className="plan-preview-top">
              <div>
                <span className="preview-label">PLAN PREVIEW</span>
                <h3>{formData.name || "Premium"}</h3>
              </div>

              <div className="preview-status">
                {formData.status === "Active" ? (
                  <>
                    <Check size={13} /> Active
                  </>
                ) : (
                  <>
                    <X size={13} /> Inactive
                  </>
                )}
              </div>
            </div>

            <div className="plan-preview-price">
              <strong>
                ₹
                {formData.price === ""
                  ? "0"
                  : Number(formData.price).toLocaleString("en-IN")}
              </strong>
              <span>/ {formData.billingCycle}</span>
            </div>

            <div className="plan-preview-meta">
              <span>{formData.duration || 0} days</span>
              <span>{formData.audioQuality}</span>
              <span>{formData.maxDevices || 1} devices</span>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="plan-form-actions">
          <button
            type="button"
            className="plan-form-cancel"
            onClick={handleCancel}
          >
            <X size={17} />
            Cancel
          </button>

          <button type="submit" className="plan-form-save">
            <Save size={17} />
            {isEditMode ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlanForm;