import {
  Plus,
  Pencil,
  Trash2,
  Video,
  Image as ImageIcon,
  Code2,
  Eye,
  CircleCheck,
  CirclePause,
  FileVideo,
  FileImage,
} from "lucide-react";

import notify from "../../utils/notify";

import "./Ads.css";

function Ads({
  ads = [],
  setActivePage,
  openViewAd,
  openEditAd,
  deleteAd,
}) {
  /* =========================================================
     HELPERS
  ========================================================= */

  const getAdType = (ad) => {
    const type = String(ad?.type || "").toLowerCase();

    if (
      type === "image" ||
      type === "image-ad" ||
      type === "banner"
    ) {
      return "image";
    }

    if (
      type === "custom" ||
      type === "custom-script" ||
      type === "script" ||
      type === "html"
    ) {
      return "custom";
    }

    return "video";
  };

  const getTypeLabel = (ad) => {
    const type = getAdType(ad);

    if (type === "image") return "Image Ad";
    if (type === "custom") return "Custom / Script";

    return "Video Ad";
  };

  const getTypeIcon = (ad, size = 20) => {
    const type = getAdType(ad);

    if (type === "image") {
      return <ImageIcon size={size} />;
    }

    if (type === "custom") {
      return <Code2 size={size} />;
    }

    return <Video size={size} />;
  };

  const getStatus = (ad) => {
    const status = String(ad?.status || "").toLowerCase();

    if (
      status === "active" ||
      status === "enabled" ||
      status === "running"
    ) {
      return "active";
    }

    if (
      status === "paused" ||
      status === "pause" ||
      status === "inactive"
    ) {
      return "paused";
    }

    return "draft";
  };

  const getStatusLabel = (ad) => {
    const status = getStatus(ad);

    if (status === "active") return "Active";
    if (status === "paused") return "Paused";

    return "Draft";
  };

  const getStatusIcon = (ad) => {
    const status = getStatus(ad);

    if (status === "active") {
      return <CircleCheck size={14} />;
    }

    if (status === "paused") {
      return <CirclePause size={14} />;
    }

    return null;
  };

  const getPlacement = (ad) => {
    if (Array.isArray(ad?.placements)) {
      return ad.placements;
    }

    if (Array.isArray(ad?.placement)) {
      return ad.placement;
    }

    if (typeof ad?.placement === "string" && ad.placement.trim()) {
      return [ad.placement];
    }

    return [];
  };

  const formatPlacement = (placement) => {
    const value = String(placement || "").toLowerCase();

    if (
      value === "video" ||
      value === "video-player" ||
      value === "video player"
    ) {
      return "Video Player";
    }

    if (
      value === "home" ||
      value === "home-page" ||
      value === "home page"
    ) {
      return "Home Page";
    }

    if (value === "banner") {
      return "Banner";
    }

    return placement;
  };

  const getDuration = (ad) => {
    const duration = Number(ad?.duration);

    if (!Number.isFinite(duration) || duration < 0) {
      return 0;
    }

    return duration;
  };

  const getSkipAfter = (ad) => {
    const skipAfter = Number(ad?.skipAfter);

    if (!Number.isFinite(skipAfter) || skipAfter < 0) {
      return 0;
    }

    return skipAfter;
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("en-GB");
  };

  const getCampaignText = (ad) => {
    const start = formatDate(ad?.startDate);
    const end = formatDate(ad?.endDate);

    if (start && end) {
      return `${start} - ${end}`;
    }

    if (start) {
      return `Starts ${start}`;
    }

    if (end) {
      return `Ends ${end}`;
    }

    return "No schedule";
  };

  const getTargetText = (ad) => {
    if (Array.isArray(ad?.targetTitles)) {
      if (ad.targetTitles.length === 0) {
        return "All Titles";
      }

      return ad.targetTitles.join(", ");
    }

    if (Array.isArray(ad?.targetTitles?.titles)) {
      if (ad.targetTitles.titles.length === 0) {
        return "All Titles";
      }

      return ad.targetTitles.titles.join(", ");
    }

    if (ad?.targetTitle) {
      return ad.targetTitle;
    }

    return "All Titles";
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalAds = ads.length;

  const activeAds = ads.filter(
    (ad) => getStatus(ad) === "active"
  ).length;

  const pausedAds = ads.filter(
    (ad) => getStatus(ad) === "paused"
  ).length;

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleAddAdvertisement = () => {
    if (typeof setActivePage === "function") {
      setActivePage("add-ad");
    }
  };

  const handleView = (ad) => {
    if (typeof openViewAd === "function") {
      openViewAd(ad);
      return;
    }

    if (typeof setActivePage === "function") {
      setActivePage("view-ad");
    }
  };

  const handleEdit = (ad) => {
    if (typeof openEditAd === "function") {
      openEditAd(ad);
      return;
    }

    if (typeof setActivePage === "function") {
      setActivePage("edit-ad");
    }
  };

  const handleDelete = (ad) => {
    if (typeof deleteAd !== "function") {
      notify.warning(
        "Delete action is not available right now."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${ad?.name || "this advertisement"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteAd(ad.id);
    } catch (error) {
      console.error("❌ Delete advertisement error:", error);

      notify.error(
        error?.message ||
          "Failed to delete advertisement."
      );
    }
  };

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (ads.length === 0) {
    return (
      <div className="ads-page">

        <div className="ads-header">
          <div className="ads-header-left">

            <div className="ads-page-icon">
              <Video size={23} />
            </div>

            <div>
              <h1>Advertisements</h1>
              <p>Manage all advertisements</p>
            </div>

          </div>

          <button
            type="button"
            className="ad-primary-btn"
            onClick={handleAddAdvertisement}
          >
            <Plus size={18} />
            Add Advertisement
          </button>
        </div>


        <div className="ads-summary">

          <div className="ads-summary-card">

            <div className="ads-summary-icon">
              <FileVideo size={20} />
            </div>

            <div>
              <span>Total Ads</span>
              <strong>0</strong>
            </div>

          </div>


          <div className="ads-summary-card">

            <div className="ads-summary-icon ads-summary-active">
              <CircleCheck size={20} />
            </div>

            <div>
              <span>Active</span>
              <strong>0</strong>
            </div>

          </div>


          <div className="ads-summary-card">

            <div className="ads-summary-icon ads-summary-paused">
              <CirclePause size={20} />
            </div>

            <div>
              <span>Paused</span>
              <strong>0</strong>
            </div>

          </div>

        </div>


        <div className="ads-empty">

          <div className="ads-empty-icon">
            <Video size={36} />
          </div>

          <h2>No Advertisements</h2>

          <p>
            You haven't created any advertisements yet.
            Create your first advertisement to start managing
            your ad campaigns.
          </p>

          <button
            type="button"
            className="ad-primary-btn"
            onClick={handleAddAdvertisement}
          >
            <Plus size={18} />
            Add Advertisement
          </button>

        </div>

      </div>
    );
  }


  /* =========================================================
     ADS PAGE
  ========================================================= */

  return (
    <div className="ads-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="ads-header">

        <div className="ads-header-left">

          <div className="ads-page-icon">
            <Video size={23} />
          </div>

          <div>
            <h1>Advertisements</h1>
            <p>Manage all advertisements</p>
          </div>

        </div>


        <button
          type="button"
          className="ad-primary-btn"
          onClick={handleAddAdvertisement}
        >
          <Plus size={18} />
          Add Advertisement
        </button>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="ads-summary">

        {/* TOTAL */}

        <div className="ads-summary-card">

          <div className="ads-summary-icon">
            <FileVideo size={20} />
          </div>

          <div>
            <span>Total Ads</span>
            <strong>{totalAds}</strong>
          </div>

        </div>


        {/* ACTIVE */}

        <div className="ads-summary-card">

          <div className="ads-summary-icon ads-summary-active">
            <CircleCheck size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeAds}</strong>
          </div>

        </div>


        {/* PAUSED */}

        <div className="ads-summary-card">

          <div className="ads-summary-icon ads-summary-paused">
            <CirclePause size={20} />
          </div>

          <div>
            <span>Paused</span>
            <strong>{pausedAds}</strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          ADS LIST
      ===================================================== */}

      <div className="ads-list">

        {ads.map((ad) => {

          const status = getStatus(ad);
          const statusLabel = getStatusLabel(ad);
          const placements = getPlacement(ad);

          return (
            <div
              className="ad-card"
              key={ad.id}
            >

              {/* =================================================
                  ICON
              ================================================= */}

              <div
                className={`ad-card-icon ad-icon-${status}`}
              >
                {getTypeIcon(ad, 21)}
              </div>


              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="ad-card-content">

                {/* TITLE ROW */}

                <div className="ad-card-title-row">

                  <h3>
                    {ad.name || "Untitled Advertisement"}
                  </h3>

                  <span
                    className={`ad-status ad-status-${status}`}
                  >
                    {getStatusIcon(ad)}
                    {statusLabel}
                  </span>

                </div>


                {/* SUBTITLE */}

                <p className="ad-card-subtitle">

                  {ad.title
                    ? ad.title
                    : getTypeLabel(ad)}

                  {ad.advertiser
                    ? ` • ${ad.advertiser}`
                    : ""}

                </p>


                {/* =================================================
                    META
                ================================================= */}

                <div className="ad-card-meta">

                  <span className="ad-meta-type">
                    {getTypeIcon(ad, 15)}
                    {getTypeLabel(ad)}
                  </span>


                  {getAdType(ad) === "video" && (
                    <>
                      <span>
                        Duration:{" "}
                        <strong>
                          {getDuration(ad)}s
                        </strong>
                      </span>

                      <span>
                        Skip after{" "}
                        <strong>
                          {getSkipAfter(ad)}s
                        </strong>
                      </span>
                    </>
                  )}


                  {ad.priority !== undefined &&
                    ad.priority !== null && (
                      <span>
                        Priority:{" "}
                        <strong>
                          {ad.priority}
                        </strong>
                      </span>
                    )}


                  <span>
                    Campaign:{" "}
                    <strong>
                      {getCampaignText(ad)}
                    </strong>
                  </span>

                </div>


                {/* =================================================
                    PLACEMENT
                ================================================= */}

                <div className="ad-placement">

                  <span className="ad-placement-label">
                    Placement:
                  </span>

                  <span className="ad-placement-value">

                    {placements.length > 0
                      ? placements
                          .map(formatPlacement)
                          .join(" • ")
                      : "Not specified"}

                  </span>

                </div>


                {/* =================================================
                    TARGETING
                ================================================= */}

                <div className="ad-placement">

                  <span className="ad-placement-label">
                    Target:
                  </span>

                  <span className="ad-placement-value">
                    {getTargetText(ad)}
                  </span>

                </div>

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="ad-card-actions">

                <button
                  type="button"
                  className="ad-view-btn"
                  onClick={() => handleView(ad)}
                  title="View advertisement"
                >
                  <Eye size={17} />
                  View
                </button>


                <button
                  type="button"
                  className="ad-edit-btn"
                  onClick={() => handleEdit(ad)}
                  title="Edit advertisement"
                >
                  <Pencil size={17} />
                  Edit
                </button>


                <button
                  type="button"
                  className="ad-delete-btn"
                  onClick={() => handleDelete(ad)}
                  title="Delete advertisement"
                >
                  <Trash2 size={17} />
                  Delete
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Ads;