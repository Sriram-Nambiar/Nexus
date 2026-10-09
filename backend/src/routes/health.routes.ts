import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

router.get('/', HealthController.getHealth);
router.get('/offspot', HealthController.getOffspotStatus);

export default router;
