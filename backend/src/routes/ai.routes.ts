import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { aiRateLimiter } from '../middleware/rate-limit';

const router = Router();

// Health of AI service
router.get('/health', AIController.checkHealth);

// AI QA forward proxy
router.post('/ask', aiRateLimiter, AIController.ask);

// AI Study plan generator and persistence
router.post('/study-plan', aiRateLimiter, AIController.generateStudyPlan);

// Saved study plans access
router.get('/study-plans', AIController.listStudyPlans);
router.get('/study-plans/:id', AIController.getStudyPlanById);

export default router;
