/* =========================================================
   api-config.js
   Put your AI provider keys and endpoints here.
   This file is loaded by every tool page — DO NOT commit real
   keys to a public repository, use environment/back-end
   injection in production instead.
   ========================================================= */

const API_CONFIG = {
  // Example: image generation provider
  imageGeneration: {
    endpoint: "", // e.g. "https://api.yourprovider.com/v1/images/generate"
    apiKey: "",   // TODO: add your API key
  },

  // Example: image enhancement / upscale provider
  imageEnhancement: {
    endpoint: "",
    apiKey: "",
  },

  // Example: image expansion (outpainting) provider
  imageExpansion: {
    endpoint: "",
    apiKey: "",
  },

  // Example: background removal provider
  backgroundRemoval: {
    endpoint: "",
    apiKey: "",
  },

  // Example: image-to-video provider
  imageToVideo: {
    endpoint: "",
    apiKey: "",
  },

  // Example: text-to-video provider
  textToVideo: {
    endpoint: "",
    apiKey: "",
  },
};

// TODO: implement the real request helper once you pick your provider(s).
async function callAiApi(providerConfig, payload) {
  throw new Error("callAiApi() not implemented yet — configure API_CONFIG and implement this function.");
}
