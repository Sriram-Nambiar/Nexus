import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadRateLimiter } from '../middleware/rate-limit';

const router = Router();

// Upload educational resource (PDF, Video, Notes, Document)
router.post(
  '/',
  uploadRateLimiter,
  uploadMiddleware.single('file'),
  ResourceController.createResource
);

// Retrieve resource metadata (or direct stream if requested with media headers/range)
router.get('/:id', ResourceController.getResourceById);

// Dedicated file delivery endpoint supporting HTTP Range streaming for videos and inline delivery for PDFs
router.get('/:id/file', ResourceController.streamResourceFile);

// Delete resource
router.delete('/:id', ResourceController.deleteResource);

export default router;
