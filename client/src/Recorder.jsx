import React, { useState, useRef } from "react";

const Recorder = ({ onAudioReady, isProcessing, onRecognize }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const getRecorderConfig = () => {
    const highQualityBitsPerSecond = 256000;

    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return {
        mimeType: "audio/webm;codecs=opus",
        extension: "webm",
        options: {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: highQualityBitsPerSecond,
        },
      };
    }

    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
      return {
        mimeType: "audio/ogg;codecs=opus",
        extension: "ogg",
        options: {
          mimeType: "audio/ogg;codecs=opus",
          audioBitsPerSecond: highQualityBitsPerSecond,
        },
      };
    }

    return {
      mimeType: "audio/webm",
      extension: "webm",
      options: { audioBitsPerSecond: highQualityBitsPerSecond },
    };
  };

  const startRecording = async () => {
    console.log("Starting recording...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got stream:", stream);
      const recorderConfig = getRecorderConfig();
      const mediaRecorder = new MediaRecorder(stream, recorderConfig.options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, chunks:", chunksRef.current.length);
        const blob = new Blob(chunksRef.current, {
          type: recorderConfig.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `recording-${stamp}.${recorderConfig.extension}`;
        setAudioBlob(blob);
        setAudioUrl(url);
        onAudioReady({ blob, filename });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      onAudioReady({ blob: file, filename: file.name });
    } else {
      alert("Please select a valid audio file.");
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  // Handle main recording button click
  const handleMainButtonClick = async () => {
    if (!isRecording) {
      // Start recording
      await startRecording();
    } else {
      // Stop recording and auto-trigger recognition
      stopRecording();
      // Give a small delay for state update
      setTimeout(() => {
        onRecognize?.();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      {/* Main Circular Recognition Button */}
      <div className="flex flex-col items-center space-y-6 mt-6">
        <button
          onClick={handleMainButtonClick}
          disabled={isProcessing}
          className={`recognize-button bg-[#e3ede1] hover:bg-[#d2e3d0] border border-[#b7cbb2] rounded-full w-36 h-36 flex items-center justify-center transition-all duration-300 ${isProcessing ? 'animate-spin' : 'float-animation'}`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <div className="button-content">
            {isRecording ? (
              <div className="animate-pulse">
                <svg
                  className="w-16 h-16 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="6" />
                </svg>
              </div>
            ) : isProcessing ? (
              <div className="animate-spin">
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2.586L9.707 6.293a1 1 0 111.414 1.414L7.414 11l3.707 3.707a1 1 0 01-1.414 1.414L6.586 12H3a1 1 0 01-1-1z" />
                </svg>
              </div>
            ) : (
              <svg
                className="w-14 h-14 text-[#2d3a2e] float-animation"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {/* Music note icon */}
                <path d="M12 3v9.28c-.47-.46-1.12-.75-1.84-.75-2.22 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
        </button>

        <p className="text-sm h-6 text-center" style={{ color: !isRecording && !isProcessing ? '#7a9c7e' : '#4b6c57' }}>
          {isRecording && "🔴 Recording... (Click to stop)"}
          {isProcessing && "🔍 Recognizing..."}
          {!isRecording && !isProcessing && "Click to record"}
        </p>
      </div>
    </div>
  );
};


// Zweef-animatie
// Voeg deze CSS toe aan je globale stylesheet als hij nog niet bestaat:
// .float-animation {
//   animation: float 2.5s ease-in-out infinite;
// }
// @keyframes float {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-16px); }
// }

export default Recorder;
