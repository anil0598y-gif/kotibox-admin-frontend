import {
  ArrowLeft,
  Edit,
  Music,
  Disc3,
  Play,
  ExternalLink,
  UserRound,
  Clock3,
} from "lucide-react";

import "./ArtistView.css";

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
  if (!image) {
    return "";
  }

  const imageUrl = String(image).trim();

  if (!imageUrl) {
    return "";
  }

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
   GET ARTIST IMAGE
========================================= */

const getArtistImage = (artist) => {
  if (!artist) {
    return "";
  }

  const image =
    artist.imageUrl ||
    artist.image ||
    artist.imageURL ||
    artist.photoUrl ||
    artist.photo ||
    "";

  return getImageUrl(image);
};

/* =========================================
   GET SONG IMAGE
========================================= */

const getSongImage = (song) => {
  if (!song) {
    return "";
  }

  const image =
    song.imageUrl ||
    song.image ||
    song.coverImage ||
    song.coverUrl ||
    song.thumbnail ||
    song.photoUrl ||
    "";

  return getImageUrl(image);
};

/* =========================================
   GET ALBUM IMAGE
========================================= */

const getAlbumImage = (album) => {
  if (!album) {
    return "";
  }

  const image =
    album.imageUrl ||
    album.image ||
    album.coverImage ||
    album.coverUrl ||
    album.thumbnail ||
    album.photoUrl ||
    "";

  return getImageUrl(image);
};

/* =========================================
   ARTIST VIEW
========================================= */

