const API_BASE_URL = '/api';

export const recognizeSong = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  const response = await fetch(`${API_BASE_URL}/recognize`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to recognize song');
  }

  return response.json();
};