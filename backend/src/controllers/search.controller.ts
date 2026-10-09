import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { searchQuerySchema } from '../validators';

export class SearchController {
  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = searchQuerySchema.parse(req.query);
      const results = await SearchService.search(validated.q, validated.include_content);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  }
}
