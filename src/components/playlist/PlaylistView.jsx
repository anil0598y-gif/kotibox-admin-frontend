import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  Heart,
  Repeat,
  MoreHorizontal,
  Plus,
  Trash2,
  Search,
  Pencil,
} from "lucide-react";
import "./PlaylistView.css";

const SERVER_URL = "http://localhost:5000";

const getId = (item) => {
  if (!item) return "";
  if (item._id !== undefined && item._id !== null) return String(item._id);
  if (item.id !== undefined && item.id !== null) return String(item.id);
  return "";
};

const getImageUrl = (value) => {
  if (!value) return "";
  const image = String(value).trim();
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  )
    return image;
  if (image.startsWith("/")) return `${SERVER_URL}${image}`;
  return `${SERVER_URL}/${image}`;
};

const getSongImage = (song) =>
  getImageUrl(
    song?.imageUrl ||
      song?.coverImage ||
      song?.image ||
      song?.coverUrl ||
      ""
  );

const getTitle = (song) => song?.title || song?.name || "Unknown Song";

const getArtist = (song) => {
  if (typeof song?.artist === "string") return song.artist;
  return song?.artist?.name || "Unknown Artist";
};

const getAlbum = (song) => {
  if (typeof song?.album === "string") return song.album;
  return song?.album?.name || "Unknown Album";
};

