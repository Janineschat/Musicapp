import React from 'react';

const ResultModal = ({ isOpen, onClose, song, chords, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Song Recognized!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-white">Loading chords...</span>
            </div>
          ) : song && chords ? (
            <div className="space-y-4">
              {/* Song Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={song.albumArt}
                  alt={`${song.title} album art`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{song.title}</h3>
                  <p className="text-gray-300">{song.artist}</p>
                </div>
              </div>

              {/* Chords Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-sm text-gray-300">
                    Key: <span className="font-semibold text-white">{chords.key}</span>
                  </span>
                  <span className="text-sm text-gray-300">
                    Capo: <span className="font-semibold text-white">{chords.capo}</span>
                  </span>
                </div>
                <pre className="text-green-400 whitespace-pre-wrap font-mono text-sm bg-gray-900 p-3 rounded border">
                  {chords.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-400">Failed to load song information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;