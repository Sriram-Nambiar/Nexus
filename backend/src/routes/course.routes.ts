import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { ResourceController } from '../controllers/resource.controller';

const router = Router();

router.get('/', CourseController.listCourses);
router.get('/:id', CourseController.getCourseById);
router.post('/', CourseController.createCourse);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

// Sub-resource endpoint: GET /api/courses/:id/resources
router.get('/:id/resources', ResourceController.listResourcesByCourse);

export default router;
