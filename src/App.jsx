import Login from "./components/auth/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminProfile from "./components/adminprofile/AdminProfile";
import SongLibrary from "./components/SongLibrary/SongLibrary";
import AddSong from "./components/addsong/AddSong"; 
import EditSong from "./components/EditSong/EditSong";
import Playlist from "./components/playlist/Playlist";
import PlaylistView from "./components/playlist/PlaylistView";
import AddPlaylist from "./components/playlist/AddPlaylist";
import EditPlaylist from "./components/playlist/EditPlaylist";
import SongPlayer from "./components/songplayer/SongPlayer";
import Artists from "./components/artists/Artists";
import AddArtist from "./components/artists/AddArtist";
import EditArtist from "./components/artists/EditArtist";
import ArtistView from "./components/artists/ArtistView";
import Albums from "./components/albums/Albums";
import AddAlbum from "./components/albums/AddAlbum";
import EditAlbum from "./components/albums/EditAlbum";
import AlbumView from "./components/albums/AlbumView";
import MediaLibrary from "./components/media/MediaLibrary";
import AddMedia from "./components/media/AddMedia";
import EditMedia from "./components/media/EditMedia";
import MediaView from "./components/media/MediaView";
import Users from "./components/users/Users";
import AddUser from "./components/users/AddUser";
import EditUser from "./components/users/EditUser";
import UserDetails from "./components/users/UserDetails";
import Settings from "./components/settings/Settings";
import SubscriptionList from "./components/subscriptions/SubscriptionList";
import SubscriptionForm from "./components/subscriptions/SubscriptionForm";
import SubscriptionDetails from "./components/subscriptions/SubscriptionDetails";
import PlanList from "./components/subscriptions/PlanList";
import PlanForm from "./components/subscriptions/PlanForm";
import Ads from "./components/ads/Ads";
import AdNetworks from "./components/ads/AdNetworks";
import AddAd from "./components/ads/AddAd";
import ViewAd from "./components/ads/ViewAd";
import notify from "./utils/notify";
import "./App.css";/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "");

/* =========================================================
   HELPERS
========================================================= */

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    if (!payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);

    return payload.exp < now;
  } catch {
    return true;
  }
};

const getRecordId = (item) => {
  if (!item) return "";

  if (item._id !== undefined && item._id !== null) {
    return String(item._id);
  }

  if (item.id !== undefined && item.id !== null) {
    return String(item.id);
  }

  if (item.userId !== undefined && item.userId !== null) {
    return String(item.userId);
  }

  return "";
};

const getObjectIdString = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        value.userId ||
        value.planId ||
        ""
    );
  }

  return String(value);
};

