import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  XCircle,
  CreditCard,
  Users,
  CheckCircle,
  Clock,
  IndianRupee,
} from "lucide-react";

import "./SubscriptionList.css";

/* =====================================================
   HELPER: user se safely string nikaalo
   (chahe string ho, object ho, null ho)
===================================================== */

const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";

  /* Agar string hai */
  if (typeof user === "string") {
    return user;
  }

  /* Agar object hai (populated) */
  if (typeof user === "object") {
    return (
      user.name ||
      user.username ||
      user.email ||
      user._id ||
      "Unknown User"
    );
  }

  return String(user);
};

/* =====================================================
   HELPER: plan se safely string nikaalo
===================================================== */

const getPlanDisplayName = (plan) => {
  if (!plan) return "Free";

  /* Agar string hai */
  if (typeof plan === "string") {
    return plan;
  }

  /* Agar object hai (populated) */
  if (typeof plan === "object") {
    return (
      plan.name ||
      plan.planName ||
      plan._id ||
      "Free"
    );
  }

  return String(plan);
};

/* =====================================================
   COMPONENT
===================================================== */

function SubscriptionList({
  subscriptions = [],
  setActivePage,
  openSubscription,
  openEditSubscription,
  deleteSubscription,
  renewSubscription,
  cancelSubscription,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  /* =====================================================
     FILTER SUBSCRIPTIONS
  ===================================================== */

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const searchText = search.toLowerCase().trim();

      const userName = String(
        getUserDisplayName(subscription.user) || ""
      ).toLowerCase();

      const email = String(
        subscription.email || ""
      ).toLowerCase();

      const plan = String(
        getPlanDisplayName(subscription.plan) || ""
      ).toLowerCase();

      const subscriptionId = String(
        subscription.subscriptionId || ""
      ).toLowerCase();

      const transactionId = String(
        subscription.transactionId || ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        subscriptionId.includes(searchText) ||
        userName.includes(searchText) ||
        email.includes(searchText) ||
        plan.includes(searchText) ||
        transactionId.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        subscription.status === statusFilter;

      const matchesPlan =
        planFilter === "All" ||
        getPlanDisplayName(subscription.plan) === planFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        subscription.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan &&
        matchesPayment
      );
    });
  }, [
    subscriptions,
    search,
    statusFilter,
    planFilter,
    paymentFilter,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalSubscribers = subscriptions.length;

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "Active"
  ).length;

  const expiredSubscriptions = subscriptions.filter(
    (item) => item.status === "Expired"
  ).length;

  const cancelledSubscriptions = subscriptions.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const monthlyRevenue = subscriptions
    .filter(
      (item) =>
        item.status === "Active" &&
        item.paymentStatus === "Paid"
    )
    .reduce((total, item) => {
      const price = Number(item.price) || 0;

      if (item.billingCycle === "Yearly") {
        return total + price / 12;
      }

      return total + price;
    }, 0);

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "subscription-status active";

      case "Expired":
        return "subscription-status expired";

      case "Cancelled":
        return "subscription-status cancelled";

      case "Pending":
        return "subscription-status pending";

      default:
        return "subscription-status";
    }
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case "Paid":
        return "payment-status paid";

      case "Pending":
        return "payment-status pending";

      case "Failed":
        return "payment-status failed";

      case "Refunded":
        return "payment-status refunded";

      default:
        return "payment-status";
    }
  };

  const getPlanClass = (plan) => {
    const planName = getPlanDisplayName(plan);

    if (!planName) return "";

    return planName
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPlanFilter("All");
    setPaymentFilter("All");
  };

  const hasFilters =
    search.trim() ||
    statusFilter !== "All" ||
    planFilter !== "All" ||
    paymentFilter !== "All";

  /* =====================================================
     BUTTON HANDLERS
  ===================================================== */

  const handleAddSubscription = () => {
    setActivePage("add-subscription");
  };

  const handleView = (subscription) => {
    if (!subscription) return;

    openSubscription(subscription);
  };

  const handleEdit = (subscription) => {
    if (!subscription) return;

    openEditSubscription(subscription);
  };

  const handleDelete = (subscription) => {
    if (!subscription) return;

    const id =
      subscription._id ||
      subscription.id ||
      subscription.subscriptionId;

    if (!id) return;

    deleteSubscription(id);
  };

  const handleRenew = (subscription) => {
    if (!subscription) return;

    renewSubscription(subscription);
  };

  const handleCancel = (subscription) => {
    if (!subscription) return;

    cancelSubscription(subscription);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="subscription-page">

      {/* PAGE HEADER */}

      <div className="subscription-header">
        <div>
          <h1>Subscriptions</h1>

          <p>
            Manage user subscriptions, plans and payments
          </p>
        </div>

        <button
          type="button"
          className="subscription-add-btn"
          onClick={handleAddSubscription}
        >
          <Plus size={18} />

          <span>Add Subscription</span>
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="subscription-stats">

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon">
            <Users size={21} />
          </div>

          <div className="subscription-stat-content">
            <span>Total Subscribers</span>

            <strong>
              {totalSubscribers}
            </strong>

            <small>
              All subscriptions
            </small>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon success">
            <CheckCircle size={21} />
          </div>

          <div className="subscription-stat-content">
            <span>Active</span>

            <strong>
              {activeSubscriptions}
            </strong>

            <small>
              Currently active
            </small>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon warning">
            <Clock size={21} />
          </div>

          <div className="subscription-stat-content">
            <span>Expired</span>

            <strong>
              {expiredSubscriptions}
            </strong>

            <small>
              Expired subscriptions
            </small>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon revenue">
            <IndianRupee size={21} />
          </div>

          <div className="subscription-stat-content">
            <span>Monthly Revenue</span>

            <strong>
              {formatCurrency(monthlyRevenue)}
            </strong>

            <small>
              Active paid plans
            </small>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon danger">
            <XCircle size={21} />
          </div>

          <div className="subscription-stat-content">
            <span>Cancelled</span>

            <strong>
              {cancelledSubscriptions}
            </strong>

            <small>
              Cancelled plans
            </small>
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR */}

      <div className="subscription-toolbar">

        <div className="subscription-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search user, email, plan or transaction..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="subscription-search-clear"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        <div className="subscription-filters">

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Expired">
              Expired
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

            <option value="Pending">
              Pending
            </option>
          </select>

          {/* PLAN */}

          <select
            value={planFilter}
            onChange={(e) =>
              setPlanFilter(e.target.value)
            }
          >
            <option value="All">
              All Plans
            </option>

            <option value="Free">
              Free
            </option>

            <option value="Basic">
              Basic
            </option>

            <option value="Premium">
              Premium
            </option>

            <option value="Pro">
              Pro
            </option>
          </select>

          {/* PAYMENT */}

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value)
            }
          >
            <option value="All">
              All Payments
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Failed">
              Failed
            </option>

            <option value="Refunded">
              Refunded
            </option>
          </select>

          {hasFilters && (
            <button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* TABLE CARD */}

      <div className="subscription-table-card">

        <div className="subscription-table-header">

          <div>
            <h2>
              All Subscriptions
            </h2>

            <span>
              Showing {filteredSubscriptions.length} of{" "}
              {subscriptions.length}
            </span>
          </div>

          <div className="subscription-table-tools">
            <CreditCard size={18} />

            <span>
              Subscription Management
            </span>
          </div>

        </div>

        {/* TABLE */}

        <div className="subscription-table-wrapper">

          <table className="subscription-table">

            <thead>
              <tr>
                <th>Subscription</th>
                <th>User</th>
                <th>Plan</th>
                <th>Billing</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Auto Renewal</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredSubscriptions.length > 0 ? (

                filteredSubscriptions.map(
                  (subscription) => {

                    const subscriptionKey =
                      subscription._id ||
                      subscription.id ||
                      subscription.subscriptionId ||
                      Math.random();

                    /* ✅ SAFE: user aur plan se display naam nikalo */
                    const userName =
                      getUserDisplayName(subscription.user);

                    const planName =
                      getPlanDisplayName(subscription.plan);

                    /* ✅ SAFE: initial nikalo */
                    const userInitial =
                      String(userName || "U")
                        .charAt(0)
                        .toUpperCase();

                    return (
                      <tr
                        key={subscriptionKey}
                      >

                        {/* SUBSCRIPTION */}

                        <td>
                          <div className="subscription-id">

                            <div className="subscription-id-icon">
                              <CreditCard size={17} />
                            </div>

                            <div>
                              <strong>
                                {subscription.subscriptionId ||
                                  "SUB-0001"}
                              </strong>

                              <span>
                                {subscription.transactionId ||
                                  "No transaction"}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* USER */}

                        <td>
                          <div className="subscription-user">

                            <div className="subscription-avatar">
                              {userInitial}
                            </div>

                            <div>
                              <strong>
                                {userName}
                              </strong>

                              <span>
                                {subscription.email ||
                                  "No email"}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* PLAN */}

                        <td>
                          <span
                            className={`plan-badge ${getPlanClass(
                              planName
                            )}`}
                          >
                            {planName}
                          </span>
                        </td>

                        {/* BILLING */}

                        <td>
                          <div className="billing-cell">

                            <strong>
                              {subscription.billingCycle ||
                                "Monthly"}
                            </strong>

                            <span>
                              {subscription.paymentMethod ||
                                "UPI"}
                            </span>

                          </div>
                        </td>

                        {/* PRICE */}

                        <td>
                          <strong className="subscription-price">
                            {formatCurrency(
                              subscription.price
                            )}
                          </strong>
                        </td>

                        {/* START DATE */}

                        <td>
                          <span className="date-cell">
                            {formatDate(
                              subscription.startDate
                            )}
                          </span>
                        </td>

                        {/* END DATE */}

                        <td>
                          <span className="date-cell">
                            {formatDate(
                              subscription.endDate
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={getStatusClass(
                              subscription.status
                            )}
                          >
                            {subscription.status ||
                              "Pending"}
                          </span>
                        </td>

                        {/* PAYMENT */}

                        <td>
                          <span
                            className={getPaymentClass(
                              subscription.paymentStatus
                            )}
                          >
                            {subscription.paymentStatus ||
                              "Pending"}
                          </span>
                        </td>

                        {/* AUTO RENEWAL */}

                        <td>
                          <span
                            className={`renewal-badge ${
                              subscription.autoRenewal
                                ? "on"
                                : "off"
                            }`}
                          >
                            <span className="renewal-dot" />

                            {subscription.autoRenewal
                              ? "ON"
                              : "OFF"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="subscription-actions">

                            {/* VIEW */}

                            <button
                              type="button"
                              className="table-action view"
                              title="View subscription"
                              onClick={() =>
                                handleView(
                                  subscription
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              className="table-action edit"
                              title="Edit subscription"
                              onClick={() =>
                                handleEdit(
                                  subscription
                                )
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            {/* RENEW */}

                            {subscription.status !==
                              "Active" && (
                              <button
                                type="button"
                                className="table-action renew"
                                title="Renew subscription"
                                onClick={() =>
                                  handleRenew(
                                    subscription
                                  )
                                }
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}

                            {/* CANCEL */}

                            {subscription.status ===
                              "Active" && (
                              <button
                                type="button"
                                className="table-action cancel"
                                title="Cancel subscription"
                                onClick={() =>
                                  handleCancel(
                                    subscription
                                  )
                                }
                              >
                                <XCircle size={16} />
                              </button>
                            )}

                            {/* DELETE */}

                            <button
                              type="button"
                              className="table-action delete"
                              title="Delete subscription"
                              onClick={() =>
                                handleDelete(
                                  subscription
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                /* EMPTY STATE */

                <tr>

                  <td
                    colSpan="11"
                    className="subscription-empty"
                  >

                    <div className="empty-subscription">

                      <div className="empty-subscription-icon">
                        <CreditCard size={30} />
                      </div>

                      <h3>
                        No subscriptions found
                      </h3>

                      <p>
                        {hasFilters
                          ? "Try changing your search or filters."
                          : "Add your first subscription to get started."}
                      </p>

                      {hasFilters ? (

                        <button
                          type="button"
                          onClick={clearFilters}
                          className="empty-clear-btn"
                        >
                          Clear Filters
                        </button>

                      ) : (

                        <button
                          type="button"
                          onClick={
                            handleAddSubscription
                          }
                          className="empty-add-btn"
                        >
                          <Plus size={17} />

                          Add Subscription
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SubscriptionList;