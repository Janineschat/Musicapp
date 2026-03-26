import React from "react";

// Simple chord shapes for demo (E, Em, G, D, C, A, Am, F, etc.)
const CHORD_SHAPES = {
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  G: [3, 2, 0, 0, 0, 3],
  D: [0, 0, 0, 2, 3, 2],
  C: [0, 3, 2, 0, 1, 0],
  A: [0, 0, 2, 2, 2, 0],
  Am: [0, 0, 2, 2, 1, 0],
  F: [1, 3, 3, 2, 1, 1],
  Dm: [0, 0, 0, 2, 3, 1],
  B7: [2, 2, 1, 2, 0, 2],
  // Add more as needed
};


function GuitarChordDiagram({ chord }) {
  const shape = CHORD_SHAPES[chord.replace(/[^A-Za-z0-9]/g, "")];
  if (!shape) return null;

  return (
    <svg width="90" height="120" viewBox="0 0 90 120">
      {/* Frets */}
      {[1, 2, 3, 4, 5].map((fret) => (
        <line
          key={fret}
          x1="15"
          x2="75"
          y1={30 + fret * 18}
          y2={30 + fret * 18}
          stroke="#fff"
          strokeWidth={fret === 1 ? 4 : 2}
        />
      ))}
      {/* Strings */}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <line
          key={s}
          y1="48"
          y2="120"
          x1={15 + s * 12}
          x2={15 + s * 12}
          stroke="#fff"
          strokeWidth="2"
        />
      ))}
      {/* Dots */}
      {shape.map((fret, s) =>
        fret > 0 ? (
          <circle
            key={s}
            cx={15 + s * 12}
            cy={30 + fret * 18}
            r="7"
            fill="#fff"
            stroke="#2d3a2e"
            strokeWidth="2"
          />
        ) : null
      )}
      {/* String names */}
      <text x="15" y="26" fontSize="12" fill="#fff">E</text>
      <text x="27" y="26" fontSize="12" fill="#fff">A</text>
      <text x="39" y="26" fontSize="12" fill="#fff">D</text>
      <text x="51" y="26" fontSize="12" fill="#fff">G</text>
      <text x="63" y="26" fontSize="12" fill="#fff">B</text>
      <text x="75" y="26" fontSize="12" fill="#fff">e</text>
      {/* Chord name */}
      <text x="45" y="16" fontSize="18" fill="#fff" textAnchor="middle">{chord}</text>
    </svg>
  );
}

export default GuitarChordDiagram;