const formatDuration = (value) => {
  if (!value) return "0:00";
  if (typeof value === "string" && value.includes(":")) return value;
  const seconds = Number(value);
  if (Number.isNaN(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(
    Math.floor(seconds % 60)
  ).padStart(2, "0")}`;
};

function PlaylistView({
  playlist,
  setActivePage,
  currentSong,
  isPlaying,
  setIsPlaying,
  playSong,
  openSongPlayer,
  playNextSong,
  playPreviousSong,
  isLiked,
  setIsLiked,
  playbackSpeed,
  setPlaybackSpeed,
  repeat,
  setRepeat,
  shuffle,
  setShuffle,
  currentTime,
  duration,
  seekSong,
  formatTime,
  openEditPlaylist,
  songs = [],
  addSongToPlaylist,
  deleteSongFromPlaylist,
}) {
  const [showAddSong, setShowAddSong] = useState(false);
  const [songSearch, setSongSearch] = useState("");

  const playlistSongs = Array.isArray(playlist?.songs) ? playlist.songs : [];

  const playlistSongIds = useMemo(
    () => new Set(playlistSongs.map(getId).filter(Boolean)),
    [playlistSongs]
  );

  const availableSongs = useMemo(() => {
    const query = songSearch.trim().toLowerCase();
    return songs.filter((song) => {
      const id = getId(song);
      if (!id || playlistSongIds.has(id)) return false;
      if (!query) return true;
      return [
        getTitle(song),
        getArtist(song),
        getAlbum(song),
        song?.genre || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [songs, playlistSongIds, songSearch]);

  const handleAdd = async (song) => {
    const saved = await addSongToPlaylist?.(getId(playlist), song);
    if (saved) setSongSearch("");
  };

  const handleRemove = async (song) => {
    await deleteSongFromPlaylist?.(getId(playlist), getId(song));
  };

  /* =========================================
     OPEN SONG PLAYER
  ========================================= */

  const handleOpenPlayer = (song) => {
    if (!song) return;

    if (openSongPlayer) {
      openSongPlayer(song, playlistSongs);
    } else if (playSong) {
      playSong(song, playlistSongs);
    }
  };

  /* =========================================
     EDIT PLAYLIST (with debug logs)
  ========================================= */

  const handleEditPlaylist = () => {
    console.log("🎯 Edit button clicked");
    console.log("🎯 playlist:", playlist);
    console.log("🎯 openEditPlaylist fn:", openEditPlaylist);

    if (typeof openEditPlaylist === "function") {
      openEditPlaylist(playlist);
    } else {
      console.error(
        "❌ openEditPlaylist is not a function. Check App.jsx — did you pass openEditPlaylist={openEditPlaylist} to PlaylistView?"
      );
      alert(
        "Edit Playlist feature is not connected. Please contact support."
      );
    }
  };

  if (!playlist) {
    return (
      <div className="playlist-view">
        <h2>Playlist not found</h2>
      </div>
    );
  }

  const cover = getImageUrl(
    playlist.coverImage ||
      playlist.coverUrl ||
      playlist.imageUrl ||
      playlist.image
  );

  return (
    <div className="playlist-view">
      <div className="playlist-view-top">
        <button
          className="back-button"
          onClick={() => setActivePage("playlists")}
        >
          <ArrowLeft size={19} /> Back
        </button>

        <div className="playlist-view-actions">
          <button
            className="playlist-edit-button"
            onClick={handleEditPlaylist}
          >
            <Pencil size={17} /> Edit
          </button>
          <button
            className="playlist-add-button"
            onClick={() => setShowAddSong(true)}
          >
            <Plus size={18} /> Add Song
          </button>
        </div>
      </div>

      <section className="playlist-hero">
        <div className="playlist-cover">
          {cover ? (
            <img src={cover} alt={playlist.name} />
          ) : (
            <div className="playlist-cover-placeholder">♪</div>
          )}
        </div>

        <div className="playlist-info">
          <span className="playlist-label">PLAYLIST</span>
          <h1>{playlist.name || "Untitled Playlist"}</h1>
          {playlist.description && (
            <p className="playlist-description">
              {playlist.description}
            </p>
          )}
          <div className="playlist-meta">
            <span>{playlist.genre || "Bollywood"}</span>
            <span>•</span>
            <span>{playlistSongs.length} songs</span>
            <span>•</span>
            <span>{playlist.status || "Active"}</span>
          </div>
        </div>
      </section>

      <div className="playlist-controls">
        <button
          className="playlist-play-button"
          disabled={!playlistSongs.length}
          onClick={() => {
            if (playlistSongs.length) {
              handleOpenPlayer(playlistSongs[0]);
            }
          }}
        >
          {isPlaying ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" />
          )}
        </button>
        <button
          className={`control-button ${shuffle ? "active" : ""}`}
          onClick={() => setShuffle?.(!shuffle)}
        >
          <Shuffle size={20} />
        </button>
        <button
          className={`control-button ${isLiked ? "active" : ""}`}
          onClick={() => setIsLiked?.(!isLiked)}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button
          className={`control-button ${repeat ? "active" : ""}`}
          onClick={() => setRepeat?.(!repeat)}
        >
          <Repeat size={20} />
        </button>
      </div>

      <section className="playlist-song-section">
        <div className="playlist-song-header">
          <h2>Songs</h2>
          <span>
            {playlistSongs.length}{" "}
            {playlistSongs.length === 1 ? "song" : "songs"}
          </span>
        </div>

        {!playlistSongs.length ? (
          <div className="empty-playlist">
            <div className="empty-playlist-icon">♪</div>
            <h3>No songs in this playlist</h3>
            <p>Add songs from your Song Library to get started.</p>
            <button
              className="playlist-add-button"
              onClick={() => setShowAddSong(true)}
            >
              <Plus size={18} /> Add Song
            </button>
          </div>
        ) : (
          <div className="playlist-song-list">
            {playlistSongs.map((song, index) => {
              const id = getId(song);
              const image = getSongImage(song);
              const current = getId(currentSong) === id;

              return (
                <div
                  className={`playlist-song-row ${
                    current ? "current" : ""
                  }`}
                  key={id || index}
                >
                  <div className="song-number">
                    {current && isPlaying ? "♪" : index + 1}
                  </div>

                  <button
                    className="song-image-button"
                    onClick={() => handleOpenPlayer(song)}
                  >
                    {image ? (
                      <img src={image} alt={getTitle(song)} />
                    ) : (
                      <div className="song-image-placeholder">♪</div>
                    )}
                    <span className="song-play-overlay">
                      <Play size={15} fill="currentColor" />
                    </span>
                  </button>

                  <button
                    className="playlist-song-title"
                    onClick={() => handleOpenPlayer(song)}
                  >
                    <strong>{getTitle(song)}</strong>
                    <span>{getArtist(song)}</span>
                  </button>

                  <div className="playlist-song-album">
                    {getAlbum(song)}
                  </div>
                  <div className="playlist-song-genre">
                    {song?.genre || "-"}
                  </div>
                  <div className="playlist-song-duration">
                    {formatDuration(song?.duration)}
                  </div>

                  <button
                    className="song-remove-button"
                    title="Remove from playlist"
                    onClick={() => handleRemove(song)}
                  >
                    <Trash2 size={17} />
                  </button>
                  <button className="song-more-button" title="More">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showAddSong && (
        <div
          className="playlist-modal-overlay"
          onClick={() => setShowAddSong(false)}
        >
          <div
            className="playlist-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="playlist-modal-header">
              <div>
                <h2>Add Song</h2>
                <p>Select songs from Song Library</p>
              </div>
              <button onClick={() => setShowAddSong(false)}>×</button>
            </div>

            <div className="playlist-song-search">
              <Search size={18} />
              <input
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                placeholder="Search songs..."
              />
            </div>

            <div className="available-song-list">
              {!availableSongs.length ? (
                <div className="no-available-songs">
                  No songs available to add.
                </div>
              ) : (
                availableSongs.map((song) => {
                  const image = getSongImage(song);
                  return (
                    <div
                      className="available-song-row"
                      key={getId(song)}
                    >
                      <div className="available-song-image">
                        {image ? (
                          <img src={image} alt={getTitle(song)} />
                        ) : (
                          <span>♪</span>
                        )}
                      </div>
                      <div className="available-song-info">
                        <strong>{getTitle(song)}</strong>
                        <span>{getArtist(song)}</span>
                      </div>
                      <button
                        className="available-song-add"
                        onClick={() => handleAdd(song)}
                      >
                        <Plus size={17} /> Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistView;