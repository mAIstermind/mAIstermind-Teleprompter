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
  if (!ai) {
    return res.status(503).json({ error: 'The server is not configured with an API key. Service unavailable.' });
  }

  const { model, contents, config } = req.body;
  if (!model || !contents) {
    return res.status(400).json({ error: 'Request body must include "model" and "contents".' });
  }
  
  try {
    const stream = await ai.models.generateContentStream({ model, contents, config });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    res.end();
  } catch (error) {
    console.error('Error during Gemini stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: `AI service stream error: ${error.message}` });
    } else {
      // If headers are already sent, we can't send a new status code.
      // We just end the response. The client will likely detect a truncated response.
      res.end();
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