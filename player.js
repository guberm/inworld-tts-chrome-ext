const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const textPreview = document.getElementById("textPreview");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff8b8b" : "#9bb0cc";
}

async function loadAudio() {
  const requestId = window.location.hash.replace("#", "");
  if (!requestId) {
    setStatus("Missing audio request", true);
    return;
  }

  const key = `tts_${requestId}`;
  const result = await chrome.storage.session.get(key);
  const payload = result[key];

  if (!payload) {
    setStatus("Audio not found or expired", true);
    return;
  }

  textPreview.textContent = payload.text || "";

  const mimeType = getAudioMimeType(payload.audioEncoding || "MP3");
  const blob = base64ToBlob(payload.audioContent, mimeType);
  const url = URL.createObjectURL(blob);
  audioPlayer.src = url;
  setStatus("Ready");
}

loadAudio().catch(() => setStatus("Failed to load audio", true));
