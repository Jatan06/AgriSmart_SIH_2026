import axios from "axios";
import imageCompression from 'browser-image-compression';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

/**
 * Sends a leaf image with geolocation to the backend for analysis.
 *
 * @param {File} imageFile - The raw File object from react-dropzone
 * @param {number} lat - Latitude (default: 20.5937 = center of India)
 * @param {number} lon - Longitude (default: 78.9629 = center of India)
 * @param {string} language - Language code for Gemini response (default: "en")
 * @returns {Promise<Object>} The exact JSON response from FastAPI
 * @throws {Error} If the request fails or the server returns non-2xx
 */
export async function analyzeLeaf(imageFile, lat = 20.5937, lon = 78.9629, language = "en") {
  
  // 1. Compress Image before sending to avoid FastAPI limits / slow networks
  const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
  let compressedFile;
  try {
    compressedFile = await imageCompression(imageFile, options);
  } catch (error) {
    console.error("Image compression failed, using original file", error);
    compressedFile = imageFile;
  }

  const formData = new FormData();
  formData.append("image", compressedFile);
  formData.append("lat", lat);
  formData.append("lon", lon);
  formData.append("language", language);

  const response = await axios.post(`${API_BASE}/api/v1/detect`, formData, {
    timeout: 60000, // 60s timeout for ML inference + APIs
  });

  return response.data;
}
