/**
 * @fileoverview Rutas de Cursos
 * Endpoints para gestión de OAs en cursos
 */

import { Router } from 'express';
import { CourseController } from '../controllers/index.js';
import { requireTeacher } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/course/:courseId/oas
 * Obtiene todos los OAs con estado para un curso (docentes)
 */
router.get('/:courseId/oas', CourseController.getCourseOAs);

/**
 * POST /api/course/:courseId/oa/:oaId
 * Agrega un OA a un curso
 */
router.post('/:courseId/oa/:oaId', requireTeacher, CourseController.addOAToCourse);

/**
 * POST /api/course/:courseId/oa/:oaId/status
 * Actualiza el estado de un OA en un curso
 */
router.post('/:courseId/oa/:oaId/status', requireTeacher, CourseController.updateOAStatus);

/**
 * DELETE /api/course/:courseId/oa/:oaId
 * Elimina un OA de un curso
 */
router.delete('/:courseId/oa/:oaId', requireTeacher, CourseController.removeOAFromCourse);

/**
 * GET /api/course/:courseId/students
 * Obtiene el número de estudiantes del curso
 */
router.get('/:courseId/students', CourseController.getStudentsCount);

export default router;
