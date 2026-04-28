/**
 * @fileoverview Servicio de Progreso
 * Encapsula la lógica de negocio para operaciones de progreso de usuarios
 */

import { OAUserProgress, OA, OA_STATUS, COMPLETION_STATUS } from '../models/index.js';
import CourseService from './Course.service.js';

/**
 * Servicio para gestión de progreso de usuarios
 */
class ProgressService {
    /**
     * Obtiene el progreso de un usuario en un OA específico
     * @param {number} userId - ID del usuario
     * @param {number} oaId - ID del OA
     * @returns {Promise<Object|null>} Progreso encontrado o null
     */
    async getUserProgress(userId, oaId) {
        return await OAUserProgress.findOne({
            where: { user_id: userId, oa_id: oaId }
        });
    }

    /**
     * Actualiza o crea el progreso de un usuario
     * @param {number} userId - ID del usuario
     * @param {number} oaId - ID del OA
     * @param {Object} data - Datos de progreso
     * @returns {Promise<Object>} Resultado con el progreso actualizado
     */
    async updateProgress(userId, oaId, data) {
        // Si progress es -1, significa que el frontend solo quiere actualizar custom_data
        // sin modificar el porcentaje de progreso real
        let progressValue = data.progress ?? 0;
        let statusValue = data.completion_status ?? COMPLETION_STATUS.IN_PROGRESS;

        if (progressValue === -1) {
            // Buscar el registro existente para preservar su progreso
            const existing = await OAUserProgress.findOne({
                where: { user_id: userId, oa_id: oaId }
            });
            if (existing) {
                progressValue = existing.progress;
                statusValue = existing.completion_status;
            } else {
                progressValue = 0;
            }
        }

        const [progress, created] = await OAUserProgress.upsert({
            user_id: userId,
            oa_id: oaId,
            completion_status: statusValue,
            progress: progressValue,
            last_updated: Math.floor(Date.now() / 1000),
            custom_data: data.custom_data
        }, {
            returning: true
        });

        return { progress, created };
    }

    /**
     * Obtiene todo el progreso de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} Lista de progresos con detalles del OA
     */
    async getUserAllProgress(userId) {
        const progress = await OAUserProgress.findAll({
            where: { user_id: userId },
            include: [{
                model: OA,
                as: 'oa',
                attributes: ['oa_name', 'description']
            }]
        });

        return progress.map(p => p.toJSON());
    }

    /**
     * Obtiene el progreso de todos los estudiantes de un curso
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de estudiantes con su progreso por módulo
     */
    async getCourseStudentsProgress(courseId) {
        // Obtener estudiantes del curso
        const estudiantes = await CourseService.getEnrolledStudents(courseId);

        if (!estudiantes || estudiantes.length === 0) {
            return [];
        }

        // Obtener OAs activos del curso
        const oasActivos = await CourseService.getActiveOAsWithNames(courseId);

        if (!oasActivos || oasActivos.length === 0) {
            return estudiantes.map(est => ({
                nombre: `${est.firstname} ${est.lastname}`,
                modulos: []
            }));
        }

        // Obtener progreso de todos los estudiantes
        const oaIds = oasActivos.map(oc => oc.oa_id);
        const userIds = estudiantes.map(e => e.id);

        const progresos = await OAUserProgress.findAll({
            where: {
                user_id: userIds,
                oa_id: oaIds
            }
        });

        // Crear mapa de nombres de OA
        const oaIdToName = {};
        oasActivos.forEach(oc => {
            oaIdToName[oc.oa_id] = oc.oa_name || `OA ${oc.oa_id}`;
        });

        // Armar respuesta
        return estudiantes.map(est => ({
            nombre: `${est.firstname} ${est.lastname}`,
            modulos: oaIds.map(oaId => {
                const prog = progresos.find(
                    p => p.user_id === est.id && p.oa_id === oaId
                );
                return {
                    nombre: oaIdToName[oaId],
                    progreso: prog ? prog.progress : 0
                };
            })
        }));
    }

    /**
     * Obtiene estadísticas generales de progreso
     * @returns {Promise<Object>} Estadísticas de progreso
     */
    async getGeneralStats() {
        const allProgress = await OAUserProgress.findAll({
            include: [{
                model: OA,
                as: 'oa',
                attributes: ['oa_name']
            }]
        });

        const totalActivities = allProgress.length;
        const completedActivities = allProgress.filter(
            p => p.completion_status >= COMPLETION_STATUS.COMPLETED
        ).length;
        const averageProgress = totalActivities > 0
            ? allProgress.reduce((acc, p) => acc + p.progress, 0) / totalActivities
            : 0;

        return {
            total_activities: totalActivities,
            completed_activities: completedActivities,
            average_progress: averageProgress
        };
    }
}

export default new ProgressService();