function ArtistView({
  artist,
  setActivePage,
  openEditArtist,
  playSong,
  currentSong,
  isPlaying,
}) {
  /* =========================================
     ARTIST NOT FOUND
  ========================================= */

  if (!artist) {
    return (
      <div className="artist-view-page">
        <div className="artist-view-not-found">
          <div className="artist-view-not-found-icon">
            <UserRound size={38} />
          </div>

          <h2>Artist Not Found</h2>

          <p>
            The artist you are trying to view does not exist.
          </p>

          <button
            onClick={() => setActivePage("artists")}
          >
            <ArrowLeft size={18} />
            Back to Artists
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     DATA
  ========================================= */

  const songs = Array.isArray(artist.songs)
    ? artist.songs
    : [];

  const albums = Array.isArray(artist.albums)
    ? artist.albums
    : [];

  const artistImage = getArtistImage(artist);

  /* =========================================
     PLAY SONG
  ========================================= */

  const handlePlaySong = (song) => {
    if (!playSong) {
      return;
    }

    playSong(song, songs);
  };

  /* =========================================
     CURRENT SONG
  ========================================= */

  const isSameSong = (song) => {
    if (!song || !currentSong) {
      return false;
    }

    const songId = getRecordId(song);
    const currentSongId = getRecordId(currentSong);

    if (songId && currentSongId) {
      return songId === currentSongId;
    }

    return (
      song.title &&
      currentSong.title &&
      song.title === currentSong.title
    );
  };

  /* =========================================
     RETURN
  ========================================= */

  return (
    <div className="artist-view-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="artist-view-header">

        <div className="artist-view-header-left">

          <button
            className="artist-view-back-btn"
            onClick={() => setActivePage("artists")}
            type="button"
            title="Back to Artists"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1>Artist Profile</h1>

            <p>
              View artist details and music
            </p>
          </div>

        </div>

        <button
          className="artist-view-edit-btn"
          onClick={() => {
            if (openEditArtist) {
              openEditArtist(artist);
            }
          }}
          type="button"
        >
          <Edit size={17} />
          Edit Artist
        </button>

      </div>

      {/* =====================================
          ARTIST HERO
      ===================================== */}

      <div className="artist-profile-card">

        <div className="artist-profile-main">

          {/* ARTIST IMAGE */}

          {artistImage ? (
            <img
              src={artistImage}
              alt={artist.name || "Artist"}
              className="artist-profile-image"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";

                const placeholder =
                  event.currentTarget
                    .nextElementSibling;

                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* PLACEHOLDER */}

          <div
            className="artist-profile-image artist-profile-placeholder"
            style={{
              display: artistImage
                ? "none"
                : "flex",
            }}
          >
            {artist.name
              ?.charAt(0)
              .toUpperCase() || "A"}
          </div>

          {/* ARTIST INFO */}

          <div className="artist-profile-info">

            <span className="artist-profile-label">
              {artist.type || "Artist"}
            </span>

            <h2>
              {artist.name || "Unknown Artist"}
            </h2>

            <p className="artist-profile-location">
              {artist.country || "India"} •{" "}
              {artist.language || "Hindi"}
            </p>

            <div className="artist-profile-tags">

              <span>
                {artist.genre || "Music"}
              </span>

              <span
                className={
                  artist.status === "Active"
                    ? "active"
                    : "inactive"
                }
              >
                {artist.status || "Active"}
              </span>

            </div>

          </div>

        </div>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="artist-profile-stats">

          {/* SONGS */}

          <div className="artist-profile-stat">

            <Music size={21} />

            <div>
              <strong>
                {songs.length}
              </strong>

              <span>
                Songs
              </span>
            </div>

          </div>

          {/* ALBUMS */}

          <div className="artist-profile-stat">

            <Disc3 size={21} />

            <div>
              <strong>
                {albums.length}
              </strong>

              <span>
                Albums
              </span>
            </div>

          </div>

          {/* STATUS */}

          <div className="artist-profile-stat">

            <div className="artist-status-circle">
              <span></span>
            </div>

            <div>
              <strong>
                {artist.status || "Active"}
              </strong>

              <span>
                Status
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="artist-view-grid">

        {/* ===================================
            LEFT COLUMN
        =================================== */}

        <div className="artist-view-main-column">

          {/* =================================
              BIOGRAPHY
          ================================= */}

          <div className="artist-view-card">

            <div className="artist-view-card-header">
              <h2>
                About Artist
              </h2>
            </div>

            <div className="artist-bio-content">

              {artist.bio ? (
                <p>
                  {artist.bio}
                </p>
              ) : (
                <p className="artist-no-data">
                  No biography available for
                  this artist.
                </p>
              )}

            </div>

          </div>

          {/* =================================
              SONGS
          ================================= */}

          <div className="artist-view-card">

            <div className="artist-view-card-header">

              <div>
                <h2>
                  Songs
                </h2>

                <span>
                  {songs.length}{" "}
                  {songs.length === 1
                    ? "song"
                    : "songs"}
                </span>
              </div>

            </div>

            {songs.length > 0 ? (
              <div className="artist-songs-list">

                {songs.map((song, index) => {

                  const isCurrentSong =
                    isSameSong(song);

                  const songImage =
                    getSongImage(song);

                  return (
                    <div
                      className={`artist-song-row ${
                        isCurrentSong
                          ? "artist-current-song"
                          : ""
                      }`}
                      key={
                        getRecordId(song) ||
                        song.title ||
                        index
                      }
                    >

                      {/* NUMBER */}

                      <div className="artist-song-number">

                        {isCurrentSong &&
                        isPlaying ? (
                          <div className="playing-bars">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        ) : (
                          index + 1
                        )}

                      </div>

                      {/* SONG COVER */}

                      <div className="artist-song-cover">

                        {songImage ? (
                          <img
                            src={songImage}
                            alt={
                              song.title ||
                              "Song"
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";

                              const icon =
                                event.currentTarget
                                  .nextElementSibling;

                              if (icon) {
                                icon.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className="artist-song-cover-placeholder"
                          style={{
                            display: songImage
                              ? "none"
                              : "flex",
                          }}
                        >
                          <Music size={20} />
                        </div>

                      </div>

                      {/* SONG INFO */}

                      <div className="artist-song-info">

                        <strong>
                          {song.title ||
                            "Untitled Song"}
                        </strong>

                        <span>
                          {song.album ||
                            "Single"}
                        </span>

                      </div>

                      {/* DURATION */}

                      <div className="artist-song-duration">

                        <Clock3 size={15} />

                        {song.duration ||
                          "0:00"}

                      </div>

                      {/* PLAY */}

                      <button
                        className="artist-song-play-btn"
                        onClick={() =>
                          handlePlaySong(
                            song
                          )
                        }
                        title={
                          isCurrentSong &&
                          isPlaying
                            ? "Playing"
                            : "Play Song"
                        }
                        type="button"
                      >

                        {isCurrentSong &&
                        isPlaying ? (
                          <span className="mini-playing">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                        ) : (
                          <Play size={16} />
                        )}

                      </button>

                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="artist-empty-section">

                <div className="artist-empty-icon">
                  <Music size={27} />
                </div>

                <h3>
                  No Songs
                </h3>

                <p>
                  No songs have been added to
                  this artist yet.
                </p>

              </div>
            )}

          </div>

          {/* =================================
              ALBUMS
          ================================= */}

          <div className="artist-view-card">

            <div className="artist-view-card-header">

              <div>
                <h2>
                  Albums
                </h2>

                <span>
                  {albums.length}{" "}
                  {albums.length === 1
                    ? "album"
                    : "albums"}
                </span>
              </div>

            </div>

            {albums.length > 0 ? (
              <div className="artist-albums-grid">

                {albums.map(
                  (album, index) => {

                    const albumImage =
                      getAlbumImage(
                        album
                      );

                    return (
                      <div
                        className="artist-album-card"
                        key={
                          getRecordId(
                            album
                          ) ||
                          album.name ||
                          album.title ||
                          index
                        }
                      >

                        {/* ALBUM IMAGE */}

                        {albumImage ? (
                          <img
                            src={albumImage}
                            alt={
                              album.name ||
                              album.title ||
                              "Album"
                            }
                            className="artist-album-image"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";

                              const placeholder =
                                event.currentTarget
                                  .nextElementSibling;

                              if (
                                placeholder
                              ) {
                                placeholder.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        {/* ALBUM PLACEHOLDER */}

                        <div
                          className="artist-album-image artist-album-placeholder"
                          style={{
                            display:
                              albumImage
                                ? "none"
                                : "flex",
                          }}
                        >
                          <Disc3 size={32} />
                        </div>

                        {/* ALBUM INFO */}

                        <div className="artist-album-info">

                          <h3>
                            {album.name ||
                              album.title ||
                              "Untitled Album"}
                          </h3>

                          <p>
                            {album.releaseDate ||
                              album.release_date ||
                              "Release date not available"}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="artist-empty-section">

                <div className="artist-empty-icon">
                  <Disc3 size={27} />
                </div>

                <h3>
                  No Albums
                </h3>

                <p>
                  No albums have been added to
                  this artist yet.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ===================================
            RIGHT SIDEBAR
        =================================== */}

        <div className="artist-view-side-column">

          {/* =================================
              ARTIST DETAILS
          ================================= */}

          <div className="artist-view-card">

            <div className="artist-view-card-header">
              <h2>
                Artist Details
              </h2>
            </div>

            <div className="artist-details-list">

              <div className="artist-detail-item">

                <span>
                  Artist Type
                </span>

                <strong>
                  {artist.type || "-"}
                </strong>

              </div>

              <div className="artist-detail-item">

                <span>
                  Genre
                </span>

                <strong>
                  {artist.genre || "-"}
                </strong>

              </div>

              <div className="artist-detail-item">

                <span>
                  Language
                </span>

                <strong>
                  {artist.language || "-"}
                </strong>

              </div>

              <div className="artist-detail-item">

                <span>
                  Country
                </span>

                <strong>
                  {artist.country || "-"}
                </strong>

              </div>

              <div className="artist-detail-item">

                <span>
                  Status
                </span>

                <strong
                  className={
                    artist.status ===
                    "Active"
                      ? "artist-detail-active"
                      : "artist-detail-inactive"
                  }
                >
                  {artist.status ||
                    "Active"}
                </strong>

              </div>

              <div className="artist-detail-item">

                <span>
                  Created Date
                </span>

                <strong>
                  {artist.createdDate ||
                    (
                      artist.createdAt
                        ? new Date(
                            artist.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"
                    )}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              SOCIAL LINKS
          ================================= */}

          <div className="artist-view-card">

            <div className="artist-view-card-header">
              <h2>
                Social Links
              </h2>
            </div>

            <div className="artist-social-links">

              {artist.instagram ? (
                <a
                  href={artist.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="artist-social-link"
                >
                  <span>
                    Instagram
                  </span>

                  <ExternalLink
                    size={15}
                  />
                </a>
              ) : null}

              {artist.youtube ? (
                <a
                  href={artist.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="artist-social-link"
                >
                  <span>
                    YouTube
                  </span>

                  <ExternalLink
                    size={15}
                  />
                </a>
              ) : null}

              {artist.spotify ? (
                <a
                  href={artist.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="artist-social-link"
                >
                  <span>
                    Spotify
                  </span>

                  <ExternalLink
                    size={15}
                  />
                </a>
              ) : null}

              {!artist.instagram &&
                !artist.youtube &&
                !artist.spotify ? (
                <p className="artist-no-social">
                  No social links available.
                </p>
              ) : null}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ArtistView;