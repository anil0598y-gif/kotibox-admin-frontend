import Swal from "sweetalert2";
import "./notify.css";

/* =========================================================
   COMMON CONFIG
========================================================= */

const commonConfig = {
  customClass: {
    popup: "notify-popup",
    confirmButton: "notify-confirm-btn",
    cancelButton: "notify-cancel-btn",
  },
  buttonsStyling: false,
};

/* =========================================================
   SUCCESS — Custom SVG checkmark
========================================================= */

export const success = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: "notify-popup",
    },
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div style="
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px auto 14px;
        ">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13L9.5 17.5L19 8" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        ${
          text
            ? `<p style="font-size:14.5px;color:var(--text-secondary);line-height:1.55;margin:0;">${text}</p>`
            : ""
        }
      </div>
    `,
    didOpen: (popup) => {
      const bar = popup.querySelector(
        ".swal2-timer-progress-bar"
      );
      if (bar) {
        bar.style.background = "#10b981";
        bar.style.height = "3px";
      }
    },
  });
};

/* =========================================================
   ERROR
========================================================= */

export const error = (title, text = "") => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Okay",
    ...commonConfig,
  });
};

/* =========================================================
   WARNING
========================================================= */

export const warning = (title, text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "Okay",
    ...commonConfig,
  });
};

/* =========================================================
   INFO
========================================================= */

export const info = (title, text = "") => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "Okay",
    ...commonConfig,
  });
};

/* =========================================================
   CONFIRM
========================================================= */

export const confirm = async (
  title,
  text = "",
  confirmText = "Yes",
  cancelText = "Cancel",
  icon = "warning"
) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    ...commonConfig,
  });

  return result.isConfirmed;
};

/* =========================================================
   DELETE CONFIRM
========================================================= */

export const confirmDelete = async (
  itemName = "this item"
) => {
  return confirm(
    "Are you sure?",
    `You want to delete "${itemName}". This action cannot be undone.`,
    "Yes, delete it",
    "Cancel",
    "warning"
  );
};

/* =========================================================
   LOADING
========================================================= */

export const showLoading = (
  title = "Please wait..."
) => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: "notify-popup",
    },
  });
};

export const hideLoading = () => {
  Swal.close();
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const notify = {
  success,
  error,
  warning,
  info,
  confirm,
  confirmDelete,
  showLoading,
  hideLoading,
};

export default notify;