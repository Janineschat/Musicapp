import React, { useState } from "react";
import Recorder from "./Recorder";
import ResultModal from "./ResultModal";
import { recognizeSong } from "./api";

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎵 Music Chord Finder
          </h1>
          <p className="text-gray-300">
            Record or upload audio to find song chords instantly
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Recorder Component */}
          <Recorder onAudioReady={handleAudioReady} isProcessing={isLoading} />

          {/* Recognize Button */}
          <button
            onClick={handleRecognizeSong}
            disabled={!audioInput?.blob || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? "🔍 Recognizing..." : "🎵 Recognize Song"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md">
              {error}
            </div>
          )}
        </div>

        {/* Result Modal */}
        <ResultModal
          isOpen={isModalOpen}
          onClose={closeModal}
          song={songData}
          chords={chordsData}
          lyrics={lyricsData}
          links={linksData}
          learning={learningData}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
