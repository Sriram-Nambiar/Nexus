import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { config } from '../config/env';
import { Resource, ResourceResponse, ResourceType } from '../types';
import { CourseService } from './course.service';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';
import { detectResourceType } from '../middleware/upload.middleware';

export interface CreateResourceInput {
  course_id: string;
  title: string;
  description?: string | null;
  resource_type?: ResourceType;
  file?: Express.Multer.File;
  storage_path?: string;
  mime_type?: string;
  file_size?: number;
}

export class ResourceService {
  public static create(input: CreateResourceInput): ResourceResponse {
    const db = getDatabase();

    // Verify course exists
    CourseService.getById(input.course_id);

    let storagePath = input.storage_path;
    let mimeType = input.mime_type;
    let fileSize = input.file_size;
    let resourceType = input.resource_type;

    if (input.file) {
      storagePath = input.file.filename;
      mimeType = input.file.mimetype;
      fileSize = input.file.size;
      const ext = path.extname(input.file.originalname);
      resourceType = resourceType || detectResourceType(mimeType, ext);
    }

    if (!storagePath || !mimeType || fileSize === undefined) {
      throw new BadRequestError('Resource file or valid storage parameters must be provided');
    }

    const id = `res_${uuidv4()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO resources (
        id, course_id, title, description, resource_type,
        storage_path, mime_type, file_size, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.course_id,
      input.title.trim(),
      input.description ? input.description.trim() : null,
      resourceType || 'other',
      storagePath,
      mimeType,
      fileSize,
      now
    );

    return this.getById(id);
  }

  public static getById(id: string): ResourceResponse {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM resources WHERE id = ?');
    const resource = stmt.get(id) as Resource | undefined;

    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }

    return {
      ...resource,
      file_url: `/api/resources/${resource.id}/file`,
      download_url: `/api/resources/${resource.id}/file?download=1`,
    };
  }

  public static getByCourseId(courseId: string, typeFilter?: string): ResourceResponse[] {
    const db = getDatabase();
    // Validate course exists
    CourseService.getById(courseId);

    let stmt;
    let resources: Resource[];

    if (typeFilter) {
      stmt = db.prepare('SELECT * FROM resources WHERE course_id = ? AND resource_type = ? ORDER BY created_at DESC');
      resources = stmt.all(courseId, typeFilter.toLowerCase()) as Resource[];
    } else {
      stmt = db.prepare('SELECT * FROM resources WHERE course_id = ? ORDER BY created_at DESC');
      resources = stmt.all(courseId) as Resource[];
    }

    return resources.map((res) => ({
      ...res,
      file_url: `/api/resources/${res.id}/file`,
      download_url: `/api/resources/${res.id}/file?download=1`,
    }));
  }

  public static delete(id: string): void {
    const db = getDatabase();
    const resource = this.getById(id);

    // Remove from database
    const stmt = db.prepare('DELETE FROM resources WHERE id = ?');
    stmt.run(id);

    // Safely remove file from disk if located in upload directory
    try {
      const fullPath = this.resolveSafePath(resource.storage_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn(`Could not delete storage file for resource ${id}:`, err);
    }
  }

  /**
   * Safely resolves a storage path and enforces strict containment
   * within config.UPLOAD_DIR to prevent directory traversal vulnerabilities.
   */
  public static resolveSafePath(storagePath: string): string {
    // Reject absolute paths that don't match or tricky traversal sequences
    const sanitizedFilename = path.basename(storagePath);
    const resolvedPath = path.resolve(config.UPLOAD_DIR, sanitizedFilename);

    // Verify containment
    const normalizedUploadDir = path.resolve(config.UPLOAD_DIR);
    if (!resolvedPath.startsWith(normalizedUploadDir)) {
      throw new BadRequestError('Access denied: Unauthorized file path');
    }

    return resolvedPath;
  }

  /**
   * Delivers resource files with HTTP Range requests for video seeking
   * and inline display headers for PDFs.
   */
  public static streamFile(id: string, req: Request, res: Response): void {
    const resource = this.getById(id);
    const filePath = this.resolveSafePath(resource.storage_path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Resource file not found on disk');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const dispositionType = isDownload ? 'attachment' : 'inline';
    const safeFilename = encodeURIComponent(resource.title || 'resource');

    // General headers
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${dispositionType}; filename="${safeFilename}${path.extname(resource.storage_path)}"`
    );

    const rangeHeader = req.headers.range;

    // Handle HTTP Range Requests (Essential for Video seeking and large media)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range boundaries
      if (isNaN(start) || isNaN(end) || start > end || start >= fileSize || end >= fileSize || start < 0) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      const fileStream = fs.createReadStream(filePath, { start, end });

      fileStream.on('error', (err) => {
        console.error('Error streaming range chunk:', err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      req.on('close', () => {
        fileStream.destroy();
      });

      fileStream.pipe(res);
      return;
    }

    // Standard Non-Range Delivery (PDFs, Notes, Complete downloads)
    res.status(200);
    res.setHeader('Content-Length', fileSize);

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });

    req.on('close', () => {
      fileStream.destroy();
    });

    fileStream.pipe(res);
  }
}
