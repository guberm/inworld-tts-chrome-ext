const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("modelSelect");
const encodingSelect = document.getElementById("encodingSelect");
const sampleRateSelect = document.getElementById("sampleRateSelect");
const streamingToggle = document.getElementById("streamingToggle");
const saveButton = document.getElementById("saveSettings");
const statusEl = document.getElementById("status");

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

  populateSelect(modelSelect, MODEL_OPTIONS, (i) => i.id, (i) => i.name);
  populateSelect(encodingSelect, ENCODING_OPTIONS, (i) => i.id, (i) => i.name);
  populateSelect(sampleRateSelect, SAMPLE_RATE_OPTIONS, (i) => i, (i) => i);

  apiKeyInput.value = settings.apiKey;
  modelSelect.value = settings.modelId;
  encodingSelect.value = settings.audioEncoding;
  sampleRateSelect.value = settings.sampleRateHertz;
  streamingToggle.checked = settings.streaming;
}

saveButton.addEventListener("click", async () => {
  const updated = {
    apiKey: apiKeyInput.value.trim(),
    modelId: modelSelect.value,
    audioEncoding: encodingSelect.value,
    sampleRateHertz: Number(sampleRateSelect.value),
    streaming: streamingToggle.checked
  };

  const existing = await loadSettings();
  const merged = { ...existing, ...updated };
  await saveSettings(merged);
  setStatus("Settings saved");
});

loadUi().catch(() => setStatus("Failed to load settings", true));
