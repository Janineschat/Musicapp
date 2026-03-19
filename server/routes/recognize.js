const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Load chords database
const chordsDbPath = path.join(__dirname, "../chords-db.json");
let chordsDb = {};

const learnedDbPath = path.join(__dirname, "../learned-chords-db.json");
let learnedDb = {
  songs: {},
  fingerprints: {},
};

try {
  const chordsData = fs.readFileSync(chordsDbPath, "utf8");
  chordsDb = JSON.parse(chordsData);
} catch (error) {
  console.error("Error loading chords database:", error);
}

try {
  if (fs.existsSync(learnedDbPath)) {
    const learnedData = fs.readFileSync(learnedDbPath, "utf8");
    learnedDb = JSON.parse(learnedData);
  }
} catch (error) {
  console.error("Error loading learned chords database:", error);
}

const saveLearnedDb = () => {
  fs.writeFileSync(learnedDbPath, JSON.stringify(learnedDb, null, 2));
};

const songKey = (title, artist) => `${title}__${artist}`.toLowerCase();

const isGeneratedRecordingName = (value = "") => {
  const normalized = value.toLowerCase().trim();
  if (!normalized) {
    return false;
  }

  // Ignore auto-generated local recording names like "recording-2026-...".
  return (
    normalized.startsWith("recording") ||
    /^\d{4}\s*-\s*\d{2}\s*-\s*\d{2}/.test(normalized)
  );
};

const isLikelyInvalidLearnedSong = (song) => {
  if (!song) {
    return true;
  }

  return (
    isGeneratedRecordingName(song.title) ||
    isGeneratedRecordingName(song.artist)
  );
};

const parseSongFromFilename = (filename = "") => {
  const cleaned = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_]+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  const dashSplit = cleaned.split(" - ");
  if (dashSplit.length >= 2) {
    const artist = dashSplit[0].trim();
    const title = dashSplit.slice(1).join(" - ").trim();
    if (
      title &&
      artist &&
      !isGeneratedRecordingName(title) &&
      !isGeneratedRecordingName(artist)
    ) {
      return { title, artist };
    }
  }

  // Also support common naming conventions like "artist-title" or "artist_title".
  const looseDashSplit = cleaned.split(/\s*-\s*/);
  if (looseDashSplit.length >= 2) {
    const artist = looseDashSplit[0].trim();
    const title = looseDashSplit.slice(1).join(" - ").trim();
    if (
      title &&
      artist &&
      !isGeneratedRecordingName(title) &&
      !isGeneratedRecordingName(artist)
    ) {
      return { title, artist };
    }
  }

  return null;
};

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreSongFromFilename = (filename, song) => {
  const normalizedFile = normalizeText(filename);
  const normalizedTitle = normalizeText(song.title);
  const normalizedArtist = normalizeText(song.artist);

  if (!normalizedFile) {
    return 0;
  }

  let score = 0;

  if (normalizedFile.includes(normalizedTitle)) {
    score += 65;
  }

  if (normalizedFile.includes(normalizedArtist)) {
    score += 35;
  }

  const titleTokens = normalizedTitle.split(" ").filter(Boolean);
  const overlap = titleTokens.filter((token) =>
    normalizedFile.includes(token),
  ).length;
  score += overlap * 6;

  return Math.min(score, 100);
};

const chooseMockSong = ({ filename, audioHash }) => {
  const scored = MOCK_SONGS.map((song) => ({
    song,
    score: scoreSongFromFilename(filename, song),
  })).sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best && best.score >= 40) {
    const confidence = Math.min(0.92, 0.45 + best.score / 160);
    return {
      song: best.song,
      confidence,
      reason: "filename-match",
      candidates: scored.slice(0, 3).map((entry) => ({
        title: entry.song.title,
        artist: entry.song.artist,
        score: entry.score,
      })),
    };
  }

  const hashSeed = Number.parseInt((audioHash || "").slice(0, 8), 16) || 0;
  const index = hashSeed % MOCK_SONGS.length;
  return {
    song: MOCK_SONGS[index],
    confidence: 0.38,
    reason: "hash-fallback",
    candidates: scored.slice(0, 3).map((entry) => ({
      title: entry.song.title,
      artist: entry.song.artist,
      score: entry.score,
    })),
  };
};

