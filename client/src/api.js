const API_BASE_URL = "/api";

export const recognizeSong = async (audioBlob, fileName = "recording.wav") => {
  const formData = new FormData();
  formData.append("audio", audioBlob, fileName);

  const response = await fetch(`${API_BASE_URL}/recognize`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || "Failed to recognize song");
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const learnChords = async (input) => {
  const response = await fetch(`${API_BASE_URL}/learn-chords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Failed to save chord schema");
  }

  return payload;
};
