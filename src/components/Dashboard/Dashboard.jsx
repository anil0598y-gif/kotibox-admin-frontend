import "./Dashboard.css";

import {
  Music,
  Users,
  ListMusic,
  Mic2,
  TrendingUp,
  Play,
  CreditCard,
  UserCheck,
  UserX,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

function Dashboard({
  subscriptions = [],
  songs = [],
  users = [],
  artists = [],
  albums = [],
  playlists = [],
  setActivePage,
}) {
  /* =========================================
      SAFE ARRAYS
  ========================================= */

  const safeSongs = Array.isArray(songs) ? songs : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeArtists = Array.isArray(artists) ? artists : [];
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const safePlaylists = Array.isArray(playlists) ? playlists : [];
  const safeSubscriptions = Array.isArray(subscriptions)
    ? subscriptions
    : [];

  /* =========================================
      HELPERS
  ========================================= */

  const getStatus = (item) =>
    String(item?.status || "").toLowerCase();

  const getCreatedDate = (item) => {
    const value =
      item?.createdAt ||
      item?.createdDate ||
      item?.dateAdded ||
      item?.addedAt ||
      item?.startDate ||
      item?.updatedAt ||
      0;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const isThisMonth = (item) => {
    const timestamp = getCreatedDate(item);

    if (!timestamp) return false;

    const date = new Date(timestamp);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  /* =========================================
      SAFE USER-NAME EXTRACTOR  ✅ FIX
  ========================================= */

  const extractUserName = (subscription) => {
    const candidate =
      subscription?.user ||
      subscription?.userName ||
      subscription?.name ||
      subscription?.customer ||
      null;

    // अगर candidate एक object है
    if (candidate && typeof candidate === "object") {
      return (
        candidate.name ||
        candidate.username ||
        candidate.fullName ||
        candidate.email ||
        "Unknown User"
      );
    }

    // अगर string है
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    return "Unknown User";
  };

  const extractUserEmail = (subscription) => {
    const candidate =
      subscription?.user ||
      subscription?.email ||
      null;

    if (candidate && typeof candidate === "object") {
      return candidate.email || "No email";
    }

    if (typeof subscription?.email === "string") {
      return subscription.email;
    }

    return "No email";
  };

  /* =========================================
      MUSIC STATISTICS
  ========================================= */

  const totalSongs = safeSongs.length;
  const totalUsers = safeUsers.length;
  const totalArtists = safeArtists.length;
  const totalAlbums = safeAlbums.length;
  const totalPlaylists = safePlaylists.length;

  const activeSongs = safeSongs.filter((song) => {
    const status = getStatus(song);

    return (
      !status ||
      status === "active" ||
      status === "published"
    );
  }).length;

  const activeUsers = safeUsers.filter((user) => {
    const status = getStatus(user);

    return !status || status === "active";
  }).length;

  const songsThisMonth = safeSongs.filter(isThisMonth).length;
  const usersThisMonth = safeUsers.filter(isThisMonth).length;
  const artistsThisMonth = safeArtists.filter(isThisMonth).length;
  const playlistsThisMonth =
    safePlaylists.filter(isThisMonth).length;

  /* =========================================
      SUBSCRIPTION STATISTICS
  ========================================= */

  const totalSubscribers = safeSubscriptions.length;

  const activeSubscriptions = safeSubscriptions.filter(
    (subscription) =>
      getStatus(subscription) === "active"
  ).length;

  const expiredSubscriptions = safeSubscriptions.filter(
    (subscription) =>
      getStatus(subscription) === "expired"
  ).length;

  const cancelledSubscriptions =
    safeSubscriptions.filter(
      (subscription) =>
        getStatus(subscription) === "cancelled"
    ).length;

  const monthlyRevenue = safeSubscriptions
    .filter((subscription) => {
      const status = getStatus(subscription);

      const billingCycle = String(
        subscription?.billingCycle || ""
      ).toLowerCase();

      const paymentStatus = String(
        subscription?.paymentStatus || ""
      ).toLowerCase();

      return (
        status === "active" &&
        billingCycle === "monthly" &&
        paymentStatus === "paid"
      );
    })
    .reduce(
      (total, subscription) =>
        total + Number(subscription?.price || 0),
      0
    );

  const totalSubscriptionRevenue = safeSubscriptions
    .filter(
      (subscription) =>
        String(
          subscription?.paymentStatus || ""
        ).toLowerCase() === "paid"
    )
    .reduce(
      (total, subscription) =>
        total + Number(subscription?.price || 0),
      0
    );

  /* =========================================
      RECENT SUBSCRIPTIONS
  ========================================= */

  const recentSubscriptions = [...safeSubscriptions]
    .sort(
      (a, b) =>
        getCreatedDate(b) - getCreatedDate(a)
    )
    .slice(0, 4);

  /* =========================================
      RECENT SONGS
  ========================================= */

  const recentSongs = [...safeSongs]
    .sort(
      (a, b) =>
        getCreatedDate(b) - getCreatedDate(a)
    )
    .slice(0, 4);

  /* =========================================
      SONG DATA HELPERS
  ========================================= */

  const getSongTitle = (song) =>
    song?.title ||
    song?.name ||
    song?.songName ||
    "Untitled Song";

  const getArtistName = (song) => {
    if (typeof song?.artist === "string") {
      return song.artist;
    }

    if (typeof song?.artistName === "string") {
      return song.artistName;
    }

    if (typeof song?.artist?.name === "string") {
      return song.artist.name;
    }

    if (Array.isArray(song?.artists)) {
      return song.artists
        .map((artist) =>
          typeof artist === "string"
            ? artist
            : artist?.name
        )
        .filter(Boolean)
        .join(", ");
    }

    return "Unknown Artist";
  };

  const getSongDuration = (song) =>
    song?.duration ||
    song?.durationFormatted ||
    song?.length ||
    "--:--";

  /* =========================================
      NAVIGATION
  ========================================= */

  const openSongs = () => {
    if (setActivePage) setActivePage("songs");
  };

  const openSubscriptions = () => {
    if (setActivePage) setActivePage("subscriptions");
  };

  const openUsers = () => {
    if (setActivePage) setActivePage("users");
  };

  const openPlaylists = () => {
    if (setActivePage) setActivePage("playlists");
  };

  const openArtists = () => {
    if (setActivePage) setActivePage("artists");
  };

  return (
    <div className="dashboard">
      {/* =========================================
          DASHBOARD HEADER
      ========================================= */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back! Here's what's happening with
            your music library.
          </p>
        </div>

        <button
          className="dashboard-action"
          onClick={openSongs}
        >
          <Music size={18} />
          Music Library
        </button>
      </div>

      {/* =========================================
          MUSIC STATISTICS
      ========================================= */}

      <div className="dashboard-stats">
        {/* Total Songs */}
        <div
          className="stat-card"
          onClick={openSongs}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon">
            <Music size={22} />
          </div>

          <div className="stat-content">
            <span>Total Songs</span>

            <h3>{totalSongs.toLocaleString("en-IN")}</h3>

            <small>
              <TrendingUp size={13} />
              {songsThisMonth > 0
                ? `${songsThisMonth} added this month`
                : "No new songs this month"}
            </small>
          </div>
        </div>

        {/* Total Users */}
        <div
          className="stat-card"
          onClick={openUsers}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div className="stat-content">
            <span>Total Users</span>

            <h3>{totalUsers.toLocaleString("en-IN")}</h3>

            <small>
              <TrendingUp size={13} />
              {usersThisMonth > 0
                ? `${usersThisMonth} added this month`
                : "No new users this month"}
            </small>
          </div>
        </div>

        {/* Playlists */}
        <div
          className="stat-card"
          onClick={openPlaylists}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon">
            <ListMusic size={22} />
          </div>

          <div className="stat-content">
            <span>Playlists</span>

            <h3>{totalPlaylists.toLocaleString("en-IN")}</h3>

            <small>
              <TrendingUp size={13} />
              {playlistsThisMonth > 0
                ? `${playlistsThisMonth} added this month`
                : "No new playlists this month"}
            </small>
          </div>
        </div>

        {/* Artists */}
        <div
          className="stat-card"
          onClick={openArtists}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon">
            <Mic2 size={22} />
          </div>

          <div className="stat-content">
            <span>Artists</span>

            <h3>{totalArtists.toLocaleString("en-IN")}</h3>

            <small>
              <TrendingUp size={13} />
              {artistsThisMonth > 0
                ? `${artistsThisMonth} added this month`
                : "No new artists this month"}
            </small>
          </div>
        </div>
      </div>

      {/* =========================================
          SUBSCRIPTION OVERVIEW HEADER
      ========================================= */}

      <div className="dashboard-section-header">
        <div>
          <h2>Subscription Overview</h2>

          <p>
            Current subscription and revenue summary
          </p>
        </div>

        <button
          className="dashboard-view-button"
          onClick={openSubscriptions}
        >
          View All
          <ArrowRight size={15} />
        </button>
      </div>

      {/* =========================================
          SUBSCRIPTION STATISTICS
      ========================================= */}

      <div className="dashboard-stats subscription-stats">
        {/* Total Subscribers */}
        <div className="stat-card subscription-stat-card">
          <div className="stat-icon">
            <CreditCard size={22} />
          </div>

          <div className="stat-content">
            <span>Total Subscribers</span>

            <h3>
              {totalSubscribers.toLocaleString("en-IN")}
            </h3>

            <small>All subscriptions</small>
          </div>
        </div>

        {/* Active */}
        <div className="stat-card subscription-stat-card">
          <div className="stat-icon">
            <UserCheck size={22} />
          </div>

          <div className="stat-content">
            <span>Active</span>

            <h3>
              {activeSubscriptions.toLocaleString("en-IN")}
            </h3>

            <small>Currently active</small>
          </div>
        </div>

        {/* Expired */}
        <div className="stat-card subscription-stat-card">
          <div className="stat-icon">
            <UserX size={22} />
          </div>

          <div className="stat-content">
            <span>Expired</span>

            <h3>
              {expiredSubscriptions.toLocaleString("en-IN")}
            </h3>

            <small>Expired subscriptions</small>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="stat-card subscription-stat-card">
          <div className="stat-icon">
            <IndianRupee size={22} />
          </div>

          <div className="stat-content">
            <span>Monthly Revenue</span>

            <h3>
              ₹{monthlyRevenue.toLocaleString("en-IN")}
            </h3>

            <small>Paid monthly plans</small>
          </div>
        </div>
      </div>

      {/* =========================================
          CANCELLED SUBSCRIPTIONS
      ========================================= */}

      <div className="subscription-summary-bar">
        <div className="subscription-summary-item">
          <span>Cancelled Subscriptions</span>

          <strong>
            {cancelledSubscriptions.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="subscription-summary-item">
          <span>Total Subscription Revenue</span>

          <strong>
            ₹{totalSubscriptionRevenue.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      {/* =========================================
          RECENT SUBSCRIPTIONS
      ========================================= */}

      {recentSubscriptions.length > 0 && (
        <div className="dashboard-card recent-subscriptions-card">
          <div className="card-header">
            <div>
              <h2>Recent Subscriptions</h2>

              <p>Latest subscription activity</p>
            </div>

            <button
              className="view-all-btn"
              onClick={openSubscriptions}
            >
              View All
            </button>
          </div>

          <div className="subscription-list">
            {recentSubscriptions.map(
              (subscription, index) => {
                const userName =
                  extractUserName(subscription); // ✅ FIX

                const userEmail =
                  extractUserEmail(subscription); // ✅ FIX

                const planName =
                  typeof subscription?.plan === "object"
                    ? subscription?.plan?.name ||
                      subscription?.plan?.planName ||
                      "No Plan"
                    : subscription?.plan ||
                      subscription?.planName ||
                      "No Plan";

                const status =
                  typeof subscription?.status === "object"
                    ? subscription?.status?.name ||
                      "Pending"
                    : subscription?.status || "Pending";

                return (
                  <div
                    className="subscription-row"
                    key={
                      subscription?.id ||
                      subscription?.subscriptionId ||
                      subscription?._id ||
                      index
                    }
                  >
                    <div className="subscription-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="subscription-avatar">
                      {String(userName)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="subscription-user-info">
                      <strong>{userName}</strong>

                      <span>{userEmail}</span>
                    </div>

                    <div className="subscription-plan-info">
                      <span>{planName}</span>

                      <small>
                        {typeof subscription?.billingCycle ===
                        "object"
                          ? subscription?.billingCycle?.name ||
                            "Monthly"
                          : subscription?.billingCycle ||
                            "Monthly"}
                      </small>
                    </div>

                    <div className="subscription-price">
                      ₹
                      {Number(
                        subscription?.price || 0
                      ).toLocaleString("en-IN")}
                    </div>

                    <div
                      className={`subscription-status status-${String(
                        status
                      ).toLowerCase()}`}
                    >
                      {String(status)}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* =========================================
          DASHBOARD CONTENT
      ========================================= */}

      <div className="dashboard-content">
        {/* =========================================
            RECENT SONGS
        ========================================= */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Recent Songs</h2>

              <p>
                Recently added songs to your library
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={openSongs}
            >
              View All
            </button>
          </div>

          <div className="song-list">
            {recentSongs.length > 0 ? (
              recentSongs.map((song, index) => (
                <div
                  className="song-row"
                  key={
                    song?.id ||
                    song?.songId ||
                    song?._id ||
                    index
                  }
                >
                  <div className="song-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="song-icon">
                    <Music size={18} />
                  </div>

                  <div className="song-info">
                    <strong>{getSongTitle(song)}</strong>

                    <span>{getArtistName(song)}</span>
                  </div>

                  <span className="song-duration">
                    {getSongDuration(song)}
                  </span>

                  <button
                    className="play-btn"
                    type="button"
                    title="Play"
                  >
                    <Play size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="dashboard-empty-state">
                <Music size={24} />
                <span>No songs added yet</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            QUICK OVERVIEW
        ========================================= */}

        <div className="dashboard-card quick-stats">
          <div className="card-header">
            <div>
              <h2>Quick Overview</h2>
              <p>Music library summary</p>
            </div>
          </div>

          {/* Active Songs */}
          <div className="overview-item">
            <div className="overview-icon">
              <Music size={18} />
            </div>

            <div>
              <span>Active Songs</span>
              <strong>
                {activeSongs.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Active Users */}
          <div className="overview-item">
            <div className="overview-icon">
              <Users size={18} />
            </div>

            <div>
              <span>Active Users</span>
              <strong>
                {activeUsers.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Total Playlists */}
          <div className="overview-item">
            <div className="overview-icon">
              <ListMusic size={18} />
            </div>

            <div>
              <span>Total Playlists</span>
              <strong>
                {totalPlaylists.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Total Artists */}
          <div className="overview-item">
            <div className="overview-icon">
              <Mic2 size={18} />
            </div>

            <div>
              <span>Total Artists</span>
              <strong>
                {totalArtists.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Total Albums */}
          <div className="overview-item">
            <div className="overview-icon">
              <Music size={18} />
            </div>

            <div>
              <span>Total Albums</span>
              <strong>
                {totalAlbums.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;