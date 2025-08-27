import multer from 'multer';
import path from 'path';
import fs from 'fs';

const proofsDir = path.resolve('uploads', 'proofs');

// Ensure destination exists
if (!fs.existsSync(proofsDir)) {
	fs.mkdirSync(proofsDir, { recursive: true });
}

// Allowed mimetypes: images and PDF
const allowedMimeTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf'
];

const storage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, proofsDir);
	},
	filename: function (req, file, cb) {
		const timestamp = Date.now();
		const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
		const filename = `${req.user?._id || 'user'}_${req.params.id || 'expense'}_${timestamp}_${safeOriginal}`;
		cb(null, filename);
	}
});

function fileFilter(_req, file, cb) {
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only images and PDF files are allowed'));
	}
}

export const uploadProof = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }
});

export { proofsDir };

