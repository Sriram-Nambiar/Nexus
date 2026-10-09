import { Router } from 'express';
import healthRoutes from './health.routes';
import courseRoutes from './course.routes';
import resourceRoutes from './resource.routes';
import searchRoutes from './search.routes';
import aiRoutes from './ai.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/ai', aiRoutes);

export default apiRouter;
