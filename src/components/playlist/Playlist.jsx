import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pencil,
  Trash2,
  Eye,
  Music2,
  Clock3,
} from "lucide-react";

import "./Playlist.css";

import notify from "../../utils/notify";

function Playlist({
  setActivePage,
  playlists = [],
  deletePlaylist,
  openPlaylist,
  openEditPlaylist,
}) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPlaylists = playlists.filter((playlist) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      playlist.name?.toLowerCase().includes(searchText) ||
      playlist.description
        ?.toLowerCase()
        .includes(searchText);

    const matchesGenre =
      genreFilter === "All" ||
      playlist.genre === genreFilter;

    const matchesStatus =
      statusFilter === "All" ||
      playlist.status === statusFilter;

    return (
      matchesSearch &&
      matchesGenre &&
      matchesStatus
    );
  });

  const handleDelete = async (id) => {
    const confirmed = await notify.confirmDelete(
      "playlist"
    );

    if (confirmed && deletePlaylist) {
      deletePlaylist(id);
    }
  };

  const getPlaylistImage = (playlist) => {
    return (
      playlist.imageUrl ||
      playlist.coverImage ||
      playlist.image ||
      playlist.coverUrl ||
      playlist.cover ||
      ""
    );
  };

  const genres = [
    "All",
    "Bollywood",
    "Pop",
    "Rock",
    "Hip Hop",
    "Classical",
    "Devotional",
    "Romantic",
    "Lo-Fi",
    "Other",
  ];

  return (
    <div className="playlist-page">
      {/* Header */}
      <div className="playlist-header">
        <div>
          <h1>Your Playlists</h1>
          <p>Manage your music playlists</p>
        </div>

        <button
          className="create-playlist-btn"
          onClick={() =>
            setActivePage("add-playlist")
          }
        >
          <Plus size={20} />
          Create Playlist
        </button>
      </div>

      {/* Search + Filters */}
      <div className="playlist-toolbar">
        <div className="playlist-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search playlists..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={genreFilter}
          onChange={(e) =>
            setGenreFilter(e.target.value)
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

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Playlist Grid */}
      {filteredPlaylists.length > 0 ? (
        <div className="playlist-grid">
          {filteredPlaylists.map((playlist) => {
            const playlistImage =
              getPlaylistImage(playlist);

            return (
              <div
                className="playlist-card"
                key={playlist.id}
              >
                {/* ✅ Background Image — Full Cover */}
                {playlistImage ? (
                  <img
                    src={playlistImage}
                    alt={playlist.name || "Playlist"}
                    className="playlist-card-bg"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="playlist-card-bg-fallback">
                    <Music2 size={60} />
                  </div>
                )}

                {/* ✅ Gradient Overlay */}
                <div className="playlist-card-overlay" />

                {/* ✅ Play Button (top-right) */}
                <button
                  className="playlist-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPlaylist &&
                      openPlaylist(playlist);
                  }}
                  title="Open Playlist"
                >
                  <Play
                    size={20}
                    fill="currentColor"
                  />
                </button>

                {/* ✅ Content Overlay */}
                <div className="playlist-card-content">
                  {/* Top Row */}
                  <div className="playlist-card-top-row">
                    <span
                      className={`playlist-status ${
                        playlist.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {playlist.status || "Active"}
                    </span>

                    <button
                      className="playlist-more-btn"
                      title="More"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Bottom Section */}
                  <div className="playlist-card-bottom">
                    <h3>{playlist.name}</h3>

                    <p className="playlist-description">
                      {playlist.description ||
                        "No description available"}
                    </p>

                    <div className="playlist-meta">
                      <span>
                        <Music2 size={14} />
                        {playlist.songs?.length ||
                          playlist.songCount ||
                          0}{" "}
                        songs
                      </span>

                      <span>
                        <Clock3 size={14} />
                        {playlist.duration || "0:00"}
                      </span>

                      <span className="playlist-genre">
                        {playlist.genre || "Other"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="playlist-actions">
                      <button
                        className="view-playlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPlaylist &&
                            openPlaylist(playlist);
                        }}
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        className="edit-playlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openEditPlaylist) {
                            openEditPlaylist(
                              playlist
                            );
                          }
                        }}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        className="delete-playlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(playlist.id);
                        }}
                        title="Delete Playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Playlist */
        <div className="empty-playlist">
          <div className="empty-playlist-icon">
            <Music2 size={45} />
          </div>

          <h2>No Playlists Found</h2>

          <p>
            Create your first playlist and
            start adding songs.
          </p>

          <button
            onClick={() =>
              setActivePage("add-playlist")
            }
          >
            <Plus size={19} />
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
}

export default Playlist;