/**
 * @fileoverview Controlador de Objetos de Aprendizaje
 * Maneja los endpoints relacionados con OAs
 */

import { OAService, LTIService } from '../services/index.js';

/**
 * Controlador para operaciones de OA
 */
class OAController {
    /**
     * GET /api/oa
     * Obtiene OAs activos para el curso del usuario actual
     */
    async getActiveOAs(req, res, next) {
        try {
            const courseId = req.ltiData?.context?.id;

            if (!courseId) {
                return res.status(400).json({
                    error: 'No course id',
                    message: 'No se encontró el ID del curso en la sesión LTI'
                });
            }

            const oas = await OAService.findActiveForCourse(courseId);
            res.json(oas);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/oa/:oaId
     * Obtiene detalles de un OA específico
     */
    async getOAById(req, res, next) {
        try {
            const { oaId } = req.params;
            const courseId = req.ltiData?.context?.id;
            const isTeacher = LTIService.isTeacher(req.ltiData);

            const oa = await OAService.findById(oaId);

            if (!oa) {
                return res.status(404).json({ error: 'OA no encontrado' });
            }

            // Si no es profesor, verificar que el OA está activo en el curso
            if (!isTeacher) {
                const activeOAs = await OAService.findActiveForCourse(courseId);
                const isActive = activeOAs.some(a => a.id === parseInt(oaId));

                if (!isActive) {
                    return res.status(404).json({
                        error: 'OA no disponible en este curso'
                    });
                }
            }

            // Obtener progreso del usuario si está disponible
            let userProgress = null;
            if (req.ltiData?.user?.id) {
                const { ProgressService } = await import('../services/index.js');
                userProgress = await ProgressService.getUserProgress(
                    req.ltiData.user.id,
                    oaId
                );
            }

            res.json({
                data: {
                    oa: {
                        id: oa.id,
                        name: oa.oa_name,
                        description: oa.description
                    },
                    user_progress: userProgress,
                    course_id: courseId
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
     * GET /api/oa/me
     * Obtiene información del usuario actual
     */
    async getCurrentUser(req, res, next) {
        try {
            res.json({
                data: {
                    user: LTIService.getCurrentUser(req.ltiData),
                    course: LTIService.getCurrentContext(req.ltiData),
                    is_teacher: LTIService.isTeacher(req.ltiData),
                    session_id: req.sessionID
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

export default new OAController();
