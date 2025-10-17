import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
const allowedOrigins = [
  'https://maistermind-teleprompter.onrender.com', // Added Render URL
  'https://maistermind.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Set Content-Security-Policy globally to allow iframe embedding
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://maistermind.com");
  next();
});

app.use(express.json());

// --- API Key and AI Initialization ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: API_KEY environment variable not set!");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- API Route ---
app.post('/api/generate', async (req, res) => {
  // Disable server timeout for this potentially long-running request
  req.setTimeout(0);
  
  if (!ai) {
    return res.status(503).json({ error: 'The server is not configured with an API key. Service unavailable.' });
  }

  const { model, contents, config } = req.body;
  if (!model || !contents) {
    return res.status(400).json({ error: 'Request body must include "model" and "contents".' });
  }

  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({ model, contents, config });
      
      const text = response?.text;
      if (typeof text === 'string') {
        return res.json({ text });
      } else {
        console.error("Gemini response did not contain valid text. Full response:", JSON.stringify(response, null, 2));
        return res.status(500).json({ error: "AI response was empty or in an unexpected format. This could be due to content safety filters." });
      }
    } catch (error) {
      console.error(`Error calling Gemini API (Attempt ${i + 1}/${MAX_RETRIES}):`, error.message);
      if (i === MAX_RETRIES - 1) {
        return res.status(500).json({ error: `AI service error after ${MAX_RETRIES} attempts: ${error.message}` });
      }
      const delay = Math.pow(2, i) * 200;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
});

// --- Static File Serving & SPA Fallback ---
// This section MUST come AFTER all API routes.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other request that doesn't match an API route or a static file,
// send back the main index.html file. This is the catch-all for SPAs.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(port, () => {
  console.log(`Secure AI proxy server listening on port ${port}`);
});