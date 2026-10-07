import { useState } from "react";

import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiMusic,
  FiHeart,
  FiList,
  FiMoreVertical,
} from "react-icons/fi";

import notify from "../../utils/notify";

import "./Users.css";

const SERVER_URL = "http://localhost:5000";

/* =========================================
   GET USER ID
========================================= */

const getUserId = (user) => {
  return (
    user?._id ||
    user?.id ||
    user?.userId ||
    ""
  );
};

/* =========================================
   GET IMAGE URL
========================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("blob:")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${SERVER_URL}${image}`;
  }

  return `${SERVER_URL}/${image}`;
};

/* =========================================
   NORMALIZE USER
========================================= */

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,

    id:
      user._id ||
      user.id ||
      user.userId ||
      "",

    _id:
      user._id ||
      user.id ||
      user.userId ||
      "",

    name: user.name || "Unknown User",

    username: user.username || "",

    email: user.email || "",

    phone: user.phone || "",

    role: user.role || "User",

    plan: user.plan || "Free",

    status: user.status || "Active",

    avatar:
      user.avatar ||
      user.profileImage ||
      "",

    profileImage:
      user.profileImage ||
      user.avatar ||
      "",

    songsPlayed: Number(user.songsPlayed || 0),

    likedSongs: Number(user.likedSongs || 0),

    playlists: Number(user.playlists || 0),

    joined: user.joined || user.createdAt || "",

    lastLogin: user.lastLogin || "",
  };
};

/* =========================================
   USERS COMPONENT
   ✅ Parent "users" prop use करता है (single source of truth)
========================================= */

