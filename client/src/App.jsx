import React, { useState } from "react";
import Recorder from "./Recorder";

import ResultModal from "./ResultModal";
import { recognizeSong } from "./api";

const SONG_LIST = [
  { title: "Wonderwall", artist: "Oasis", chords: "Em7 - G - Dsus4 - A7sus4", albumArt: "https://upload.wikimedia.org/wikipedia/en/5/52/Oasis_-_Wonderwall_cover.jpg" },
  { title: "Stairway to Heaven", artist: "Led Zeppelin", chords: "Am - Am/G - D/F# - Fmaj7 - G - Am", albumArt: "https://upload.wikimedia.org/wikipedia/en/9/9a/Led_Zeppelin_-_Led_Zeppelin_IV.jpg" },
  { title: "Nothing Else Matters", artist: "Metallica", chords: "Em - D - C - G - B7", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2c/Metallica_-_Nothing_Else_Matters_cover.jpg" },
  { title: "Tears in Heaven", artist: "Eric Clapton", chords: "A - E/G# - F#m - D - A - E", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Eric_Clapton_-_Tears_in_Heaven.jpg" },
  { title: "Hotel California", artist: "Eagles", chords: "Bm - F# - A - E - G - D - Em - F#", albumArt: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg" },
  { title: "Blackbird", artist: "The Beatles", chords: "G - Am - G/B - C - G - D - G", albumArt: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_White_Album_cover.jpg" },
  { title: "Shape of My Heart", artist: "Sting", chords: "Am - Em - F - C - Dm - Am - E", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2e/Sting_-_Ten_Summoner%27s_Tales.jpg" },
  { title: "Smoke on the Water", artist: "Deep Purple", chords: "G5 - Bb5 - C5", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2e/Deep_Purple_-_Machine_Head.jpg" },
  { title: "Wish You Were Here", artist: "Pink Floyd", chords: "G - C - D - Am", albumArt: "https://upload.wikimedia.org/wikipedia/en/9/9f/Pink_Floyd_-_Wish_You_Were_Here.jpg" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", chords: "D - C - G - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/9/9c/GunsnRosesSweetChildO%27Mine7InchSingleCover.jpg" },
  { title: "Knockin' on Heaven's Door", artist: "Bob Dylan", chords: "G - D - Am", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2b/Bob_Dylan_-_Knockin%27_on_Heaven%27s_Door.jpg" },
  { title: "Hey There Delilah", artist: "Plain White T's", chords: "D - F#m - Bm - G - A", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7b/Plain_White_T%27s_-_Hey_There_Delilah.jpg" },
  { title: "Fast Car", artist: "Tracy Chapman", chords: "C - G - Em - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/6/6e/Tracy_Chapman_-_Fast_Car.jpg" },
  { title: "Let It Be", artist: "The Beatles", chords: "C - G - Am - F", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/25/LetItBe.jpg" },
  { title: "Zombie", artist: "The Cranberries", chords: "Em - C - G - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2b/The_Cranberries_Zombie_album_cover.jpg" },
  { title: "I'm Yours", artist: "Jason Mraz", chords: "G - D - Em - C", albumArt: "https://upload.wikimedia.org/wikipedia/en/6/6a/Jason_Mraz_-_I%27m_Yours.jpg" },
  { title: "Riptide", artist: "Vance Joy", chords: "Am - G - C", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Vance_Joy_-_Riptide.jpg" },
  { title: "Counting Stars", artist: "OneRepublic", chords: "Am - C - G - F", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2e/OneRepublic_Counting_Stars_cover.png" },
  { title: "Someone Like You", artist: "Adele", chords: "A - E - F#m - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Adele_-_Someone_Like_You.png" },
  { title: "Perfect", artist: "Ed Sheeran", chords: "G - Em - C - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/4/45/Ed_Sheeran_Perfect_Single_cover.jpg" },
  { title: "All of Me", artist: "John Legend", chords: "Em - C - G - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/1/1e/John_Legend_All_of_Me_single_cover.png" },
  { title: "Take Me Home, Country Roads", artist: "John Denver", chords: "G - Em - D - C", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/John_Denver_-_Take_Me_Home%2C_Country_Roads.png" },
  { title: "Stand By Me", artist: "Ben E. King", chords: "G - Em - C - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2e/Ben_E._King_-_Stand_by_Me.jpg" },
  { title: "Let Her Go", artist: "Passenger", chords: "G - D - Em - C", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Passenger_-_Let_Her_Go.jpg" },
  { title: "Apologize", artist: "OneRepublic", chords: "Am - F - C - G", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/OneRepublic_Apologize.png" },
  { title: "Boulevard of Broken Dreams", artist: "Green Day", chords: "Em - G - D - A", albumArt: "https://upload.wikimedia.org/wikipedia/en/2/2e/Green_Day_-_Boulevard_of_Broken_Dreams.png" },
  { title: "Chasing Cars", artist: "Snow Patrol", chords: "A - E - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Snow_Patrol_-_Chasing_Cars.png" },
  { title: "Demons", artist: "Imagine Dragons", chords: "Em - C - G - D", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Imagine_Dragons_-_Demons.png" },
  { title: "Hey Soul Sister", artist: "Train", chords: "C - G - Am - F", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Train_-_Hey_Soul_Sister.png" },
  { title: "No Woman No Cry", artist: "Bob Marley", chords: "C - G - Am - F", albumArt: "https://upload.wikimedia.org/wikipedia/en/7/7e/Bob_Marley_-_No_Woman_No_Cry.png" },
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
          <h1 className="app-title text-6xl mb-2" style={{ color: '#4b6c57' }}>
            Music Chord Finder
          </h1>
          <p style={{ color: '#4b6c57' }}>
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
          song={selectedSong ? { title: selectedSong.title, artist: selectedSong.artist, albumArt: selectedSong.albumArt, externalUrl: '' } : songData}
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
                <span style={{ color: '#4b6c57', fontSize: '1rem' }}>{song.artist}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <footer className="w-full flex justify-center items-center py-6 bg-transparent mt-8">
        <span className="text-[#4b6c57] text-base font-semibold tracking-wide opacity-80">
          © janine schat
        </span>
      </footer>
    </div>
  );
}

export default App;