const enrichSongMetadata = async (title, artist) => {
  const term = encodeURIComponent(`${title} ${artist}`);
  const fallback = {
    albumArt: `https://placehold.co/300x300/4a5568/ffffff?text=${encodeURIComponent(title)}`,
    externalUrl: null,
  };

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`,
    );
    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const item = data.results && data.results[0];
    if (!item) {
      return fallback;
    }

    return {
      albumArt: item.artworkUrl100
        ? item.artworkUrl100.replace("100x100", "300x300")
        : fallback.albumArt,
      externalUrl: item.trackViewUrl || null,
    };
  } catch (error) {
    return fallback;
  }
};

const fetchLyricsInfo = async (title, artist) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedArtist = encodeURIComponent(artist);

  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`,
    );
    if (!response.ok) {
      return {
        available: false,
        preview: null,
        sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(`${artist} ${title} lyrics`)}`,
      };
    }

    const data = await response.json();
    const preview = (data.lyrics || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join("\n");

    return {
      available: Boolean(preview),
      preview: preview || null,
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(`${artist} ${title} lyrics`)}`,
    };
  } catch (error) {
    return {
      available: false,
      preview: null,
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(`${artist} ${title} lyrics`)}`,
    };
  }
};

const buildChordSearchLinks = (title, artist) => {
  const query = encodeURIComponent(`${artist} ${title} chords`);
  return {
    searchUrl: `https://www.google.com/search?q=${query}`,
    ultimateGuitarSearchUrl: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(title)}`,
  };
};

const recognizeWithAudD = async (audioBuffer, originalname = "audio.wav") => {
  const apiToken = process.env.AUDD_API_TOKEN;

  if (!apiToken) {
    return {
      matched: false,
      reason: "audd-disabled",
    };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer]);

    formData.append("api_token", apiToken);
    formData.append("return", "apple_music,spotify,deezer");
    formData.append("file", blob, originalname);

    const response = await fetch("https://api.audd.io/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return {
        matched: false,
        reason: "audd-http-error",
      };
    }

    const data = await response.json();
    const result = data?.result;

    if (!result?.title || !result?.artist) {
      return {
        matched: false,
        reason: "audd-no-match",
      };
    }

    return {
      matched: true,
      reason: "audd-match",
      confidence: 0.98,
      song: {
        title: result.title,
        artist: result.artist,
      },
      externalUrl:
        result?.spotify?.external_urls?.spotify ||
        result?.apple_music?.url ||
        result?.song_link ||
        null,
    };
  } catch (error) {
    console.warn(
      "AudD recognition failed, falling back to mock recognizer:",
      error.message,
    );
    return {
      matched: false,
      reason: "audd-request-failed",
    };
  }
};

// Mock song recognition - always returns "Wonderwall" for demo
const MOCK_SONGS = [
  {
    title: "Wonderwall",
    artist: "Oasis",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Wonderwall",
  },
  {
    title: "Here Comes the Sun",
    artist: "The Beatles",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Here+Comes+the+Sun",
  },
  {
    title: "Blackbird",
    artist: "The Beatles",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Blackbird",
  },
  {
    title: "Let It Go",
    artist: "Passenger",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Let+It+Go",
  },
  {
    title: "This Town",
    artist: "Niall Horan",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=This+Town",
  },
  {
    title: "All I Want",
    artist: "Kodaline",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=All+I+Want",
  },
  {
    title: "Sweet Creature",
    artist: "Harry Styles",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Sweet+Creature",
  },
  {
    title: "Hey There Delilah",
    artist: "Plain White T's",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Hey+There+Delilah",
  },
  {
    title: "Say You Won't Let Go",
    artist: "James Arthur",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Say+You+Won%27t+Let+Go",
  },
  {
    title: "The A Team",
    artist: "Ed Sheeran",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=The+A+Team",
  },
  {
    title: "Photograph",
    artist: "Ed Sheeran",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Photograph",
  },
  {
    title: "Can't Help Falling in Love",
    artist: "Elvis Presley",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Can%27t+Help+Falling+in+Love",
  },
  {
    title: "I'm Yours",
    artist: "Jason Mraz",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=I%27m+Yours",
  },
  {
    title: "Yellow",
    artist: "Coldplay",
    albumArt: "https://via.placeholder.com/300x300/4a5568/ffffff?text=Yellow",
  },
  {
    title: "Waves",
    artist: "Dean Lewis",
    albumArt: "https://via.placeholder.com/300x300/4a5568/ffffff?text=Waves",
  },
  {
    title: "Let It Be",
    artist: "The Beatles",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Let+It+Be",
  },
  {
    title: "She Will Be Loved",
    artist: "Maroon 5",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=She+Will+Be+Loved",
  },
  {
    title: "Hey, Soul Sister",
    artist: "Train",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Hey%2C+Soul+Sister",
  },
  {
    title: "Sparks",
    artist: "Coldplay",
    albumArt: "https://via.placeholder.com/300x300/4a5568/ffffff?text=Sparks",
  },
  {
    title: "Little Lion Man",
    artist: "Mumford & Sons",
    albumArt:
      "https://via.placeholder.com/300x300/4a5568/ffffff?text=Little+Lion+Man",
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    albumArt:
      "https://via.placeholder.com/300x300/2d3748/ffffff?text=Hotel+California",
  },
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    albumArt:
      "https://via.placeholder.com/300x300/1a202c/ffffff?text=Stairway+to+Heaven",
  },
];

router.post("/recognize", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const audioHash = crypto
      .createHash("sha1")
      .update(req.file.buffer)
      .digest("hex");
    const cachedSongId = learnedDb.fingerprints[audioHash];
    const cached = cachedSongId ? learnedDb.songs[cachedSongId] : null;

    if (cachedSongId && cached && !isLikelyInvalidLearnedSong(cached)) {
      const meta = await enrichSongMetadata(cached.title, cached.artist);

      return res.json({
        song: {
          title: cached.title,
          artist: cached.artist,
          albumArt: meta.albumArt,
          externalUrl: meta.externalUrl,
        },
        chords: cached.chords,
        lyrics: cached.lyrics || null,
        links:
          cached.links || buildChordSearchLinks(cached.title, cached.artist),
        learning: {
          fromCache: true,
          learned: true,
          audioHash,
        },
      });
    }

    if (cachedSongId && cached && isLikelyInvalidLearnedSong(cached)) {
      delete learnedDb.fingerprints[audioHash];
      delete learnedDb.songs[cachedSongId];
      saveLearnedDb();
    }

    const parsedFromFilename = parseSongFromFilename(req.file.originalname);
    const auddResult = await recognizeWithAudD(
      req.file.buffer,
      req.file.originalname,
    );
    const mockResult = chooseMockSong({
      filename: req.file.originalname,
      audioHash,
    });

    const baseSong = auddResult.song || parsedFromFilename || mockResult.song;
    const title = baseSong.title;
    const artist = baseSong.artist;
    const id = songKey(title, artist);

    const existingLearned = learnedDb.songs[id];
    const staticChords = chordsDb[title]
      ? {
          key: chordsDb[title].key,
          capo: chordsDb[title].capo,
          content: chordsDb[title].content,
          source: "seed-db",
        }
      : null;

    const chords = existingLearned?.chords || staticChords || null;
    const links =
      existingLearned?.links || buildChordSearchLinks(title, artist);
    const lyrics =
      existingLearned?.lyrics || (await fetchLyricsInfo(title, artist));
    const metadata = await enrichSongMetadata(title, artist);
    const preferredExternalUrl =
      metadata.externalUrl ||
      (auddResult.matched ? auddResult.externalUrl : null);

    learnedDb.songs[id] = {
      title,
      artist,
      chords,
      lyrics,
      links,
      updatedAt: new Date().toISOString(),
    };
    learnedDb.fingerprints[audioHash] = id;
    saveLearnedDb();

    if (!chords) {
      return res.json({
        song: {
          title,
          artist,
          albumArt: metadata.albumArt,
          externalUrl: preferredExternalUrl,
        },
        chords: null,
        lyrics,
        links,
        learning: {
          fromCache: false,
          learned: false,
          audioHash,
        },
        warning:
          "No chord schema known yet for this song. Add it once and it will be remembered.",
        recognition: {
          mode: auddResult.matched ? "audd" : "mock-deterministic",
          confidence: parsedFromFilename
            ? 0.95
            : auddResult.matched
              ? auddResult.confidence
              : mockResult.confidence,
          reason: parsedFromFilename
            ? "filename-artist-title"
            : auddResult.matched
              ? auddResult.reason
              : mockResult.reason,
          candidates: mockResult.candidates,
        },
      });
    }

    res.json({
      song: {
        title,
        artist,
        albumArt: metadata.albumArt,
        externalUrl: preferredExternalUrl,
      },
      chords,
      lyrics,
      links,
      learning: {
        fromCache: false,
        learned: Boolean(chords),
        audioHash,
      },
      recognition: {
        mode: auddResult.matched ? "audd" : "mock-deterministic",
        confidence: parsedFromFilename
          ? 0.95
          : auddResult.matched
            ? auddResult.confidence
            : mockResult.confidence,
        reason: parsedFromFilename
          ? "filename-artist-title"
          : auddResult.matched
            ? auddResult.reason
            : mockResult.reason,
        candidates: mockResult.candidates,
      },
    });
  } catch (error) {
    console.error("Recognition error:", error);
    res.status(500).json({
      error: "Failed to recognize song",
    });
  }
});

router.post("/learn-chords", (req, res) => {
  try {
    const {
      title,
      artist,
      key,
      capo = 0,
      content,
      sourceUrl,
      audioHash,
      lyrics,
    } = req.body || {};

    if (!title || !artist || !content || !key) {
      return res.status(400).json({
        error: "title, artist, key and content are required",
      });
    }

    const id = songKey(title, artist);
    const existing = learnedDb.songs[id] || {};

    learnedDb.songs[id] = {
      title,
      artist,
      chords: {
        key,
        capo,
        content,
        source: sourceUrl || "manual",
      },
      lyrics: lyrics || existing.lyrics || null,
      links: {
        ...(existing.links || {}),
        ...(sourceUrl ? { chordSourceUrl: sourceUrl } : {}),
      },
      updatedAt: new Date().toISOString(),
    };

    if (audioHash) {
      learnedDb.fingerprints[audioHash] = id;
    }

    saveLearnedDb();

    res.json({
      success: true,
      message: "Chord schema saved. Future recognitions can reuse it.",
    });
  } catch (error) {
    console.error("Learn chords error:", error);
    res.status(500).json({ error: "Failed to store learned chord schema" });
  }
});

module.exports = router;