function Users({
  users: parentUsers = [],
  setActivePage,
  setSelectedUser,
  setEditingUser,
  openUser,
  openEditUser,
  deleteUser,
}) {
  /* ✅ Parent users — कोई local copy नहीं */
  const users = Array.isArray(parentUsers)
    ? parentUsers
    : [];

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [planFilter, setPlanFilter] =
    useState("All");

  const [selectedUsers, setSelectedUsers] =
    useState([]);

  const [openMenu, setOpenMenu] =
    useState(null);

  /* =========================================
     REFRESH — Parent को trigger करता है
  ========================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      /* Parent को refresh signal भेजो */
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("adminRefreshUsers")
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      notify.success("Users refreshed!");
    } catch (err) {
      console.error("Refresh error:", err);
      notify.error("Failed to refresh users.");
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================
     ADD USER
  ========================================= */

  const handleAddUser = () => {
    setSelectedUser?.(null);
    setEditingUser?.(null);
    setActivePage("add-user");
  };

  /* =========================================
     EDIT USER — ✅ FIXED
  ========================================= */

  const handleEditUser = (user) => {
    const normalized = normalizeUser(user);

    if (!getUserId(normalized)) {
      notify.warning("User ID not found.");
      return;
    }

    console.log(
      "🎯 handleEditUser:",
      getUserId(normalized)
    );

    /* ✅ पहले state set, फिर page change */
    if (typeof openEditUser === "function") {
      openEditUser(normalized);
    } else {
      setEditingUser?.(normalized);
      setSelectedUser?.(normalized);
      setActivePage("edit-user");
    }

    setOpenMenu(null);
  };

  /* =========================================
     VIEW USER
  ========================================= */

  const handleViewUser = (user) => {
    const normalized = normalizeUser(user);

    if (!getUserId(normalized)) {
      notify.warning("User ID not found.");
      return;
    }

    if (typeof openUser === "function") {
      openUser(normalized);
    } else {
      setSelectedUser?.(normalized);
      setActivePage("user-details");
    }

    setOpenMenu(null);
  };

  /* =========================================
     DELETE USER — Parent function use करता है
  ========================================= */

  const handleDeleteUser = async (user) => {
    const userId = getUserId(user);

    if (!userId) {
      notify.warning("User ID not found.");
      return;
    }

    /* अगर App.jsx का deleteUser function है तो use करो */
    if (typeof deleteUser === "function") {
      try {
        await deleteUser(userId);

        setSelectedUsers((prev) =>
          prev.filter((id) => id !== userId)
        );

        setOpenMenu(null);
      } catch (err) {
        console.error("Delete failed:", err);
      }
      return;
    }

    /* Fallback: खुद handle करो */
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${user.name}"?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete user."
        );
      }

      setSelectedUsers((prev) =>
        prev.filter((id) => id !== userId)
      );

      setOpenMenu(null);

      notify.success("User deleted successfully.");
    } catch (error) {
      console.error("Delete User Error:", error);

      notify.error(
        error.message || "Failed to delete user."
      );
    }
  };

  /* =========================================
     SELECT ONE USER
  ========================================= */

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }

      return [...prev, userId];
    });
  };

  /* =========================================
     SELECT ALL
  ========================================= */

  const handleSelectAll = () => {
    if (
      selectedUsers.length === filteredUsers.length
    ) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUsers(
      filteredUsers.map((user) => getUserId(user))
    );
  };

  /* =========================================
     FILTER USERS
  ========================================= */

  const filteredUsers = users.filter((user) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      String(user.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(user.username || "")
        .toLowerCase()
        .includes(searchText) ||
      String(user.email || "")
        .toLowerCase()
        .includes(searchText) ||
      String(user.phone || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      user.status === statusFilter;

    const matchesRole =
      roleFilter === "All" ||
      user.role === roleFilter;

    const matchesPlan =
      planFilter === "All" ||
      user.plan === planFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRole &&
      matchesPlan
    );
  });

  /* =========================================
     STATS
  ========================================= */

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status !== "Active"
  ).length;

  const premiumUsers = users.filter(
    (user) => user.plan === "Premium"
  ).length;

  /* =========================================
     IMAGE FALLBACK
  ========================================= */

  const handleImageError = (e) => {
    e.currentTarget.style.display = "none";

    const parent = e.currentTarget.parentElement;

    if (
      parent &&
      !parent.querySelector(".user-image-fallback")
    ) {
      const fallback =
        document.createElement("div");

      fallback.className = "user-image-fallback";

      fallback.innerHTML = "<span>U</span>";

      parent.appendChild(fallback);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h1>Users</h1>

          <p>
            Manage registered users, accounts and
            subscriptions.
          </p>
        </div>

        <div className="users-header-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw
              className={refreshing ? "loading-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="add-user-button"
            onClick={handleAddUser}
          >
            <FiPlus />
            Add User
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="users-stats">
        <div className="user-stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FiXCircle />
          </div>

          <div>
            <span>Inactive Users</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon">
            <FiStarIcon />
          </div>

          <div>
            <span>Premium Users</span>
            <strong>{premiumUsers}</strong>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="users-toolbar">
        <div className="users-search">
          <FiSearch />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="All">All Roles</option>
          <option value="User">User</option>
          <option value="Premium User">
            Premium User
          </option>
          <option value="Admin">Admin</option>
          <option value="Moderator">Moderator</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) =>
            setPlanFilter(e.target.value)
          }
        >
          <option value="All">All Plans</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
          <option value="Family">Family</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="users-table-card">
        <div className="users-table-header">
          <div>
            <h2>User List</h2>
            <span>{filteredUsers.length} users</span>
          </div>

          {selectedUsers.length > 0 && (
            <div className="selected-count">
              {selectedUsers.length} selected
            </div>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="users-empty">
            <FiUser size={48} />

            <h3>No Users Found</h3>

            <p>
              No users match your current filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setRoleFilter("All");
                setPlanFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedUsers.length ===
                          filteredUsers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const userId = getUserId(user);

                  const image = getImageUrl(
                    user.avatar || user.profileImage
                  );

                  return (
                    <tr key={userId}>
                      {/* CHECKBOX */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(
                            userId
                          )}
                          onChange={() =>
                            handleSelectUser(userId)
                          }
                        />
                      </td>

                      {/* USER */}
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {image ? (
                              <img
                                src={image}
                                alt={user.name}
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="user-image-fallback">
                                <FiUser />
                              </div>
                            )}
                          </div>

                          <div className="user-name-wrapper">
                            <strong>{user.name}</strong>

                            <span>
                              @{user.username || "username"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="user-contact">
                          <span>
                            {user.email || "No email"}
                          </span>

                          <small>
                            {user.phone || "No phone"}
                          </small>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td>
                        <span className="role-badge">
                          {user.role}
                        </span>
                      </td>

                      {/* PLAN */}
                      <td>
                        <span
                          className={`plan-badge plan-${String(
                            user.plan
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {user.plan}
                        </span>
                      </td>

                      {/* ACTIVITY */}
                      <td>
                        <div className="activity-info">
                          <span>
                            <FiMusic />
                            {user.songsPlayed}
                          </span>

                          <span>
                            <FiHeart />
                            {user.likedSongs}
                          </span>

                          <span>
                            <FiList />
                            {user.playlists}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`status-badge ${String(
                            user.status
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="status-dot"></span>
                          {user.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            title="View User"
                            onClick={() =>
                              handleViewUser(user)
                            }
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            title="Edit User"
                            onClick={() =>
                              handleEditUser(user)
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            title="Delete User"
                            className="delete-action"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                          >
                            <FiTrash2 />
                          </button>

                          <div className="user-menu-wrapper">
                            <button
                              type="button"
                              title="More"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === userId
                                    ? null
                                    : userId
                                )
                              }
                            >
                              <FiMoreVertical />
                            </button>

                            {openMenu === userId && (
                              <div className="user-dropdown">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewUser(user)
                                  }
                                >
                                  <FiEye />
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditUser(user)
                                  }
                                >
                                  <FiEdit2 />
                                  Edit User
                                </button>

                                <button
                                  type="button"
                                  className="dropdown-delete"
                                  onClick={() =>
                                    handleDeleteUser(user)
                                  }
                                >
                                  <FiTrash2 />
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================
   PREMIUM ICON
========================================= */

function FiStarIcon() {
  return <span className="premium-star">★</span>;
}

export default Users;