import { useState } from "react";

import {
  Music,
  Search,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  RefreshCw,
} from "lucide-react";

import "./SongLibrary.css";

import notify from "../../utils/notify";

/* ✅ FIXED: Hardcoded URL hata diya */
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

function SongLibrary({
  setActivePage,
  openEditSong,
  deleteSong,
  playSong,
  openSongPlayer,
  currentSong,
  isPlaying,
  setIsPlaying,
  songs: parentSongs = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /* ✅ ONLY parent songs */
  const songs = Array.isArray(parentSongs) ? parentSongs : [];

  /* =================================
     Get Correct Song ID
  ================================= */

  const getSongId = (song) => {
    if (!song) return null;
    return song._id || song.id || null;
  };

  /* =================================
     Get Image URL
     ✅ FIXED: purane localhost URLs bhi handle karta hai
  ================================= */

  const getSongImage = (song) => {
    const imagePath =
      song?.imageUrl ||
      song?.coverImagePath ||
      song?.coverImageUrl ||
      song?.image ||
      "";

    if (!imagePath) {
      return "";
    }

    const value = String(imagePath).trim();

    /* Purane localhost URLs convert karo */
    if (value.includes("localhost:5000")) {
      const relativePath = value.split("localhost:5000")[1];
      return `${SERVER_URL}${relativePath}`;
    }

    if (value.includes("127.0.0.1:5000")) {
      const relativePath = value.split("127.0.0.1:5000")[1];
      return `${SERVER_URL}${relativePath}`;
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${SERVER_URL}${value}`;
    }

    return `${SERVER_URL}/${value}`;
  };

  /* =================================
     Manual Refresh
  ================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );
      notify.success("Songs refreshed!");
    } catch (err) {
      console.error("Refresh error:", err);
      notify.error("Failed to refresh songs.");
    } finally {
      setRefreshing(false);
    }
  };

  /* =================================
     Search Songs
  ================================= */

  const filteredSongs = songs.filter((song) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const title = String(song?.title || "").toLowerCase();
    const artist = String(song?.artist || "").toLowerCase();
    const album = String(song?.album || "").toLowerCase();
    const genre = String(song?.genre || "").toLowerCase();
    const language = String(song?.language || "").toLowerCase();
    const status = String(song?.status || "").toLowerCase();

    return (
      title.includes(search) ||
      artist.includes(search) ||
      album.includes(search) ||
      genre.includes(search) ||
      language.includes(search) ||
      status.includes(search)
    );
  });

  /* =================================
     Current Playing Song ID
  ================================= */

  const currentSongId = currentSong
    ? getSongId(currentSong)
    : null;

  /* =================================
     Play / Pause
  ================================= */

  const handlePlay = (song) => {
    if (!song) return;

    const songId = getSongId(song);

    if (!songId) {
      notify.warning("Invalid song ID.");
      return;
    }

    if (
      String(currentSongId) === String(songId) &&
      isPlaying
    ) {
      if (setIsPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    if (openSongPlayer) {
      openSongPlayer(song, songs);
    } else if (playSong) {
      playSong(song, songs);
    }
  };

  /* =================================
     Edit Song
  ================================= */

  const handleEdit = (song) => {
    if (openEditSong) {
      openEditSong(song);
    }
  };

  /* =================================
     Delete Song
  ================================= */

  const handleDelete = async (song) => {
    if (!song) {
      notify.warning("Invalid song.");
      return;
    }

    const songId = getSongId(song);

    if (!songId) {
      console.error("Invalid song object:", song);
      notify.warning("Invalid song ID.");
      return;
    }

    const confirmed = await notify.confirmDelete(
      song.title || "this song"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(String(songId));
      setError("");

      if (deleteSong) {
        await deleteSong(songId);
        return;
      }

      const response = await fetch(
        `${API_URL}/songs/${encodeURIComponent(
          String(songId)
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Failed to delete song"
        );
      }

      notify.success(
        "Deleted!",
        "Song deleted successfully!"
      );
    } catch (err) {
      console.error("Delete song error:", err);

      setError(err.message || "Failed to delete song.");

      if (!deleteSong) {
        notify.error(
          "Delete Failed",
          err.message ||
            "Failed to delete song. Please try again."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  /* =================================
     Add Song
  ================================= */

  const handleAddSong = () => {
    setActivePage("add-song");
  };

  return (
    <div className="song-library">
      {/* Header */}
      <div className="song-library-header">
        <div>
          <h1>Music Library</h1>

          <p>
            Manage all songs in your music library
          </p>
        </div>

        <button
          className="add-song-button"
          onClick={handleAddSong}
        >
          <Plus size={18} />
          Add Song
        </button>
      </div>

      {/* Library Controls */}
      <div className="library-controls">
        {/* Search */}
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search songs, artists or albums..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {/* Song Count */}
        <div className="song-count">
          <Music size={17} />

          <span>{filteredSongs.length} Songs</span>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh Songs"
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            background: "transparent",
            color: "inherit",
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.5 : 1,
          }}
        >
          <RefreshCw
            size={17}
            style={{
              animation: refreshing
                ? "songLibrarySpin 1s linear infinite"
                : "none",
            }}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 15px",
            marginBottom: "15px",
            borderRadius: "8px",
            background: "rgba(220, 38, 38, 0.10)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            color: "#ef4444",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Songs Table */}
      <div className="songs-table-container">
        <table className="songs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Song</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song, index) => {
                const songId = getSongId(song);

                const songImage = getSongImage(song);

                const isCurrentSong =
                  songId &&
                  currentSongId &&
                  String(songId) ===
                    String(currentSongId);

                const isSongPlaying = Boolean(
                  isCurrentSong && isPlaying
                );

                return (
                  <tr key={songId || `song-${index}`}>
                    {/* Number */}
                    <td>
                      <span className="song-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* Song */}
                    <td>
                      <div className="table-song-info">
                        <div className="table-song-icon">
                          {songImage ? (
                            <img
                              src={songImage}
                              alt={song.title || "Song Cover"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "inherit",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                const fallback =
                                  e.currentTarget.parentElement?.querySelector(
                                    ".song-fallback-icon"
                                  );

                                if (fallback) {
                                  fallback.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className="song-fallback-icon"
                            style={{
                              display: songImage
                                ? "none"
                                : "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <Music size={18} />
                          </div>
                        </div>

                        <div>
                          <strong>
                            {song.title || "Untitled"}
                          </strong>

                          <span>Music Track</span>
                        </div>
                      </div>
                    </td>

                    {/* Artist */}
                    <td>
                      <span className="artist-name">
                        {song.artist || "Unknown Artist"}
                      </span>
                    </td>

                    {/* Album */}
                    <td>
                      <span className="album-name">
                        {song.album || "Unknown Album"}
                      </span>
                    </td>

                    {/* Genre */}
                    <td>
                      <span className="genre-badge">
                        {song.genre || "Unknown"}
                      </span>
                    </td>

                    {/* Language */}
                    <td>
                      <span className="language-text">
                        {song.language || "Unknown"}
                      </span>
                    </td>

                    {/* Duration */}
                    <td>
                      <div className="duration">
                        <Clock size={14} />
                        {song.duration || "0:00"}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={
                          "status-badge " +
                          String(
                            song.status || "Active"
                          ).toLowerCase()
                        }
                      >
                        <span className="status-dot"></span>
                        {song.status || "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">
                        {/* Play / Pause */}
                        <button
                          type="button"
                          className="play-button"
                          onClick={() => handlePlay(song)}
                          title={
                            isSongPlaying ? "Pause" : "Play"
                          }
                        >
                          {isSongPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(song)}
                          title="Edit Song"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(song)}
                          title="Delete Song"
                          disabled={
                            String(deletingId) ===
                            String(songId)
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* More */}
                        <button
                          type="button"
                          className="more-button"
                          title="More"
                        >
                          <MoreVertical size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-songs">
                  <Music size={35} />

                  <strong>No songs found</strong>

                  <span>
                    {searchTerm
                      ? "Try searching with a different keyword."
                      : "Add a song to your music library."}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="library-footer">
        <span>
          Showing {filteredSongs.length} of {songs.length}{" "}
          songs
        </span>
      </div>

      {/* Refresh Animation */}
      <style>
        {`
          @keyframes songLibrarySpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default SongLibrary;