const toServerUrl = (url) => {
  if (!url) return "";

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  return `${SERVER_BASE_URL}${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

/* =========================================================
   FILE -> MEDIA LIBRARY
========================================================= */

const fileToMedia = async (file, usedFor, extra = {}) => {
  if (!(file instanceof Blob)) {
    return null;
  }

  const form = new FormData();

  form.append("file", file);

  const mediaData = {
    title:
      extra.title ||
      file.name?.replace(/\.[^/.]+$/, "") ||
      "",
    usedFor: usedFor || "Other",
    artist: extra.artist || "",
    album: extra.album || "",
    genre: extra.genre || "",
    language: extra.language || "",
    duration: extra.duration || "",
    status: "Active",
  };

  Object.entries(mediaData).forEach(([key, value]) => {
    form.append(key, value ?? "");
  });

  const response = await fetch(`${API_BASE_URL}/media`, {
    method: "POST",
    body: form,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.message ||
        `Media upload failed (${response.status})`
    );
  }

  return payload.data || payload;
};

/* =========================================================
   JSON REQUEST
========================================================= */

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.message ||
        `Request failed (${response.status})`
    );
  }

  return payload?.data ?? payload;
};

/* =========================================================
   CLEAN PAYLOAD
========================================================= */

const cleanPayload = (value = {}, options = {}) => {
  const clean = { ...value };

  const { preserveFiles = false } = options;

  const baseRemoveKeys = [
    "_id",
    "__v",
    "id",
    "fileObject",
    "mediaFile",
    "thumbnailFile",
    "imageRemoved",
    "coverRemoved",
    "removeImage",
    "removeFile",
    "selectedImage",
    "selectedAudio",
    "coverMedia",
    "audioMedia",
    "musicVideo",
    "lyricVideo",
    "lyricsFile",
  ];

  const fileRemoveKeys = [
    "imageFile",
    "coverFile",
    "audioFile",
    "file",
    "coverImage",
  ];

  baseRemoveKeys.forEach((key) => {
    delete clean[key];
  });

  if (!preserveFiles) {
    fileRemoveKeys.forEach((key) => {
      delete clean[key];
    });
  }

  return clean;
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeSong = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  imageUrl: toServerUrl(
    item.imageUrl || item.image || item.coverUrl || ""
  ),
  audioUrl: toServerUrl(
    item.audioUrl || item.audio || item.url || ""
  ),
});

const normalizeArtist = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  imageUrl: toServerUrl(item.imageUrl || item.image || ""),
  image: toServerUrl(item.image || item.imageUrl || ""),
  songs: Array.isArray(item.songs)
    ? item.songs.map(normalizeSong)
    : [],
  albums: Array.isArray(item.albums) ? item.albums : [],
});

const normalizeAlbum = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  title: item.title || item.name || "",
  name: item.name || item.title || "",
  image: toServerUrl(
    item.image || item.coverUrl || item.coverImage || ""
  ),
  coverUrl: toServerUrl(
    item.coverUrl || item.coverImage || item.image || ""
  ),
  coverImage: toServerUrl(
    item.coverImage || item.coverUrl || item.image || ""
  ),
  songs: Array.isArray(item.songs)
    ? item.songs.map(normalizeSong)
    : [],
});

const normalizePlaylist = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  imageUrl: toServerUrl(
    item.imageUrl || item.image || item.coverUrl || ""
  ),
  image: toServerUrl(
    item.image || item.imageUrl || item.coverUrl || ""
  ),
  songs: Array.isArray(item.songs)
    ? item.songs.map(normalizeSong)
    : [],
});

const normalizeMedia = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  url: toServerUrl(item.url || item.filePath || ""),
  filePath: item.filePath || item.url || "",
  uploadDate:
    item.uploadDate ||
    item.createdAt?.split?.("T")?.[0] ||
    "",
});

const normalizeUser = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  avatar: toServerUrl(
    item.avatar || item.profileImage || item.image || ""
  ),
  profileImage: toServerUrl(
    item.profileImage || item.avatar || item.image || ""
  ),
});

const normalizeAd = (item = {}) => ({
  ...item,
  id: getRecordId(item),
  mediaUrl: item.mediaUrl ? toServerUrl(item.mediaUrl) : "",
  thumbnailUrl: item.thumbnailUrl
    ? toServerUrl(item.thumbnailUrl)
    : "",
});

/* =========================================================
   APP COMPONENT
========================================================= */

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("adminToken");
    const flag = localStorage.getItem("adminLoggedIn");

    if (flag !== "true" || !token) return false;

    if (isTokenExpired(token)) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("isAdminLoggedIn");
      return false;
    }

    return true;
  });

  const [activePage, setActivePageState] = useState(
    () =>
      localStorage.getItem("adminActivePage") || "dashboard"
  );

  const [theme, setThemeState] = useState(
    () => localStorage.getItem("adminTheme") || "dark"
  );

  const [accentColor, setAccentColorState] = useState(
    () =>
      localStorage.getItem("adminAccent") ||
      localStorage.getItem("accentColor") ||
      "black"
  );

  /* DATA STATES */

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [ads, setAds] = useState([]);
  const [adNetworks, setAdNetworks] = useState([]);

  /* EDIT / SELECT STATES */

  const [editingSong, setEditingSong] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [editingArtist, setEditingArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "adminSelectedMediaRecord"
      );
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [editingMedia, setEditingMedia] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSubscription, setEditingSubscription] =
    useState(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);

  /* PLAYER */

  const [currentSong, setCurrentSong] = useState(() => {
    try {
      const saved = localStorage.getItem("adminCurrentSong");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const addSongInProgressRef = useRef(false);

  /* LOADING */

  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  /* =======================================================
     ALL useEffect
  ======================================================= */

  /* 1️⃣ VERIFY SESSION */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("adminToken");
      const loggedInFlag = localStorage.getItem("adminLoggedIn");

      if (!token || loggedInFlag !== "true") {
        setIsLoggedIn(false);
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("isAdminLoggedIn");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          console.warn("⚠️ Session expired. Logging out.");

          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminId");
          localStorage.removeItem("adminUserId");
          localStorage.removeItem("adminProfile");
          localStorage.removeItem("adminProfileImage");
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("isAdminLoggedIn");
          localStorage.removeItem("rememberAdmin");

          setIsLoggedIn(false);
          setActivePageState("login");
          return;
        }

        if (response.ok) {
          const payload = await response.json();
          const admin = payload?.data ?? payload;

          if (admin) {
            localStorage.setItem(
              "adminProfile",
              JSON.stringify(admin)
            );

            if (admin._id || admin.id) {
              localStorage.setItem(
                "adminId",
                String(admin._id || admin.id)
              );
            }
          }

          console.log("✅ Session verified");
        }
      } catch (error) {
        console.warn(
          "Session verification failed:",
          error.message
        );
      }
    };

    verifySession();
  }, []);

  /* 2️⃣ APPEARANCE */
  useEffect(() => {
    const root = document.documentElement;

    const accentColors = {
      black: {
        main: "#111111",
        hover: "#000000",
        light: "rgba(17,17,17,0.08)",
      },
      blue: {
        main: "#2563eb",
        hover: "#1d4ed8",
        light: "rgba(37,99,235,0.10)",
      },
      green: {
        main: "#16a34a",
        hover: "#15803d",
        light: "rgba(22,163,74,0.10)",
      },
      purple: {
        main: "#7c3aed",
        hover: "#6d28d9",
        light: "rgba(124,58,237,0.10)",
      },
      red: {
        main: "#dc2626",
        hover: "#b91c1c",
        light: "rgba(220,38,38,0.10)",
      },
      orange: {
        main: "#ea580c",
        hover: "#c2410c",
        light: "rgba(234,88,12,0.10)",
      },
    };

    const applyAppearance = () => {
      const savedTheme =
        localStorage.getItem("adminTheme") ||
        theme ||
        "dark";

      const savedAccent =
        localStorage.getItem("adminAccent") ||
        localStorage.getItem("accentColor") ||
        accentColor ||
        "black";

      const selectedAccent =
        accentColors[savedAccent] || accentColors.black;

      root.classList.remove(
        "theme-light",
        "theme-dark",
        "theme-system"
      );
      root.classList.add(`theme-${savedTheme}`);
      root.setAttribute("data-theme", savedTheme);
      root.setAttribute("data-accent", savedAccent);

      root.style.setProperty(
        "--accent-color",
        selectedAccent.main
      );
      root.style.setProperty(
        "--accent-hover",
        selectedAccent.hover
      );
      root.style.setProperty(
        "--accent-light",
        selectedAccent.light
      );

      const savedFont =
        localStorage.getItem("adminFontSize") || "medium";

      root.classList.remove(
        "font-small",
        "font-medium",
        "font-large"
      );
      root.classList.add(`font-${savedFont}`);

      const savedCompact =
        localStorage.getItem("adminCompactMode") ===
        "true";

      root.classList.toggle("compact-mode", savedCompact);

      const savedSidebar =
        localStorage.getItem("adminSidebarMode") || "expanded";

      root.classList.remove(
        "sidebar-expanded",
        "sidebar-collapsed",
        "sidebar-mini"
      );
      root.classList.add(`sidebar-${savedSidebar}`);

      setAccentColorState(savedAccent);
    };

    applyAppearance();

    const handleAppearanceChanged = () => {
      applyAppearance();
    };

    window.addEventListener(
      "adminAppearanceChanged",
      handleAppearanceChanged
    );
    window.addEventListener(
      "storage",
      handleAppearanceChanged
    );

    return () => {
      window.removeEventListener(
        "adminAppearanceChanged",
        handleAppearanceChanged
      );
      window.removeEventListener(
        "storage",
        handleAppearanceChanged
      );
    };
  }, [theme, accentColor]);

  /* 3️⃣ REFRESH ALL DATA */
  useEffect(() => {
    if (isLoggedIn) {
      refreshAll();
    }
  }, [isLoggedIn]);

  /* 4️⃣ KEEP SELECTED RECORDS FRESH */

  useEffect(() => {
    if (!selectedArtist) return;
    const fresh = artists.find(
      (artist) =>
        getRecordId(artist) === getRecordId(selectedArtist)
    );
    if (fresh) setSelectedArtist(fresh);
  }, [artists]);

  useEffect(() => {
    if (!selectedAlbum) return;
    const fresh = albums.find(
      (album) =>
        getRecordId(album) === getRecordId(selectedAlbum)
    );
    if (fresh) setSelectedAlbum(fresh);
  }, [albums]);

  useEffect(() => {
    if (!selectedPlaylist) return;
    const fresh = playlists.find(
      (playlist) =>
        getRecordId(playlist) ===
        getRecordId(selectedPlaylist)
    );
    if (fresh) setSelectedPlaylist(fresh);
  }, [playlists]);

  useEffect(() => {
    if (!selectedMedia) return;
    const fresh = mediaFiles.find(
      (media) =>
        getRecordId(media) === getRecordId(selectedMedia)
    );
    if (fresh) setSelectedMedia(fresh);
  }, [mediaFiles]);

  useEffect(() => {
    if (!selectedUser) return;
    const fresh = users.find(
      (user) =>
        getRecordId(user) === getRecordId(selectedUser)
    );
    if (fresh) setSelectedUser(fresh);
  }, [users]);

  useEffect(() => {
    if (!selectedAd) return;
    const fresh = ads.find(
      (ad) => getRecordId(ad) === getRecordId(selectedAd)
    );
    if (fresh) setSelectedAd(fresh);
  }, [ads]);

  /* 5️⃣ RESTORE EDITING RECORDS */

  useEffect(() => {
    if (!songs.length) return;
    const editingId = localStorage.getItem(
      "adminEditingSongId"
    );
    if (!editingId) return;

    const freshSong = songs.find(
      (song) => getRecordId(song) === String(editingId)
    );

    if (freshSong) {
      setEditingSong(normalizeSong(freshSong));
    } else {
      clearPageRecord("adminEditingSongId");
    }
  }, [songs]);

  useEffect(() => {
    if (!artists.length) return;

    const selectedId = localStorage.getItem(
      "adminSelectedArtistId"
    );
    const editingId = localStorage.getItem(
      "adminEditingArtistId"
    );

    if (selectedId) {
      const fresh = artists.find(
        (artist) =>
          getRecordId(artist) === String(selectedId)
      );
      if (fresh) setSelectedArtist(fresh);
      else clearPageRecord("adminSelectedArtistId");
    }

    if (editingId) {
      const fresh = artists.find(
        (artist) =>
          getRecordId(artist) === String(editingId)
      );
      if (fresh) setEditingArtist(fresh);
      else clearPageRecord("adminEditingArtistId");
    }
  }, [artists]);

  useEffect(() => {
    if (!albums.length) return;

    const selectedId = localStorage.getItem(
      "adminSelectedAlbumId"
    );
    const editingId = localStorage.getItem(
      "adminEditingAlbumId"
    );

    if (selectedId) {
      const fresh = albums.find(
        (album) =>
          getRecordId(album) === String(selectedId)
      );
      if (fresh) setSelectedAlbum(fresh);
      else clearPageRecord("adminSelectedAlbumId");
    }

    if (editingId) {
      const fresh = albums.find(
        (album) =>
          getRecordId(album) === String(editingId)
      );
      if (fresh) setEditingAlbum(fresh);
      else clearPageRecord("adminEditingAlbumId");
    }
  }, [albums]);

  useEffect(() => {
    if (!playlists.length) return;

    const selectedId = localStorage.getItem(
      "adminSelectedPlaylistId"
    );
    const editingId = localStorage.getItem(
      "adminEditingPlaylistId"
    );

    if (selectedId) {
      const fresh = playlists.find(
        (playlist) =>
          getRecordId(playlist) === String(selectedId)
      );
      if (fresh) setSelectedPlaylist(fresh);
      else clearPageRecord("adminSelectedPlaylistId");
    }

    if (editingId) {
      const fresh = playlists.find(
        (playlist) =>
          getRecordId(playlist) === String(editingId)
      );
      if (fresh) setEditingPlaylist(fresh);
      else clearPageRecord("adminEditingPlaylistId");
    }
  }, [playlists]);

  useEffect(() => {
    const selectedId = localStorage.getItem(
      "adminSelectedMediaId"
    );
    const editingId = localStorage.getItem(
      "adminEditingMediaId"
    );

    if (selectedId) {
      const fresh = mediaFiles.find(
        (media) =>
          getRecordId(media) === String(selectedId)
      );
      if (fresh) {
        setSelectedMedia(fresh);
        persistPageRecord("adminSelectedMediaId", fresh);
      } else {
        try {
          const raw = localStorage.getItem(
            "adminSelectedMediaRecord"
          );
          const savedRecord = raw ? JSON.parse(raw) : null;
          if (
            savedRecord &&
            getRecordId(savedRecord) === String(selectedId)
          ) {
            setSelectedMedia(savedRecord);
          }
        } catch {}
      }
    }

    if (editingId && mediaFiles.length) {
      const fresh = mediaFiles.find(
        (media) =>
          getRecordId(media) === String(editingId)
      );
      if (fresh) setEditingMedia(fresh);
    }
  }, [mediaFiles]);

  useEffect(() => {
    if (!users.length) return;

    const selectedId = localStorage.getItem(
      "adminSelectedUserId"
    );
    const editingId = localStorage.getItem(
      "adminEditingUserId"
    );

    if (selectedId) {
      const fresh = users.find(
        (user) => getRecordId(user) === String(selectedId)
      );
      if (fresh) setSelectedUser(fresh);
      else clearPageRecord("adminSelectedUserId");
    }

    if (editingId) {
      const fresh = users.find(
        (user) => getRecordId(user) === String(editingId)
      );
      if (fresh) setEditingUser(fresh);
      else clearPageRecord("adminEditingUserId");
    }
  }, [users]);

  useEffect(() => {
    if (!subscriptions.length) return;

    const selectedId = localStorage.getItem(
      "adminSelectedSubscriptionId"
    );
    const editingId = localStorage.getItem(
      "adminEditingSubscriptionId"
    );

    if (selectedId) {
      const fresh = subscriptions.find(
        (sub) =>
          String(
            getRecordId(sub) || sub.subscriptionId
          ) === String(selectedId)
      );
      if (fresh) setSelectedSubscription(fresh);
    }

    if (editingId) {
      const fresh = subscriptions.find(
        (sub) =>
          String(
            getRecordId(sub) || sub.subscriptionId
          ) === String(editingId)
      );
      if (fresh) setEditingSubscription(fresh);
    }
  }, [subscriptions]);

  useEffect(() => {
    if (!plans.length) return;

    const editingId = localStorage.getItem(
      "adminEditingPlanId"
    );
    if (editingId) {
      const fresh = plans.find(
        (plan) =>
          String(getRecordId(plan) || plan.planId) ===
          String(editingId)
      );
      if (fresh) setEditingPlan(fresh);
    }
  }, [plans]);

  /* 6️⃣ PERSIST ACTIVE PAGE */
  useEffect(() => {
    if (activePage) {
      localStorage.setItem("adminActivePage", activePage);
    }
  }, [activePage]);

  /* 7️⃣ AUDIO PLAYBACK */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    audio.playbackRate = playbackSpeed;

    if (currentSong.audioUrl) {
      audio.src = toServerUrl(currentSong.audioUrl);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.src = "";
      setIsPlaying(false);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying && currentSong.audioUrl) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  /* =======================================================
     HELPER FUNCTIONS
  ======================================================= */

  const setActivePage = (page) => {
    const nextPage = page || "dashboard";
    setActivePageState(nextPage);
    localStorage.setItem("adminActivePage", nextPage);
  };

  const setTheme = (newTheme) => {
    const selectedTheme = ["light", "dark", "system"].includes(
      newTheme
    )
      ? newTheme
      : "dark";
    setThemeState(selectedTheme);
    localStorage.setItem("adminTheme", selectedTheme);
  };

  const setAccentColor = (newAccent) => {
    const allowedAccents = [
      "black",
      "blue",
      "green",
      "purple",
      "red",
      "orange",
    ];
    const selectedAccent = allowedAccents.includes(newAccent)
      ? newAccent
      : "black";

    setAccentColorState(selectedAccent);
    localStorage.setItem("adminAccent", selectedAccent);
    localStorage.setItem("accentColor", selectedAccent);

    window.dispatchEvent(
      new CustomEvent("adminAppearanceChanged", {
        detail: { accentColor: selectedAccent },
      })
    );
  };

  const persistPageRecord = (key, record) => {
    const id = getRecordId(record);
    if (id) localStorage.setItem(key, id);
    else localStorage.removeItem(key);

    if (key === "adminSelectedMediaId") {
      if (record) {
        try {
          localStorage.setItem(
            "adminSelectedMediaRecord",
            JSON.stringify(record)
          );
        } catch {}
      } else {
        localStorage.removeItem("adminSelectedMediaRecord");
      }
    }
  };

  const clearPageRecord = (key) => {
    localStorage.removeItem(key);
    if (key === "adminSelectedMediaId") {
      localStorage.removeItem("adminSelectedMediaRecord");
    }
  };

  const refreshAll = async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        requestJson(`${API_BASE_URL}/songs`),
        requestJson(`${API_BASE_URL}/artists`),
        requestJson(`${API_BASE_URL}/albums`),
        requestJson(`${API_BASE_URL}/playlists`),
        requestJson(`${API_BASE_URL}/media`),
        requestJson(`${API_BASE_URL}/users`),
        requestJson(`${API_BASE_URL}/plans`),
        requestJson(`${API_BASE_URL}/subscriptions`),
        requestJson(`${API_BASE_URL}/ads`),
        requestJson(`${API_BASE_URL}/ad-networks`),
      ]);

      const [
        songResult,
        artistResult,
        albumResult,
        playlistResult,
        mediaResult,
        userResult,
        planResult,
        subscriptionResult,
        adResult,
        adNetworkResult,
      ] = results;

      if (songResult.status === "fulfilled") {
        setSongs(
          (songResult.value || []).map(normalizeSong)
        );
      }
      if (artistResult.status === "fulfilled") {
        setArtists(
          (artistResult.value || []).map(normalizeArtist)
        );
      }
      if (albumResult.status === "fulfilled") {
        setAlbums(
          (albumResult.value || []).map(normalizeAlbum)
        );
      }
      if (playlistResult.status === "fulfilled") {
        setPlaylists(
          (playlistResult.value || []).map(normalizePlaylist)
        );
      }
      if (mediaResult.status === "fulfilled") {
        setMediaFiles(
          (mediaResult.value || []).map(normalizeMedia)
        );
      }
      if (userResult.status === "fulfilled") {
        setUsers(
          (userResult.value || []).map(normalizeUser)
        );
      }
      if (planResult.status === "fulfilled") {
        setPlans(planResult.value || []);
      }
      if (subscriptionResult.status === "fulfilled") {
        setSubscriptions(subscriptionResult.value || []);
      }
      if (adResult.status === "fulfilled") {
        setAds((adResult.value || []).map(normalizeAd));
      }
      if (adNetworkResult.status === "fulfilled") {
        setAdNetworks(adNetworkResult.value || []);
      }
    } finally {
      setLoading(false);
      setInitialDataLoading(false);
    }
  };

  const updateLocalSongCopies = (song) => {
    const normalized = normalizeSong(song);
    const id = String(normalized.id);

    setArtists((prev) =>
      prev.map((artist) => ({
        ...artist,
        songs: (artist.songs || []).map((item) =>
          String(getRecordId(item)) === id
            ? { ...item, ...normalized }
            : item
        ),
      }))
    );

    setAlbums((prev) =>
      prev.map((album) => ({
        ...album,
        songs: (album.songs || []).map((item) =>
          String(getRecordId(item)) === id
            ? { ...item, ...normalized }
            : item
        ),
      }))
    );

    setPlaylists((prev) =>
      prev.map((playlist) => ({
        ...playlist,
        songs: (playlist.songs || []).map((item) =>
          String(getRecordId(item)) === id
            ? { ...item, ...normalized }
            : item
        ),
      }))
    );
  };

  /* =======================================================
     ALL HANDLERS
  ======================================================= */

  /* Artist */
  const openArtist = (artist) => {
    if (!artist) return;
    setSelectedArtist(artist);
    persistPageRecord("adminSelectedArtistId", artist);
    setActivePage("view-artist");
  };

  const openEditArtist = (artist) => {
    if (!artist) return;
    setEditingArtist(artist);
    persistPageRecord("adminEditingArtistId", artist);
    setActivePage("edit-artist");
  };

  const addArtist = async (newArtist) => {
    if (!newArtist) return;

    try {
      const form = new FormData();

      Object.entries(cleanPayload(newArtist)).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            typeof value !== "object"
          ) {
            form.append(key, value);
          }
        }
      );

      if (newArtist.imageFile instanceof Blob) {
        form.append("image", newArtist.imageFile);
      }

      const created = normalizeArtist(
        await requestJson(`${API_BASE_URL}/artists`, {
          method: "POST",
          body: form,
        })
      );

      setArtists((prev) => [created, ...prev]);
      setSelectedArtist(created);
      setEditingArtist(null);
      clearPageRecord("adminEditingArtistId");
      persistPageRecord("adminSelectedArtistId", created);
      setActivePage("artists");

      notify.success("Artist added successfully!");
    } catch (error) {
      notify.error(
        error.message || "Artist add nahi ho paya."
      );
    }
  };

  const updateArtist = async (updatedArtist) => {
    if (!updatedArtist) return;

    const id = getRecordId(updatedArtist);
    if (!id) return;

    try {
      const form = new FormData();

      Object.entries(cleanPayload(updatedArtist)).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            typeof value !== "object"
          ) {
            form.append(key, value);
          }
        }
      );

      if (updatedArtist.imageFile instanceof Blob) {
        form.append("image", updatedArtist.imageFile);
      }

      if (updatedArtist.imageRemoved === true) {
        form.append("removeImage", "true");
      }

      const updated = normalizeArtist(
        await requestJson(
          `${API_BASE_URL}/artists/${id}`,
          {
            method: "PUT",
            body: form,
          }
        )
      );

      setArtists((prev) =>
        prev.map((artist) =>
          getRecordId(artist) === String(id)
            ? updated
            : artist
        )
      );

      setSelectedArtist(updated);
      setEditingArtist(null);
      clearPageRecord("adminEditingArtistId");
      persistPageRecord("adminSelectedArtistId", updated);
      setActivePage("artists");

      notify.success("Artist updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "Artist update nahi ho paya."
      );
    }
  };

  const deleteArtist = async (artistId) => {
    if (!artistId) return;

    const confirmed = await notify.confirmDelete("artist");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/artists/${artistId}`,
        { method: "DELETE" }
      );

      setArtists((prev) =>
        prev.filter(
          (artist) =>
            getRecordId(artist) !== String(artistId)
        )
      );

      if (
        getRecordId(selectedArtist) === String(artistId)
      ) {
        setSelectedArtist(null);
        clearPageRecord("adminSelectedArtistId");
      }

      if (
        getRecordId(editingArtist) === String(artistId)
      ) {
        setEditingArtist(null);
        clearPageRecord("adminEditingArtistId");
      }

      setActivePage("artists");

      notify.success("Artist deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "Artist delete nahi ho paya."
      );
    }
  };

  /* Album */
  const openAlbum = (album) => {
    if (!album) return;
    setSelectedAlbum(album);
    persistPageRecord("adminSelectedAlbumId", album);
    setActivePage("view-album");
  };

  const openEditAlbum = (album) => {
    if (!album) return;
    setEditingAlbum(album);
    persistPageRecord("adminEditingAlbumId", album);
    setActivePage("edit-album");
  };

  const addAlbum = async (newAlbum) => {
    if (!newAlbum) return;

    try {
      let coverUrl =
        newAlbum.coverUrl ||
        newAlbum.coverImage ||
        newAlbum.image ||
        "";

      if (newAlbum.coverFile instanceof Blob) {
        const media = await fileToMedia(
          newAlbum.coverFile,
          "Album Cover",
          {
            title: newAlbum.title || newAlbum.name,
            artist: newAlbum.artist,
            genre: newAlbum.genre,
            language: newAlbum.language,
          }
        );

        coverUrl = media?.url || media?.filePath || "";
      } else if (newAlbum.coverMedia?.url) {
        coverUrl = newAlbum.coverMedia.url;
      }

      const payload = cleanPayload({
        ...newAlbum,
        name: newAlbum.name || newAlbum.title,
        image: coverUrl,
        coverUrl,
        coverImage: coverUrl,
        songs: newAlbum.songs || [],
      });

      const backendCreated = normalizeAlbum(
        await requestJson(`${API_BASE_URL}/albums`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      const created = normalizeAlbum({
        ...backendCreated,
        image: coverUrl || backendCreated.image || "",
        coverUrl: coverUrl || backendCreated.coverUrl || "",
        coverImage:
          coverUrl || backendCreated.coverImage || "",
      });

      setAlbums((prev) => [...prev, created]);
      setSelectedAlbum(created);
      setEditingAlbum(null);
      clearPageRecord("adminEditingAlbumId");
      persistPageRecord("adminSelectedAlbumId", created);
      setActivePage("albums");

      notify.success("Album added successfully!");
    } catch (error) {
      notify.error(
        error.message || "Album add nahi ho paya."
      );
    }
  };

  const updateAlbum = async (updatedAlbum) => {
    if (!updatedAlbum) return;

    const id = getRecordId(updatedAlbum);
    if (!id) return;

    try {
      let coverUrl =
        updatedAlbum.coverUrl ||
        updatedAlbum.coverImage ||
        updatedAlbum.image ||
        "";

      if (updatedAlbum.coverFile instanceof Blob) {
        const media = await fileToMedia(
          updatedAlbum.coverFile,
          "Album Cover",
          {
            title:
              updatedAlbum.title || updatedAlbum.name,
            artist: updatedAlbum.artist,
            genre: updatedAlbum.genre,
            language: updatedAlbum.language,
          }
        );

        coverUrl = media?.url || media?.filePath || "";
      } else if (updatedAlbum.coverMedia?.url) {
        coverUrl = updatedAlbum.coverMedia.url;
      }

      const payload = cleanPayload({
        ...updatedAlbum,
        name: updatedAlbum.name || updatedAlbum.title,
        image: coverUrl,
        coverUrl,
        coverImage: coverUrl,
        songs: updatedAlbum.songs || [],
      });

      if (updatedAlbum.coverRemoved === true) {
        payload.removeImage = true;
        payload.image = "";
        payload.coverUrl = "";
        payload.coverImage = "";
      }

      const backendUpdated = normalizeAlbum(
        await requestJson(
          `${API_BASE_URL}/albums/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        )
      );

      const updated = normalizeAlbum({
        ...backendUpdated,
        image: coverUrl || backendUpdated.image || "",
        coverUrl:
          coverUrl || backendUpdated.coverUrl || "",
        coverImage:
          coverUrl || backendUpdated.coverImage || "",
      });

      setAlbums((prev) =>
        prev.map((album) =>
          getRecordId(album) === String(id)
            ? updated
            : album
        )
      );

      setSelectedAlbum(updated);
      setEditingAlbum(null);
      clearPageRecord("adminEditingAlbumId");
      persistPageRecord("adminSelectedAlbumId", updated);
      setActivePage("albums");

      notify.success("Album updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "Album update nahi ho paya."
      );
    }
  };

  const deleteAlbum = async (albumId) => {
    if (!albumId) return;

    const confirmed = await notify.confirmDelete("album");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/albums/${albumId}`,
        { method: "DELETE" }
      );

      setAlbums((prev) =>
        prev.filter(
          (album) =>
            getRecordId(album) !== String(albumId)
        )
      );

      if (
        getRecordId(selectedAlbum) === String(albumId)
      ) {
        setSelectedAlbum(null);
        clearPageRecord("adminSelectedAlbumId");
      }

      setActivePage("albums");

      notify.success("Album deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "Album delete nahi ho paya."
      );
    }
  };

  /* Playlist */
  const openPlaylist = (playlist) => {
    if (!playlist) return;
    setSelectedPlaylist(playlist);
    persistPageRecord("adminSelectedPlaylistId", playlist);
    setActivePage("view-playlist");
  };

  const openEditPlaylist = (playlist) => {
    if (!playlist) return;
    setEditingPlaylist(playlist);
    persistPageRecord("adminEditingPlaylistId", playlist);
    setActivePage("edit-playlist");
  };

  const addPlaylist = async (newPlaylist) => {
    if (!newPlaylist) return;

    try {
      let imageUrl =
        newPlaylist.imageUrl ||
        newPlaylist.image ||
        newPlaylist.selectedImage?.url ||
        "";

      if (newPlaylist.imageFile instanceof Blob) {
        const media = await fileToMedia(
          newPlaylist.imageFile,
          "Playlist Cover",
          {
            title: newPlaylist.name,
            genre: newPlaylist.genre,
            language: newPlaylist.language,
          }
        );

        imageUrl = media?.url || media?.filePath || "";
      }

      const payload = cleanPayload({
        ...newPlaylist,
        image: imageUrl,
        imageUrl,
        songs: newPlaylist.songs || [],
      });

      const created = normalizePlaylist(
        await requestJson(
          `${API_BASE_URL}/playlists`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        )
      );

      setPlaylists((prev) => [created, ...prev]);
      setSelectedPlaylist(created);
      setEditingPlaylist(null);
      clearPageRecord("adminEditingPlaylistId");
      persistPageRecord("adminSelectedPlaylistId", created);
      setActivePage("playlists");

      notify.success("Playlist added successfully!");
    } catch (error) {
      notify.error(
        error.message || "Playlist add nahi ho payi."
      );
    }
  };

  const updatePlaylist = async (updatedPlaylist) => {
    if (!updatedPlaylist) return;

    const id = getRecordId(updatedPlaylist);
    if (!id) return;

    try {
      let imageUrl =
        updatedPlaylist.imageUrl ||
        updatedPlaylist.image ||
        updatedPlaylist.selectedImage?.url ||
        "";

      if (updatedPlaylist.imageFile instanceof Blob) {
        const media = await fileToMedia(
          updatedPlaylist.imageFile,
          "Playlist Cover",
          {
            title: updatedPlaylist.name,
            genre: updatedPlaylist.genre,
            language: updatedPlaylist.language,
          }
        );

        imageUrl = media?.url || media?.filePath || imageUrl;
      }

      const payload = cleanPayload({
        ...updatedPlaylist,
        image: imageUrl,
        imageUrl,
        songs: updatedPlaylist.songs || [],
      });

      if (updatedPlaylist.imageRemoved === true) {
        payload.removeImage = true;
        payload.image = "";
        payload.imageUrl = "";
      }

      const updated = normalizePlaylist(
        await requestJson(
          `${API_BASE_URL}/playlists/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        )
      );

      setPlaylists((prev) =>
        prev.map((playlist) =>
          getRecordId(playlist) === String(id)
            ? updated
            : playlist
        )
      );

      setSelectedPlaylist(updated);
      setEditingPlaylist(null);
      clearPageRecord("adminEditingPlaylistId");
      persistPageRecord("adminSelectedPlaylistId", updated);
      setActivePage("playlists");

      notify.success("Playlist updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "Playlist update nahi ho payi."
      );
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!playlistId) return;

    const confirmed = await notify.confirmDelete("playlist");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/playlists/${playlistId}`,
        { method: "DELETE" }
      );

      setPlaylists((prev) =>
        prev.filter(
          (playlist) =>
            getRecordId(playlist) !== String(playlistId)
        )
      );

      if (
        getRecordId(selectedPlaylist) ===
        String(playlistId)
      ) {
        setSelectedPlaylist(null);
        clearPageRecord("adminSelectedPlaylistId");
      }

      setActivePage("playlists");

      notify.success("Playlist deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "Playlist delete nahi ho payi."
      );
    }
  };

  const addSongToPlaylist = async (playlistId, song) => {
    if (!song || !playlistId) return;

    const playlist = playlists.find(
      (item) =>
        getRecordId(item) === String(playlistId)
    );

    if (!playlist) return;

    if (
      (playlist.songs || []).some(
        (item) =>
          getRecordId(item) === getRecordId(song)
      )
    )
      return;

    await updatePlaylist({
      ...playlist,
      songs: [
        ...(playlist.songs || []),
        normalizeSong(song),
      ],
    });
  };

  const deleteSongFromPlaylist = async (
    playlistId,
    songId
  ) => {
    const playlist = playlists.find(
      (item) =>
        getRecordId(item) === String(playlistId)
    );

    if (!playlist) return;

    await updatePlaylist({
      ...playlist,
      songs: (playlist.songs || []).filter(
        (song) =>
          getRecordId(song) !== String(songId)
      ),
    });

    if (
      currentSong &&
      getRecordId(currentSong) === String(songId)
    ) {
      setIsPlaying(false);
      setCurrentSong(null);
      try {
        localStorage.removeItem("adminCurrentSong");
      } catch {}
    }
  };

  /* Media */
  const addMediaFileToLibrary = async (
    file,
    usedFor = "Other",
    extraData = {}
  ) => {
    if (!(file instanceof Blob)) return null;

    try {
      const media = normalizeMedia(
        await fileToMedia(file, usedFor, extraData)
      );

      setMediaFiles((prev) => [media, ...prev]);
      return media;
    } catch (error) {
      notify.error(
        error.message || "Media upload nahi ho paya."
      );
      return null;
    }
  };

  const addImageToMediaLibrary = (
    file,
    usedFor = "Image",
    extraData = {}
  ) =>
    addMediaFileToLibrary(file, usedFor, extraData);

  /* Songs */
  const addSong = async (newSong) => {
    if (!newSong) return null;

    if (addSongInProgressRef.current) {
      console.warn("⚠️ Song save already running.");
      return null;
    }

    addSongInProgressRef.current = true;

    try {
      let audioUrl =
        newSong.audioUrl ||
        newSong.selectedAudio?.url ||
        "";
      let imageUrl =
        newSong.imageUrl ||
        newSong.selectedImage?.url ||
        "";
      let audioMediaId = newSong.audioMediaId || "";
      let imageMediaId = newSong.imageMediaId || "";

      if (newSong.audioFile instanceof Blob) {
        const media = await addMediaFileToLibrary(
          newSong.audioFile,
          "Song Audio",
          {
            title: newSong.title || "",
            artist: newSong.artist || "",
            album: newSong.album || "",
            genre: newSong.genre || "",
            language: newSong.language || "",
            duration: newSong.duration || "",
          }
        );

        if (!media) throw new Error("Audio upload failed.");

        audioUrl = media.url || media.filePath || "";
        audioMediaId = media.id || media._id || "";
      }

      if (
        (newSong.coverImage || newSong.imageFile) instanceof
        Blob
      ) {
        const file =
          newSong.coverImage || newSong.imageFile;

        const media = await addMediaFileToLibrary(
          file,
          "Song Cover",
          {
            title: `${newSong.title || "Song"} Cover`,
            artist: newSong.artist || "",
            album: newSong.album || "",
            genre: newSong.genre || "",
            language: newSong.language || "",
            duration: newSong.duration || "",
          }
        );

        if (!media) throw new Error("Cover upload failed.");

        imageUrl = media.url || media.filePath || "";
        imageMediaId = media.id || media._id || "";
      }

      const payload = cleanPayload({
        ...newSong,
        title: String(newSong.title || "").trim(),
        artist: String(newSong.artist || "")
          .trim()
          .replace(/\s*,\s*/g, ", "),
        imageUrl,
        audioUrl,
        audioMediaId,
        imageMediaId,
        plays: Number(newSong.plays) || 0,
      });

      const created = normalizeSong(
        await requestJson(`${API_BASE_URL}/songs`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      if (!created)
        throw new Error("Song create response nahi mila.");

      const finalSong = normalizeSong({
        ...created,
        imageUrl: imageUrl || created.imageUrl || "",
        audioUrl: audioUrl || created.audioUrl || "",
      });

      setSongs((prev) => [finalSong, ...prev]);
      setEditingSong(null);
      clearPageRecord("adminEditingSongId");
      setActivePage("songs");

      notify.success("Song added successfully!");
      return finalSong;
    } catch (error) {
      console.error("❌ ADD SONG ERROR:", error);
      notify.error(
        error?.message ||
          "Song add karte time error aa gaya."
      );
      return null;
    } finally {
      addSongInProgressRef.current = false;
    }
  };

  const openEditSong = (song) => {
    if (!song) return;
    const normalized = normalizeSong(song);
    setEditingSong(normalized);
    persistPageRecord("adminEditingSongId", normalized);
    setActivePage("edit-song");
  };

  const updateSong = (updatedSong) => {
    console.log("🎯 updateSong CALLED (state-only)");
    console.log("📦 Payload:", updatedSong);

    if (!updatedSong) {
      console.warn("⚠️ updateSong: no data provided");
      return;
    }

    const id = getRecordId(updatedSong);
    if (!id) {
      console.warn("⚠️ updateSong: no ID found");
      return;
    }

    const normalized = normalizeSong(updatedSong);

    console.log("🎯 updateSong state update:");
    console.log("   ID:", id);
    console.log("   imageUrl:", normalized.imageUrl);
    console.log("   audioUrl:", normalized.audioUrl);

    setSongs((prev) =>
      prev.map((song) =>
        getRecordId(song) === String(id)
          ? { ...song, ...normalized }
          : song
      )
    );

    updateLocalSongCopies(normalized);

    setEditingSong(null);
    clearPageRecord("adminEditingSongId");

    setActivePage("songs");

    notify.success("Song updated successfully!");
  };

  const deleteSong = async (songId) => {
    if (!songId) return;

    const confirmed = await notify.confirmDelete("song");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/songs/${songId}`,
        { method: "DELETE" }
      );

      setSongs((prev) =>
        prev.filter(
          (song) => getRecordId(song) !== String(songId)
        )
      );

      setArtists((prev) =>
        prev.map((artist) => ({
          ...artist,
          songs: (artist.songs || []).filter(
            (song) =>
              getRecordId(song) !== String(songId)
          ),
        }))
      );

      setAlbums((prev) =>
        prev.map((album) => ({
          ...album,
          songs: (album.songs || []).filter(
            (song) =>
              getRecordId(song) !== String(songId)
          ),
        }))
      );

      setPlaylists((prev) =>
        prev.map((playlist) => ({
          ...playlist,
          songs: (playlist.songs || []).filter(
            (song) =>
              getRecordId(song) !== String(songId)
          ),
        }))
      );

      if (
        getRecordId(currentSong) === String(songId)
      ) {
        setIsPlaying(false);
        setCurrentSong(null);
        try {
          localStorage.removeItem("adminCurrentSong");
        } catch {}

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      }

      setActivePage("songs");

      notify.success("Song deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "Song delete nahi ho paya."
      );
    }
  };

  /* User */
  const addUser = async (newUser) => {
    if (!newUser) return;

    try {
      let profileImage =
        newUser.profileImage ||
        newUser.avatar ||
        newUser.image ||
        "";

      if (newUser.imageFile instanceof Blob) {
        const media = await addMediaFileToLibrary(
          newUser.imageFile,
          "User Avatar",
          { title: newUser.name }
        );

        profileImage = media?.url || profileImage;
      }

      const payload = cleanPayload({
        ...newUser,
        profileImage,
        avatar: profileImage,
      });

      const created = normalizeUser(
        await requestJson(`${API_BASE_URL}/users`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      setUsers((prev) => [created, ...prev]);
      setSelectedUser(created);
      setEditingUser(null);
      clearPageRecord("adminEditingUserId");
      persistPageRecord("adminSelectedUserId", created);
      setActivePage("users");

      notify.success("User added successfully!");
    } catch (error) {
      notify.error(
        error.message || "User add nahi ho paya."
      );
    }
  };

  const openUser = (user) => {
    if (!user) return;
    setSelectedUser(user);
    persistPageRecord("adminSelectedUserId", user);
    setActivePage("user-details");
  };

  const openUserDetails = openUser;

  const openEditUser = (user) => {
    if (!user) return;
    setEditingUser(user);
    setSelectedUser(user);
    persistPageRecord("adminEditingUserId", user);
    persistPageRecord("adminSelectedUserId", user);
    setActivePage("edit-user");
  };

  const updateUser = async (updatedUser) => {
    if (!updatedUser) return;

    const id = getRecordId(updatedUser);
    if (!id) return;

    try {
      let profileImage =
        updatedUser.profileImage ||
        updatedUser.avatar ||
        updatedUser.image ||
        "";

      if (updatedUser.imageFile instanceof Blob) {
        const media = await addMediaFileToLibrary(
          updatedUser.imageFile,
          "User Avatar",
          { title: updatedUser.name }
        );

        profileImage = media?.url || profileImage;
      }

      const payload = cleanPayload({
        ...updatedUser,
        profileImage,
        avatar: profileImage,
      });

      if (updatedUser.imageRemoved === true) {
        payload.profileImage = "";
        payload.avatar = "";
        payload.removeImage = true;
      }

      const updated = normalizeUser(
        await requestJson(
          `${API_BASE_URL}/users/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        )
      );

      setUsers((prev) =>
        prev.map((user) =>
          getRecordId(user) === String(id)
            ? updated
            : user
        )
      );

      setSelectedUser(updated);
      setEditingUser(null);
      clearPageRecord("adminEditingUserId");
      persistPageRecord("adminSelectedUserId", updated);
      setActivePage("users");

      notify.success("User updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "User update nahi ho paya."
      );
    }
  };

  const deleteUser = async (userId) => {
    if (!userId) return;

    const confirmed = await notify.confirmDelete("user");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/users/${userId}`,
        { method: "DELETE" }
      );

      setUsers((prev) =>
        prev.filter(
          (user) => getRecordId(user) !== String(userId)
        )
      );

      if (getRecordId(selectedUser) === String(userId)) {
        setSelectedUser(null);
        clearPageRecord("adminSelectedUserId");
      }

      if (getRecordId(editingUser) === String(userId)) {
        setEditingUser(null);
        clearPageRecord("adminEditingUserId");
      }

      setActivePage("users");

      notify.success("User deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "User delete nahi ho paya."
      );
    }
  };

  /* Media */
  const addMedia = async (newMedia) => {
    if (!newMedia) return;

    const file =
      newMedia.file || newMedia.fileObject || null;

    try {
      let media;

      if (file instanceof Blob) {
        media = normalizeMedia(
          await fileToMedia(
            file,
            newMedia.usedFor || "Other",
            newMedia
          )
        );
      } else {
        media = normalizeMedia(
          await requestJson(`${API_BASE_URL}/media`, {
            method: "POST",
            body: JSON.stringify(cleanPayload(newMedia)),
          })
        );
      }

      setMediaFiles((prev) => [media, ...prev]);
      setEditingMedia(null);
      clearPageRecord("adminEditingMediaId");
      setActivePage("media");

      notify.success("Media added successfully!");
    } catch (error) {
      notify.error(
        error.message || "Media add nahi ho paya."
      );
    }
  };

  const deleteMedia = (mediaId) => {
    if (!mediaId) return;

    clearPageRecord("adminSelectedMediaId");

    if (getRecordId(selectedMedia) === String(mediaId)) {
      setSelectedMedia(null);
    }

    setMediaFiles((prev) =>
      prev.filter(
        (media) =>
          getRecordId(media) !== String(mediaId)
      )
    );

    setActivePage("media");

    notify.success("Media deleted successfully!");
  };

  const openMedia = (media) => {
    if (!media) return;
    setSelectedMedia(media);
    persistPageRecord("adminSelectedMediaId", media);
    setActivePage("view-media");
  };

  const openEditMedia = (media) => {
    if (!media) return;
    setEditingMedia(media);
    persistPageRecord("adminEditingMediaId", media);
    setActivePage("edit-media");
  };

  const updateMedia = async (updatedMedia) => {
    if (!updatedMedia) return;

    const id = getRecordId(updatedMedia);
    if (!id) return;

    try {
      let updated;
      const file =
        updatedMedia.file ||
        updatedMedia.fileObject ||
        null;

      if (file instanceof Blob) {
        const form = new FormData();

        Object.entries(
          cleanPayload(updatedMedia)
        ).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            typeof value !== "object"
          ) {
            form.append(key, value);
          }
        });

        form.append("file", file);

        if (updatedMedia.removeFile === true) {
          form.append("removeFile", "true");
        }

        updated = normalizeMedia(
          await requestJson(
            `${API_BASE_URL}/media/${id}`,
            { method: "PUT", body: form }
          )
        );
      } else {
        updated = normalizeMedia(
          await requestJson(
            `${API_BASE_URL}/media/${id}`,
            {
              method: "PUT",
              body: JSON.stringify(
                cleanPayload(updatedMedia)
              ),
            }
          )
        );
      }

      setMediaFiles((prev) =>
        prev.map((media) =>
          getRecordId(media) === String(id)
            ? updated
            : media
        )
      );

      setSelectedMedia(updated);
      setEditingMedia(null);
      clearPageRecord("adminEditingMediaId");
      persistPageRecord("adminSelectedMediaId", updated);
      setActivePage("media");

      notify.success("Media updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "Media update nahi ho paya."
      );
    }
  };

  /* Ads */
  const openViewAd = (ad) => {
    if (!ad) return;
    setSelectedAd(ad);
    setActivePage("view-ad");
  };

  const openEditAd = (ad) => {
    if (!ad) return;
    setSelectedAd(ad);
    setActivePage("edit-ad");
  };

  const addAd = async (newAd) => {
    if (!newAd) return null;

    try {
      let mediaUrl = newAd.mediaUrl || "";
      let thumbnailUrl = newAd.thumbnailUrl || "";

      if (newAd.mediaFile instanceof Blob) {
        const media = await addMediaFileToLibrary(
          newAd.mediaFile,
          "Advertisement",
          {
            title: newAd.name,
            duration: newAd.duration || "",
          }
        );

        if (media) {
          mediaUrl =
            media.url || media.filePath || mediaUrl;
        }
      }

      if (newAd.thumbnailFile instanceof Blob) {
        const media = await addMediaFileToLibrary(
          newAd.thumbnailFile,
          "Ad Thumbnail",
          { title: `${newAd.name} Thumbnail` }
        );

        if (media) {
          thumbnailUrl =
            media.url || media.filePath || thumbnailUrl;
        }
      }

      const payload = cleanPayload({
        ...newAd,
        mediaUrl,
        thumbnailUrl,
      });

      const created = normalizeAd(
        await requestJson(`${API_BASE_URL}/ads`, {
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      setAds((prev) => [created, ...prev]);

      notify.success(
        "Advertisement created successfully!"
      );
      return created;
    } catch (error) {
      console.error("❌ ADD AD ERROR:", error);
      notify.error(
        error.message ||
          "Advertisement create nahi ho paya."
      );
      throw error;
    }
  };

  const deleteAd = async (adId) => {
    if (!adId) return;

    const confirmed =
      await notify.confirmDelete("advertisement");
    if (!confirmed) return;

    const idString = String(adId);
    const isValidObjectId =
      /^[0-9a-fA-F]{24}$/.test(idString);

    try {
      if (isValidObjectId) {
        await requestJson(
          `${API_BASE_URL}/ads/${idString}`,
          { method: "DELETE" }
        );
      }

      setAds((prev) =>
        prev.filter(
          (ad) => getRecordId(ad) !== idString
        )
      );

      if (
        selectedAd &&
        getRecordId(selectedAd) === idString
      ) {
        setSelectedAd(null);
        setActivePage("ads");
      }

      notify.success(
        "Advertisement deleted successfully!"
      );
    } catch (error) {
      notify.error(
        error.message || "Ad delete nahi ho paya."
      );
    }
  };

  const updateAd = async (updatedAd) => {
    if (!updatedAd) return;

    const id = getRecordId(updatedAd);
    if (!id) return;

    const idString = String(id);
    const isValidObjectId =
      /^[0-9a-fA-F]{24}$/.test(idString);

    try {
      if (isValidObjectId) {
        const payload = cleanPayload(updatedAd);

        const updated = normalizeAd(
          await requestJson(
            `${API_BASE_URL}/ads/${idString}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            }
          )
        );

        setAds((prev) =>
          prev.map((ad) =>
            getRecordId(ad) === idString
              ? updated
              : ad
          )
        );

        setSelectedAd(updated);
      } else {
        setAds((prev) =>
          prev.map((ad) =>
            getRecordId(ad) === idString
              ? { ...ad, ...updatedAd }
              : ad
          )
        );

        setSelectedAd((prev) =>
          prev && getRecordId(prev) === idString
            ? { ...prev, ...updatedAd }
            : prev
        );
      }

      notify.success(
        "Advertisement updated successfully!"
      );
    } catch (error) {
      notify.error(
        error.message || "Ad update nahi ho paya."
      );
    }
  };

  /* Subscriptions */
  const addSubscription = async (newSubscription) => {
    if (!newSubscription) return;

    try {
      const created = await requestJson(
        `${API_BASE_URL}/subscriptions`,
        {
          method: "POST",
          body: JSON.stringify(
            cleanPayload(newSubscription)
          ),
        }
      );

      setSubscriptions((prev) => [created, ...prev]);
      setEditingSubscription(null);
      clearPageRecord("adminEditingSubscriptionId");
      setActivePage("subscriptions");

      notify.success(
        "Subscription added successfully!"
      );
    } catch (error) {
      notify.error(
        error.message || "Subscription add nahi ho payi."
      );
    }
  };

  const updateSubscription = async (
    updatedSubscription
  ) => {
    if (!updatedSubscription) return;

    const id =
      updatedSubscription._id || updatedSubscription.id;

    if (!id) {
      notify.error(
        "Subscription ID not found. Please refresh and try again."
      );
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
      notify.error(
        "Invalid subscription ID. Please refresh the page."
      );
      return;
    }

    try {
      const updated = await requestJson(
        `${API_BASE_URL}/subscriptions/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(
            cleanPayload(updatedSubscription)
          ),
        }
      );

      setSubscriptions((prev) =>
        prev.map((subscription) =>
          String(
            getRecordId(subscription) ||
              subscription.subscriptionId
          ) === String(id)
            ? updated
            : subscription
        )
      );

      setSelectedSubscription(updated);
      setEditingSubscription(null);
      clearPageRecord("adminEditingSubscriptionId");
      persistPageRecord(
        "adminSelectedSubscriptionId",
        updated
      );
      setActivePage("subscriptions");

      notify.success(
        "Subscription updated successfully!"
      );
    } catch (error) {
      notify.error(
        error.message || "Subscription update nahi ho payi."
      );
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    if (!subscriptionId) return;

    const confirmed =
      await notify.confirmDelete("subscription");
    if (!confirmed) return;

    try {
      await requestJson(
        `${API_BASE_URL}/subscriptions/${subscriptionId}`,
        { method: "DELETE" }
      );

      setSubscriptions((prev) =>
        prev.filter(
          (subscription) =>
            String(
              getRecordId(subscription) ||
                subscription.subscriptionId
            ) !== String(subscriptionId)
        )
      );

      setActivePage("subscriptions");

      notify.success(
        "Subscription deleted successfully!"
      );
    } catch (error) {
      notify.error(
        error.message || "Subscription delete nahi ho payi."
      );
    }
  };

  const openSubscription = (subscription) => {
    if (!subscription) return;
    setSelectedSubscription(subscription);
    persistPageRecord(
      "adminSelectedSubscriptionId",
      subscription
    );
    setActivePage("subscription-details");
  };

  const openEditSubscription = (subscription) => {
    if (!subscription) return;
    setEditingSubscription(subscription);
    persistPageRecord(
      "adminEditingSubscriptionId",
      subscription
    );
    setActivePage("edit-subscription");
  };

  const renewSubscription = (subscription) => {
    if (!subscription) return;

    const userId = getObjectIdString(
      subscription.user || subscription.userId
    );
    const planId = getObjectIdString(
      subscription.plan || subscription.planId
    );

    const start = new Date(
      subscription.endDate || new Date()
    );
    start.setDate(start.getDate() + 1);

    const days =
      subscription.billingCycle === "Yearly" ? 365 : 30;

    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);

    updateSubscription({
      ...subscription,
      _id: subscription._id || subscription.id,
      user: userId,
      plan: planId,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      status: "Active",
      paymentStatus: "Paid",
      lastPayment: new Date().toISOString().split("T")[0],
      nextBillingDate: new Date(
        end.getTime() + 86400000
      )
        .toISOString()
        .split("T")[0],
    });
  };

  const cancelSubscription = async (subscription) => {
    if (!subscription) return;

    const confirmed = await notify.confirm(
      "Cancel Subscription?",
      "Are you sure you want to cancel this subscription?",
      "Yes, cancel it",
      "No, keep it",
      "warning"
    );
    if (!confirmed) return;

    const userId = getObjectIdString(
      subscription.user || subscription.userId
    );
    const planId = getObjectIdString(
      subscription.plan || subscription.planId
    );

    updateSubscription({
      ...subscription,
      _id: subscription._id || subscription.id,
      user: userId,
      plan: planId,
      status: "Cancelled",
      autoRenewal: false,
    });
  };

  /* =======================================================
     PLANS — ✅ FIXED
  ======================================================= */

  const addPlan = async (newPlan) => {
    if (!newPlan) return;

    try {
      // ✅ _id mat bhejo — MongoDB khud banayega
      const payload = cleanPayload(newPlan);

      const created = await requestJson(
        `${API_BASE_URL}/plans`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setPlans((prev) => [created, ...prev]);
      setEditingPlan(null);
      clearPageRecord("adminEditingPlanId");
      setActivePage("plans");

      notify.success("Plan added successfully!");
    } catch (error) {
      notify.error(
        error.message || "Plan add nahi ho paya."
      );
    }
  };

  const updatePlan = async (updatedPlan) => {
    if (!updatedPlan) return;

    // ✅ MongoDB _id use karo (custom planId nahi)
    const id = getRecordId(updatedPlan);

    if (!id) {
      notify.error(
        "Plan ID not found. Please refresh and try again."
      );
      return;
    }

    // ✅ ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
      notify.error(
        "Invalid plan ID. Please refresh the page."
      );
      return;
    }

    try {
      const updated = await requestJson(
        `${API_BASE_URL}/plans/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(
            cleanPayload(updatedPlan)
          ),
        }
      );

      setPlans((prev) =>
        prev.map((plan) =>
          String(getRecordId(plan)) === String(id)
            ? updated
            : plan
        )
      );

      setEditingPlan(null);
      clearPageRecord("adminEditingPlanId");
      setActivePage("plans");

      notify.success("Plan updated successfully!");
    } catch (error) {
      notify.error(
        error.message || "Plan update nahi ho paya."
      );
    }
  };

  const deletePlan = async (planId) => {
    if (!planId) return;

    const confirmed = await notify.confirmDelete("plan");
    if (!confirmed) return;

    // ✅ ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(String(planId))) {
      notify.error(
        "Invalid plan ID. Please refresh the page."
      );
      return;
    }

    try {
      await requestJson(
        `${API_BASE_URL}/plans/${planId}`,
        { method: "DELETE" }
      );

      setPlans((prev) =>
        prev.filter(
          (plan) =>
            String(getRecordId(plan)) !== String(planId)
        )
      );

      setActivePage("plans");

      notify.success("Plan deleted successfully!");
    } catch (error) {
      notify.error(
        error.message || "Plan delete nahi ho paya."
      );
    }
  };

  const openEditPlan = (plan) => {
    if (!plan) return;
    setEditingPlan(plan);
    persistPageRecord("adminEditingPlanId", plan);
    setActivePage("edit-plan");
  };

  /* Player */
  const playSong = (song, playlistSongs = []) => {
    if (!song) return;

    const normalized = normalizeSong(song);
    const list = playlistSongs.length
      ? playlistSongs.map(normalizeSong)
      : [normalized];

    const nextSong = {
      ...normalized,
      playlistSongs: list,
    };

    setCurrentSong(nextSong);

    try {
      localStorage.setItem(
        "adminCurrentSong",
        JSON.stringify(nextSong)
      );
    } catch {}

    setCurrentTime(0);
    setIsPlaying(true);
    setIsLiked(false);
  };

  const openSongPlayer = (song, playlistSongs = []) => {
    if (!song) return;
    playSong(song, playlistSongs);
    setActivePage("song-player");
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const playNextSong = () => {
    if (!currentSong) return;

    const list = currentSong.playlistSongs || [];
    if (list.length <= 1) return;

    const currentIndex = list.findIndex(
      (song) =>
        getRecordId(song) === getRecordId(currentSong)
    );

    let nextIndex;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * list.length);
      if (list.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % list.length;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= list.length) nextIndex = 0;

    playSong(list[nextIndex], list);
  };

  const playPreviousSong = () => {
    if (!currentSong) return;

    const list = currentSong.playlistSongs || [];
    if (list.length <= 1) return;

    const currentIndex = list.findIndex(
      (song) =>
        getRecordId(song) === getRecordId(currentSong)
    );

    const previousIndex =
      currentIndex <= 0
        ? list.length - 1
        : currentIndex - 1;

    playSong(list[previousIndex], list);
  };

  const handleSongEnded = () => {
    if (!currentSong) return;

    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    playNextSong();
  };

  const seekSong = (value) => {
    if (!audioRef.current) return;
    const time = Number(value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secondsValue = Math.floor(seconds % 60);

    return `${minutes}:${String(secondsValue).padStart(
      2,
      "0"
    )}`;
  };

  /* Auth */
  const handleLogin = () => {
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem(
      "adminActivePage",
      "dashboard"
    );

    setActivePageState("dashboard");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("rememberAdmin");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUserId");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("adminProfile");
    localStorage.removeItem("adminProfileImage");

    [
      "adminSelectedArtistId",
      "adminEditingArtistId",
      "adminSelectedAlbumId",
      "adminEditingAlbumId",
      "adminSelectedPlaylistId",
      "adminEditingPlaylistId",
      "adminSelectedMediaId",
      "adminSelectedMediaRecord",
      "adminEditingMediaId",
      "adminSelectedUserId",
      "adminEditingUserId",
      "adminSelectedSubscriptionId",
      "adminEditingSubscriptionId",
      "adminEditingSongId",
      "adminEditingPlanId",
      "adminCurrentSong",
    ].forEach((key) => localStorage.removeItem(key));

    localStorage.setItem("adminActivePage", "login");

    setActivePageState("login");
    setIsLoggedIn(false);
  };

  /* =======================================================
     RENDER PAGE
  ======================================================= */

  const renderPage = () => {
    const savedEditingSongId = localStorage.getItem(
      "adminEditingSongId"
    );
    const savedSelectedArtistId = localStorage.getItem(
      "adminSelectedArtistId"
    );
    const savedEditingArtistId = localStorage.getItem(
      "adminEditingArtistId"
    );
    const savedSelectedAlbumId = localStorage.getItem(
      "adminSelectedAlbumId"
    );
    const savedEditingAlbumId = localStorage.getItem(
      "adminEditingAlbumId"
    );
    const savedSelectedPlaylistId = localStorage.getItem(
      "adminSelectedPlaylistId"
    );
    const savedEditingPlaylistId = localStorage.getItem(
      "adminEditingPlaylistId"
    );
    const savedSelectedMediaId = localStorage.getItem(
      "adminSelectedMediaId"
    );
    const savedEditingMediaId = localStorage.getItem(
      "adminEditingMediaId"
    );
    const savedSelectedUserId = localStorage.getItem(
      "adminSelectedUserId"
    );
    const savedEditingUserId = localStorage.getItem(
      "adminEditingUserId"
    );
    const savedSelectedSubscriptionId =
      localStorage.getItem(
        "adminSelectedSubscriptionId"
      );
    const savedEditingSubscriptionId =
      localStorage.getItem("adminEditingSubscriptionId");
    const savedEditingPlanId = localStorage.getItem(
      "adminEditingPlanId"
    );

    const pageEditingSong =
      editingSong ||
      songs.find(
        (song) =>
          getRecordId(song) ===
          String(savedEditingSongId || "")
      );

    const pageSelectedArtist =
      selectedArtist ||
      artists.find(
        (artist) =>
          getRecordId(artist) ===
          String(savedSelectedArtistId || "")
      );

    const pageEditingArtist =
      editingArtist ||
      artists.find(
        (artist) =>
          getRecordId(artist) ===
          String(savedEditingArtistId || "")
      );

    const pageSelectedAlbum =
      selectedAlbum ||
      albums.find(
        (album) =>
          getRecordId(album) ===
          String(savedSelectedAlbumId || "")
      );

    const pageEditingAlbum =
      editingAlbum ||
      albums.find(
        (album) =>
          getRecordId(album) ===
          String(savedEditingAlbumId || "")
      );

    const pageSelectedPlaylist =
      selectedPlaylist ||
      playlists.find(
        (playlist) =>
          getRecordId(playlist) ===
          String(savedSelectedPlaylistId || "")
      );

    const pageEditingPlaylist =
      editingPlaylist ||
      playlists.find(
        (playlist) =>
          getRecordId(playlist) ===
          String(savedEditingPlaylistId || "")
      );

    const pageSelectedMedia =
      selectedMedia ||
      mediaFiles.find(
        (media) =>
          getRecordId(media) ===
          String(savedSelectedMediaId || "")
      );

    const pageEditingMedia =
      editingMedia ||
      mediaFiles.find(
        (media) =>
          getRecordId(media) ===
          String(savedEditingMediaId || "")
      );

    const pageSelectedUser =
      selectedUser ||
      users.find(
        (user) =>
          getRecordId(user) ===
          String(savedSelectedUserId || "")
      );

    const pageEditingUser =
      editingUser ||
      users.find(
        (user) =>
          getRecordId(user) ===
          String(savedEditingUserId || "")
      );

    const pageSelectedSubscription =
      selectedSubscription ||
      subscriptions.find(
        (subscription) =>
          String(
            getRecordId(subscription) ||
              subscription.subscriptionId
          ) ===
          String(savedSelectedSubscriptionId || "")
      );

    const pageEditingSubscription =
      editingSubscription ||
      subscriptions.find(
        (subscription) =>
          String(
            getRecordId(subscription) ||
              subscription.subscriptionId
          ) ===
          String(savedEditingSubscriptionId || "")
      );

    const pageEditingPlan =
      editingPlan ||
      plans.find(
        (plan) =>
          String(getRecordId(plan)) ===
          String(savedEditingPlanId || "")
      );

    const recordPageNeedsData = [
      "edit-song",
      "view-artist",
      "edit-artist",
      "view-album",
      "edit-album",
      "view-playlist",
      "edit-playlist",
      "view-media",
      "edit-media",
      "user-details",
      "edit-user",
      "subscription-details",
      "edit-subscription",
      "edit-plan",
    ].includes(activePage);

    if (recordPageNeedsData && initialDataLoading) {
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Loading...
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            setActivePage={setActivePage}
            songs={songs}
            users={users}
            artists={artists}
            albums={albums}
            playlists={playlists}
            subscriptions={subscriptions}
          />
        );

      case "admin-profile":
        return (
          <AdminProfile
            setActivePage={setActivePage}
            onLogout={handleLogout}
          />
        );

      case "songs":
        return (
          <SongLibrary
            songs={songs}
            setActivePage={setActivePage}
            openEditSong={openEditSong}
            deleteSong={deleteSong}
            playSong={playSong}
            openSongPlayer={openSongPlayer}
          />
        );

      case "add-song":
        return (
          <AddSong
            setActivePage={setActivePage}
            addSong={addSong}
            mediaFiles={mediaFiles}
            addImageToMediaLibrary={
              addImageToMediaLibrary
            }
            addMediaFileToLibrary={
              addMediaFileToLibrary
            }
          />
        );

      case "edit-song":
        return (
          <EditSong
            song={pageEditingSong}
            setActivePage={setActivePage}
            updateSong={updateSong}
            mediaFiles={mediaFiles}
            addImageToMediaLibrary={
              addImageToMediaLibrary
            }
            addMediaFileToLibrary={
              addMediaFileToLibrary
            }
          />
        );

      case "song-player":
        return (
          <SongPlayer
            currentSong={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isLiked={isLiked}
            setIsLiked={setIsLiked}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            repeat={repeat}
            setRepeat={setRepeat}
            shuffle={shuffle}
            setShuffle={setShuffle}
            currentTime={currentTime}
            duration={duration}
            seekSong={seekSong}
            playNextSong={playNextSong}
            playPreviousSong={playPreviousSong}
            setActivePage={setActivePage}
          />
        );

      case "artists":
        return (
          <Artists
            artists={artists}
            setActivePage={setActivePage}
            openArtist={openArtist}
            openEditArtist={openEditArtist}
            deleteArtist={deleteArtist}
          />
        );

      case "add-artist":
        return (
          <AddArtist
            setActivePage={setActivePage}
            addArtist={addArtist}
          />
        );

      case "edit-artist":
        return (
          <EditArtist
            artist={pageEditingArtist}
            setActivePage={setActivePage}
            updateArtist={updateArtist}
          />
        );

      case "view-artist":
        return (
          <ArtistView
            artist={pageSelectedArtist}
            setActivePage={setActivePage}
            openEditArtist={openEditArtist}
            songs={songs}
            playSong={playSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        );

      case "albums":
        return (
          <Albums
            albums={albums}
            setAlbums={setAlbums}
            setActivePage={setActivePage}
            openAlbum={openAlbum}
            openEditAlbum={openEditAlbum}
            deleteAlbum={deleteAlbum}
          />
        );

      case "add-album":
        return (
          <AddAlbum
            setActivePage={setActivePage}
            addAlbum={addAlbum}
            songs={songs}
            mediaFiles={mediaFiles}
            addMediaFileToLibrary={
              addMediaFileToLibrary
            }
          />
        );

      case "edit-album":
        return (
          <EditAlbum
            album={pageEditingAlbum}
            setActivePage={setActivePage}
            updateAlbum={updateAlbum}
            songs={songs}
            mediaFiles={mediaFiles}
            addImageToMediaLibrary={
              addImageToMediaLibrary
            }
          />
        );

      case "view-album":
        return (
          <AlbumView
            album={pageSelectedAlbum}
            setActivePage={setActivePage}
            openEditAlbum={openEditAlbum}
            deleteAlbum={deleteAlbum}
            playSong={playSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        );

      case "media":
        return (
          <MediaLibrary
            mediaFiles={mediaFiles}
            songs={songs}
            playlists={playlists}
            artists={artists}
            albums={albums}
            users={users}
            setActivePage={setActivePage}
            openMedia={openMedia}
            openEditMedia={openEditMedia}
            deleteMedia={deleteMedia}
          />
        );

      case "add-media":
        return (
          <AddMedia
            setActivePage={setActivePage}
            addMedia={addMedia}
            mediaFiles={mediaFiles}
          />
        );

      case "view-media":
        if (!pageSelectedMedia) return null;
        return (
          <MediaView
            media={pageSelectedMedia}
            setActivePage={setActivePage}
            openEditMedia={openEditMedia}
            deleteMedia={deleteMedia}
          />
        );

      case "edit-media":
        return (
          <EditMedia
            media={pageEditingMedia}
            setActivePage={setActivePage}
            updateMedia={updateMedia}
            mediaFiles={mediaFiles}
          />
        );

      case "playlists":
        return (
          <Playlist
            playlists={playlists}
            setActivePage={setActivePage}
            openPlaylist={openPlaylist}
            openEditPlaylist={openEditPlaylist}
            deletePlaylist={deletePlaylist}
          />
        );

      case "view-playlist":
        return (
          <PlaylistView
            playlist={pageSelectedPlaylist}
            songs={songs}
            setActivePage={setActivePage}
            playSong={playSong}
            openSongPlayer={openSongPlayer}
            openEditPlaylist={openEditPlaylist}
            currentSong={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isLiked={isLiked}
            setIsLiked={setIsLiked}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            repeat={repeat}
            setRepeat={setRepeat}
            shuffle={shuffle}
            setShuffle={setShuffle}
            currentTime={currentTime}
            duration={duration}
            seekSong={seekSong}
            formatTime={formatTime}
            playNextSong={playNextSong}
            playPreviousSong={playPreviousSong}
            addSongToPlaylist={addSongToPlaylist}
            deleteSongFromPlaylist={
              deleteSongFromPlaylist
            }
          />
        );

      case "add-playlist":
        return (
          <AddPlaylist
            setActivePage={setActivePage}
            addPlaylist={addPlaylist}
            songs={songs}
            mediaFiles={mediaFiles}
          />
        );

      case "edit-playlist":
        return (
          <EditPlaylist
            playlist={pageEditingPlaylist}
            setActivePage={setActivePage}
            updatePlaylist={updatePlaylist}
            songs={songs}
            mediaFiles={mediaFiles}
          />
        );

      case "users":
        return (
          <Users
            users={users}
            setUsers={setUsers}
            setActivePage={setActivePage}
            setSelectedUser={setSelectedUser}
            openUser={openUserDetails}
            openEditUser={openEditUser}
            deleteUser={deleteUser}
          />
        );

      case "add-user":
        return (
          <AddUser
            setActivePage={setActivePage}
            addUser={addUser}
          />
        );

      case "edit-user":
        return (
          <EditUser
            key={
              editingUser?.id ?? editingUser?.userId
            }
            user={pageEditingUser}
            setActivePage={setActivePage}
            updateUser={updateUser}
          />
        );

      case "user-details":
        return (
          <UserDetails
            user={pageSelectedUser}
            setActivePage={setActivePage}
            openEditUser={openEditUser}
          />
        );

      case "subscriptions":
        return (
          <SubscriptionList
            subscriptions={subscriptions}
            setActivePage={setActivePage}
            openSubscription={openSubscription}
            openEditSubscription={openEditSubscription}
            deleteSubscription={deleteSubscription}
            renewSubscription={renewSubscription}
            cancelSubscription={cancelSubscription}
          />
        );

      case "add-subscription":
        return (
          <SubscriptionForm
            subscription={null}
            users={users}
            plans={plans}
            setActivePage={setActivePage}
            onSave={addSubscription}
          />
        );

      case "edit-subscription":
        return (
          <SubscriptionForm
            subscription={pageEditingSubscription}
            users={users}
            plans={plans}
            setActivePage={setActivePage}
            onSave={updateSubscription}
          />
        );

      case "subscription-details":
        return (
          <SubscriptionDetails
            subscription={pageSelectedSubscription}
            setActivePage={setActivePage}
            openEditSubscription={openEditSubscription}
            renewSubscription={renewSubscription}
            cancelSubscription={cancelSubscription}
            deleteSubscription={deleteSubscription}
          />
        );

      case "plans":
        return (
          <PlanList
            plans={plans}
            setActivePage={setActivePage}
            openEditPlan={openEditPlan}
            deletePlan={deletePlan}
          />
        );

      case "add-plan":
        return (
          <PlanForm
            plan={null}
            setActivePage={setActivePage}
            onSave={addPlan}
          />
        );

      case "edit-plan":
        return (
          <PlanForm
            key={pageEditingPlan?._id || pageEditingPlan?.id || "edit-plan"}
            plan={pageEditingPlan}
            setActivePage={setActivePage}
            onSave={updatePlan}
          />
        );

      case "ads":
        return (
          <Ads
            ads={ads}
            setAds={setAds}
            setActivePage={setActivePage}
            openViewAd={openViewAd}
            openEditAd={openEditAd}
            deleteAd={deleteAd}
            updateAd={updateAd}
          />
        );

      case "add-ad":
        return (
          <AddAd
            setActivePage={setActivePage}
            addAd={addAd}
          />
        );

      case "view-ad":
        return (
          <ViewAd
            ad={selectedAd}
            setActivePage={setActivePage}
            closeViewAd={() => {
              setSelectedAd(null);
              setActivePage("ads");
            }}
            openEditAd={openEditAd}
          />
        );

      case "edit-ad":
        return (
          <AddAd
            setActivePage={setActivePage}
            addAd={addAd}
            updateAd={updateAd}
            editingAd={selectedAd}
          />
        );

      case "ad-networks":
        return (
          <AdNetworks
            ads={ads}
            adNetworks={adNetworks}
            setAdNetworks={setAdNetworks}
            setActivePage={setActivePage}
          />
        );

      case "settings":
        return (
          <Settings
            setActivePage={setActivePage}
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
          />
        );

      default:
        return (
          <Dashboard
            setActivePage={setActivePage}
            songs={songs}
            artists={artists}
            albums={albums}
            playlists={playlists}
            subscriptions={subscriptions}
          />
        );
    }
  };

  if (!isLoggedIn || activePage === "login") {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <main className="main-content">{renderPage()}</main>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnded}
      />
    </div>
  );
};

export default App;