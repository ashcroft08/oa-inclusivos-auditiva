/**
 * @fileoverview Rutas de Progreso
 * Endpoints para gestión del progreso de usuarios
 */

import { Router } from 'express';
import { ProgressController } from '../controllers/index.js';
import { requireLTISession, requireTeacher } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/progress/my-progress
 * Obtiene el progreso del usuario actual
 */
router.get('/my-progress', requireLTISession, ProgressController.getMyProgress);

/**
 * GET /api/progress/course-stats
 * Obtiene estadísticas del curso (solo profesores)
 */
router.get('/course-stats', requireTeacher, ProgressController.getCourseStats);

/**
 * GET /api/progress/course/:courseId/students
 * Obtiene el progreso de todos los estudiantes del curso
 */
router.get('/course/:courseId/students', requireTeacher, ProgressController.getCourseStudentsProgress);

/**
 * GET /api/progress/:oaId
 * Obtiene el progreso de un usuario en un OA
 */
router.get('/:oaId', requireLTISession, ProgressController.getUserProgress);

/**
 * POST /api/progress
 * Actualiza el progreso de un usuario
 */
router.post('/', requireLTISession, ProgressController.updateProgress);

export default router;
