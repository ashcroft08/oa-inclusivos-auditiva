/**
 * @fileoverview Servicio de Cursos
 * Maneja la gestión de OAs en cursos
 */

import api from './api.js';
import { API_CONFIG } from '../config/api.js';

/**
 * Servicio para operaciones de cursos
 */
const courseService = {
    /**
     * Obtiene los OAs activos para el estudiante actual
     * @returns {Promise<Array>} Lista de OAs activos
     */
    async getActiveOAs() {
        return await api.get(API_CONFIG.ENDPOINTS.OA);
    },

    /**
     * Obtiene todos los OAs con estado para un curso (docentes)
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de OAs con estado
     */
    async getCourseOAs(courseId) {
        return await api.get(`${API_CONFIG.ENDPOINTS.COURSE}/${courseId}/oas`);
    },

    /**
     * Agrega un OA a un curso
     * @param {number} courseId - ID del curso
     * @param {number} oaId - ID del OA
     * @param {number} statusId - Estado inicial (1=Inactivo, 2=Activo)
     * @returns {Promise<Object>} Resultado
     */
    async addOAToCourse(courseId, oaId, statusId = 1) {
        return await api.post(`${API_CONFIG.ENDPOINTS.COURSE}/${courseId}/oa/${oaId}`, {
            status_id: statusId
        });
    },

    /**
     * Actualiza el estado de un OA en un curso (activar/desactivar)
     * @param {number} courseId - ID del curso
     * @param {number} oaId - ID del OA
     * @param {number} statusId - Nuevo estado (1=Inactivo, 2=Activo)
     * @returns {Promise<Object>} Resultado
     */
    async updateOAStatus(courseId, oaId, statusId) {
        return await api.post(`${API_CONFIG.ENDPOINTS.COURSE}/${courseId}/oa/${oaId}/status`, {
            status_id: statusId
        });
    },

    /**
     * Obtiene el número de estudiantes del curso
     * @param {number} courseId - ID del curso
     * @returns {Promise<number>} Total de estudiantes
     */
    async getStudentsCount(courseId) {
        const result = await api.get(`${API_CONFIG.ENDPOINTS.COURSE}/${courseId}/students`);
        return result.total_estudiantes || 0;
    },

    /**
     * Obtiene detalles de un OA específico
     * @param {number} oaId - ID del OA
     * @returns {Promise<Object>} Detalles del OA
     */
    async getOADetails(oaId) {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.OA}/${oaId}`);
        return response.data;
    }
};

export default courseService;
