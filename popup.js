const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const ttsText = document.getElementById("ttsText");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const generateBtn = document.getElementById("generate");
const useSelectionBtn = document.getElementById("useSelection");
const clearBtn = document.getElementById("clearText");
const openOptionsBtn = document.getElementById("openOptions");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff8b8b" : "#9bb0cc";
}

function populateSelect(selectEl, items, getValue, getLabel) {
  selectEl.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    selectEl.appendChild(option);
  });
}

async function loadUi() {
  const settings = await loadSettings();

  populateSelect(languageSelect, LANGUAGE_OPTIONS, (i) => i.code, (i) => i.name);
  populateSelect(voiceSelect, VOICE_OPTIONS, (i) => i, (i) => i);

  languageSelect.value = settings.languageCode;
  voiceSelect.value = settings.voiceId;

  languageSelect.addEventListener("change", async () => {
    const updated = { ...settings, languageCode: languageSelect.value };
    await saveSettings(updated);
  });

  voiceSelect.addEventListener("change", async () => {
    const updated = { ...settings, voiceId: voiceSelect.value };
    await saveSettings(updated);
  });
}

async function getSelectedTextFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return "";

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  return result || "";
}

async function generateSpeech() {
  const settings = await loadSettings();
  const text = ttsText.value;

  setStatus("Generating speech...");
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");

  chrome.runtime.sendMessage(
    {
      type: "GENERATE_TTS",
      payload: { text, settings }
    },
    (response) => {
      if (!response || !response.success) {
        setStatus(response?.error || "Failed to generate speech", true);
        return;
      }

      const mimeType = getAudioMimeType(settings.audioEncoding);
      const blob = base64ToBlob(response.audioContent, mimeType);
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      audioPlayer.play();
      setStatus("Ready");
    }
  );
}

useSelectionBtn.addEventListener("click", async () => {
  try {
    const selectedText = await getSelectedTextFromPage();
    if (selectedText) {
      ttsText.value = selectedText;
      setStatus("Selected text loaded");
    } else {
      setStatus("No text selected", true);
    }
  } catch (error) {
    setStatus("Unable to read selection", true);
  }
});

clearBtn.addEventListener("click", () => {
  ttsText.value = "";
  setStatus("Cleared");
});

generateBtn.addEventListener("click", generateSpeech);

openOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

loadUi().catch(() => setStatus("Failed to load settings", true));
