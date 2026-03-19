import React from "react";

const ResultModal = ({
  isOpen,
  onClose,
  song,
  chords,
  lyrics,
  links,
  learning,
  error,
  isLoading,
}) => {
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
          ) : song ? (
            <div className="space-y-4">
              {/* Song Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={song.albumArt}
                  alt={`${song.title} album art`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {song.title}
                  </h3>
                  <p className="text-gray-300">{song.artist}</p>
                  {song.externalUrl && (
                    <a
                      href={song.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm"
                    >
                      Open song page
                    </a>
                  )}
                </div>
              </div>

              {learning && (
                <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-100">
                  {learning.fromCache
                    ? "Known audio fingerprint found. Chords loaded from memory."
                    : "New recognition processed and saved for future matches."}
                </div>
              )}

              {chords ? (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm text-gray-300">
                      Key:{" "}
                      <span className="font-semibold text-white">
                        {chords.key}
                      </span>
                    </span>
                    <span className="text-sm text-gray-300">
                      Capo:{" "}
                      <span className="font-semibold text-white">
                        {chords.capo}
                      </span>
                    </span>
                    <span className="text-sm text-gray-300">
                      Source:{" "}
                      <span className="font-semibold text-white">
                        {chords.source || "unknown"}
                      </span>
                    </span>
                  </div>
                  <pre className="text-green-400 whitespace-pre-wrap font-mono text-sm bg-gray-900 p-3 rounded border">
                    {chords.content}
                  </pre>
                </div>
              ) : (
                <div className="bg-amber-900 border border-amber-700 text-amber-100 rounded-lg p-4 text-sm">
                  No chord schema stored yet for this song. Add one once via API
                  and this app will remember it.
                </div>
              )}

              {lyrics && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">Lyrics preview</h4>
                    {lyrics.sourceUrl && (
                      <a
                        href={lyrics.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-300 hover:text-blue-200 text-sm"
                      >
                        Open lyrics source
                      </a>
                    )}
                  </div>
                  <pre className="text-gray-200 whitespace-pre-wrap font-mono text-xs bg-gray-900 p-3 rounded border min-h-[52px]">
                    {lyrics.preview || "No lyrics preview available yet."}
                  </pre>
                </div>
              )}

              {links && (
                <div className="bg-gray-700 rounded-lg p-4 text-sm text-gray-200 space-y-2">
                  <h4 className="text-white font-semibold">Useful links</h4>
                  {links.searchUrl && (
                    <a
                      href={links.searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-blue-300 hover:text-blue-200"
                    >
                      Search chords on web
                    </a>
                  )}
                  {links.ultimateGuitarSearchUrl && (
                    <a
                      href={links.ultimateGuitarSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-blue-300 hover:text-blue-200"
                    >
                      Ultimate Guitar search
                    </a>
                  )}
                  {links.chordSourceUrl && (
                    <a
                      href={links.chordSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-blue-300 hover:text-blue-200"
                    >
                      Stored chord source
                    </a>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
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
