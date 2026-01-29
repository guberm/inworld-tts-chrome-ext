const DEFAULT_SETTINGS = {
  apiKey: "",
  modelId: "inworld-tts-1.5-max",
  audioEncoding: "MP3",
  sampleRateHertz: 24000,
  streaming: false,
  languageCode: "EN_US",
  voiceId: "Ashley"
};

const LANGUAGE_OPTIONS = [
  { code: "EN_US", name: "English (US)" },
  { code: "ZH_CN", name: "Chinese (Simplified)" },
  { code: "KO_KR", name: "Korean" },
  { code: "JA_JP", name: "Japanese" },
  { code: "RU_RU", name: "Russian" },
  { code: "IT_IT", name: "Italian" },
  { code: "ES_ES", name: "Spanish" },
  { code: "PT_BR", name: "Portuguese (Brazil)" },
  { code: "DE_DE", name: "German" },
  { code: "FR_FR", name: "French" },
  { code: "AR_SA", name: "Arabic" },
  { code: "PL_PL", name: "Polish" },
  { code: "NL_NL", name: "Dutch" },
  { code: "HI_IN", name: "Hindi" },
  { code: "HE_IL", name: "Hebrew" }
];

const VOICE_OPTIONS = [
  "Ashley",
  "Alex",
  "Craig",
  "Deborah",
  "Dennis",
  "Edward",
  "Elizabeth",
  "Julia",
  "Mark",
  "Olivia",
  "Sarah",
  "Laura",
  "Andrew",
  "Simon",
  "Danny",
  "Mike",
  "Peter",
  "Megan",
  "Anna",
  "Sophia",
  "Rachel",
  "Jack"
];

const MODEL_OPTIONS = [
  { id: "inworld-tts-1.5-max", name: "TTS-1.5-Max" },
  { id: "inworld-tts-1.5-mini", name: "TTS-1.5-Mini" }
];

const ENCODING_OPTIONS = [
  { id: "MP3", name: "MP3" },
  { id: "LINEAR16", name: "LINEAR16" }
];

const SAMPLE_RATE_OPTIONS = [16000, 22050, 24000, 44100, 48000];

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, (result) => {
      resolve({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  });
}

function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ settings }, () => resolve());
  });
}

function getAudioMimeType(encoding) {
  return encoding === "LINEAR16" ? "audio/wav" : "audio/mpeg";
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
