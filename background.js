importScripts("common.js");

const MENU_ID = "inworld-tts-generate";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Send to Inworld TTS",
    contexts: ["selection"]
  });
});

async function generateTtsAudio(payload, apiKey, streaming) {
  const endpoint = streaming
    ? "https://api.inworld.ai/tts/v1/voice:stream"
    : "https://api.inworld.ai/tts/v1/voice";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const audioContent = data.audioContent || data.audio_content || null;

  if (!audioContent) {
    throw new Error("Audio data not returned by API");
  }

  return audioContent;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_TTS") {
    const { text, settings } = message.payload;

    if (!settings.apiKey) {
      sendResponse({ success: false, error: "API key is required" });
      return true;
    }

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: "Text is required" });
      return true;
    }

    const payload = {
      text: text.trim(),
      voiceId: settings.voiceId,
      modelId: settings.modelId,
      languageCode: settings.languageCode,
      audio_config: {
        encoding: settings.audioEncoding,
        sample_rate_hertz: settings.sampleRateHertz
      }
    };

    generateTtsAudio(payload, settings.apiKey, settings.streaming)
      .then((audioContent) => {
        sendResponse({ success: true, audioContent });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  return false;
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectedText = (info.selectionText || "").trim();
  if (!selectedText) return;

  const settings = await loadSettings();
  if (!settings.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }

  const payload = {
    text: selectedText,
    voiceId: settings.voiceId,
    modelId: settings.modelId,
    languageCode: settings.languageCode,
    audio_config: {
      encoding: settings.audioEncoding,
      sample_rate_hertz: settings.sampleRateHertz
    }
  };

  try {
    const audioContent = await generateTtsAudio(
      payload,
      settings.apiKey,
      settings.streaming
    );

    const requestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString();

    await chrome.storage.session.set({
      [`tts_${requestId}`]: {
        audioContent,
        audioEncoding: settings.audioEncoding,
        text: selectedText
      }
    });

    chrome.tabs.create({ url: `player.html#${requestId}` });
  } catch (error) {
    console.error("Inworld TTS context menu error:", error);
  }
});
