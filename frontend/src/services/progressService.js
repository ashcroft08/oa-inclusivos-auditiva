/**
 * @fileoverview Servicio de Progreso
 * Maneja el seguimiento del progreso de usuarios
 */

import api from './api.js';
import { API_CONFIG } from '../config/api.js';

/**
 * Servicio para operaciones de progreso
 */
const progressService = {
    /**
     * Obtiene el progreso del usuario en un OA específico
     * @param {number} oaId - ID del OA
     * @returns {Promise<Object>} Datos de progreso
     */
    async getUserProgress(oaId) {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PROGRESS}/${oaId}`);
        return response.data;
    },

    /**
     * Actualiza el progreso de un usuario
     * @param {number} oaId - ID del OA
     * @param {Object} data - Datos de progreso
     * @param {number} data.completion_status - Estado de completitud
     * @param {number} data.progress - Porcentaje de progreso (0-100)
     * @returns {Promise<Object>} Resultado de la actualización
     */
    async updateProgress(oaId, data) {
        const response = await api.post(API_CONFIG.ENDPOINTS.PROGRESS, {
            oa_id: oaId,
            completion_status: data.completion_status,
            progress: data.progress,
            custom_data: data.custom_data
        });
        return response.data;
    },

    /**
     * Obtiene todo el progreso del usuario actual
     * @returns {Promise<Object>} Progreso completo del usuario
     */
    async getMyProgress() {
        const response = await api.get(API_CONFIG.ENDPOINTS.MY_PROGRESS);
        return response.data;
    },

    /**
     * Obtiene el progreso de todos los estudiantes del curso
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de estudiantes con progreso
     */
    async getCourseStudentsProgress(courseId) {
        return await api.get(`${API_CONFIG.ENDPOINTS.PROGRESS}/course/${courseId}/students`);
    },

    /**
     * Obtiene estadísticas generales del curso
     * @returns {Promise<Object>} Estadísticas
     */
    async getCourseStats() {
        const response = await api.get(API_CONFIG.ENDPOINTS.COURSE_STATS);
        return response.data;
    },

    /**
     * Marca una actividad como completada
     * @param {number} oaId - ID del OA
     * @param {string} activityId - ID de la actividad
     * @param {number} totalActivities - Total de actividades del OA
     * @param {number} completedCount - Número de actividades completadas
     */
    async markActivityCompleted(oaId, activityId, totalActivities, completedCount) {
        const progress = Math.round((completedCount / totalActivities) * 100);
        const isComplete = completedCount >= totalActivities;

        return await this.updateProgress(oaId, {
            completion_status: isComplete ? 2 : 5, // 2=Completado, 5=En progreso
            progress: progress,
            custom_data: JSON.stringify({
                last_activity: activityId,
                completed_count: completedCount,
                updated_at: Date.now()
            })
        });
    }
};

export default progressService;
