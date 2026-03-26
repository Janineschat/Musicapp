import React, { useState } from "react";
import Recorder from "./Recorder";

import ResultModal from "./ResultModal";
import { recognizeSong } from "./api";

const SONG_LIST = [
  { title: "Wonderwall", artist: "Oasis", chords: "Em7 - G - Dsus4 - A7sus4" },
  { title: "Stairway to Heaven", artist: "Led Zeppelin", chords: "Am - Am/G - D/F# - Fmaj7 - G - Am" },
  { title: "Nothing Else Matters", artist: "Metallica", chords: "Em - D - C - G - B7" },
  { title: "Tears in Heaven", artist: "Eric Clapton", chords: "A - E/G# - F#m - D - A - E" },
  { title: "Hotel California", artist: "Eagles", chords: "Bm - F# - A - E - G - D - Em - F#" },
  { title: "Blackbird", artist: "The Beatles", chords: "G - Am - G/B - C - G - D - G" },
  { title: "Shape of My Heart", artist: "Sting", chords: "Am - Em - F - C - Dm - Am - E" },
  { title: "Smoke on the Water", artist: "Deep Purple", chords: "G5 - Bb5 - C5" },
  { title: "Wish You Were Here", artist: "Pink Floyd", chords: "G - C - D - Am" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", chords: "D - C - G - D" },
  { title: "Knockin' on Heaven's Door", artist: "Bob Dylan", chords: "G - D - Am" },
  { title: "Hey There Delilah", artist: "Plain White T's", chords: "D - F#m - Bm - G - A" },
  { title: "Fast Car", artist: "Tracy Chapman", chords: "C - G - Em - D" },
  { title: "Let It Be", artist: "The Beatles", chords: "C - G - Am - F" },
  { title: "Zombie", artist: "The Cranberries", chords: "Em - C - G - D" },
  { title: "I'm Yours", artist: "Jason Mraz", chords: "G - D - Em - C" },
  { title: "Riptide", artist: "Vance Joy", chords: "Am - G - C" },
  { title: "Counting Stars", artist: "OneRepublic", chords: "Am - C - G - F" },
  { title: "Someone Like You", artist: "Adele", chords: "A - E - F#m - D" },
  { title: "Perfect", artist: "Ed Sheeran", chords: "G - Em - C - D" },
  { title: "All of Me", artist: "John Legend", chords: "Em - C - G - D" },
  { title: "Take Me Home, Country Roads", artist: "John Denver", chords: "G - Em - D - C" },
  { title: "Stand By Me", artist: "Ben E. King", chords: "G - Em - C - D" },
  { title: "Let Her Go", artist: "Passenger", chords: "G - D - Em - C" },
  { title: "Apologize", artist: "OneRepublic", chords: "Am - F - C - G" },
  { title: "Boulevard of Broken Dreams", artist: "Green Day", chords: "Em - G - D - A" },
  { title: "Chasing Cars", artist: "Snow Patrol", chords: "A - E - D" },
  { title: "Demons", artist: "Imagine Dragons", chords: "Em - C - G - D" },
  { title: "Hey Soul Sister", artist: "Train", chords: "C - G - Am - F" },
  { title: "No Woman No Cry", artist: "Bob Marley", chords: "C - G - Am - F" },
];

function App() {
  const [audioInput, setAudioInput] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songData, setSongData] = useState(null);
  const [chordsData, setChordsData] = useState(null);
  const [lyricsData, setLyricsData] = useState(null);
  const [linksData, setLinksData] = useState(null);
  const [learningData, setLearningData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleAudioReady = ({ blob, filename }) => {
    setAudioInput({ blob, filename });
    setError(null);
  };

  const handleRecognizeSong = async () => {
    if (!audioInput?.blob) {
      setError("Please record or upload audio first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSongData(null);
    setChordsData(null);
    setLyricsData(null);
    setLinksData(null);
    setLearningData(null);
    setIsModalOpen(true);

    try {
      const result = await recognizeSong(audioInput.blob, audioInput.filename);
      setSongData(result.song);
      setChordsData(result.chords);
      setLyricsData(result.lyrics || null);
      setLinksData(result.links || null);
      setLearningData(result.learning || null);
    } catch (err) {
      console.error("Recognition failed:", err);
      if (err.payload?.song) {
        setSongData(err.payload.song);
        setChordsData(err.payload.chords || null);
        setLyricsData(err.payload.lyrics || null);
        setLinksData(err.payload.links || null);
        setLearningData(err.payload.learning || null);
      }
      setError(err.message || "Failed to recognize song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSongData(null);
    setChordsData(null);
    setLyricsData(null);
    setLinksData(null);
    setLearningData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4">
      <div className="main-container max-w-4xl w-full mt-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-extrabold mb-2" style={{ color: '#38bdf8' }}>
            Music Chord Finder
          </h1>
          <p className="text-gray-300">
            Record or upload audio to find song chords instantly
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Recorder Component */}
          <Recorder onAudioReady={handleAudioReady} isProcessing={isLoading} onRecognize={handleRecognizeSong} />


          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md">
              {error}
            </div>
          )}
        </div>

        {/* Result Modal */}
        <ResultModal
          isOpen={isModalOpen || !!selectedSong}
          onClose={() => { setIsModalOpen(false); setSelectedSong(null); closeModal(); }}
          song={selectedSong ? { title: selectedSong.title, artist: selectedSong.artist, albumArt: '', externalUrl: '' } : songData}
          chords={selectedSong ? { content: selectedSong.chords, key: '', capo: '', source: 'basislijst' } : chordsData}
          lyrics={lyricsData}
          links={linksData}
          learning={learningData}
          error={error}
          isLoading={isLoading}
        />
      </div>

      {/* Song List onderaan */}
      <div className="w-full max-w-4xl mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#4b6c57' }}>Populaire nummers</h2>
        <ul className="minimal-list">
          {SONG_LIST.map((song, idx) => (
            <li key={song.title + song.artist}>
              <button
                className="w-full flex justify-between items-center"
                onClick={() => setSelectedSong(song)}
              >
                <span>{song.title}</span>
                <span style={{ color: '#7a9c7e', fontSize: '1rem' }}>{song.artist}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
