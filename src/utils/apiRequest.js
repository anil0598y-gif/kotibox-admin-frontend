/* =========================================================
   API REQUEST WITH AUTO 401 HANDLING
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   FORCE LOGOUT — सारी admin keys clear
========================================================= */

const forceLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminId");
  localStorage.removeItem("adminUserId");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("adminProfile");
  localStorage.removeItem("adminProfileImage");
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.removeItem("rememberAdmin");
};

/* =========================================================
   GET AUTH HEADERS
========================================================= */

export const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...extra,
  };
};

/* =========================================================
   API REQUEST
========================================================= */

export const apiRequest = async (
  url,
  options = {}
) => {
  const token = localStorage.getItem("adminToken");

  const isFormData =
    options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,

    headers: {
      ...(isFormData
        ? {} /* FormData → browser sets Content-Type */
        : { "Content-Type": "application/json" }),

      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),

      ...(options.headers || {}),
    },
  });

  /* ✅ Token invalid/expired → auto logout */
  if (response.status === 401) {
    console.warn(
      "⚠️ Session expired — auto logout"
    );

    forceLogout();

    /* Login page पर redirect */
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    } else {
      window.location.reload();
    }

    throw new Error("Session expired");
  }

  return response;
};

export { API_BASE_URL, forceLogout };