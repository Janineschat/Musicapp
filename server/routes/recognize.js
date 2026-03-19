const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load chords database
const chordsDbPath = path.join(__dirname, '../chords-db.json');
let chordsDb = {};

try {
  const chordsData = fs.readFileSync(chordsDbPath, 'utf8');
  chordsDb = JSON.parse(chordsData);
} catch (error) {
  console.error('Error loading chords database:', error);
}

// Mock song recognition - always returns "Wonderwall" for demo
const MOCK_SONGS = [
  {
    title: "Wonderwall",
    artist: "Oasis",
    albumArt: "https://via.placeholder.com/300x300/4a5568/ffffff?text=Wonderwall"
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    albumArt: "https://via.placeholder.com/300x300/2d3748/ffffff?text=Hotel+California"
  },
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    albumArt: "https://via.placeholder.com/300x300/1a202c/ffffff?text=Stairway+to+Heaven"
  }
];

router.post('/recognize', (req, res) => {
  try {
    // In a real app, you'd process the audio file here
    // For now, we'll simulate recognition by randomly selecting a song
    const randomSong = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];

    // Get chords for the recognized song
    const songChords = chordsDb[randomSong.title];

    if (!songChords) {
      return res.status(404).json({
        error: 'Chords not found for recognized song'
      });
    }

    // Return the response
    res.json({
      song: randomSong,
      chords: {
        key: songChords.key,
        capo: songChords.capo,
        content: songChords.content
      }
    });

  } catch (error) {
    console.error('Recognition error:', error);
    res.status(500).json({
      error: 'Failed to recognize song'
    });
  }
});

module.exports = router;