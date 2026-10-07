import React, { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  Disc3,
  Music,
  Calendar,
  User,
  Languages,
  Tag,
  Clock,
  ListMusic,
} from "lucide-react";

import "./AlbumView.css";

import notify from "../../utils/notify";

const API_BASE_URL = "http://localhost:5000";
const API_ENDPOINT = "http://localhost:5000/api";

/* =========================================
   FILE URL HELPER
========================================= */

const getFileUrl = (file) => {
  if (!file) return "";

  const value = String(file).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `${API_BASE_URL}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
};

const getImageUrl = (image) => getFileUrl(image);

/* =========================================
   ALBUM IMAGE
========================================= */

const getAlbumImage = (album) => {
  if (!album) return "";

  const image =
    album.coverImage ||
    album.coverUrl ||
    album.image ||
    album.imageUrl ||
    album.cover ||
    "";

  return getImageUrl(image);
};

/* =========================================
   SONG AUDIO URL
========================================= */

const getSongAudioUrl = (song) => {
  if (!song) return "";

  if (
    typeof song === "string" ||
    typeof song === "number"
  ) {
    return "";
  }

  if (typeof song !== "object") {
    return "";
  }

  const audio =
    song.audioUrl ||
    song.audioFileUrl ||
    song.audioFilePath ||
    song.audioFile ||
    song.audioPath ||
    song.fileUrl ||
    song.file ||
    song.url ||
    song.songUrl ||
    song.musicUrl ||
    (typeof song.audio === "string"
      ? song.audio
      : "") ||
    (song.audio && typeof song.audio === "object"
      ? song.audio.url ||
        song.audio.path ||
        song.audio.file ||
        song.audio.fileUrl ||
        ""
      : "");

  return getFileUrl(audio);
};

/* =========================================
   NORMALIZE TEXT
========================================= */

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

/* =========================================
   GET RECORD ID
========================================= */

const getRecordId = (record) => {
  if (record === null || record === undefined) {
    return "";
  }

  if (typeof record === "string") {
    return record.trim();
  }

  if (typeof record === "number") {
    return String(record).trim();
  }

  if (typeof record !== "object") {
    return "";
  }

  if (record.$oid !== undefined && record.$oid !== null) {
    return String(record.$oid).trim();
  }

  const possibleIds = [
    record._id,
    record.id,
    record.songId,
    record.song_id,
    record.songID,
    record.trackId,
    record.trackID,
  ];

  for (const possibleId of possibleIds) {
    if (
      possibleId !== undefined &&
      possibleId !== null &&
      possibleId !== ""
    ) {
      if (
        typeof possibleId === "object" &&
        possibleId.$oid
      ) {
        return String(possibleId.$oid).trim();
      }

      if (
        typeof possibleId === "object" &&
        possibleId.toString
      ) {
        const value = possibleId.toString();

        if (value && value !== "[object Object]") {
          return String(value).trim();
        }
      }

      return String(possibleId).trim();
    }
  }

  if (record.buffer && typeof record.buffer === "object") {
    try {
      const bufferValues = Object.values(record.buffer);

      if (bufferValues.length > 0) {
        const hex = bufferValues
          .map((value) =>
            Number(value).toString(16).padStart(2, "0")
          )
          .join("");

        if (hex) return hex;
      }
    } catch (error) {
      console.error("Buffer parse failed:", error);
    }
  }

  return "";
};

/* =========================================
   ✅ GET SONG TITLE — FIXED
   "name" fallback हटाया (क्योंकि कभी-कभी name = artist होता है)
========================================= */

const getSongTitle = (song) => {
  if (!song) return "";

  if (
    typeof song === "string" ||
    typeof song === "number"
  ) {
    return "";
  }

  if (typeof song !== "object") {
    return "";
  }

  /* ✅ सिर्फ title-related fields */
  return (
    song.title ||
    song.songTitle ||
    song.songName ||
    song.trackName ||
    ""
  );
};

/* =========================================
   ✅ GET SONG ARTIST — FIXED
   अगर artist खाली है तो name fallback
========================================= */

const getSongArtist = (song) => {
  if (!song || typeof song !== "object") {
    return "";
  }

  const artist =
    song.artist ||
    song.artistName ||
    song.artist_name ||
    song.singer ||
    song.performer ||
    "";

  if (artist) return artist;

  /* ✅ Fallback: अगर artist नहीं है तो name use करें */
  if (
    typeof song.name === "string" &&
    song.name.trim()
  ) {
    return song.name.trim();
  }

  return "";
};

/* =========================================
   FIND FULL SONG FROM LIBRARY
========================================= */

const findFullSong = (albumSong, songs = []) => {
  if (albumSong === null || albumSong === undefined) {
    return null;
  }

  if (!Array.isArray(songs) || !songs.length) {
    return null;
  }

  const albumSongId = getRecordId(albumSong);
  const albumSongTitle = normalizeText(
    getSongTitle(albumSong)
  );

  /* Match 1: By ID */
  if (albumSongId) {
    const foundById = songs.find((song) => {
      const songId = getRecordId(song);

      return (
        songId &&
        String(songId).trim() ===
          String(albumSongId).trim()
      );
    });

    if (foundById) return foundById;
  }

  /* Match 2: By Title */
  if (albumSongTitle) {
    const foundByTitle = songs.find((song) => {
      const songTitle = normalizeText(
        getSongTitle(song)
      );
      return songTitle && songTitle === albumSongTitle;
    });

    if (foundByTitle) return foundByTitle;
  }

  /* Match 3: Album song already has audio */
  if (
    typeof albumSong === "object" &&
    (albumSong.audioUrl || albumSong.audioFileUrl)
  ) {
    return albumSong;
  }

  return null;
};

/* =========================================
   NORMALIZE ALBUM SONG
========================================= */

const normalizeAlbumSong = (
  albumSong,
  index,
  library,
  album
) => {
  let foundSong = findFullSong(albumSong, library);

  if (foundSong) {
    const songId =
      getRecordId(foundSong) ||
      getRecordId(albumSong) ||
      `album-song-${index}`;

    const audioUrl =
      getSongAudioUrl(foundSong) ||
      getSongAudioUrl(albumSong);

    const title =
      getSongTitle(foundSong) ||
      getSongTitle(albumSong) ||
      "Untitled Song";

    const artist =
      getSongArtist(foundSong) ||
      getSongArtist(albumSong) ||
      album?.artist ||
      "Unknown Artist";

    const image =
      foundSong.imageUrl ||
      foundSong.image ||
      foundSong.coverImage ||
      foundSong.coverUrl ||
      album?.coverImage ||
      album?.coverUrl ||
      album?.image ||
      album?.imageUrl ||
      "";

    const imageUrl = getImageUrl(image);

    return {
      ...foundSong,
      id: songId,
      _id: songId,
      title,
      name: title,
      artist,
      duration: foundSong.duration || "--:--",
      audioUrl,
      audioFileUrl: foundSong.audioFileUrl || audioUrl,
      audioFilePath: foundSong.audioFilePath || "",
      imageUrl,
      image: imageUrl,
      album:
        foundSong.album ||
        foundSong.albumName ||
        album?.name ||
        album?.title ||
        "",
      genre: foundSong.genre || album?.genre || "",
      language:
        foundSong.language || album?.language || "",
      _albumSongMatched: true,
    };
  }

  /* Fallback — Album song itself */
  let fallbackSong = {};

  if (
    albumSong &&
    typeof albumSong === "object" &&
    !Array.isArray(albumSong)
  ) {
    fallbackSong = { ...albumSong };
  }

  const fallbackId =
    getRecordId(albumSong) || `album-song-${index}`;

  const fallbackTitle =
    getSongTitle(albumSong) || "Untitled Song";

  const fallbackArtist =
    getSongArtist(albumSong) ||
    album?.artist ||
    "Unknown Artist";

  const fallbackAudio = getSongAudioUrl(albumSong);

  const fallbackImage =
    fallbackSong.imageUrl ||
    fallbackSong.image ||
    fallbackSong.coverImage ||
    fallbackSong.coverUrl ||
    getAlbumImage(album) ||
    "";

  const fallbackImageUrl = getImageUrl(fallbackImage);

  return {
    ...fallbackSong,
    id: fallbackId,
    _id: fallbackId,
    title: fallbackTitle,
    name: fallbackTitle,
    artist: fallbackArtist,
    duration: fallbackSong.duration || "--:--",
    audioUrl: fallbackAudio,
    audioFileUrl:
      fallbackSong.audioFileUrl || fallbackAudio,
    audioFilePath: fallbackSong.audioFilePath || "",
    imageUrl: fallbackImageUrl,
    image: fallbackImageUrl,
    album:
      fallbackSong.album ||
      fallbackSong.albumName ||
      album?.name ||
      album?.title ||
      "",
    genre: fallbackSong.genre || album?.genre || "",
    language:
      fallbackSong.language || album?.language || "",
    _albumSongMatched: false,
  };
};

/* =========================================
   COMPONENT
========================================= */

function AlbumView({
  album,
  setActivePage,
  openEditAlbum,
  deleteAlbum,
  songs = [],
  playSong,
  currentSong,
  isPlaying,
}) {
  const [fetchedSongs, setFetchedSongs] = useState([]);

  /* ✅ Loop prevention — यह flag track करेगा कि fetch हो चुका है या नहीं */
  const fetchedRef = useRef(false);

  /* ✅ Album ID stable — string */
  const albumId = getRecordId(album);

  /* ✅ Parent songs की length — array reference नहीं */
  const parentSongsLength = Array.isArray(songs)
    ? songs.length
    : 0;

  useEffect(() => {
    if (!albumId) return;

    /* अगर parent से songs मिल रहे हैं → fetch मत करो */
    if (parentSongsLength > 0) {
      return;
    }

    /* अगर पहले से fetch हो चुका है → दोबारा मत करो */
    if (fetchedRef.current) {
      return;
    }

    let isCancelled = false;

    const fetchSongsFromLibrary = async () => {
      try {
        console.log(
          "🔄 Fetching song library (once)..."
        );

        const response = await fetch(
          `${API_ENDPOINT}/songs`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }

        const result = await response.json();
        const songList =
          result.data || result.songs || [];

        if (isCancelled) return;

        console.log(
          "✅ Fetched songs:",
          songList.length
        );

        fetchedRef.current = true;

        setFetchedSongs(songList);
      } catch (error) {
        if (!isCancelled) {
          console.error(
            "❌ Fetch songs error:",
            error
          );
        }
      }
    };

    fetchSongsFromLibrary();

    return () => {
      isCancelled = true;
    };
  }, [albumId, parentSongsLength]);

  if (!album) {
    return (
      <div className="album-view-page">
        <div className="album-view-not-found">
          <Disc3 size={55} />

          <h2>Album Not Found</h2>

          <p>
            The album you are looking for does not
            exist or has been removed.
          </p>

          <button onClick={() => setActivePage("albums")}>
            <ArrowLeft size={17} />
            Back to Albums
          </button>
        </div>
      </div>
    );
  }

  const albumImage = getAlbumImage(album);

  const albumSongs = Array.isArray(album.songs)
    ? album.songs
    : [];

  /* ✅ Combined library — parent + fetched */
  const combinedLibrary = [
    ...(Array.isArray(songs) ? songs : []),
    ...fetchedSongs,
  ];

  /* Deduplicate by ID */
  const uniqueLibrary = combinedLibrary.filter(
    (song, index, arr) => {
      const id = getRecordId(song);
      if (!id) return true;

      return (
        arr.findIndex(
          (s) => getRecordId(s) === id
        ) === index
      );
    }
  );

  const fullAlbumSongs = albumSongs.map(
    (albumSong, index) =>
      normalizeAlbumSong(
        albumSong,
        index,
        uniqueLibrary,
        album
      )
  );

  const totalDuration = fullAlbumSongs.reduce(
    (total, song) => {
      if (!song?.duration) return total;

      const parts = String(song.duration).split(":");

      if (parts.length !== 2) return total;

      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;

      return total + minutes * 60 + seconds;
    },
    0
  );

  const formattedDuration = `${Math.floor(
    totalDuration / 60
  )}:${String(totalDuration % 60).padStart(2, "0")}`;

  /* =========================================
     DELETE ALBUM
  ========================================= */

  const handleDelete = async () => {
    const confirmed = await notify.confirmDelete(
      album.name || album.title || "this album"
    );

    if (!confirmed) return;

    if (typeof deleteAlbum === "function") {
      deleteAlbum(getRecordId(album));
    }
  };

  /* =========================================
     PLAY SONG
  ========================================= */

  const handlePlaySong = (song) => {
    if (!song) return;

    console.log("🎵 Album Song clicked:", {
      title: getSongTitle(song),
      artist: getSongArtist(song),
      audioUrl: getSongAudioUrl(song),
      songId: getRecordId(song),
    });

    let resolvedSong = song;
    const songId = getRecordId(song);

    /* ✅ Combined library से latest data */
    if (songId) {
      const librarySong = uniqueLibrary.find(
        (item) => getRecordId(item) === songId
      );

      if (librarySong) {
        resolvedSong = {
          ...song,
          ...librarySong,
        };
      }
    }

    let audioUrl = getSongAudioUrl(resolvedSong);

    /* ✅ Title matching fallback */
    if (!audioUrl) {
      const title = normalizeText(
        getSongTitle(resolvedSong)
      );

      if (title) {
        const librarySongByTitle =
          uniqueLibrary.find(
            (item) =>
              normalizeText(
                getSongTitle(item)
              ) === title
          );

        if (librarySongByTitle) {
          resolvedSong = {
            ...resolvedSong,
            ...librarySongByTitle,
          };
          audioUrl = getSongAudioUrl(resolvedSong);
        }
      }
    }

    console.log("🎧 Resolved audio URL:", audioUrl);

    if (!audioUrl) {
      const title =
        getSongTitle(resolvedSong) || "this song";

      console.error(
        "❌ Audio not available for:",
        title
      );

      notify.warning(
        `Audio file is not available for "${title}".`
      );

      return;
    }

    const selectedSongId =
      getRecordId(resolvedSong) ||
      getRecordId(song) ||
      `album-song-${Date.now()}`;

    const selectedTitle =
      getSongTitle(resolvedSong) ||
      getSongTitle(song) ||
      "Untitled Song";

    const selectedArtist =
      getSongArtist(resolvedSong) ||
      getSongArtist(song) ||
      album.artist ||
      "Unknown Artist";

    const selectedImage =
      resolvedSong.imageUrl ||
      resolvedSong.image ||
      resolvedSong.coverImage ||
      resolvedSong.coverUrl ||
      song.imageUrl ||
      song.image ||
      song.coverImage ||
      song.coverUrl ||
      albumImage ||
      "";

    const selectedSong = {
      ...resolvedSong,
      id: selectedSongId,
      _id: selectedSongId,
      title: selectedTitle,
      name: selectedTitle,
      artist: selectedArtist,
      album:
        resolvedSong.album ||
        resolvedSong.albumName ||
        album.name ||
        album.title ||
        "",
      genre: resolvedSong.genre || album.genre || "",
      language:
        resolvedSong.language || album.language || "",
      duration:
        resolvedSong.duration ||
        song.duration ||
        "--:--",
      audioUrl,
      audioFileUrl:
        resolvedSong.audioFileUrl || audioUrl,
      audioFilePath:
        resolvedSong.audioFilePath || "",
      imageUrl: getImageUrl(selectedImage),
      image: getImageUrl(selectedImage),
    };

    /* ✅ Queue */
    const queue = fullAlbumSongs
      .map((item) => {
        let libraryItem = item;

        const itemId = getRecordId(item);

        if (itemId) {
          const latestLibrarySong =
            uniqueLibrary.find(
              (librarySong) =>
                getRecordId(librarySong) === itemId
            );

          if (latestLibrarySong) {
            libraryItem = {
              ...item,
              ...latestLibrarySong,
            };
          }
        }

        const itemAudio =
          getSongAudioUrl(libraryItem);

        if (!itemAudio) return null;

        const itemTitle =
          getSongTitle(libraryItem) ||
          "Untitled Song";

        const itemArtist =
          getSongArtist(libraryItem) ||
          album.artist ||
          "Unknown Artist";

        const itemImage =
          libraryItem.imageUrl ||
          libraryItem.image ||
          libraryItem.coverImage ||
          libraryItem.coverUrl ||
          albumImage ||
          "";

        const finalItemId =
          getRecordId(libraryItem) ||
          itemId ||
          `album-song-${Date.now()}-${Math.random()}`;

        return {
          ...libraryItem,
          id: finalItemId,
          _id: finalItemId,
          title: itemTitle,
          name: itemTitle,
          artist: itemArtist,
          album:
            libraryItem.album ||
            libraryItem.albumName ||
            album.name ||
            album.title ||
            "",
          genre:
            libraryItem.genre || album.genre || "",
          language:
            libraryItem.language ||
            album.language ||
            "",
          duration:
            libraryItem.duration ||
            "--:--",
          audioUrl: itemAudio,
          audioFileUrl:
            libraryItem.audioFileUrl || itemAudio,
          audioFilePath:
            libraryItem.audioFilePath || "",
          imageUrl: getImageUrl(itemImage),
          image: getImageUrl(itemImage),
        };
      })
      .filter(Boolean);

    const selectedId = getRecordId(selectedSong);

    const existsInQueue = queue.some(
      (item) =>
        String(getRecordId(item)) ===
        String(selectedId)
    );

    if (!existsInQueue) {
      queue.push(selectedSong);
    }

    if (typeof playSong === "function") {
      playSong(selectedSong, queue);
    }

    if (typeof setActivePage === "function") {
      setActivePage("song-player");
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="album-view-page">
      {/* HEADER */}
      <div className="album-view-header">
        <button
          className="album-view-back-btn"
          onClick={() => setActivePage("albums")}
        >
          <ArrowLeft size={18} />
          Back to Albums
        </button>

        <div className="album-view-header-actions">
          <button
            className="album-view-edit-btn"
            onClick={() => openEditAlbum(album)}
          >
            <Edit size={17} />
            Edit
          </button>

          <button
            className="album-view-delete-btn"
            onClick={handleDelete}
          >
            <Trash2 size={17} />
            Delete
          </button>
        </div>
      </div>

      {/* ALBUM HERO */}
      <div className="album-view-hero">
        <div className="album-view-cover">
          {albumImage ? (
            <img
              src={albumImage}
              alt={
                album.name ||
                album.title ||
                "Album cover"
              }
              onError={(e) => {
                e.currentTarget.style.display = "none";

                const parent =
                  e.currentTarget.parentElement;

                if (parent) {
                  parent.classList.add(
                    "album-image-error"
                  );
                }
              }}
            />
          ) : (
            <div className="album-view-cover-placeholder">
              <Disc3 size={80} />
            </div>
          )}
        </div>

        <div className="album-view-info">
          <span
            className={`album-view-status ${
              album.status?.toLowerCase() ===
              "inactive"
                ? "inactive"
                : "active"
            }`}
          >
            {album.status || "Active"}
          </span>

          <h1>
            {album.name ||
              album.title ||
              "Untitled Album"}
          </h1>

          <div className="album-view-artist">
            <User size={17} />
            <span>
              {album.artist || "Unknown Artist"}
            </span>
          </div>

          {album.description && (
            <p className="album-view-description">
              {album.description}
            </p>
          )}

          <div className="album-view-meta">
            <div className="album-view-meta-item">
              <Tag size={16} />
              <div>
                <span>Genre</span>
                <strong>{album.genre || "N/A"}</strong>
              </div>
            </div>

            <div className="album-view-meta-item">
              <Languages size={16} />
              <div>
                <span>Language</span>
                <strong>
                  {album.language || "N/A"}
                </strong>
              </div>
            </div>

            <div className="album-view-meta-item">
              <Calendar size={16} />
              <div>
                <span>Release Date</span>
                <strong>
                  {album.releaseDate || "N/A"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALBUM STATS */}
      <div className="album-view-stats">
        <div className="album-view-stat-card">
          <div className="album-view-stat-icon">
            <Music size={20} />
          </div>
          <div>
            <span>Total Songs</span>
            <strong>{fullAlbumSongs.length}</strong>
          </div>
        </div>

        <div className="album-view-stat-card">
          <div className="album-view-stat-icon">
            <Clock size={20} />
          </div>
          <div>
            <span>Total Duration</span>
            <strong>{formattedDuration}</strong>
          </div>
        </div>

        <div className="album-view-stat-card">
          <div className="album-view-stat-icon">
            <Disc3 size={20} />
          </div>
          <div>
            <span>Album Type</span>
            <strong>Album</strong>
          </div>
        </div>

        <div className="album-view-stat-card">
          <div className="album-view-stat-icon">
            <ListMusic size={20} />
          </div>
          <div>
            <span>Status</span>
            <strong>{album.status || "Active"}</strong>
          </div>
        </div>
      </div>

      {/* SONGS SECTION */}
      <div className="album-view-songs-section">
        <div className="album-view-section-header">
          <div>
            <h2>
              <Music size={20} />
              Songs
            </h2>

            <p>
              {fullAlbumSongs.length} song
              {fullAlbumSongs.length !== 1 ? "s" : ""}{" "}
              in this album
            </p>
          </div>
        </div>

        {fullAlbumSongs.length === 0 ? (
          <div className="album-view-empty-songs">
            <Music size={45} />

            <h3>No Songs Added</h3>

            <p>
              This album does not have any songs
              yet.
            </p>

            <button onClick={() => openEditAlbum(album)}>
              <Edit size={16} />
              Add Songs
            </button>
          </div>
        ) : (
          <div className="album-view-song-list">
            {fullAlbumSongs.map((song, index) => {
              const songId =
                getRecordId(song) ||
                `album-song-${index}`;

              const currentSongId =
                getRecordId(currentSong);

              const isCurrentSong =
                currentSongId &&
                String(currentSongId) ===
                  String(songId);

              const songIsPlaying =
                isCurrentSong && isPlaying;

              const hasAudio = Boolean(
                getSongAudioUrl(song)
              );

              return (
                <div
                  className={`album-view-song ${
                    isCurrentSong ? "current" : ""
                  }`}
                  key={`${songId}-${index}`}
                >
                  <div className="album-view-song-number">
                    {songIsPlaying ? (
                      <span className="album-view-playing-bars">
                        <i></i>
                        <i></i>
                        <i></i>
                      </span>
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="album-view-song-icon">
                    <Music size={18} />
                  </div>

                  <div className="album-view-song-info">
                    <strong>
                      {getSongTitle(song) ||
                        "Untitled Song"}
                    </strong>

                    <span>
                      {getSongArtist(song) ||
                        album.artist ||
                        "Unknown Artist"}
                    </span>
                  </div>

                  <div className="album-view-song-genre">
                    {song.genre || album.genre || "N/A"}
                  </div>

                  <div className="album-view-song-duration">
                    {song.duration || "--:--"}
                  </div>

                  <button
                    type="button"
                    className={`album-view-play-btn ${
                      songIsPlaying ? "playing" : ""
                    } ${
                      !hasAudio ? "disabled" : ""
                    }`}
                    onClick={() => handlePlaySong(song)}
                    title={
                      hasAudio
                        ? songIsPlaying
                          ? "Open Player"
                          : "Play Song"
                        : "Audio file not available"
                    }
                  >
                    {songIsPlaying ? (
                      <Pause size={17} />
                    ) : (
                      <Play size={17} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumView;