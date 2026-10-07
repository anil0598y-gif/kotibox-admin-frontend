import React from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Repeat,
  Shuffle,
  Volume2,
  Music2,
} from "lucide-react";

import "./SongPlayer.css";

const SERVER_URL = "http://localhost:5000";

function SongPlayer({
  currentSong,
  isPlaying,
  setIsPlaying,
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
  playNextSong,
  playPreviousSong,
  setActivePage,
}) {
  if (!currentSong) {
    return (
      <div className="song-player-empty">
        <Music2 size={60} />
        <h2>No song selected</h2>
        <p>Select a song from the Song Library to start playing.</p>

        <button
          className="song-player-back-btn"
          onClick={() => setActivePage("songs")}
        >
          <ArrowLeft size={18} />
          Back to Song Library
        </button>
      </div>
    );
  }

  const getImageUrl = (song) => {
    const image =
      song.coverImagePath ||
      song.coverImageUrl ||
      song.imageUrl ||
      song.image ||
      "";

    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/${image}`;
  };

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const imageUrl = getImageUrl(currentSong);

  return (
    <div className="song-player-page">

      {/* HEADER */}
      <div className="song-player-header">
        <button
          className="song-player-back"
          onClick={() => setActivePage("songs")}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h2>Now Playing</h2>

        <div className="song-player-header-space" />
      </div>

      {/* PLAYER */}
      <div className="song-player-container">

        {/* COVER */}
        <div className="song-player-cover-wrapper">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={currentSong.title || "Song"}
              className="song-player-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display =
                  "flex";
              }}
            />
          ) : null}

          <div
            className="song-player-cover-placeholder"
            style={{
              display: imageUrl ? "none" : "flex",
            }}
          >
            <Music2 size={90} />
          </div>
        </div>

        {/* SONG INFO */}
        <div className="song-player-info">
          <h1>{currentSong.title || "Unknown Song"}</h1>

          <p>
            {currentSong.artist ||
              currentSong.artistName ||
              "Unknown Artist"}
          </p>

          {(currentSong.album || currentSong.genre) && (
            <span>
              {currentSong.album || currentSong.genre}
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="song-player-actions">

          <button
            className={`song-player-action ${
              shuffle ? "active" : ""
            }`}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            className={`song-player-action ${
              isLiked ? "liked" : ""
            }`}
            onClick={() => setIsLiked(!isLiked)}
            title="Like"
          >
            <Heart
              size={22}
              fill={isLiked ? "currentColor" : "none"}
            />
          </button>

          <button
            className={`song-player-action ${
              repeat ? "active" : ""
            }`}
            onClick={() => setRepeat(!repeat)}
            title="Repeat"
          >
            <Repeat size={20} />
          </button>

        </div>

        {/* PROGRESS */}
        <div className="song-player-progress-section">

          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) =>
              seekSong(Number(e.target.value))
            }
            className="song-player-progress"
          />

          <span>{formatTime(duration)}</span>

        </div>

        {/* CONTROLS */}
        <div className="song-player-controls">

          <button
            className="song-player-control secondary"
            onClick={playPreviousSong}
            title="Previous"
          >
            <SkipBack size={24} />
          </button>

          <button
            className="song-player-main-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={30} fill="currentColor" />
            ) : (
              <Play size={30} fill="currentColor" />
            )}
          </button>

          <button
            className="song-player-control secondary"
            onClick={playNextSong}
            title="Next"
          >
            <SkipForward size={24} />
          </button>

        </div>

        {/* BOTTOM CONTROLS */}
        <div className="song-player-bottom">

          <div className="song-player-volume">
            <Volume2 size={19} />
            <div className="song-player-volume-line" />
          </div>

          <div className="song-player-speed">
            {[1, 1.25, 1.5, 2].map((speed) => (
              <button
                key={speed}
                className={
                  playbackSpeed === speed
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setPlaybackSpeed(speed)
                }
              >
                {speed}x
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default SongPlayer;