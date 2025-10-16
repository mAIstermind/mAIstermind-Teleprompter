import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); 
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

  try {
    const response = await ai.models.generateContent({ model, contents, config });
    res.json({ text: response.text });
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
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
