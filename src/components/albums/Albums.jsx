import { useState } from "react";

import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Disc3,
  Music,
  Clock,
} from "lucide-react";

import "./Albums.css";

import notify from "../../utils/notify";

const API_BASE_URL = "http://localhost:5000";

/* =========================================
   GET RECORD ID
========================================= */

const getRecordId = (item) => {
  if (!item) return "";

  if (item._id !== undefined && item._id !== null) {
    return String(item._id);
  }

  if (item.id !== undefined && item.id !== null) {
    return String(item.id);
  }

  return "";
};

/* =========================================
   GET IMAGE URL
========================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  const imageUrl = String(image).trim();

  if (!imageUrl) return "";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
};

/* =========================================
   GET ALBUM IMAGE
========================================= */

const getAlbumImage = (album) => {
  if (!album) return "";

  const image =
    album.coverUrl ||
    album.coverImage ||
    album.image ||
    album.cover ||
    album.imageUrl ||
    album.imageURL ||
    album.photoUrl ||
    "";

  return getImageUrl(image);
};

/* =========================================
   ALBUMS
========================================= */

function Albums({
  albums = [],
  setActivePage,
  openAlbum,
  openEditAlbum,
  deleteAlbum,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");

  const filteredAlbums = albums.filter((album) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      album.name?.toLowerCase().includes(search) ||
      album.artist?.toLowerCase().includes(search) ||
      album.genre?.toLowerCase().includes(search) ||
      album.language?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      album.status === statusFilter;

    const matchesGenre =
      genreFilter === "All" ||
      album.genre === genreFilter;

    return (
      matchesSearch && matchesStatus && matchesGenre
    );
  });

  const genres = [
    "All",
    ...new Set(
      albums.map((album) => album.genre).filter(Boolean)
    ),
  ];

  const totalAlbums = albums.length;

  const activeAlbums = albums.filter(
    (album) => album.status === "Active"
  ).length;

  const inactiveAlbums = albums.filter(
    (album) => album.status === "Inactive"
  ).length;

  const totalSongs = albums.reduce(
    (total, album) =>
      total +
      (Array.isArray(album.songs)
        ? album.songs.length
        : 0),
    0
  );

  const handleDelete = async (album) => {
    if (!album) return;

    const albumId = getRecordId(album);

    if (!albumId) {
      notify.warning("Album ID नहीं मिला।");
      return;
    }

    const confirmed = await notify.confirmDelete(
      album.name || "album"
    );

    if (!confirmed) return;

    if (deleteAlbum) {
      deleteAlbum(albumId);
    }
  };

  const handleOpenAlbum = (album) => {
    if (!album) return;

    if (openAlbum) {
      openAlbum(album);
    }
  };

  const handleEditAlbum = (album) => {
    if (!album) return;

    if (openEditAlbum) {
      openEditAlbum(album);
    }
  };

  return (
    <div className="albums-page">
      {/* HEADER */}
      <div className="albums-header">
        <div>
          <h1>Albums</h1>
          <p>
            Manage your music albums and collections
          </p>
        </div>

        <button
          className="add-album-btn"
          onClick={() => setActivePage("add-album")}
          type="button"
        >
          <Plus size={18} />
          Add Album
        </button>
      </div>

      {/* STATS */}
      <div className="album-stats">
        <div className="album-stat-card">
          <div className="album-stat-icon">
            <Disc3 size={22} />
          </div>
          <div>
            <span>Total Albums</span>
            <strong>{totalAlbums}</strong>
          </div>
        </div>

        <div className="album-stat-card">
          <div className="album-stat-icon">
            <Disc3 size={22} />
          </div>
          <div>
            <span>Active Albums</span>
            <strong>{activeAlbums}</strong>
          </div>
        </div>

        <div className="album-stat-card">
          <div className="album-stat-icon">
            <Music size={22} />
          </div>
          <div>
            <span>Total Songs</span>
            <strong>{totalSongs}</strong>
          </div>
        </div>

        <div className="album-stat-card">
          <div className="album-stat-icon">
            <Clock size={22} />
          </div>
          <div>
            <span>Inactive Albums</span>
            <strong>{inactiveAlbums}</strong>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="albums-filter-box">
        <div className="album-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={genreFilter}
          onChange={(event) =>
            setGenreFilter(event.target.value)
          }
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre === "All"
                ? "All Genres"
                : genre}
            </option>
          ))}
        </select>
      </div>

      {/* ALBUM GRID */}
      <div className="albums-grid">
        {filteredAlbums.length > 0 ? (
          filteredAlbums.map((album) => {
            const albumId = getRecordId(album);

            const songCount = Array.isArray(album.songs)
              ? album.songs.length
              : 0;

            const albumImage = getAlbumImage(album);

            return (
              <div
                className="album-card"
                key={albumId || album.name}
                onClick={() => handleOpenAlbum(album)}
              >
                {/* Background Image */}
                {albumImage ? (
                  <img
                    src={albumImage}
                    alt={album.name || "Album"}
                    className="album-card-bg"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";

                      const fallback =
                        event.currentTarget.parentElement?.querySelector(
                          ".album-card-bg-fallback"
                        );

                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                {/* Fallback */}
                <div
                  className="album-card-bg-fallback"
                  style={{
                    display: albumImage ? "none" : "flex",
                  }}
                >
                  <Disc3 size={60} />
                </div>

                {/* Gradient Overlay */}
                <div className="album-card-overlay" />

                {/* ✅ Play button हटाया */}

                {/* Content Overlay */}
                <div className="album-card-content">
                  {/* Top Row */}
                  <div className="album-card-top-row">
                    <span
                      className={`album-status ${
                        album.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {album.status || "Active"}
                    </span>

                    <button
                      className="album-more-btn"
                      title="More"
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Bottom Section */}
                  <div className="album-card-bottom">
                    <h3>
                      {album.name || "Untitled Album"}
                    </h3>

                    <p className="album-artist">
                      {album.artist || "Unknown Artist"}
                    </p>

                    <div className="album-meta">
                      <span>
                        <Music size={14} />
                        {songCount}{" "}
                        {songCount === 1
                          ? "song"
                          : "songs"}
                      </span>

                      {album.genre && (
                        <span className="album-tag">
                          {album.genre}
                        </span>
                      )}

                      {album.language && (
                        <span className="album-tag">
                          {album.language}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="album-actions">
                      <button
                        className="album-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAlbum(album);
                        }}
                        title="View Album"
                        type="button"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        className="album-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAlbum(album);
                        }}
                        title="Edit Album"
                        type="button"
                      >
                        <Edit size={15} />
                        Edit
                      </button>

                      <button
                        className="album-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(album);
                        }}
                        title="Delete Album"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* EMPTY */
          <div className="albums-empty">
            <Disc3 size={50} />

            <h3>No Albums Found</h3>

            <p>
              Try changing your search or filters.
            </p>

            <button
              onClick={() => setActivePage("add-album")}
              type="button"
            >
              <Plus size={17} />
              Add Your First Album
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Albums;