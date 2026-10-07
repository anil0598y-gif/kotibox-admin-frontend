import { useRef, useState } from "react";

import {
  Music,
  Upload,
  Calendar,
  Clock,
  Save,
  X,
  Image as ImageIcon,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileAudio,
  Video,
  FileText,
} from "lucide-react";

import notify from "../../utils/notify";

import "./AddSong.css";

/* =========================================
   TEXTAREA STYLES — Common (works in light + dark)
========================================= */

const textareaStyles = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(150, 150, 150, 0.3)",
  background: "#ffffff",
  color: "#111111",
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: "14px",
  lineHeight: "1.7",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
};

function AddSong({ setActivePage, addSong }) {
  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const lyricVideoInputRef = useRef(null);
  const lyricsInputRef = useRef(null);

  const audioRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    language: "",
    releaseDate: "",
    duration: "",
    description: "",
    // ✅ Lyrics fields
    lyrics: "",
    syncedLyrics: "",
    isrc: "",
    catalogId: "",
    composer: "",
    lyricist: "",
    musicDirector: "",
    producer: "",
    copyright: "",
    publisher: "",
    copyrightYear: "",
    status: "Draft",
    visibility: "Public",
    scheduleDate: "",
    scheduleTime: "",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [musicVideo, setMusicVideo] = useState(null);
  const [lyricVideo, setLyricVideo] = useState(null);
  const [lyricsFile, setLyricsFile] = useState(null);

  const [coverPreview, setCoverPreview] = useState(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState("");
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     COVER IMAGE
  ========================================= */

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.warning("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setCoverImage(file);
    setCoverPreview(previewUrl);
  };

  const removeCoverImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverImage(null);
    setCoverPreview(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  /* =========================================
     AUDIO FILE
  ========================================= */

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      notify.warning("Please select a valid audio file.");
      e.target.value = "";
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);

    setAudioFile(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration("");
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration("");

    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Audio play error:", error);
          notify.error("Unable to play audio preview.");
          setIsPlaying(false);
        });
    }
  };

  const handleAudioLoaded = () => {
    if (!audioRef.current) return;

    const duration = audioRef.current.duration;

    if (Number.isFinite(duration)) {
      setAudioDuration(formatTime(duration));
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;

    setAudioCurrentTime(audioRef.current.currentTime);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCurrentTime(0);
  };

  const handleAudioSeek = (e) => {
    const value = Number(e.target.value);

    if (!audioRef.current) return;

    audioRef.current.currentTime = value;
    setAudioCurrentTime(value);
  };

  /* =========================================
     MUSIC VIDEO
  ========================================= */

  const handleMusicVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      notify.warning("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      notify.warning("Music video size must be less than 500 MB.");
      e.target.value = "";
      return;
    }

    setMusicVideo(file);
  };

  const removeMusicVideo = () => {
    setMusicVideo(null);

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  /* =========================================
     LYRIC VIDEO
  ========================================= */

  const handleLyricVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      notify.warning("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      notify.warning("Lyric video size must be less than 500 MB.");
      e.target.value = "";
      return;
    }

    setLyricVideo(file);
  };

  const removeLyricVideo = () => {
    setLyricVideo(null);

    if (lyricVideoInputRef.current) {
      lyricVideoInputRef.current.value = "";
    }
  };

  /* =========================================
     LYRICS FILE
  ========================================= */

  const handleLyricsChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    const allowedExtensions = ["txt", "lrc", "srt", "vtt"];

    if (!allowedExtensions.includes(extension)) {
      notify.warning("Lyrics file must be TXT, LRC, SRT or VTT.");

      e.target.value = "";
      return;
    }

    setLyricsFile(file);
  };

  const removeLyrics = () => {
    setLyricsFile(null);

    if (lyricsInputRef.current) {
      lyricsInputRef.current.value = "";
    }
  };

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* =========================================
     FILE SIZE
  ========================================= */

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.ceil(bytes / 1024)} KB`;
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSavingRef.current) {
      console.warn("⚠️ Submit blocked: save already in progress.");
      return;
    }

    if (isSaving) {
      return;
    }

    if (!formData.title.trim()) {
      notify.warning("Please enter song title.");
      return;
    }

    const cleanedArtist = formData.artist.trim().replace(/\s*,\s*/g, ", ");

    if (!cleanedArtist) {
      notify.warning("Please enter artist name.");
      return;
    }

    if (!formData.genre) {
      notify.warning("Please select genre.");
      return;
    }

    if (!formData.language) {
      notify.warning("Please select language.");
      return;
    }

    if (
      formData.status === "Scheduled" &&
      (!formData.scheduleDate || !formData.scheduleTime)
    ) {
      notify.warning("Please select schedule date and time.");
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const finalDuration = formData.duration || audioDuration || "00:00";

      const songPayload = {
        ...formData,
        title: formData.title.trim(),
        artist: cleanedArtist,
        duration: finalDuration,
        coverImage,
        audioFile,
        musicVideo,
        lyricVideo,
        lyricsFile,
        // ✅ Lyrics fields
        lyrics: formData.lyrics || "",
        syncedLyrics: formData.syncedLyrics || "",
      };

      console.log("=================================");
      console.log("📤 ADD SONG -> App.jsx ONLY");
      console.log("🎵 Title:", songPayload.title);
      console.log("📝 Lyrics length:", songPayload.lyrics?.length || 0);
      console.log("=================================");

      const savedSong = await addSong(songPayload);

      if (!savedSong) {
        return;
      }

      // Cleanup
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      setCoverPreview(null);
      setAudioUrl(null);
      setCoverImage(null);
      setAudioFile(null);
      setMusicVideo(null);
      setLyricVideo(null);
      setLyricsFile(null);

      if (coverInputRef.current) coverInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (lyricVideoInputRef.current) lyricVideoInputRef.current.value = "";
      if (lyricsInputRef.current) lyricsInputRef.current.value = "";
    } catch (error) {
      console.error("❌ ADD SONG ERROR:", error);

      if (error?.message === "Failed to fetch") {
        notify.error(
          "Backend server se connection nahi ho raha. Please backend folder me npm run dev chal raha hai ya nahi check karein."
        );
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  /* =========================================
     CANCEL
  ========================================= */

  const handleCancel = () => {
    setActivePage("songs");
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="add-song-page">
      <div className="add-song-header">
        <div>
          <h1>Add New Song</h1>
          <p>Add a new song to your music library</p>
        </div>
      </div>

      <form className="add-song-form" onSubmit={handleSubmit}>
        {/* 1. SONG ARTWORK */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <ImageIcon size={19} />
            </div>
            <div>
              <h2>Song Artwork</h2>
              <p>Upload the cover image for your song</p>
            </div>
          </div>

          <div className="add-artwork-area">
            {!coverImage ? (
              <label htmlFor="addCoverImage" className="add-cover-upload">
                <input
                  ref={coverInputRef}
                  type="file"
                  id="addCoverImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverChange}
                  hidden
                />
                <div className="add-cover-upload-icon">
                  <ImageIcon size={30} />
                </div>
                <strong>Upload Cover Image</strong>
                <span>JPG, PNG or WEBP</span>
                <span>Recommended: 1200 × 1200 px</span>
              </label>
            ) : (
              <div className="add-cover-preview-card">
                <div className="add-cover-preview">
                  <img src={coverPreview} alt="Song cover preview" />
                </div>
                <div className="add-cover-info">
                  <strong>{coverImage.name}</strong>
                  <span>{formatFileSize(coverImage.size)}</span>
                  <div className="add-media-actions">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <RefreshCw size={16} />
                      Replace
                    </button>
                    <button
                      type="button"
                      className="danger-action"
                      onClick={removeCoverImage}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. AUDIO FILE */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <FileAudio size={19} />
            </div>
            <div>
              <h2>Audio File</h2>
              <p>Upload and preview the song audio</p>
            </div>
          </div>

          {!audioFile ? (
            <label htmlFor="addAudioFile" className="add-audio-upload">
              <input
                ref={audioInputRef}
                type="file"
                id="addAudioFile"
                accept=".mp3,.wav,.ogg,.m4a,audio/*"
                onChange={handleAudioChange}
                hidden
              />
              <div className="add-audio-upload-icon">
                <Upload size={30} />
              </div>
              <strong>Upload Audio File</strong>
              <span>MP3, WAV, OGG or M4A</span>
              <span>Audio file is optional for now</span>
            </label>
          ) : (
            <div className="add-audio-card">
              <div className="add-audio-top">
                <div className="add-audio-file-icon">
                  <Music size={22} />
                </div>
                <div className="add-audio-file-info">
                  <strong>{audioFile.name}</strong>
                  <span>{formatFileSize(audioFile.size)}</span>
                </div>
                <button
                  type="button"
                  className="audio-remove-button"
                  onClick={removeAudio}
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="add-audio-player">
                <button
                  type="button"
                  className="audio-play-button"
                  onClick={toggleAudio}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <span className="audio-time">
                  {formatTime(audioCurrentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={audioRef.current?.duration || 0}
                  step="0.01"
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  className="audio-progress"
                />
                <span className="audio-time">{audioDuration || "00:00"}</span>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={handleAudioLoaded}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
              />

              <div className="add-audio-bottom">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <RefreshCw size={16} />
                  Replace Audio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. ADDITIONAL MEDIA */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <Video size={19} />
            </div>
            <div>
              <h2>Additional Media</h2>
              <p>Add optional video and lyrics files</p>
            </div>
          </div>

          <div className="add-media-grid">
            {/* MUSIC VIDEO */}
            <div className="add-form-field">
              <label>Music Video</label>
              {!musicVideo ? (
                <label htmlFor="musicVideo" className="add-small-upload">
                  <input
                    ref={videoInputRef}
                    type="file"
                    id="musicVideo"
                    accept="video/*"
                    onChange={handleMusicVideoChange}
                    hidden
                  />
                  <Video size={22} />
                  <span>Upload Music Video</span>
                </label>
              ) : (
                <div className="add-file-preview">
                  <Video size={20} />
                  <div>
                    <strong>{musicVideo.name}</strong>
                    <span>{formatFileSize(musicVideo.size)}</span>
                  </div>
                  <button type="button" onClick={removeMusicVideo}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* LYRIC VIDEO */}
            <div className="add-form-field">
              <label>Lyric Video</label>
              {!lyricVideo ? (
                <label htmlFor="lyricVideo" className="add-small-upload">
                  <input
                    ref={lyricVideoInputRef}
                    type="file"
                    id="lyricVideo"
                    accept="video/*"
                    onChange={handleLyricVideoChange}
                    hidden
                  />
                  <Video size={22} />
                  <span>Upload Lyric Video</span>
                </label>
              ) : (
                <div className="add-file-preview">
                  <Video size={20} />
                  <div>
                    <strong>{lyricVideo.name}</strong>
                    <span>{formatFileSize(lyricVideo.size)}</span>
                  </div>
                  <button type="button" onClick={removeLyricVideo}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* LYRICS FILE */}
            <div className="add-form-field add-full-width">
              <label>Lyrics File</label>
              {!lyricsFile ? (
                <label htmlFor="lyricsFile" className="add-small-upload">
                  <input
                    ref={lyricsInputRef}
                    type="file"
                    id="lyricsFile"
                    accept=".txt,.lrc,.srt,.vtt"
                    onChange={handleLyricsChange}
                    hidden
                  />
                  <FileText size={22} />
                  <span>Upload Lyrics File</span>
                  <small>TXT, LRC, SRT or VTT</small>
                </label>
              ) : (
                <div className="add-file-preview">
                  <FileText size={20} />
                  <div>
                    <strong>{lyricsFile.name}</strong>
                    <span>{formatFileSize(lyricsFile.size)}</span>
                  </div>
                  <button type="button" onClick={removeLyrics}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. BASIC INFORMATION */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <Music size={19} />
            </div>
            <div>
              <h2>Basic Information</h2>
              <p>Enter the basic information about the song</p>
            </div>
          </div>

          <div className="add-song-grid">
            <div className="add-form-field">
              <label htmlFor="title">
                Song Title <span>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter song title"
                required
              />
            </div>

            <div className="add-form-field">
              <label htmlFor="artist">
                Artist / Singer <span>*</span>
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Arijit Singh, Shreya Ghoshal"
                required
              />
              <small>Multiple artists comma se separate karein.</small>
            </div>

            <div className="add-form-field">
              <label htmlFor="album">Album</label>
              <input
                type="text"
                id="album"
                name="album"
                value={formData.album}
                onChange={handleChange}
                placeholder="Enter album name"
              />
            </div>

            <div className="add-form-field">
              <label htmlFor="genre">
                Genre <span>*</span>
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              >
                <option value="">Select genre</option>
                <option value="Bollywood">Bollywood</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Classical">Classical</option>
                <option value="Devotional">Devotional</option>
                <option value="Romantic">Romantic</option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="Indie">Indie</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="add-form-field">
              <label htmlFor="language">
                Language <span>*</span>
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
              >
                <option value="">Select language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="add-form-field">
              <label htmlFor="releaseDate">Release Date</label>
              <div className="add-input-with-icon">
                <Calendar size={17} />
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="add-form-field">
              <label htmlFor="duration">Duration</label>
              <div className="add-input-with-icon">
                <Clock size={17} />
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="03:45"
                />
              </div>
            </div>

            <div className="add-form-field add-full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a short description about the song..."
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* ✅ 5. LYRICS SECTION */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <FileText size={19} />
            </div>
            <div>
              <h2>Lyrics</h2>
              <p>
                Song lyrics — user app me lyrics button click karne pe dikhenge
              </p>
            </div>
          </div>

          <div className="add-song-grid">
            {/* Plain Lyrics */}
            <div className="add-form-field add-full-width">
              <label htmlFor="lyrics" style={{ display: "block", marginBottom: "10px", fontWeight: 600 }}>
                📝 Lyrics (Plain Text)
              </label>
              <textarea
                id="lyrics"
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                placeholder={`Paste song lyrics here...\n\nExample:\nTera naam...\nTere bina...\nTere sang...\n\nEk line ek line pe likho.`}
                rows="12"
                style={textareaStyles}
              />
              <small style={{ display: "block", marginTop: "8px", color: "#6b7280" }}>
                💡 Hindi / English songs ke lyrics yahan paste karo.
              </small>
            </div>

            {/* Synced Lyrics */}
            <div className="add-form-field add-full-width">
              <label htmlFor="syncedLyrics" style={{ display: "block", marginBottom: "10px", fontWeight: 600 }}>
                🎵 Synced Lyrics (Optional)
              </label>
              <textarea
                id="syncedLyrics"
                name="syncedLyrics"
                value={formData.syncedLyrics}
                onChange={handleChange}
                placeholder={`[00:12.34] First line\n[00:15.67] Second line\n[00:18.90] Third line`}
                rows="8"
                style={textareaStyles}
              />
              <small style={{ display: "block", marginTop: "8px", color: "#6b7280" }}>
                💡 Timed lyrics (Spotify jaisa auto-scroll). Format: [MM:SS.mm] Line text
              </small>
            </div>
          </div>
        </div>

        {/* 6. ADVANCED DETAILS */}
        <div className="add-song-section">
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            <div className="add-section-heading">
              <div className="add-section-icon">
                <FileText size={19} />
              </div>
              <div>
                <h2>Advanced Details</h2>
                <p>Copyright, credits and catalog information</p>
              </div>
            </div>
            <div className="advanced-toggle-icon">
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showAdvanced && (
            <div className="advanced-content">
              <div className="add-song-grid">
                <div className="add-form-field">
                  <label htmlFor="isrc">ISRC</label>
                  <input
                    type="text"
                    id="isrc"
                    name="isrc"
                    value={formData.isrc}
                    onChange={handleChange}
                    placeholder="Enter ISRC"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="catalogId">Catalog ID / Song ID</label>
                  <input
                    type="text"
                    id="catalogId"
                    name="catalogId"
                    value={formData.catalogId}
                    onChange={handleChange}
                    placeholder="Enter catalog ID"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="composer">Composer</label>
                  <input
                    type="text"
                    id="composer"
                    name="composer"
                    value={formData.composer}
                    onChange={handleChange}
                    placeholder="Enter composer name"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="lyricist">Lyricist</label>
                  <input
                    type="text"
                    id="lyricist"
                    name="lyricist"
                    value={formData.lyricist}
                    onChange={handleChange}
                    placeholder="Enter lyricist name"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="musicDirector">Music Director</label>
                  <input
                    type="text"
                    id="musicDirector"
                    name="musicDirector"
                    value={formData.musicDirector}
                    onChange={handleChange}
                    placeholder="Enter music director"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="producer">Producer</label>
                  <input
                    type="text"
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleChange}
                    placeholder="Enter producer name"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="copyright">Copyright</label>
                  <input
                    type="text"
                    id="copyright"
                    name="copyright"
                    value={formData.copyright}
                    onChange={handleChange}
                    placeholder="© 2026 Your Company"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="publisher">Publisher</label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Enter publisher"
                  />
                </div>

                <div className="add-form-field">
                  <label htmlFor="copyrightYear">Copyright Year</label>
                  <input
                    type="number"
                    id="copyrightYear"
                    name="copyrightYear"
                    value={formData.copyrightYear}
                    onChange={handleChange}
                    placeholder="2026"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. PUBLISHING */}
        <div className="add-song-section">
          <div className="add-section-heading">
            <div className="add-section-icon">
              <Clock size={19} />
            </div>
            <div>
              <h2>Publishing</h2>
              <p>Control song status, visibility and publishing time</p>
            </div>
          </div>

          <div className="add-song-grid">
            <div className="add-form-field">
              <label htmlFor="status">
                Status <span>*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="add-form-field">
              <label htmlFor="visibility">Visibility</label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Unlisted">Unlisted</option>
              </select>
            </div>

            {formData.status === "Scheduled" && (
              <>
                <div className="add-form-field">
                  <label htmlFor="scheduleDate">
                    Publish Date <span>*</span>
                  </label>
                  <div className="add-input-with-icon">
                    <Calendar size={17} />
                    <input
                      type="date"
                      id="scheduleDate"
                      name="scheduleDate"
                      value={formData.scheduleDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="add-form-field">
                  <label htmlFor="scheduleTime">
                    Publish Time <span>*</span>
                  </label>
                  <div className="add-input-with-icon">
                    <Clock size={17} />
                    <input
                      type="time"
                      id="scheduleTime"
                      name="scheduleTime"
                      value={formData.scheduleTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 8. ACTIONS */}
        <div className="add-song-actions">
          <button
            type="button"
            className="add-cancel-button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={17} />
            Cancel
          </button>

          <div className="add-primary-actions">
            {formData.status === "Draft" && (
              <button
                type="submit"
                className="add-draft-button"
                disabled={isSaving}
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
            )}

            <button
              type="submit"
              className="add-save-button"
              disabled={isSaving}
            >
              <Save size={17} />
              {isSaving
                ? "Saving..."
                : formData.status === "Scheduled"
                ? "Schedule Song"
                : formData.status === "Published"
                ? "Publish Song"
                : "Save Song"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddSong;  