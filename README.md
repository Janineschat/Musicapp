# Music Chord Finder

A modern fullstack web application that recognizes music from audio input and instantly displays song information along with guitar chords.

## Features

- 🎤 **Microphone Recording**: Record audio directly from your microphone
- 📁 **File Upload**: Upload audio files for recognition
- 🎵 **Audio Preview**: Listen to your recording before recognition
- 🔍 **Song Recognition**: Mock music recognition (returns random songs for demo)
- 🎸 **Chord Display**: View formatted guitar chords in a modal popup
- 🎨 **Modern UI**: Dark theme with smooth animations

## Tech Stack

### Frontend

- React 18 with Vite
- Tailwind CSS for styling
- Modern ES6+ JavaScript

### Backend

- Node.js with Express
- Multer for file uploads
- CORS enabled
- JSON-based chord database

## Project Structure

```
music-chord-finder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── Recorder.jsx   # Audio recording/upload component
│   │   ├── ResultModal.jsx # Results modal component
│   │   ├── api.js         # API client functions
│   │   ├── main.jsx       # App entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── routes/
│   │   └── recognize.js   # Recognition API route
│   ├── chords-db.json     # Chord database
│   ├── server.js          # Main server file
│   └── package.json
└── package.json           # Root package for dev scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install all dependencies:
   ```bash
   npm run install:all
   ```

### Running the Application

1. Start both frontend and backend in development mode:

   ```bash
   npm run dev
   ```

2. The app will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Alternative: Run separately

**Backend:**

```bash
cd server
npm run dev
```

**Frontend:**

```bash
cd client
npm run dev
```

## API Endpoints

### POST /api/recognize

Recognizes a song from audio input and returns song info with chords.

**Request:** Multipart form data with `audio` file
**Response:**

```json
{
  "song": {
    "title": "Wonderwall",
    "artist": "Oasis",
    "albumArt": "https://via.placeholder.com/300x300/4a5568/ffffff?text=Wonderwall"
  },
  "chords": {
    "key": "F#m",
    "capo": 2,
    "content": "Em7 G Dsus4 A7sus4\n\n[Intro]\nEm7 G Dsus4 A7sus4\n..."
  }
}
```

## Mock Data

The app currently uses mock data for demonstration:

- Song recognition returns random songs from a predefined list
- Chords are stored in `server/chords-db.json`

## Future Enhancements

- [ ] Real music recognition API integration (AudD, ACRCloud)
- [ ] User authentication and chord libraries
- [ ] Chord transposition
- [ ] Song search and favorites
- [ ] Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development!
