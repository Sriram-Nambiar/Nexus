import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { createCourseSchema, updateCourseSchema } from '../validators';

export class CourseController {
  public static async listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = CourseService.list(search, limit, offset);

      res.status(200).json({
        success: true,
        data: result.courses,
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

  public static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const course = CourseService.getById(id);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createCourseSchema.parse(req.body);
      const course = CourseService.create(validated);

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = updateCourseSchema.parse(req.body);
      const course = CourseService.update(id, validated);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      CourseService.delete(id);

      res.status(200).json({
        success: true,
        message: `Course with id '${id}' and associated resources deleted successfully`,
      });
    } catch (err) {
      next(err);
    }
  }
}
