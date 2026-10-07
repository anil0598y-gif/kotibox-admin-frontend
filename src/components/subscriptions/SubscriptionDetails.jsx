import {
  X,
  CreditCard,
  User,
  Mail,
  Calendar,
  IndianRupee,
  Receipt,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  Ban,
} from "lucide-react";

import "./SubscriptionDetails.css";

/* =====================================================
   HELPER: user se display naam nikalo
   (string, object, null — sab handle kare)
===================================================== */

const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";

  if (typeof user === "string") {
    return user;
  }

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
   HELPER: plan se display naam nikalo
===================================================== */

const getPlanDisplayName = (plan) => {
  if (!plan) return "Free";

  if (typeof plan === "string") {
    return plan;
  }

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
   HELPER: subscription ka ID nikalo
===================================================== */

const getSubscriptionId = (subscription) => {
  if (!subscription) return "";

  return (
    subscription._id ||
    subscription.id ||
    subscription.subscriptionId ||
    ""
  );
};

/* =====================================================
   COMPONENT
===================================================== */

function SubscriptionDetails({
  subscription,
  setActivePage,
  openEditSubscription,
  renewSubscription,
  cancelSubscription,
  deleteSubscription,
}) {
  if (!subscription) {
    return null;
  }

  /* =====================================================
     HELPERS
  ===================================================== */

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusIcon = () => {
    switch (subscription.status) {
      case "Active":
        return <CheckCircle size={16} />;

      case "Expired":
        return <Clock size={16} />;

      case "Cancelled":
        return <X size={16} />;

      case "Pending":
        return <AlertCircle size={16} />;

      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusClass = () => {
    switch (subscription.status) {
      case "Active":
        return "details-status active";

      case "Expired":
        return "details-status expired";

      case "Cancelled":
        return "details-status cancelled";

      case "Pending":
        return "details-status pending";

      default:
        return "details-status";
    }
  };

  /* =====================================================
     PAYMENT STATUS
  ===================================================== */

  const getPaymentClass = () => {
    switch (subscription.paymentStatus) {
      case "Paid":
        return "details-payment paid";

      case "Pending":
        return "details-payment pending";

      case "Failed":
        return "details-payment failed";

      case "Refunded":
        return "details-payment refunded";

      default:
        return "details-payment";
    }
  };

  /* =====================================================
     USER DATA
     ✅ Safe — user object hai to bhi naam nikalega
  ===================================================== */

  const userName =
    getUserDisplayName(subscription.user);

  /* ✅ Email: pehle subscription.email, phir user object se */
  const userEmail =
    subscription.email ||
    (typeof subscription.user === "object"
      ? subscription.user?.email
      : "") ||
    "No email available";

  /* ✅ User ID: pehle subscription.userId, phir user object se */
  const userId =
    subscription.userId ||
    (typeof subscription.user === "object"
      ? subscription.user?._id
      : "") ||
    "-";

  /* ✅ Plan name — object ya string dono handle */
  const planName =
    getPlanDisplayName(subscription.plan);

  /* ✅ Safe initials */
  const initials = String(
    userName || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  /* =====================================================
     BUTTON HANDLERS
  ===================================================== */

  const handleClose = () => {
    setActivePage("subscriptions");
  };

  const handleEdit = () => {
    openEditSubscription(subscription);
  };

  const handleRenew = () => {
    renewSubscription(subscription);
  };

  const handleCancel = () => {
    cancelSubscription(subscription);
  };

  const handleDelete = () => {
    const id = getSubscriptionId(subscription);

    if (!id) return;

    deleteSubscription(id);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="subscription-details-overlay"
      onClick={handleClose}
    >

      <div
        className="subscription-details-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="subscription-details-header">

          <div className="subscription-details-title">

            <div className="subscription-details-icon">
              <CreditCard size={21} />
            </div>

            <div>
              <h2>
                Subscription Details
              </h2>

              <span>
                {subscription.subscriptionId ||
                  "SUB-0001"}
              </span>
            </div>

          </div>

          <div className="subscription-details-header-actions">

            <button
              type="button"
              className="details-edit-btn"
              onClick={handleEdit}
            >
              <Pencil size={15} />

              Edit
            </button>

            <button
              type="button"
              className="details-close-btn"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={19} />
            </button>

          </div>

        </div>


        {/* USER PROFILE */}

        <div className="subscription-user-profile">

          <div className="details-user-avatar">
            {initials}
          </div>

          <div className="details-user-info">

            <h3>
              {userName}
            </h3>

            <div className="details-user-email">

              <Mail size={14} />

              <span>
                {userEmail}
              </span>

            </div>

          </div>

          <div className="details-current-status">

            <span
              className={getStatusClass()}
            >
              {getStatusIcon()}

              {subscription.status ||
                "Pending"}
            </span>

          </div>

        </div>


        {/* PLAN SUMMARY */}

        <div className="subscription-plan-summary">

          <div className="plan-summary-main">

            <span className="plan-summary-label">
              Current Plan
            </span>

            <h3>
              {planName}
            </h3>

            <span className="plan-summary-cycle">
              {subscription.billingCycle ||
                "Monthly"}{" "}
              Billing
            </span>

          </div>

          <div className="plan-summary-price">

            <span>
              Price
            </span>

            <strong>
              {formatCurrency(
                subscription.price
              )}
            </strong>

            <small>
              /{" "}
              {(
                subscription.billingCycle ||
                "Monthly"
              ).toLowerCase()}
            </small>

          </div>

        </div>


        {/* INFORMATION GRID */}

        <div className="subscription-details-grid">

          {/* START DATE */}

          <div className="details-info-card">

            <div className="details-info-icon">
              <Calendar size={16} />
            </div>

            <div>
              <span>
                Start Date
              </span>

              <strong>
                {formatDate(
                  subscription.startDate
                )}
              </strong>
            </div>

          </div>


          {/* END DATE */}

          <div className="details-info-card">

            <div className="details-info-icon">
              <Calendar size={16} />
            </div>

            <div>
              <span>
                End Date
              </span>

              <strong>
                {formatDate(
                  subscription.endDate
                )}
              </strong>
            </div>

          </div>


          {/* NEXT BILLING */}

          <div className="details-info-card">

            <div className="details-info-icon">
              <RefreshCw size={16} />
            </div>

            <div>
              <span>
                Next Billing
              </span>

              <strong>
                {formatDate(
                  subscription.nextBillingDate
                )}
              </strong>
            </div>

          </div>


          {/* LAST PAYMENT */}

          <div className="details-info-card">

            <div className="details-info-icon">
              <IndianRupee size={16} />
            </div>

            <div>
              <span>
                Last Payment
              </span>

              <strong>
                {formatDate(
                  subscription.lastPayment
                )}
              </strong>
            </div>

          </div>

        </div>


        {/* PAYMENT DETAILS */}

        <div className="subscription-details-section">

          <div className="details-section-title">

            <div>
              <Receipt size={17} />
            </div>

            <h3>
              Payment Information
            </h3>

          </div>

          <div className="details-payment-grid">

            <div className="details-payment-item">

              <span>
                Payment Status
              </span>

              <strong
                className={getPaymentClass()}
              >
                {subscription.paymentStatus ||
                  "Pending"}
              </strong>

            </div>

            <div className="details-payment-item">

              <span>
                Payment Method
              </span>

              <strong>
                {subscription.paymentMethod ||
                  "UPI"}
              </strong>

            </div>

            <div className="details-payment-item">

              <span>
                Transaction ID
              </span>

              <strong className="transaction-id">
                {subscription.transactionId ||
                  "No transaction ID"}
              </strong>

            </div>

            <div className="details-payment-item">

              <span>
                Amount
              </span>

              <strong>
                {formatCurrency(
                  subscription.price
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* RENEWAL INFORMATION */}

        <div className="subscription-details-section">

          <div className="details-section-title">

            <div>
              <RefreshCw size={17} />
            </div>

            <h3>
              Renewal Information
            </h3>

          </div>

          <div className="renewal-details-row">

            <div className="renewal-detail">

              <span>
                Auto Renewal
              </span>

              <strong
                className={
                  subscription.autoRenewal
                    ? "renewal-on"
                    : "renewal-off"
                }
              >
                <span className="renewal-status-dot" />

                {subscription.autoRenewal
                  ? "Enabled"
                  : "Disabled"}
              </strong>

            </div>

            <div className="renewal-detail">

              <span>
                Billing Cycle
              </span>

              <strong>
                {subscription.billingCycle ||
                  "Monthly"}
              </strong>

            </div>

            <div className="renewal-detail">

              <span>
                Next Billing Date
              </span>

              <strong>
                {formatDate(
                  subscription.nextBillingDate
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* USER / SUBSCRIPTION META */}

        <div className="subscription-meta">

          <div className="meta-item">

            <User size={14} />

            <span>
              User ID:
            </span>

            <strong>
              {userId}
            </strong>

          </div>

          <div className="meta-item">

            <CreditCard size={14} />

            <span>
              Subscription ID:
            </span>

            <strong>
              {subscription.subscriptionId ||
                "-"}
            </strong>

          </div>

          <div className="meta-item">

            <Calendar size={14} />

            <span>
              Created:
            </span>

            <strong>
              {formatDate(
                subscription.createdAt
              )}
            </strong>

          </div>

        </div>


        {/* FOOTER ACTIONS */}

        <div className="subscription-details-footer">

          <button
            type="button"
            className="details-footer-close"
            onClick={handleClose}
          >
            Close
          </button>

          <div className="details-footer-actions">

            {/* CANCEL */}

            {subscription.status ===
              "Active" && (
              <button
                type="button"
                className="details-footer-cancel"
                onClick={handleCancel}
              >
                <Ban size={15} />

                Cancel
              </button>
            )}

            {/* RENEW */}

            {subscription.status !==
              "Active" && (
              <button
                type="button"
                className="details-footer-renew"
                onClick={handleRenew}
              >
                <RefreshCw size={15} />

                Renew
              </button>
            )}

            {/* DELETE */}

            <button
              type="button"
              className="details-footer-delete"
              onClick={handleDelete}
            >
              <Trash2 size={15} />

              Delete
            </button>

            {/* EDIT */}

            <button
              type="button"
              className="details-footer-edit"
              onClick={handleEdit}
            >
              <Pencil size={15} />

              Edit Subscription
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SubscriptionDetails;