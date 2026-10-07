import { useEffect, useState } from "react";
import {
  CreditCard,
  User,
  Mail,
  Calendar,
  IndianRupee,
  Save,
  X,
  RefreshCw,
  Receipt,
} from "lucide-react";

import "./SubscriptionForm.css";

/* =========================================================
   HELPERS
========================================================= */

const isObjectId = (value) =>
  /^[0-9a-fA-F]{24}$/.test(String(value || "").trim());

const getUserObjectId = (user) => {
  if (!user) return "";
  return (
    user._id ||
    user.id ||
    user.userId ||
    ""
  );
};

const getPlanObjectId = (plan) => {
  if (!plan) return "";
  return (
    plan._id ||
    plan.id ||
    plan.planId ||
    ""
  );
};

/* =========================================================
   COMPONENT
========================================================= */

function SubscriptionForm({
  subscription = null,
  users = [],
  plans = [],
  setActivePage,
  onSave,
}) {
  const isEdit = Boolean(subscription);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  const getDefaultEndDate = (
    startDate,
    billingCycle
  ) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    if (billingCycle === "Yearly") {
      date.setFullYear(
        date.getFullYear() + 1
      );
      date.setDate(date.getDate() - 1);
    } else {
      date.setMonth(
        date.getMonth() + 1
      );
      date.setDate(date.getDate() - 1);
    }

    return date
      .toISOString()
      .split("T")[0];
  };

  const getPlanPrice = (
    plan,
    billingCycle
  ) => {
    if (!plan) return "";

    if (billingCycle === "Yearly") {
      return (
        plan.yearlyPrice ??
        plan.price ??
        ""
      );
    }

    return (
      plan.monthlyPrice ??
      plan.price ??
      ""
    );
  };

  /* =====================================================
     INITIAL FORM DATA
     ✅ _id ADD KIYA
  ===================================================== */

  const [formData, setFormData] = useState({
    /* ✅ MongoDB _id — edit ke waqt preserve hoga */
    _id:
      subscription?._id ||
      subscription?.id ||
      "",

    subscriptionId:
      subscription?.subscriptionId ||
      `SUB-${Date.now()
        .toString()
        .slice(-6)}`,

    userId:
      subscription?.userId ||
      getUserObjectId(
        subscription?.user
      ) ||
      "",

    user:
      subscription?.userName ||
      subscription?.user ||
      "",

    email:
      subscription?.email || "",

    planId:
      subscription?.planId ||
      getPlanObjectId(
        subscription?.plan
      ) ||
      "",

    plan:
      subscription?.planName ||
      subscription?.plan ||
      "",

    billingCycle:
      subscription?.billingCycle ||
      "Monthly",

    price:
      subscription?.price ?? "",

    startDate:
      subscription?.startDate ||
      getToday(),

    endDate:
      subscription?.endDate ||
      getDefaultEndDate(
        subscription?.startDate ||
          getToday(),
        subscription?.billingCycle ||
          "Monthly"
      ),

    status:
      subscription?.status ||
      "Active",

    paymentStatus:
      subscription?.paymentStatus ||
      "Paid",

    paymentMethod:
      subscription?.paymentMethod ||
      "UPI",

    transactionId:
      subscription?.transactionId ||
      "",

    autoRenewal:
      subscription?.autoRenewal ??
      true,

    lastPayment:
      subscription?.lastPayment ||
      getToday(),

    nextBillingDate:
      subscription?.nextBillingDate ||
      getDefaultEndDate(
        subscription?.startDate ||
          getToday(),
        subscription?.billingCycle ||
          "Monthly"
      ),
  });

  const [errors, setErrors] = useState({});

  /* =====================================================
     LOAD EDIT DATA
     ✅ _id BHI SET KIYA
  ===================================================== */

  useEffect(() => {
    if (!subscription) return;

    const startDate =
      subscription.startDate ||
      getToday();

    const billingCycle =
      subscription.billingCycle ||
      "Monthly";

    setFormData({
      /* ✅ _id set karo */
      _id:
        subscription._id ||
        subscription.id ||
        "",

      subscriptionId:
        subscription.subscriptionId ||
        "",

      userId:
        subscription.userId ||
        getUserObjectId(
          subscription.user
        ) ||
        "",

      user:
        subscription.userName ||
        subscription.user ||
        "",

      email:
        subscription.email || "",

      planId:
        subscription.planId ||
        getPlanObjectId(
          subscription.plan
        ) ||
        "",

      plan:
        subscription.planName ||
        subscription.plan ||
        "",

      billingCycle,

      price:
        subscription.price ?? "",

      startDate,

      endDate:
        subscription.endDate ||
        getDefaultEndDate(
          startDate,
          billingCycle
        ),

      status:
        subscription.status ||
        "Active",

      paymentStatus:
        subscription.paymentStatus ||
        "Paid",

      paymentMethod:
        subscription.paymentMethod ||
        "UPI",

      transactionId:
        subscription.transactionId ||
        "",

      autoRenewal:
        subscription.autoRenewal ??
        true,

      lastPayment:
        subscription.lastPayment ||
        "",

      nextBillingDate:
        subscription.nextBillingDate ||
        getDefaultEndDate(
          startDate,
          billingCycle
        ),
    });

    setErrors({});
  }, [subscription]);

  /* =====================================================
     CANCEL / CLOSE
  ===================================================== */

  const handleCancel = () => {
    setActivePage("subscriptions");
  };

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  /* =====================================================
     USER CHANGE
  ===================================================== */

  const handleUserChange = (e) => {
    const selectedUserId =
      e.target.value;

    const selectedUser = users.find(
      (user) =>
        String(
          getUserObjectId(user)
        ) === String(selectedUserId)
    );

    setFormData((previous) => ({
      ...previous,

      userId: selectedUserId,

      user:
        selectedUser?.name ||
        selectedUser?.userName ||
        selectedUser?.email ||
        "",

      email:
        selectedUser?.email || "",
    }));

    setErrors((previous) => ({
      ...previous,
      userId: "",
    }));
  };

  /* =====================================================
     PLAN CHANGE
  ===================================================== */

  const handlePlanChange = (e) => {
    const selectedPlanId =
      e.target.value;

    const selectedPlan = plans.find(
      (plan) =>
        String(
          getPlanObjectId(plan)
        ) === String(selectedPlanId)
    );

    setFormData((previous) => ({
      ...previous,

      planId: selectedPlanId,

      plan:
        selectedPlan?.name ||
        selectedPlan?.planName ||
        selectedPlanId,

      price:
        getPlanPrice(
          selectedPlan,
          previous.billingCycle
        ) ||
        previous.price,
    }));

    setErrors((previous) => ({
      ...previous,
      plan: "",
    }));
  };

  /* =====================================================
     BILLING CHANGE
  ===================================================== */

  const handleBillingChange = (e) => {
    const billingCycle =
      e.target.value;

    setFormData((previous) => {
      const selectedPlan =
        plans.find(
          (plan) =>
            String(
              getPlanObjectId(plan)
            ) ===
            String(previous.planId)
        );

      const price = selectedPlan
        ? getPlanPrice(
            selectedPlan,
            billingCycle
          )
        : previous.price;

      const endDate =
        getDefaultEndDate(
          previous.startDate,
          billingCycle
        );

      return {
        ...previous,

        billingCycle,

        price,

        endDate,

        nextBillingDate: endDate,
      };
    });
  };

  /* =====================================================
     START DATE CHANGE
  ===================================================== */

  const handleStartDateChange = (e) => {
    const startDate =
      e.target.value;

    setFormData((previous) => {
      const endDate =
        getDefaultEndDate(
          startDate,
          previous.billingCycle
        );

      return {
        ...previous,

        startDate,

        endDate,

        nextBillingDate: endDate,
      };
    });

    setErrors((previous) => ({
      ...previous,
      startDate: "",
      endDate: "",
    }));
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId && !formData.user) {
      newErrors.userId =
        "Please select a user";
    }

    if (!formData.planId && !formData.plan) {
      newErrors.plan =
        "Please select a plan";
    }

    if (
      formData.price === "" ||
      formData.price === null ||
      formData.price === undefined
    ) {
      newErrors.price =
        "Please enter price";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Please select start date";
    }

    if (!formData.endDate) {
      newErrors.endDate =
        "Please select end date";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <
        new Date(formData.startDate)
    ) {
      newErrors.endDate =
        "End date cannot be before start date";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  /* =====================================================
     SUBMIT
     ✅ _id BHI BHEJO
  ===================================================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now =
      new Date().toISOString();

    const finalUser =
      formData.userId ||
      formData.user;

    const finalPlan =
      formData.planId ||
      formData.plan;

    const finalData = {
      ...formData,

      /* ✅ _id bhejo — backend isse use karega */
      _id:
        subscription?._id ||
        subscription?.id ||
        formData._id ||
        undefined,

      subscriptionId:
        formData.subscriptionId,

      user: finalUser,
      plan: finalPlan,

      userName:
        formData.user || "",

      planName:
        formData.plan || "",

      email: formData.email,

      billingCycle:
        formData.billingCycle,

      price:
        Number(formData.price) || 0,

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      nextBillingDate:
        formData.nextBillingDate,

      status: formData.status,

      paymentStatus:
        formData.paymentStatus,

      paymentMethod:
        formData.paymentMethod,

      transactionId:
        formData.transactionId,

      autoRenewal:
        formData.autoRenewal,

      lastPayment:
        formData.lastPayment,

      createdAt:
        subscription?.createdAt ||
        now,

      updatedAt: now,
    };

    if (!isEdit) {
      delete finalData.id;
    }

    onSave?.(finalData);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="subscription-form-page">

      {/* HEADER */}

      <div className="subscription-form-header">

        <div>
          <div className="subscription-form-title-row">

            <div className="subscription-form-main-icon">
              <CreditCard size={22} />
            </div>

            <div>
              <h1>
                {isEdit
                  ? "Edit Subscription"
                  : "Add Subscription"}
              </h1>

              <p>
                {isEdit
                  ? "Update subscription and payment details"
                  : "Create a new user subscription"}
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          className="subscription-form-close"
          onClick={handleCancel}
          aria-label="Close"
        >
          <X size={18} />
        </button>

      </div>

      {/* FORM */}

      <form
        className="subscription-form"
        onSubmit={handleSubmit}
      >

        {/* USER INFORMATION */}

        <section className="subscription-form-section">

          <div className="subscription-section-heading">

            <div className="section-heading-icon">
              <User size={17} />
            </div>

            <div>
              <h2>User Information</h2>

              <p>
                Select the user who owns this subscription
              </p>
            </div>

          </div>

          <div className="subscription-form-grid">

            <div className="subscription-form-group">

              <label>
                User <span>*</span>
              </label>

              {users.length > 0 ? (
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleUserChange}
                  className={
                    errors.userId
                      ? "form-error-input"
                      : ""
                  }
                >
                  <option value="">
                    Select User
                  </option>

                  {users.map((user) => {
                    const objectId =
                      getUserObjectId(user);

                    if (!objectId) {
                      return null;
                    }

                    return (
                      <option
                        key={objectId}
                        value={objectId}
                      >
                        {user.name ||
                          user.userName ||
                          user.email}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  className={
                    errors.userId
                      ? "form-error-input"
                      : ""
                  }
                />
              )}

              {errors.userId && (
                <small className="form-error">
                  {errors.userId}
                </small>
              )}

            </div>

            <div className="subscription-form-group">

              <label>Email</label>

              <div className="form-input-with-icon">

                <Mail size={16} />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                />

              </div>

            </div>

            <div className="subscription-form-group">

              <label>
                Subscription ID
              </label>

              <input
                type="text"
                name="subscriptionId"
                value={formData.subscriptionId}
                onChange={handleChange}
                disabled
              />

            </div>

          </div>

        </section>


        {/* PLAN INFORMATION */}

        <section className="subscription-form-section">

          <div className="subscription-section-heading">

            <div className="section-heading-icon">
              <CreditCard size={17} />
            </div>

            <div>
              <h2>Plan Information</h2>

              <p>
                Choose subscription plan and billing cycle
              </p>
            </div>

          </div>

          <div className="subscription-form-grid">

            <div className="subscription-form-group">

              <label>
                Plan Name <span>*</span>
              </label>

              <select
                name="planId"
                value={formData.planId}
                onChange={handlePlanChange}
                className={
                  errors.plan
                    ? "form-error-input"
                    : ""
                }
              >

                <option value="">
                  Select Plan
                </option>

                {plans.length > 0 ? (
                  plans.map((plan) => {
                    const objectId =
                      getPlanObjectId(plan);

                    if (!objectId) {
                      return null;
                    }

                    return (
                      <option
                        key={objectId}
                        value={objectId}
                      >
                        {plan.name ||
                          plan.planName}
                      </option>
                    );
                  })
                ) : (
                  <>
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
                  </>
                )}

              </select>

              {errors.plan && (
                <small className="form-error">
                  {errors.plan}
                </small>
              )}

            </div>

            <div className="subscription-form-group">

              <label>
                Billing Cycle
              </label>

              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleBillingChange}
              >
                <option value="Monthly">
                  Monthly
                </option>

                <option value="Yearly">
                  Yearly
                </option>
              </select>

            </div>

            <div className="subscription-form-group">

              <label>
                Price <span>*</span>
              </label>

              <div className="form-input-with-icon">

                <IndianRupee size={16} />

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="199"
                  min="0"
                  className={
                    errors.price
                      ? "form-error-input"
                      : ""
                  }
                />

              </div>

              {errors.price && (
                <small className="form-error">
                  {errors.price}
                </small>
              )}

            </div>

          </div>

        </section>


        {/* DATES */}

        <section className="subscription-form-section">

          <div className="subscription-section-heading">

            <div className="section-heading-icon">
              <Calendar size={17} />
            </div>

            <div>
              <h2>Subscription Dates</h2>

              <p>
                Set subscription duration and billing dates
              </p>
            </div>

          </div>

          <div className="subscription-form-grid">

            <div className="subscription-form-group">

              <label>
                Start Date <span>*</span>
              </label>

              <div className="form-input-with-icon">

                <Calendar size={16} />

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  className={
                    errors.startDate
                      ? "form-error-input"
                      : ""
                  }
                />

              </div>

              {errors.startDate && (
                <small className="form-error">
                  {errors.startDate}
                </small>
              )}

            </div>

            <div className="subscription-form-group">

              <label>
                End Date <span>*</span>
              </label>

              <div className="form-input-with-icon">

                <Calendar size={16} />

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={
                    errors.endDate
                      ? "form-error-input"
                      : ""
                  }
                />

              </div>

              {errors.endDate && (
                <small className="form-error">
                  {errors.endDate}
                </small>
              )}

            </div>

            <div className="subscription-form-group">

              <label>
                Next Billing Date
              </label>

              <div className="form-input-with-icon">

                <Calendar size={16} />

                <input
                  type="date"
                  name="nextBillingDate"
                  value={formData.nextBillingDate}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

        </section>


        {/* STATUS */}

        <section className="subscription-form-section">

          <div className="subscription-section-heading">

            <div className="section-heading-icon">
              <RefreshCw size={17} />
            </div>

            <div>
              <h2>Status & Renewal</h2>

              <p>
                Manage subscription status and renewal
              </p>
            </div>

          </div>

          <div className="subscription-form-grid">

            <div className="subscription-form-group">

              <label>
                Subscription Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Expired">
                  Expired
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>

            </div>

            <div className="subscription-form-group">

              <label>
                Auto Renewal
              </label>

              <label className="subscription-toggle">

                <input
                  type="checkbox"
                  name="autoRenewal"
                  checked={formData.autoRenewal}
                  onChange={handleChange}
                />

                <span className="toggle-slider"></span>

                <span className="toggle-text">
                  {formData.autoRenewal
                    ? "ON"
                    : "OFF"}
                </span>

              </label>

            </div>

          </div>

        </section>


        {/* PAYMENT */}

        <section className="subscription-form-section">

          <div className="subscription-section-heading">

            <div className="section-heading-icon">
              <Receipt size={17} />
            </div>

            <div>
              <h2>Payment Information</h2>

              <p>
                Track payment and transaction details
              </p>
            </div>

          </div>

          <div className="subscription-form-grid">

            <div className="subscription-form-group">

              <label>
                Payment Status
              </label>

              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
              >
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

            </div>

            <div className="subscription-form-group">

              <label>
                Payment Method
              </label>

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="UPI">
                  UPI
                </option>

                <option value="Card">
                  Card
                </option>

                <option value="PayPal">
                  PayPal
                </option>

                <option value="Net Banking">
                  Net Banking
                </option>

                <option value="Wallet">
                  Wallet
                </option>

                <option value="Cash">
                  Cash
                </option>

              </select>

            </div>

            <div className="subscription-form-group">

              <label>
                Transaction ID
              </label>

              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="TXN123456789"
              />

            </div>

            <div className="subscription-form-group">

              <label>
                Last Payment
              </label>

              <div className="form-input-with-icon">

                <Calendar size={16} />

                <input
                  type="date"
                  name="lastPayment"
                  value={formData.lastPayment}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ACTIONS */}

        <div className="subscription-form-actions">

          <button
            type="button"
            className="subscription-cancel-btn"
            onClick={handleCancel}
          >
            <X size={17} />

            Cancel
          </button>

          <button
            type="submit"
            className="subscription-save-btn"
          >
            <Save size={17} />

            {isEdit
              ? "Update Subscription"
              : "Save Subscription"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default SubscriptionForm;