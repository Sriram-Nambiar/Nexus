import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { BadRequestError } from './error.middleware';
import { ResourceType } from '../types';

// Ensure the configured upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Whitelist of permitted MIME types
export const ALLOWED_MIME_TYPES = new Set([
  // PDF Documents
  'application/pdf',

  // Video Formats (for local offline streaming / Kiwix hotspot playback)
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',

  // Notes & Text
  'text/plain',
  'text/markdown',
  'text/csv',

  // Office & Structured Documents
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// Whitelist of permitted file extensions
export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.mp4',
  '.webm',
  '.ogg',
  '.mov',
  '.mkv',
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.json',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
]);

export function detectResourceType(mimeType: string, extension: string): ResourceType {
  const ext = extension.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime === 'application/pdf' || ext === '.pdf') {
    return 'pdf';
  }
  if (mime.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mov', '.mkv'].includes(ext)) {
    return 'video';
  }
  if (
    mime === 'text/plain' ||
    mime === 'text/markdown' ||
    ['.txt', '.md', '.markdown'].includes(ext)
  ) {
    return 'notes';
  }
  if (
    [
      '.doc',
      '.docx',
      '.ppt',
      '.pptx',
      '.xls',
      '.xlsx',
      '.csv',
      '.json',
    ].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    // Ensure destination is strictly the configured upload directory outside src
    cb(null, config.UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate a secure UUID filename to prevent arbitrary paths or dangerous filenames
    const ext = path.extname(file.originalname).toLowerCase();
    const safeStorageIdentifier = `res_${uuidv4()}${ext}`;
    cb(null, safeStorageIdentifier);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
    return cb(
      new BadRequestError(
        `File type not allowed. Supported types: PDF, MP4/WebM videos, Notes (txt/md), and Office documents. Received: ${mime} (${ext})`
      )
    );
  }

  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES, // 500 MB default
    files: 1, // Single file per upload request
  },
});
