import React, { useState } from 'react';
import Recorder from './Recorder';
import ResultModal from './ResultModal';
import { recognizeSong } from './api';

function App() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songData, setSongData] = useState(null);
  const [chordsData, setChordsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAudioReady = (blob) => {
    setAudioBlob(blob);
    setError(null);
  };

  const handleRecognizeSong = async () => {
    if (!audioBlob) {
      setError('Please record or upload audio first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSongData(null);
    setChordsData(null);
    setIsModalOpen(true);

    try {
      const result = await recognizeSong(audioBlob);
      setSongData(result.song);
      setChordsData(result.chords);
    } catch (err) {
      console.error('Recognition failed:', err);
      setError('Failed to recognize song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSongData(null);
    setChordsData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎵 Music Chord Finder</h1>
          <p className="text-gray-300">Record or upload audio to find song chords instantly</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Recorder Component */}
          <Recorder onAudioReady={handleAudioReady} isProcessing={isLoading} />


            {/* Gebruik een disabled style met visuele feedback (bijv. opacity of cursor) zodat duidelijker is dat de knop niet klikbaar is. */}
          {/* Recognize Button */}
          <button
            onClick={handleRecognizeSong}
            disabled={!audioBlob || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? '🔍 Recognizing...' : '🎵 Recognize Song'}
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
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;

Codereview Musicapp - Lars Gruppelaar
Positief:
De code is goed opgebouwd en overzichtelijk. Alles is netjes opgesplitst in losse componenten zoals Recorder en ResultModal, waardoor de code makkelijk te lezen is. Ook is er goede foutafhandeling aanwezig met een try/catch blok, en wordt de gebruiker netjes op de hoogte gehouden met een foutmelding als er iets misgaat. De loading state is ook goed uitgewerkt, de knop verandert van tekst terwijl het laden bezig is.
Verbeterpunten:
De knop wordt wel uitgeschakeld als er geen audio is maar je ziet niet echt waarom. Een klein tekstje zoals "Neem eerst audio op" zou de gebruiker duidelijker helpen. Er staat wel een opmerking in de code over de disabled styling maar die is nog niet uitgewerkt.
Verder zou het fijn zijn als er een bevestiging komt als de opname gelukt is, zodat je als gebruiker zeker weet dat er iets opgenomen is voordat je op de knop drukt.

  In het vervolg misschien voor de netheid even de notities van AI uit je code halen, ziet er iets professioneler uit. 
