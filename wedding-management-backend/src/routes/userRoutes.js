import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteUserAccount, 
  exportUserData 
} from '../controllers/userController.js';
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
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.delete('/profile', protect, deleteUserAccount);
router.get('/export-data', protect, exportUserData);

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

    // Enhanced prompt for multi-language support with phonetic English transcription
    const transcriptionPrompt = `
Transcribe the audio to plain text in English only. 
The audio may contain speech in any language (English, Hindi, Gujarati, or other languages).

Please transcribe what is spoken using English letters (phonetic transcription). Do NOT translate the meaning.
For example:
- If someone says "नमस्ते" (Hindi), transcribe as "namaste" (not "hello")
- If someone says "કેમ છો" (Gujarati), transcribe as "kem cho" (not "how are you")
- If someone says "hello" (English), transcribe as "hello"
- If someone says "धन्यवाद" (Hindi), transcribe as "dhanyavaad" (not "thank you")

Use English letters to spell out the sounds you hear, maintaining the original pronunciation.
Only return the phonetic English transcription, no additional comments or explanations.
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType,
        },
      },
      { text: transcriptionPrompt }
    ]);

    fs.unlink(req.file.path, () => {});

    const text = result?.response?.text?.() || '';
    
    // Ensure the transcription is in English (Latin characters)
    const englishText = text.replace(/[^\w\s.,!?-]/g, '').trim();
    
    // If no valid English text, return empty
    if (!englishText) {
      return res.json({ text: '' });
    }

    return res.json({ text: englishText });
  } catch (err) {
    console.error('Transcription error:', err);
    
    // Provide more specific error messages
    if (err.message?.includes('API_KEY')) {
      return res.status(500).json({ message: 'API configuration error' });
    } else if (err.message?.includes('audio')) {
      return res.status(400).json({ message: 'Invalid audio format' });
    } else if (err.message?.includes('quota') || err.message?.includes('limit')) {
      return res.status(429).json({ message: 'API quota exceeded' });
    } else {
      return res.status(500).json({ message: 'Transcription failed. Please try again.' });
    }
  }
});

export default router;
