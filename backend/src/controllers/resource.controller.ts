import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resource.service';
import { createResourceBodySchema } from '../validators';
import { BadRequestError } from '../middleware/error.middleware';

export class ResourceController {
  public static async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('File must be provided in multipart form data (field name: "file")');
      }

      const validated = createResourceBodySchema.parse(req.body);

      const resource = ResourceService.create({
        course_id: validated.course_id,
        title: validated.title,
        description: validated.description,
        resource_type: validated.resource_type,
        file: req.file,
      });

      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getResourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      // If requested directly via browser media/download or with Range header, stream file directly
      const wantsFile =
        req.query.file === '1' ||
        req.query.download === '1' ||
        Boolean(req.headers.range) ||
        (req.headers.accept &&
          (req.headers.accept.includes('video/') ||
            req.headers.accept.includes('application/pdf')) &&
          !req.headers.accept.includes('application/json'));

      if (wantsFile) {
        ResourceService.streamFile(id, req, res);
        return;
      }

      const resource = ResourceService.getById(id);

      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async streamResourceFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      ResourceService.streamFile(id, req, res);
    } catch (err) {
      next(err);
    }
  }

  public static async listResourcesByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const type = req.query.type as string | undefined;

      const resources = ResourceService.getByCourseId(id, type);

      res.status(200).json({
        success: true,
        data: resources,
        meta: {
          course_id: id,
          count: resources.length,
          type_filter: type || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      ResourceService.delete(id);

      res.status(200).json({
        success: true,
        message: `Resource with id '${id}' deleted successfully`,
      });
    } catch (err) {
      next(err);
    }
  }
}
