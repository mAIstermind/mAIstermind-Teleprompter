import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
// Restrict requests to only come from your frontend's domain for security.
app.use(cors({ origin: 'https://maistermind.github.io' })); 
app.use(express.json());

// --- API Key and AI Initialization ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: API_KEY environment variable not set!");
}
// Initialize with a placeholder if the key is missing to prevent crashes,
// but the API route will fail gracefully.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- API Route ---
app.post('/api/generate', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'The server is not configured with an API key.' });
  }

  const { model, contents, config } = req.body;
  if (!model || !contents) {
    return res.status(400).json({ error: 'Request body must include "model" and "contents".' });
  }

  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({ model, contents, config });
      // Success, send the response and stop retrying.
      return res.json({ text: response.text });
    } catch (error) {
      console.error(`Error calling Gemini API (Attempt ${i + 1}/${MAX_RETRIES}):`, error.message);
      if (i === MAX_RETRIES - 1) {
        // Last attempt failed, send an error response.
        return res.status(500).json({ error: `AI service error after ${MAX_RETRIES} attempts: ${error.message}` });
      }
      // Wait before retrying, with exponential backoff.
      const delay = Math.pow(2, i) * 200; // e.g., 200ms, 400ms, 800ms
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
});

// --- Static File Serving ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Secure AI proxy server listening on port ${port}`);
});