import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Music,
  Image as ImageIcon,
  Video,
  File,
  Eye,
  Trash2,
  Edit,
  Filter,
  Folder,
  ArrowLeft,
  LayoutGrid,
  List,
  Users,
  Disc3,
  ListMusic,
  Mic2,
  MoreHorizontal,
} from "lucide-react";

import "./MediaLibrary.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "");

/* =========================================================
   FOLDERS
========================================================= */

const FOLDERS = [
  {
    id: "songs",
    name: "Songs",
    icon: Music,
    description: "Song audio, covers and music videos",
  },
  {
    id: "playlists",
    name: "Playlists",
    icon: ListMusic,
    description: "Playlist covers and related media",
  },
  {
    id: "artists",
    name: "Artists",
    icon: Mic2,
    description: "Artist images and media",
  },
  {
    id: "albums",
    name: "Albums",
    icon: Disc3,
    description: "Album covers and album media",
  },
  {
    id: "users",
    name: "Users",
    icon: Users,
    description: "User profile images",
  },
  {
    id: "other",
    name: "Other Media",
    icon: MoreHorizontal,
    description: "Other uploaded media",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getId = (item) =>
  item?.id ??
  item?.userId ??
  item?._id ??
  "";

const toMediaUrl = (value) => {
  const url = String(value ?? "").trim();

  if (!url) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${SERVER_BASE_URL}${url}`;
  }

  return `${SERVER_BASE_URL}/${url.replace(/^\/+/, "")}`;
};

const getImageUrl = (item) =>
  item?.imageUrl ||
  item?.coverUrl ||
  item?.coverImage ||
  item?.profileImage ||
  item?.avatar ||
  item?.image ||
  item?.photoUrl ||
  "";

const getAudioUrl = (item) =>
  item?.audioUrl ||
  item?.audio ||
  item?.audioFileUrl ||
  item?.fileUrl ||
  "";

/* =========================================================
   ENTITY MEDIA (यह पूरा function वैसा ही रहेगा)
========================================================= */

const getEntityMedia = ({
  songs = [],
  playlists = [],
  artists = [],
  albums = [],
  users = [],
}) => {
  const generated = [];

  /* SONGS */
  songs.forEach((song) => {
    const songId = getId(song);

    const title =
      song?.title || song?.name || "Untitled Song";

    const artist =
      song?.artist ||
      song?.artistName ||
      "Unknown Artist";

    const album =
      song?.album || song?.albumName || "Single";

    const imageUrl = toMediaUrl(getImageUrl(song));
    const audioUrl = toMediaUrl(getAudioUrl(song));

    generated.push({
      id: `song-${songId}`,
      entityId: songId,
      title,
      fileName:
        song?.audioFileName ||
        song?.audioFile?.name ||
        (audioUrl
          ? `${
              normalize(title).replace(/\s+/g, "-") || "song"
            }.mp3`
          : "No audio file"),
      type: audioUrl ? "Audio" : imageUrl ? "Image" : "Other",
      format:
        song?.audioFormat ||
        (audioUrl ? "MP3" : imageUrl ? "JPG" : "-"),
      size: song?.audioSize || song?.fileSize || song?.size || "-",
      duration: song?.duration || "-",
      artist,
      album,
      genre: song?.genre || "-",
      language: song?.language || "-",
      usedFor: "Song",
      status: song?.status || "Active",
      uploadDate:
        song?.releaseDate ||
        song?.createdDate ||
        song?.createdAt ||
        "-",
      url: audioUrl || imageUrl || "",
      previewUrl: imageUrl || "",
      audioUrl,
      imageUrl,
      fileType: audioUrl
        ? "audio/mpeg"
        : imageUrl
        ? "image/jpeg"
        : "",
      source: "song",
      sourceId: songId,
      realMedia: true,
      isEntityRecord: true,
    });
  });

  /* PLAYLISTS */
  playlists.forEach((playlist) => {
    const playlistId = getId(playlist);

    const name =
      playlist?.name || playlist?.title || "Untitled Playlist";

    const imageUrl = toMediaUrl(getImageUrl(playlist));

    generated.push({
      id: `playlist-${playlistId}`,
      entityId: playlistId,
      title: name,
      fileName:
        playlist?.imageFile?.name ||
        playlist?.imageFileName ||
        playlist?.coverFile?.name ||
        (imageUrl
          ? `${
              normalize(name).replace(/\s+/g, "-") || "playlist"
            }-cover.jpg`
          : "No cover image"),
      type: imageUrl ? "Image" : "Other",
      format: imageUrl ? "JPG" : "-",
      size:
        playlist?.imageSize ||
        playlist?.coverSize ||
        playlist?.size ||
        "-",
      duration: playlist?.duration || "0 min",
      artist: "",
      album: "",
      genre: playlist?.genre || "-",
      language: playlist?.language || "-",
      usedFor: "Playlist",
      status: playlist?.status || "Active",
      uploadDate:
        playlist?.createdDate || playlist?.createdAt || "-",
      url: imageUrl,
      previewUrl: imageUrl,
      imageUrl,
      fileType: imageUrl ? "image/jpeg" : "",
      source: "playlist",
      sourceId: playlistId,
      realMedia: true,
      isEntityRecord: true,
    });
  });

  /* ARTISTS */
  artists.forEach((artist) => {
    const artistId = getId(artist);

    const name =
      artist?.name || artist?.artistName || "Unknown Artist";

    const imageUrl = toMediaUrl(getImageUrl(artist));

    generated.push({
      id: `artist-${artistId}`,
      entityId: artistId,
      title: name,
      fileName:
        artist?.imageFile?.name ||
        artist?.imageFileName ||
        (imageUrl
          ? `${
              normalize(name).replace(/\s+/g, "-") || "artist"
            }-profile.jpg`
          : "No profile image"),
      type: imageUrl ? "Image" : "Other",
      format: imageUrl ? "JPG" : "-",
      size: artist?.imageSize || artist?.size || "-",
      duration: "-",
      artist: name,
      album: "",
      genre: artist?.genre || "-",
      language: artist?.language || "-",
      usedFor: "Artist",
      status: artist?.status || "Active",
      uploadDate:
        artist?.createdDate || artist?.createdAt || "-",
      url: imageUrl,
      previewUrl: imageUrl,
      imageUrl,
      fileType: imageUrl ? "image/jpeg" : "",
      source: "artist",
      sourceId: artistId,
      realMedia: true,
      isEntityRecord: true,
    });
  });

  /* ALBUMS */
  albums.forEach((album) => {
    const albumId = getId(album);

    const title =
      album?.title || album?.name || "Untitled Album";

    const imageUrl = toMediaUrl(getImageUrl(album));

    generated.push({
      id: `album-${albumId}`,
      entityId: albumId,
      title,
      fileName:
        album?.coverFile?.name ||
        album?.imageFile?.name ||
        album?.coverFileName ||
        (imageUrl
          ? `${
              normalize(title).replace(/\s+/g, "-") || "album"
            }-cover.jpg`
          : "No cover image"),
      type: imageUrl ? "Image" : "Other",
      format: imageUrl ? "JPG" : "-",
      size:
        album?.coverSize ||
        album?.imageSize ||
        album?.size ||
        "-",
      duration: album?.duration || "-",
      artist: album?.artist || album?.artistName || "",
      album: title,
      genre: album?.genre || "-",
      language: album?.language || "-",
      usedFor: "Album",
      status: album?.status || "Active",
      uploadDate:
        album?.releaseDate ||
        album?.createdDate ||
        album?.createdAt ||
        "-",
      url: imageUrl,
      previewUrl: imageUrl,
      imageUrl,
      fileType: imageUrl ? "image/jpeg" : "",
      source: "album",
      sourceId: albumId,
      realMedia: true,
      isEntityRecord: true,
    });
  });

  /* USERS */
  users.forEach((user) => {
    const userId = getId(user);

    const name =
      user?.name ||
      user?.username ||
      user?.fullName ||
      "Unknown User";

    const imageUrl = toMediaUrl(getImageUrl(user));

    generated.push({
      id: `user-${userId}`,
      entityId: userId,
      title: name,
      fileName:
        user?.imageFile?.name ||
        user?.imageFileName ||
        (imageUrl
          ? `${
              normalize(user?.username || name).replace(
                /\s+/g,
                "-"
              ) || "user"
            }-profile.jpg`
          : "No profile image"),
      type: imageUrl ? "Image" : "Other",
      format: imageUrl ? "JPG" : "-",
      size: user?.imageSize || user?.size || "-",
      duration: "-",
      artist: "",
      album: "",
      genre: "",
      language: user?.language || "-",
      usedFor: "User",
      status: user?.status || "Active",
      uploadDate:
        user?.joined ||
        user?.createdDate ||
        user?.createdAt ||
        "-",
      url: imageUrl,
      previewUrl: imageUrl,
      imageUrl,
      fileType: imageUrl ? "image/jpeg" : "",
      source: "user",
      sourceId: userId,
      realMedia: true,
      isEntityRecord: true,
    });
  });

  return generated;
};

/* =========================================================
   COMPONENT
========================================================= */

function MediaLibrary({
  mediaFiles = [],
  songs = [],
  playlists = [],
  artists = [],
  albums = [],
  users = [],
  setActivePage,
  openMedia,
  openEditMedia,
  deleteMedia,
}) {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table");

  const [backendMedia, setBackendMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* =======================================================
     FETCH MEDIA FROM MONGODB
  ======================================================= */

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);

      const response = await fetch(`${API_BASE_URL}/media`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load media"
        );
      }

      if (
        result?.success &&
        Array.isArray(result?.data)
      ) {
        setBackendMedia(result.data);
      } else {
        setBackendMedia([]);
      }
    } catch (error) {
      console.error(
        "❌ Media Library fetch error:",
        error
      );
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  /* =======================================================
     ENTITY MEDIA
  ======================================================= */

  const entityMedia = useMemo(() => {
    return getEntityMedia({
      songs,
      playlists,
      artists,
      albums,
      users,
    });
  }, [songs, playlists, artists, albums, users]);

  /* =======================================================
     MONGODB MEDIA
  ======================================================= */

  const uploadedMedia = useMemo(() => {
    const sourceData = Array.isArray(backendMedia)
      ? backendMedia
      : [];

    return sourceData.map((media) => {
      const id = media?._id || media?.id;

      const mediaType = media?.type || "Other";

      const url = toMediaUrl(
        media?.url ||
          media?.filePath ||
          media?.fileUrl ||
          media?.path ||
          ""
      );

      let previewUrl = "";

      if (normalize(mediaType) === "image") {
        previewUrl = url;
      }

      if (media?.previewUrl) {
        previewUrl = toMediaUrl(media.previewUrl);
      }

      return {
        ...media,
        id,
        source: "media-library",
        sourceId: id,
        entityId: id,
        realMedia: true,
        isEntityRecord: false,

        title:
          media?.title ||
          media?.originalFileName ||
          media?.fileName ||
          "Untitled Media",

        fileName:
          media?.fileName ||
          media?.originalFileName ||
          "-",

        originalFileName: media?.originalFileName || "",
        type: mediaType,
        format: media?.format || "-",
        size: media?.size || "-",
        duration: media?.duration || "-",
        artist: media?.artist || "",
        album: media?.album || "",
        genre: media?.genre || "-",
        language: media?.language || "-",
        usedFor: media?.usedFor || "Other",
        status: media?.status || "Active",

        uploadDate:
          media?.createdAt || media?.uploadDate || "-",

        url,
        previewUrl,
        imageUrl: previewUrl,
        fileType: media?.fileType || "",

        audioUrl:
          normalize(mediaType) === "audio" ? url : "",

        sourceRecord: media,
      };
    });
  }, [backendMedia]);

  /* =======================================================
     FOLDER MEDIA
  ======================================================= */

  const folderMedia = useMemo(() => {
    return {
      songs: entityMedia.filter(
        (media) => media.source === "song"
      ),
      playlists: entityMedia.filter(
        (media) => media.source === "playlist"
      ),
      artists: entityMedia.filter(
        (media) => media.source === "artist"
      ),
      albums: entityMedia.filter(
        (media) => media.source === "album"
      ),
      users: entityMedia.filter(
        (media) => media.source === "user"
      ),
      other: uploadedMedia,
    };
  }, [entityMedia, uploadedMedia]);

  /* =======================================================
     MODULE COUNTS
  ======================================================= */

  const moduleCounts = {
    songs: songs.length,
    playlists: playlists.length,
    artists: artists.length,
    albums: albums.length,
    users: users.length,
    other: uploadedMedia.length,
  };

  /* =======================================================
     ALL ACTUAL MEDIA
  ======================================================= */

  const allActualMedia = useMemo(() => {
    return [...entityMedia, ...uploadedMedia];
  }, [entityMedia, uploadedMedia]);

  /* =======================================================
     CURRENT FOLDER
  ======================================================= */

  const currentFolder = FOLDERS.find(
    (folder) => folder.id === selectedFolder
  );

  const currentMedia = selectedFolder
    ? folderMedia[selectedFolder] || []
    : [];

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMedia = useMemo(() => {
    if (!selectedFolder) {
      return [];
    }

    const query = normalize(search);

    return currentMedia.filter((media) => {
      const matchesSearch =
        !query ||
        normalize(media.title).includes(query) ||
        normalize(media.fileName).includes(query) ||
        normalize(media.artist).includes(query) ||
        normalize(media.album).includes(query) ||
        normalize(media.usedFor).includes(query);

      const matchesType =
        typeFilter === "All" ||
        normalize(media.type) === normalize(typeFilter);

      const matchesStatus =
        statusFilter === "All" ||
        normalize(media.status) === normalize(statusFilter);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [
    selectedFolder,
    currentMedia,
    search,
    typeFilter,
    statusFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalMedia = allActualMedia.length;

  const totalAudio = allActualMedia.filter(
    (media) => normalize(media.type) === "audio"
  ).length;

  const totalImages = allActualMedia.filter(
    (media) => normalize(media.type) === "image"
  ).length;

  const totalVideo = allActualMedia.filter(
    (media) => normalize(media.type) === "video"
  ).length;

  const totalActive = allActualMedia.filter((media) => {
    const status = normalize(media.status);

    return status === "active" || status === "published";
  }).length;

  /* =======================================================
     RESET FOLDER
  ======================================================= */

  const resetFolder = () => {
    setSelectedFolder(null);
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  /* =======================================================
     OPEN FOLDER
  ======================================================= */

  const openFolder = (folderId) => {
    setSelectedFolder(folderId);

    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setViewMode("table");
  };

  /* =======================================================
     MEDIA ICON
  ======================================================= */

  const getMediaIcon = (media) => {
    const type = normalize(media?.type);

    if (type === "audio") {
      return <Music size={20} />;
    }

    if (type === "image") {
      return <ImageIcon size={20} />;
    }

    if (type === "video") {
      return <Video size={20} />;
    }

    return <File size={20} />;
  };

  /* =======================================================
     PREVIEW IMAGE
  ======================================================= */

  const getPreviewImage = (media) => {
    if (media?.previewUrl) {
      return toMediaUrl(media.previewUrl);
    }

    if (
      normalize(media?.type) === "image" &&
      media?.url
    ) {
      return toMediaUrl(media.url);
    }

    return "";
  };

  /* =======================================================
     DELETE MEDIA
     ✅ NAYA: notify.confirmDelete + notify.error/warning
  ======================================================= */

  const handleDelete = async (media) => {
    /* ✅ alert → notify.warning */
    if (media?.source !== "media-library") {
      notify.warning(
        "Ye record original module ke data se aa raha hai. Isko Song, Album, Artist, Playlist ya User module se change karein."
      );
      return;
    }

    const mediaId = media?._id || media?.id;

    /* ✅ alert → notify.warning */
    if (!mediaId) {
      notify.warning("Media ID nahi mili.");
      return;
    }

    /* Double-click guard */
    if (deletingId === mediaId) {
      return;
    }

    /* ✅ window.confirm → notify.confirmDelete */
    const confirmed = await notify.confirmDelete(
      media.title || "this media"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(mediaId);

    try {
      /* 1️⃣ Library khud HTTP DELETE bheje */
      const response = await fetch(
        `${API_BASE_URL}/media/${mediaId}`,
        { method: "DELETE" }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      /* 2️⃣ 404 = already deleted — gracefully handle */
      if (response.status === 404) {
        setBackendMedia((prev) =>
          prev.filter(
            (item) =>
              String(item?._id || item?.id) !==
              String(mediaId)
          )
        );

        if (deleteMedia) deleteMedia(mediaId);

        notify.success(
          "Deleted!",
          "Media deleted successfully."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "Media delete failed"
        );
      }

      /* 3️⃣ Local backendMedia state se hatao */
      setBackendMedia((prev) =>
        prev.filter(
          (item) =>
            String(item?._id || item?.id) !==
            String(mediaId)
        )
      );

      /* 4️⃣ App.jsx की mediaFiles state sync */
      if (deleteMedia) deleteMedia(mediaId);

      /* ✅ Success notification */
      notify.success(
        "Deleted!",
        "Media deleted successfully."
      );
    } catch (error) {
      console.error("❌ Delete media error:", error);

      /* ✅ alert → notify.error */
      notify.error(
        error.message || "Media delete nahi ho paya."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (value) => {
    if (!value || value === "-") {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="media-library">
      {/* HEADER */}
      <div className="media-header">
        <div>
          <h1>Media Library</h1>

          <p>
            Manage all real media connected with your
            music application.
          </p>
        </div>

        <button
          className="media-upload-btn"
          onClick={() => setActivePage("add-media")}
        >
          <Plus size={18} />
          Upload Media
        </button>
      </div>

      {/* STATS */}
      <div className="media-stats">
        <div className="media-stat-card">
          <div className="media-stat-icon">
            <Folder size={20} />
          </div>
          <div>
            <span>Total Media</span>
            <strong>{totalMedia}</strong>
          </div>
        </div>

        <div className="media-stat-card">
          <div className="media-stat-icon">
            <Music size={20} />
          </div>
          <div>
            <span>Audio</span>
            <strong>{totalAudio}</strong>
          </div>
        </div>

        <div className="media-stat-card">
          <div className="media-stat-icon">
            <ImageIcon size={20} />
          </div>
          <div>
            <span>Images</span>
            <strong>{totalImages}</strong>
          </div>
        </div>

        <div className="media-stat-card">
          <div className="media-stat-icon">
            <Video size={20} />
          </div>
          <div>
            <span>Videos</span>
            <strong>{totalVideo}</strong>
          </div>
        </div>

        <div className="media-stat-card">
          <div className="media-stat-icon">
            <Filter size={20} />
          </div>
          <div>
            <span>Active</span>
            <strong>{totalActive}</strong>
          </div>
        </div>
      </div>

      {/* FOLDER VIEW */}
      {!selectedFolder && (
        <>
          <div className="media-section-heading">
            <div>
              <h2>Media Folders</h2>
              <p>
                Open a folder to see its real module data
                and media.
              </p>
            </div>
          </div>

          <div className="media-folder-grid">
            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const recordCount =
                moduleCounts[folder.id] || 0;

              return (
                <button
                  key={folder.id}
                  className="media-folder-card"
                  onClick={() => openFolder(folder.id)}
                >
                  <div className="media-folder-top">
                    <div className="media-folder-icon">
                      <Icon size={25} />
                    </div>
                    <span className="media-folder-arrow">→</span>
                  </div>

                  <div className="media-folder-content">
                    <h3>{folder.name}</h3>
                    <p>{folder.description}</p>
                  </div>

                  <div className="media-folder-footer">
                    <span>{recordCount} records</span>
                  </div>
                </button>
              );
            })}
          </div>

          {mediaLoading && (
            <div className="media-empty">
              <Folder size={42} />
              <h3>Loading media...</h3>
              <p>MongoDB se media load ho raha hai.</p>
            </div>
          )}

          {!mediaLoading && totalMedia === 0 && (
            <div className="media-empty">
              <Folder size={42} />
              <h3>No media available</h3>
              <p>
                Abhi kisi module mein data ya media
                available nahi hai.
              </p>

              <button
                onClick={() => setActivePage("add-media")}
              >
                <Plus size={17} />
                Upload Media
              </button>
            </div>
          )}
        </>
      )}

      {/* FOLDER CONTENT */}
      {selectedFolder && currentFolder && (
        <>
          {/* BREADCRUMB */}
          <div className="media-breadcrumb">
            <button onClick={resetFolder}>
              <ArrowLeft size={17} />
              Media Library
            </button>

            <span>/</span>

            <strong>{currentFolder.name}</strong>
          </div>

          {/* FOLDER HEADER */}
          <div className="media-folder-header">
            <div>
              <h2>{currentFolder.name}</h2>

              <p>
                {filteredMedia.length} records
                {filteredMedia.length !==
                  currentMedia.length &&
                  ` of ${currentMedia.length}`}
              </p>
            </div>

            <button
              className="media-back-btn"
              onClick={resetFolder}
            >
              <ArrowLeft size={17} />
              Back
            </button>
          </div>

          {/* FILTERS */}
          <div className="media-toolbar">
            <div className="media-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="All">All Types</option>
              <option value="Audio">Audio</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Published">Published</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="media-view-toggle">
              <button
                type="button"
                className={
                  viewMode === "table" ? "active" : ""
                }
                onClick={() => setViewMode("table")}
              >
                <List size={18} />
              </button>

              <button
                type="button"
                className={
                  viewMode === "grid" ? "active" : ""
                }
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          {/* LOADING */}
          {mediaLoading && selectedFolder === "other" && (
            <div className="media-empty">
              <Folder size={42} />
              <h3>Loading media...</h3>
              <p>MongoDB se media load ho raha hai.</p>
            </div>
          )}

          {/* TABLE */}
          {!mediaLoading && viewMode === "table" && (
            <div className="media-table-wrapper">
              <table className="media-table">
                <thead>
                  <tr>
                    <th>Media</th>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Size</th>
                    <th>Used For</th>
                    <th>Status</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMedia.map((media) => {
                    const image = getPreviewImage(media);
                    const currentId =
                      media?._id || media?.id;
                    const isDeleting =
                      deletingId === currentId;

                    return (
                      <tr key={media.id}>
                        <td>
                          <div className="media-name-cell">
                            {image ? (
                              <img
                                src={image}
                                alt={media.title}
                                className="media-preview"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="media-icon-box">
                                {getMediaIcon(media)}
                              </div>
                            )}

                            <div>
                              <strong>
                                {media.title || "Untitled"}
                              </strong>

                              {media.artist && (
                                <span>{media.artist}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>{media.fileName || "-"}</td>
                        <td>{media.type || "-"}</td>
                        <td>{media.format || "-"}</td>
                        <td>{media.size || "-"}</td>
                        <td>{media.usedFor || "-"}</td>

                        <td>
                          <span
                            className={`media-status ${
                              normalize(media.status) ===
                                "active" ||
                              normalize(media.status) ===
                                "published"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {media.status || "-"}
                          </span>
                        </td>

                        <td>{formatDate(media.uploadDate)}</td>

                        <td>
                          <div className="media-actions">
                            <button
                              type="button"
                              title="View"
                              onClick={() =>
                                openMedia?.(media)
                              }
                            >
                              <Eye size={17} />
                            </button>

                            {media.source ===
                              "media-library" && (
                              <>
                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    openEditMedia?.(
                                      media
                                    )
                                  }
                                >
                                  <Edit size={17} />
                                </button>

                                <button
                                  type="button"
                                  title="Delete"
                                  className="danger"
                                  disabled={isDeleting}
                                  onClick={() =>
                                    handleDelete(media)
                                  }
                                >
                                  <Trash2 size={17} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* GRID */}
          {!mediaLoading && viewMode === "grid" && (
            <div className="media-grid-view">
              {filteredMedia.map((media) => {
                const image = getPreviewImage(media);
                const currentId =
                  media?._id || media?.id;
                const isDeleting =
                  deletingId === currentId;

                return (
                  <div
                    className="media-grid-card"
                    key={media.id}
                  >
                    <div className="media-grid-preview">
                      {image ? (
                        <img
                          src={image}
                          alt={media.title}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="media-grid-icon">
                          {getMediaIcon(media)}
                        </div>
                      )}
                    </div>

                    <div className="media-grid-info">
                      <h3>{media.title || "Untitled"}</h3>
                      <p>{media.fileName || "-"}</p>

                      <div className="media-grid-meta">
                        <span>{media.type || "-"}</span>
                        <span>{media.size || "-"}</span>
                      </div>
                    </div>

                    <div className="media-grid-actions">
                      <button
                        type="button"
                        onClick={() => openMedia?.(media)}
                      >
                        <Eye size={16} />
                        View
                      </button>

                      {media.source === "media-library" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              openEditMedia?.(media)
                            }
                          >
                            <Edit size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(media)
                            }
                          >
                            <Trash2 size={16} />
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY */}
          {!mediaLoading &&
            filteredMedia.length === 0 && (
              <div className="media-empty">
                <Folder size={42} />
                <h3>No records found</h3>
                <p>
                  Is folder mein abhi koi matching
                  record available nahi hai.
                </p>

                <button
                  onClick={() =>
                    setActivePage("add-media")
                  }
                >
                  <Plus size={17} />
                  Upload Media
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
}

export default MediaLibrary;