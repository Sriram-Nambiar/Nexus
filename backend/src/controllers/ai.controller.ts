import { Request, Response, NextFunction } from 'express';
import { aiServiceClient } from '../services/ai-client.service';
import { StudyPlanService } from '../services/study-plan.service';
import { aiAskSchema, aiStudyPlanSchema } from '../validators';

export class AIController {
  public static async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = aiAskSchema.parse(req.body);
      const aiResponse = await aiServiceClient.ask(validated);

      res.status(200).json({
        success: true,
        data: aiResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async generateStudyPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = aiStudyPlanSchema.parse(req.body);
      const aiResponse = await aiServiceClient.generateStudyPlan(validated);

      let savedRecord = null;
      if (validated.save !== false) {
        savedRecord = StudyPlanService.save({
          title: aiResponse.title,
          goal: aiResponse.goal,
          plan: aiResponse.plan,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...aiResponse,
          study_plan_id: savedRecord ? savedRecord.id : undefined,
          saved: Boolean(savedRecord),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async checkHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await aiServiceClient.checkHealth();
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listStudyPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = StudyPlanService.list(limit, offset);

      res.status(200).json({
        success: true,
        data: result.plans,
        meta: {
          total: result.total,
          limit,
          offset,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getStudyPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const plan = StudyPlanService.getById(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  }
}
