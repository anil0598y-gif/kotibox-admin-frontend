import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  CreditCard,
  MoreVertical,
} from "lucide-react";

import notify from "../../utils/notify";
import "./PlanList.css";

function PlanList({
  plans = [],
  setActivePage,
  openEditPlan,
  deletePlan,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const searchText = search.toLowerCase().trim();

      const planName = (
        plan.name ||
        plan.planName ||
        ""
      ).toLowerCase();

      const planId = (
        plan.planId ||
        plan.id ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        planName.includes(searchText) ||
        planId.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        plan.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  const activePlans = plans.filter(
    (plan) => plan.status?.toLowerCase() === "active"
  ).length;

  const inactivePlans = plans.filter(
    (plan) => plan.status?.toLowerCase() === "inactive"
  ).length;

  const totalPlans = plans.length;

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
      return "₹0";
    }
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  /* =========================================
     ADD PLAN
  ========================================= */

  const handleAddPlan = () => {
    if (setActivePage) {
      setActivePage("add-plan");
    }
  };

  /* =========================================
     EDIT PLAN
  ========================================= */

  const handleEdit = (plan) => {
    if (!plan) return;

    if (openEditPlan) {
      openEditPlan(plan);
      return;
    }

    if (setActivePage) {
      setActivePage("edit-plan");
    }
  };

  /* =========================================
     ✅ DELETE PLAN — MongoDB _id bhejo
  ========================================= */

  const handleDelete = async (plan) => {
    if (!plan) return;

    const planName =
      plan.name || plan.planName || "this plan";

    const confirmed = await notify.confirmDelete(planName);
    if (!confirmed) return;

    // ✅ MongoDB ka _id use karo, custom id nahi
    const planId = plan._id || plan.id || plan.planId;

    if (!planId) {
      notify.error("Plan ID missing");
      return;
    }

    if (deletePlan) {
      deletePlan(planId);
    }
  };

  return (
    <div className="plan-list-page">
      {/* HEADER */}
      <div className="plan-list-header">
        <div>
          <div className="plan-list-title-row">
            <div className="plan-list-title-icon">
              <CreditCard size={22} />
            </div>

            <div>
              <h1>Subscription Plans</h1>
              <p>
                Create and manage subscription plans for your music platform.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="plan-add-btn"
          onClick={handleAddPlan}
        >
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      {/* STATS */}
      <div className="plan-stats-grid">
        <div className="plan-stat-card">
          <div className="plan-stat-icon total">
            <CreditCard size={20} />
          </div>
          <div>
            <span>Total Plans</span>
            <strong>{totalPlans}</strong>
          </div>
        </div>

        <div className="plan-stat-card">
          <div className="plan-stat-icon active">
            <Check size={20} />
          </div>
          <div>
            <span>Active Plans</span>
            <strong>{activePlans}</strong>
          </div>
        </div>

        <div className="plan-stat-card">
          <div className="plan-stat-icon inactive">
            <X size={20} />
          </div>
          <div>
            <span>Inactive Plans</span>
            <strong>{inactivePlans}</strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="plan-toolbar">
        <div className="plan-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="plan-search-clear"
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="plan-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* PLAN CARDS */}
      {filteredPlans.length > 0 ? (
        <div className="plans-grid">
          {filteredPlans.map((plan) => {
            const features = [
              {
                label: "Audio Quality",
                value: plan.audioQuality || plan.maxQuality || "320 kbps",
              },
              {
                label: "Ads",
                value:
                  plan.ads === false || plan.adsFree === true
                    ? "No Ads"
                    : "With Ads",
              },
              {
                label: "Offline Download",
                value:
                  plan.offlineDownload === false ||
                  plan.downloads === false
                    ? "Not Available"
                    : "Available",
              },
              {
                label: "Unlimited Playlist",
                value:
                  plan.unlimitedPlaylist === false
                    ? "Limited"
                    : "Unlimited",
              },
              {
                label: "Max Devices",
                value: plan.maxDevices
                  ? `${plan.maxDevices} Devices`
                  : "1 Device",
              },
            ];

            const planName =
              plan.name || plan.planName || "Unnamed Plan";

            const planId =
              plan.planId || plan.id || "PLAN-000000";

            const isActive =
              plan.status?.toLowerCase() === "active";

            // ✅ Unique key — MongoDB _id use karo
            const planKey =
              plan._id || plan.id || plan.planId || planName;

            return (
              <div
                className={`plan-card ${
                  !isActive ? "inactive-plan" : ""
                }`}
                key={planKey}   /* ✅ Unique key */
              >
                {/* CARD HEADER */}
                <div className="plan-card-header">
                  <div className="plan-card-name">
                    <div className="plan-card-icon">
                      <CreditCard size={20} />
                    </div>

                    <div>
                      <h3>{planName}</h3>
                      <span>{planId}</span>
                    </div>
                  </div>

                  <div className="plan-card-menu">
                    <MoreVertical size={19} />
                  </div>
                </div>

                {/* PRICE */}
                <div className="plan-price">
                  <strong>{formatPrice(plan.price)}</strong>
                  <span>/ {plan.billingCycle || "Month"}</span>
                </div>

                {/* DURATION */}
                <div className="plan-duration">
                  {plan.duration || 30} days
                </div>

                {/* STATUS */}
                <div className="plan-status-row">
                  <span
                    className={`plan-status ${
                      isActive ? "active" : "inactive"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check size={13} />
                        Active
                      </>
                    ) : (
                      <>
                        <X size={13} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                <div className="plan-card-divider" />

                {/* FEATURES */}
                <div className="plan-features">
                  {features.map((feature) => (
                    <div
                      className="plan-feature"
                      key={feature.label}
                    >
                      <Check size={15} />
                      <span>{feature.label}</span>
                      <strong>{feature.value}</strong>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="plan-card-actions">
                  <button
                    type="button"
                    className="plan-edit-btn"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="plan-delete-btn"
                    onClick={() => handleDelete(plan)}
                    title="Delete plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="plans-empty">
          <div className="plans-empty-icon">
            <CreditCard size={32} />
          </div>

          <h3>
            {search || statusFilter !== "All"
              ? "No plans found"
              : "No subscription plans yet"}
          </h3>

          <p>
            {search || statusFilter !== "All"
              ? "Try changing your search or filter."
              : "Create your first subscription plan to get started."}
          </p>

          {!search && statusFilter === "All" && (
            <button
              type="button"
              className="plan-add-btn"
              onClick={handleAddPlan}
            >
              <Plus size={17} />
              Create First Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanList;