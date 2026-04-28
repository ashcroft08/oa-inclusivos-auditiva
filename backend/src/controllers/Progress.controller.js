/**
 * @fileoverview Controlador de Progreso
 * Maneja los endpoints relacionados con el progreso de usuarios
 */

import { ProgressService, LTIService } from '../services/index.js';

/**
 * Controlador para operaciones de progreso
 */
class ProgressController {
    /**
     * GET /api/progress/:oaId
     * Obtiene el progreso de un usuario en un OA
     */
    async getUserProgress(req, res, next) {
        try {
            const { oaId } = req.params;
            const userId = req.ltiData.user.id;

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID required',
                    message: 'Se requiere ID de usuario en sesión'
                });
            }

            const progress = await ProgressService.getUserProgress(userId, oaId);

            res.json({
                data: {
                    progress: progress || {},
                    user_info: LTIService.getCurrentUser(req.ltiData)
                },
                lti_context: req.ltiData ? {
                    user: LTIService.getCurrentUser(req.ltiData),
                    context: LTIService.getCurrentContext(req.ltiData),
                    session_id: req.sessionID
                } : null
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/progress
     * Actualiza el progreso de un usuario
     */
    async updateProgress(req, res, next) {
        try {
            const userId = req.ltiData.user.id;

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID required',
                    message: 'Se requiere ID de usuario en sesión'
                });
            }

            if (!req.body.oa_id) {
                return res.status(400).json({
                    error: 'OA ID required',
                    message: 'Se requiere ID del objeto de aprendizaje'
                });
            }

            const result = await ProgressService.updateProgress(
                userId,
                req.body.oa_id,
                {
                    completion_status: req.body.completion_status,
                    progress: req.body.progress,
                    custom_data: req.body.custom_data
                }
            );

            res.json({
                data: {
                    progress: result.progress,
                    created: result.created,
                    lti_info: LTIService.getCurrentContext(req.ltiData)
                },
                lti_context: req.ltiData ? {
                    user: LTIService.getCurrentUser(req.ltiData),
                    context: LTIService.getCurrentContext(req.ltiData),
                    session_id: req.sessionID
                } : null
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/progress/my-progress
     * Obtiene todo el progreso del usuario actual
     */
    async getMyProgress(req, res, next) {
        try {
            const userId = req.ltiData.user.id;
            const progress = await ProgressService.getUserAllProgress(userId);

            res.json({
                data: {
                    user: LTIService.getCurrentUser(req.ltiData),
                    course: LTIService.getCurrentContext(req.ltiData),
                    progress
                },
                lti_context: {
                    user: LTIService.getCurrentUser(req.ltiData),
                    context: LTIService.getCurrentContext(req.ltiData),
                    session_id: req.sessionID
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/progress/course/:courseId/students
     * Obtiene el progreso de todos los estudiantes del curso
     */
    async getCourseStudentsProgress(req, res, next) {
        try {
            const { courseId } = req.params;
            const studentsProgress = await ProgressService.getCourseStudentsProgress(courseId);
            res.json(studentsProgress);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/progress/course-stats
     * Obtiene estadísticas generales del curso (solo profesores)
     */
    async getCourseStats(req, res, next) {
        try {
            const stats = await ProgressService.getGeneralStats();

            res.json({
                data: {
                    course: LTIService.getCurrentContext(req.ltiData),
                    teacher: LTIService.getCurrentUser(req.ltiData),
                    stats
                },
                lti_context: {
                    user: LTIService.getCurrentUser(req.ltiData),
                    context: LTIService.getCurrentContext(req.ltiData),
                    session_id: req.sessionID
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProgressController();
