/**
 * @fileoverview Controlador de Health Check
 * Maneja los endpoints de salud y debugging del sistema
 */

import { sequelize } from '../database/index.js';
import { OA, OAStatus, OACurso } from '../models/index.js';

/**
 * Controlador para operaciones de salud y debug
 */
class HealthController {
    /**
     * GET /health
     * Verifica el estado del servidor
     */
    async getHealth(req, res) {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            lti_version: 'LTI-1p0/1p1',
            endpoint: process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch',
            session_active: !!req.session?.ltiData
        });
    }

    /**
     * GET /test-db
     * Prueba la conexión a la base de datos
     */
    async testDatabase(req, res, next) {
        try {
            await sequelize.authenticate();
            res.json({
                database: 'Connected',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Database connection failed',
                details: error.message
            });
        }
    }

    /**
     * GET /api/debug
     * Obtiene información de debug del sistema
     */
    async getDebugInfo(req, res, next) {
        try {
            const courseId = req.ltiData?.context?.id;

            const allOAs = await OA.findAll();
            const allStatus = await OAStatus.findAll();
            const courseOAs = await OACurso.findAll({
                where: courseId ? { course_id: courseId } : {},
                include: [
                    { model: OA, as: 'oa', attributes: ['id', 'oa_name', 'description'] },
                    { model: OAStatus, as: 'status', attributes: ['id', 'status_name'] }
                ]
            });

            res.json({
                course_id: courseId,
                all_oa_count: allOAs.length,
                all_status_count: allStatus.length,
                course_oa_count: courseOAs.length,
                all_oa: allOAs.map(oa => ({ id: oa.id, name: oa.oa_name })),
                all_status: allStatus.map(s => ({ id: s.id, name: s.status_name })),
                course_oa: courseOAs.map(oc => ({
                    course_id: oc.course_id,
                    oa_id: oc.oa_id,
                    status_id: oc.status_id,
                    oa_name: oc.oa?.oa_name,
                    status_name: oc.status?.status_name
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/debug-oa/:courseId
     * Debug específico para OAs de un curso
     */
    async debugCourseOAs(req, res, next) {
        try {
            const { courseId } = req.params;

            const oasConInclude = await OACurso.findAll({
                where: { course_id: courseId, status_id: 2 },
                include: [{
                    model: OA,
                    as: 'oa',
                    attributes: ['id', 'oa_name'],
                    required: true
                }]
            });

            const oasSinInclude = await OACurso.findAll({
                where: { course_id: courseId, status_id: 2 }
            });

            const todosLosOAs = await OA.findAll();

            res.json({
                course_id: courseId,
                oas_con_include: oasConInclude.map(oc => ({
                    oa_id: oc.oa_id,
                    course_id: oc.course_id,
                    status_id: oc.status_id,
                    oa_object: oc.oa,
                    oa_name: oc.oa?.oa_name
                })),
                oas_sin_include: oasSinInclude.map(oc => ({
                    oa_id: oc.oa_id,
                    course_id: oc.course_id,
                    status_id: oc.status_id
                })),
                todos_los_oas: todosLosOAs.map(oa => ({
                    id: oa.id,
                    name: oa.oa_name
                }))
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new HealthController();
