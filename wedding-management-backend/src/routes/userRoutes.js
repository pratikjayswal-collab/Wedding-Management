import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Gemini Speech-to-Text via file upload
const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (_) {}
const upload = multer({ dest: tmpDir });
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ message: 'Missing GEMINI_API_KEY/GOOGLE_API_KEY' });
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || 'audio/webm';

    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType,
        },
      },
      { text: 'Transcribe the audio to plain text only.' }
    ]);

    fs.unlink(req.file.path, () => {});

    const text = result?.response?.text?.() || '';
    return res.json({ text });
  } catch (err) {
    console.error('Transcription error:', err);
    return res.status(500).json({ message: 'Transcription failed' });
  }
});

export default router;
