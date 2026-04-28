/**
 * @fileoverview Controlador de Cursos
 * Maneja los endpoints relacionados con OAs en cursos
 */

import { OAService, CourseService, LTIService } from '../services/index.js';

/**
 * Controlador para operaciones de cursos
 */
class CourseController {
    /**
     * GET /api/course/:courseId/oas
     * Obtiene todos los OAs con su estado para un curso (docentes)
     */
    async getCourseOAs(req, res, next) {
        try {
            const { courseId } = req.params;
            const oas = await OAService.findAllWithCourseStatus(courseId);
            res.json(oas);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/course/:courseId/oa/:oaId
     * Agrega un OA a un curso
     */
    async addOAToCourse(req, res, next) {
        try {
            const { courseId, oaId } = req.params;
            const { status_id = 1 } = req.body;

            const result = await CourseService.addOAToCourse(
                courseId,
                oaId,
                status_id
            );

            if (!result.success) {
                return res.status(400).json({ error: result.error });
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/course/:courseId/oa/:oaId/status
     * Actualiza el estado de un OA en un curso
     */
    async updateOAStatus(req, res, next) {
        try {
            const { courseId, oaId } = req.params;
            const { status_id } = req.body;

            if (status_id === undefined) {
                return res.status(400).json({
                    error: 'status_id es requerido'
                });
            }

            const result = await CourseService.updateOAStatus(
                courseId,
                oaId,
                status_id
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/course/:courseId/students
     * Obtiene el número de estudiantes inscritos
     */
    async getStudentsCount(req, res, next) {
        try {
            const { courseId } = req.params;
            const total = await CourseService.getEnrolledStudentsCount(courseId);
            res.json({ total_estudiantes: total });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/course/:courseId/oa/:oaId
     * Elimina un OA de un curso
     */
    async removeOAFromCourse(req, res, next) {
        try {
            const { courseId, oaId } = req.params;
            const removed = await CourseService.removeOAFromCourse(courseId, oaId);

            if (!removed) {
                return res.status(404).json({
                    error: 'OA no encontrado en el curso'
                });
            }

            res.json({
                success: true,
                message: 'OA eliminado del curso'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new CourseController();
