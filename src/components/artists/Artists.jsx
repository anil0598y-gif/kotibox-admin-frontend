import React, { useMemo, useState } from "react";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  Music,
  Disc3,
  Mic2,
  X,
  Filter,
} from "lucide-react";

import "./Artists.css";

/* ✅ NAYA: notify import */
import notify from "../../utils/notify";

const API_BASE_URL = "http://localhost:5000";

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

const getArtistImage = (artist) => {
  if (!artist) return "";

  const image =
    artist.imageUrl ||
    artist.image ||
    artist.imageURL ||
    artist.photoUrl ||
    artist.photo ||
    "";

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${API_BASE_URL}${
    image.startsWith("/") ? "" : "/"
  }${image}`;
};

const formatFollowers = (value) => {
  const followers = Number(value) || 0;

  if (followers >= 1000000000) {
    return `${(followers / 1000000000).toFixed(1)}B`;
  }

  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M`;
  }

  if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K`;
  }

  return followers.toLocaleString();
};

function Artists({
  artists = [],
  songs = [],
  albums = [],
  setActivePage,
  openArtist,
  openEditArtist,
  deleteArtist,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const artistList = Array.isArray(artists) ? artists : [];
  const songList = Array.isArray(songs) ? songs : [];
  const albumList = Array.isArray(albums) ? albums : [];

  /* DYNAMIC FILTER OPTIONS */

  const genres = useMemo(() => {
    const values = artistList
      .map((artist) => artist.genre)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [artistList]);

  const languages = useMemo(() => {
    const values = artistList
      .map((artist) => artist.language)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [artistList]);

  /* RELATED SONG COUNT */

  const getArtistSongs = (artist) => {
    if (!artist) return [];

    const artistId = getRecordId(artist);

    if (Array.isArray(artist.songs) && artist.songs.length) {
      return artist.songs;
    }

    return songList.filter((song) => {
      const songArtistId =
        getRecordId(song.artist) ||
        getRecordId(song.artistId);

      const songArtistName =
        typeof song.artist === "string"
          ? song.artist
          : song.artist?.name;

      return (
        (artistId &&
          songArtistId &&
          artistId === songArtistId) ||
        (songArtistName &&
          artist.name &&
          songArtistName.toLowerCase() ===
            artist.name.toLowerCase())
      );
    });
  };

  /* RELATED ALBUM COUNT */

  const getArtistAlbums = (artist) => {
    if (!artist) return [];

    const artistId = getRecordId(artist);

    if (Array.isArray(artist.albums) && artist.albums.length) {
      return artist.albums;
    }

    return albumList.filter((album) => {
      const albumArtistId =
        getRecordId(album.artist) ||
        getRecordId(album.artistId);

      const albumArtistName =
        typeof album.artist === "string"
          ? album.artist
          : album.artist?.name;

      return (
        (artistId &&
          albumArtistId &&
          artistId === albumArtistId) ||
        (albumArtistName &&
          artist.name &&
          albumArtistName.toLowerCase() ===
            artist.name.toLowerCase())
      );
    });
  };

  /* FILTERED ARTISTS */

  const filteredArtists = useMemo(() => {
    return artistList.filter((artist) => {
      const name = artist.name?.toLowerCase() || "";
      const type = artist.type?.toLowerCase() || "";
      const genre = artist.genre?.toLowerCase() || "";
      const language =
        artist.language?.toLowerCase() || "";
      const status =
        artist.status?.toLowerCase() || "";

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        type.includes(search) ||
        genre.includes(search) ||
        language.includes(search);

      const matchesGenre =
        genreFilter === "All" ||
        genre === genreFilter.toLowerCase();

      const matchesLanguage =
        languageFilter === "All" ||
        language === languageFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesGenre &&
        matchesLanguage &&
        matchesStatus
      );
    });
  }, [
    artistList,
    searchTerm,
    genreFilter,
    languageFilter,
    statusFilter,
  ]);

  /* STATS */

  const totalArtists = artistList.length;

  const activeArtists = artistList.filter(
    (artist) =>
      String(artist.status || "Active").toLowerCase() ===
      "active"
  ).length;

  const inactiveArtists = artistList.filter(
    (artist) =>
      String(artist.status || "").toLowerCase() ===
      "inactive"
  ).length;

  const totalFollowers = artistList.reduce(
    (total, artist) =>
      total + (Number(artist.followers) || 0),
    0
  );

  /* ACTIONS */

  const handleAddArtist = () => {
    if (setActivePage) {
      setActivePage("add-artist");
    }
  };

  const handleViewArtist = (artist) => {
    if (!artist) return;

    if (openArtist) {
      openArtist(artist);
      return;
    }

    if (setActivePage) {
      setActivePage("view-artist");
    }
  };

  const handleEditArtist = (artist) => {
    if (!artist) return;

    if (openEditArtist) {
      openEditArtist(artist);
      return;
    }

    if (setActivePage) {
      setActivePage("edit-artist");
    }
  };

  /* ✅ NAYA: async handleDeleteArtist */
  const handleDeleteArtist = async (artist) => {
    if (!artist) return;

    const artistId = getRecordId(artist);

    /* ✅ alert → notify.warning */
    if (!artistId) {
      notify.warning("Artist ID missing.");
      return;
    }

    /* ✅ window.confirm → notify.confirmDelete */
    const confirmed = await notify.confirmDelete(
      artist.name || "this artist"
    );

    if (!confirmed) return;

    if (deleteArtist) {
      await deleteArtist(artistId);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGenreFilter("All");
    setLanguageFilter("All");
    setStatusFilter("All");
  };

  const hasActiveFilters =
    searchTerm ||
    genreFilter !== "All" ||
    languageFilter !== "All" ||
    statusFilter !== "All";

  /* RENDER */

  return (
    <div className="artists-page">
      {/* HEADER */}
      <div className="artists-header">
        <div className="artists-header-left">
          <div className="artists-title-icon">
            <Mic2 size={24} />
          </div>

          <div>
            <h1>Artists</h1>
            <p>Manage artists and their music</p>
          </div>
        </div>

        <button
          type="button"
          className="add-artist-btn"
          onClick={handleAddArtist}
        >
          <Plus size={18} />
          Add Artist
        </button>
      </div>

      {/* STATS */}
      <div className="artists-stats">
        <div className="artist-stat-card">
          <div className="artist-stat-icon">
            <Mic2 size={21} />
          </div>

          <div className="artist-stat-content">
            <span>Total Artists</span>
            <strong>{totalArtists}</strong>
          </div>
        </div>

        <div className="artist-stat-card">
          <div className="artist-stat-icon">
            <Users size={21} />
          </div>

          <div className="artist-stat-content">
            <span>Total Followers</span>
            <strong>
              {formatFollowers(totalFollowers)}
            </strong>
          </div>
        </div>

        <div className="artist-stat-card">
          <div className="artist-stat-icon">
            <Music size={21} />
          </div>

          <div className="artist-stat-content">
            <span>Active Artists</span>
            <strong>{activeArtists}</strong>
          </div>
        </div>

        <div className="artist-stat-card">
          <div className="artist-stat-icon">
            <Disc3 size={21} />
          </div>

          <div className="artist-stat-content">
            <span>Inactive Artists</span>
            <strong>{inactiveArtists}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="artists-toolbar">
        <div className="artist-search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`artist-filter-toggle ${
            showFilters ? "active" : ""
          }`}
          onClick={() =>
            setShowFilters((prev) => !prev)
          }
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="artists-filter-panel">
          <div className="artist-filter-group">
            <label>Genre</label>

            <select
              value={genreFilter}
              onChange={(event) =>
                setGenreFilter(event.target.value)
              }
            >
              {genres.map((genre) => (
                <option value={genre} key={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="artist-filter-group">
            <label>Language</label>

            <select
              value={languageFilter}
              onChange={(event) =>
                setLanguageFilter(event.target.value)
              }
            >
              {languages.map((language) => (
                <option
                  value={language}
                  key={language}
                >
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div className="artist-filter-group">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* RESULT INFO */}
      <div className="artists-result-info">
        <span>
          Showing{" "}
          <strong>{filteredArtists.length}</strong> of{" "}
          <strong>{totalArtists}</strong> artists
        </span>

        {hasActiveFilters && (
          <button type="button" onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </div>

      {/* ARTIST TABLE */}
      <div className="artists-table-wrapper">
        <table className="artists-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Type</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Followers</th>
              <th>Songs</th>
              <th>Albums</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredArtists.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="artists-empty-cell"
                >
                  <div className="artists-empty">
                    <div className="artists-empty-icon">
                      <Mic2 size={28} />
                    </div>

                    <h3>No artists found</h3>

                    <p>
                      {artistList.length === 0
                        ? "No artists have been added yet."
                        : "Try changing your search or filters."}
                    </p>

                    {artistList.length === 0 && (
                      <button
                        type="button"
                        onClick={handleAddArtist}
                        className="empty-add-artist-btn"
                      >
                        <Plus size={17} />
                        Add Artist
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredArtists.map((artist) => {
                const artistId = getRecordId(artist);

                const image = getArtistImage(artist);

                const artistSongs = getArtistSongs(artist);

                const artistAlbums =
                  getArtistAlbums(artist);

                const status =
                  artist.status || "Active";

                return (
                  <tr key={artistId || artist.name}>
                    {/* ARTIST */}
                    <td>
                      <div className="artist-table-profile">
                        {image ? (
                          <img
                            src={image}
                            alt={artist.name || "Artist"}
                            className="artist-table-image"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";

                              const fallback =
                                event.currentTarget
                                  .nextElementSibling;

                              if (fallback) {
                                fallback.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className="artist-table-placeholder"
                          style={{
                            display: image
                              ? "none"
                              : "flex",
                          }}
                        >
                          <Mic2 size={20} />
                        </div>

                        <div className="artist-table-info">
                          <strong>
                            {artist.name ||
                              "Unnamed Artist"}
                          </strong>

                          <span>
                            {artist.country || "India"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className="artist-type">
                        {artist.type || "Singer"}
                      </span>
                    </td>

                    {/* GENRE */}
                    <td>
                      <span className="artist-genre">
                        {artist.genre || "Bollywood"}
                      </span>
                    </td>

                    {/* LANGUAGE */}
                    <td>
                      {artist.language || "Hindi"}
                    </td>

                    {/* FOLLOWERS */}
                    <td>
                      <div className="artist-followers">
                        <Users size={15} />

                        <span>
                          {formatFollowers(
                            artist.followers
                          )}
                        </span>
                      </div>
                    </td>

                    {/* SONGS */}
                    <td>
                      <div className="artist-count">
                        <Music size={15} />
                        <span>{artistSongs.length}</span>
                      </div>
                    </td>

                    {/* ALBUMS */}
                    <td>
                      <div className="artist-count">
                        <Disc3 size={15} />
                        <span>
                          {artistAlbums.length}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`artist-status ${
                          String(status).toLowerCase() ===
                          "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span className="status-dot" />
                        {status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="artist-actions">
                        <button
                          type="button"
                          className="artist-action-btn view"
                          title="View Artist"
                          onClick={() =>
                            handleViewArtist(artist)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="artist-action-btn edit"
                          title="Edit Artist"
                          onClick={() =>
                            handleEditArtist(artist)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="artist-action-btn delete"
                          title="Delete Artist"
                          onClick={() =>
                            handleDeleteArtist(artist)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Artists;