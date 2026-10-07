import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Music,
  PlusCircle,
  ListMusic,
  Users,
  Mic2,
  Disc3,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Layers,
  User,
  CircleUserRound,
  ShieldCheck,
  Megaphone,
} from "lucide-react";

/* ✅ Swal → notify */
import notify from "../../utils/notify";

import logo from "../../assets/download.png";

import "./Sidebar.css";

function Sidebar({
  activePage,
  setActivePage,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =========================================
     SIDEBAR STYLE
  ========================================= */

  const [sidebarStyle, setSidebarStyle] = useState(() => {
    try {
      const saved = localStorage.getItem("appearanceSettings");

      if (saved) {
        const parsed = JSON.parse(saved);

        return (
          parsed.sidebarStyle ||
          localStorage.getItem("sidebarStyle") ||
          "expanded"
        );
      }

      return (
        localStorage.getItem("sidebarStyle") ||
        "expanded"
      );
    } catch (error) {
      return "expanded";
    }
  });

  /* =========================================
     SUBSCRIPTION OPEN
  ========================================= */

  const [subscriptionOpen, setSubscriptionOpen] =
    useState(
      activePage === "subscriptions" ||
        activePage === "add-subscription" ||
        activePage === "edit-subscription" ||
        activePage === "subscription-details" ||
        activePage === "plans" ||
        activePage === "add-plan" ||
        activePage === "edit-plan"
    );

  /* =========================================
     ADS OPEN
  ========================================= */

  const [adsOpen, setAdsOpen] = useState(
    activePage === "ads" ||
      activePage === "add-ad" ||
      activePage === "edit-ad" ||
      activePage === "view-ad" ||
      activePage === "ad-networks"
  );

  /* =========================================
     PROFILE OPEN
  ========================================= */

  const [profileOpen, setProfileOpen] = useState(false);

  /* =========================================
     WATCH ACTIVE PAGE
  ========================================= */

  useEffect(() => {
    const subscriptionPages = [
      "subscriptions",
      "add-subscription",
      "edit-subscription",
      "subscription-details",
      "plans",
      "add-plan",
      "edit-plan",
    ];

    const adPages = [
      "ads",
      "add-ad",
      "edit-ad",
      "view-ad",
      "ad-networks",
    ];

    if (subscriptionPages.includes(activePage)) {
      setSubscriptionOpen(true);
    }

    if (adPages.includes(activePage)) {
      setAdsOpen(true);
    }
  }, [activePage]);

  /* =========================================
     WATCH APPEARANCE SETTINGS
  ========================================= */

  useEffect(() => {
    const readSidebarStyle = () => {
      try {
        const saved =
          localStorage.getItem("appearanceSettings");

        if (saved) {
          const parsed = JSON.parse(saved);

          if (
            parsed.sidebarStyle &&
            [
              "expanded",
              "collapsed",
              "mini",
            ].includes(parsed.sidebarStyle)
          ) {
            setSidebarStyle(parsed.sidebarStyle);
            return;
          }
        }

        const directStyle =
          localStorage.getItem("sidebarStyle");

        if (
          [
            "expanded",
            "collapsed",
            "mini",
          ].includes(directStyle)
        ) {
          setSidebarStyle(directStyle);
        }
      } catch (error) {
        console.error(
          "Sidebar style read error:",
          error
        );
      }
    };

    readSidebarStyle();

    const handleStorage = (event) => {
      if (
        event.key === "appearanceSettings" ||
        event.key === "sidebarStyle"
      ) {
        readSidebarStyle();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    const observer = new MutationObserver(() => {
      const root = document.documentElement;

      const currentStyle =
        root.getAttribute("data-sidebar-style");

      if (
        [
          "expanded",
          "collapsed",
          "mini",
        ].includes(currentStyle)
      ) {
        setSidebarStyle(currentStyle);
      }
    });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-sidebar-style",
        ],
      }
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      observer.disconnect();
    };
  }, []);

  /* =========================================
     APPLY SIDEBAR CLASS
  ========================================= */

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove(
      "sidebar-expanded",
      "sidebar-collapsed",
      "sidebar-mini"
    );

    root.classList.add(
      `sidebar-${sidebarStyle}`
    );

    root.setAttribute(
      "data-sidebar-style",
      sidebarStyle
    );
  }, [sidebarStyle]);

  /* =========================================
     MAIN MENU ITEMS
  ========================================= */

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "songs",
      label: "Song Library",
      icon: Music,
    },

    {
      id: "add-song",
      label: "Add Song",
      icon: PlusCircle,
    },

    {
      id: "playlists",
      label: "Playlists",
      icon: ListMusic,
    },

    {
      id: "artists",
      label: "Artists",
      icon: Mic2,
    },

    {
      id: "albums",
      label: "Albums",
      icon: Disc3,
    },

    {
      id: "media",
      label: "Media Library",
      icon: Image,
    },

    {
      id: "users",
      label: "Users",
      icon: Users,
    },
  ];

  /* =========================================
     SUBSCRIPTION PAGES
  ========================================= */

  const subscriptionPages = [
    "subscriptions",
    "add-subscription",
    "edit-subscription",
    "subscription-details",
    "plans",
    "add-plan",
    "edit-plan",
  ];

  const isSubscriptionActive =
    subscriptionPages.includes(activePage);

  /* =========================================
     ADS PAGES
  ========================================= */

  const adsPages = [
    "ads",
    "add-ad",
    "edit-ad",
    "view-ad",
    "ad-networks",
  ];

  const isAdsActive =
    adsPages.includes(activePage);

  /* =========================================
     MAIN MENU CLICK
  ========================================= */

  const handleMenuClick = (id) => {
    setActivePage(id);

    setMobileOpen(false);

    setProfileOpen(false);
  };

  /* =========================================
     SUBSCRIPTION TOGGLE
  ========================================= */

  const handleSubscriptionToggle = () => {
    setSubscriptionOpen(
      (prev) => !prev
    );
  };

  /* =========================================
     SUBSCRIPTION PAGE
  ========================================= */

  const handleSubscriptionPage = (id) => {
    setActivePage(id);

    setMobileOpen(false);

    setProfileOpen(false);
  };

  /* =========================================
     ADS TOGGLE
  ========================================= */

  const handleAdsToggle = () => {
    setAdsOpen(
      (prev) => !prev
    );
  };

  /* =========================================
     ADS PAGE
  ========================================= */

  const handleAdsPage = (id) => {
    setActivePage(id);

    setMobileOpen(false);

    setProfileOpen(false);
  };

  /* =========================================
     SETTINGS
  ========================================= */

  const handleSettings = () => {
    setActivePage("settings");

    setMobileOpen(false);

    setProfileOpen(false);
  };

  /* =========================================
     MY PROFILE
  ========================================= */

  const handleProfile = () => {
    setActivePage("admin-profile");

    setProfileOpen(false);

    setMobileOpen(false);
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    /* ✅ Swal → notify.confirm */
    const confirmed = await notify.confirm(
      "Logout?",
      "Are you sure you want to logout?",
      "Yes, Logout",
      "Cancel",
      "warning"
    );

    if (!confirmed) return;

    /* सारी admin keys clear करो */
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUserId");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("adminProfile");
    localStorage.removeItem("adminProfileImage");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("rememberAdmin");

    if (onLogout) {
      onLogout();
    }

    /* ✅ Swal → notify.success */
    notify.success(
      "Logged Out!",
      "You have been logged out successfully."
    );
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar sidebar-${sidebarStyle} ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="sidebar-header">
          {/* LOGO */}
          <div className="sidebar-logo">
            <img
              src={logo}
              alt="Music Admin"
              className="sidebar-logo-image"
            />
          </div>

          {/* BRAND */}
          <div className="sidebar-brand">
            <h2>Kotibox</h2>
            <span>Admin Panel</span>
          </div>

          {/* MOBILE CLOSE */}
          <button
            className="sidebar-close-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {/* MAIN MENU TITLE */}
          <div className="nav-section-title">
            MAIN MENU
          </div>

          {/* MAIN MENU */}
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`sidebar-menu-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() =>
                  handleMenuClick(item.id)
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            );
          })}

          {/* SUBSCRIPTIONS */}
          <div className="subscription-menu-wrapper">
            <button
              className={`sidebar-menu-item subscription-main-item ${
                isSubscriptionActive ? "active" : ""
              }`}
              onClick={handleSubscriptionToggle}
            >
              <CreditCard size={19} />

              <span>Subscriptions</span>

              <span className="subscription-arrow">
                {subscriptionOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </button>

            {/* SUBSCRIPTION SUBMENU */}
            {subscriptionOpen && (
              <div className="subscription-submenu">
                <button
                  className={`sidebar-submenu-item ${
                    activePage === "subscriptions" ||
                    activePage === "add-subscription" ||
                    activePage === "edit-subscription" ||
                    activePage === "subscription-details"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSubscriptionPage(
                      "subscriptions"
                    )
                  }
                >
                  <CreditCard size={16} />

                  <span>All Subscriptions</span>
                </button>

                <button
                  className={`sidebar-submenu-item ${
                    activePage === "plans" ||
                    activePage === "add-plan" ||
                    activePage === "edit-plan"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSubscriptionPage("plans")
                  }
                >
                  <Layers size={16} />

                  <span>Plans</span>
                </button>
              </div>
            )}
          </div>

          {/* ADS */}
          <div className="ads-menu-wrapper">
            <button
              className={`sidebar-menu-item ads-main-item ${
                isAdsActive ? "active" : ""
              }`}
              onClick={handleAdsToggle}
            >
              <Megaphone size={19} />

              <span>Ads</span>

              <span className="ads-arrow">
                {adsOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </button>

            {/* ADS SUBMENU */}
            {adsOpen && (
              <div className="ads-submenu">
                <button
                  className={`sidebar-submenu-item ${
                    activePage === "ads" ||
                    activePage === "add-ad" ||
                    activePage === "edit-ad" ||
                    activePage === "view-ad"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleAdsPage("ads")}
                >
                  <Megaphone size={16} />

                  <span>Manual Ads</span>
                </button>

                <button
                  className={`sidebar-submenu-item ${
                    activePage === "ad-networks"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleAdsPage("ad-networks")
                  }
                >
                  <Layers size={16} />

                  <span>Ad Networks</span>
                </button>
              </div>
            )}
          </div>

          {/* SYSTEM */}
          <div className="nav-section-title settings-title">
            SYSTEM
          </div>

          {/* SETTINGS */}
          <button
            className={`sidebar-menu-item ${
              activePage === "settings" ? "active" : ""
            }`}
            onClick={handleSettings}
          >
            <Settings size={19} />

            <span>Settings</span>
          </button>
        </nav>

        {/* ADMIN PROFILE FOOTER */}
        <div className="sidebar-footer">
          <div className="admin-profile-wrapper">
            {/* PROFILE BUTTON */}
            <button
              className={`admin-profile ${
                activePage === "admin-profile"
                  ? "profile-active"
                  : ""
              }`}
              onClick={() =>
                setProfileOpen((prev) => !prev)
              }
            >
              {/* AVATAR */}
              <div className="admin-avatar-wrapper">
                <div className="admin-avatar">
                  <User size={20} />
                </div>

                <span className="admin-online-dot"></span>
              </div>

              {/* ADMIN INFORMATION */}
              <div className="admin-info">
                <strong>Admin</strong>

                <span>
                  <ShieldCheck size={12} />
                  Administrator
                </span>
              </div>

              {/* ARROW */}
              <span className="profile-chevron">
                {profileOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="admin-profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    <User size={20} />
                  </div>

                  <div>
                    <strong>Admin</strong>
                    <span>Administrator</span>
                  </div>
                </div>

                <div className="profile-dropdown-divider"></div>

                <button
                  className="profile-dropdown-item"
                  onClick={handleProfile}
                >
                  <CircleUserRound size={17} />

                  <span>My Profile</span>
                </button>

                <button
                  className="profile-dropdown-item"
                  onClick={handleSettings}
                >
                  <Settings size={17} />

                  <span>Account Settings</span>
                </button>

                <div className="profile-dropdown-divider"></div>

                <button
                  className="profile-dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />

                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;