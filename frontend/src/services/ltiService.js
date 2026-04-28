/**
 * @fileoverview Servicio de LTI
 * Maneja la autenticación y datos de sesión LTI
 */

import api from './api.js';
import { API_CONFIG } from '../config/api.js';

/**
 * Servicio para operaciones LTI
 */
const ltiService = {
    /**
     * Obtiene los datos LTI de la sesión actual
     * @returns {Promise<Object>} Datos de usuario, contexto y roles
     */
    async getLTIData() {
        try {
            return await api.get(API_CONFIG.ENDPOINTS.LTI_DATA);
        } catch (error) {
            if (error.status === 404) {
                return null; // No hay sesión LTI
            }
            throw error;
        }
    },

    /**
     * Obtiene información del usuario actual
     * @returns {Promise<Object>} Información completa del usuario
     */
    async getCurrentUser() {
        const response = await api.get(API_CONFIG.ENDPOINTS.OA_ME);
        return response.data;
    },

    /**
     * Cierra la sesión LTI
     */
    async logout() {
        return await api.post(API_CONFIG.ENDPOINTS.LTI_LOGOUT);
    },

    /**
     * Verifica si hay una sesión LTI activa
     * @returns {Promise<boolean>}
     */
    async isAuthenticated() {
        try {
            const data = await this.getLTIData();
            return data !== null;
        } catch {
            return false;
        }
    },

    /**
     * Parsea los parámetros LTI de la URL
     * @returns {Object|null} Parámetros LTI o null
     */
    parseLTIParams() {
        const params = new URLSearchParams(window.location.search);

        const courseId = params.get('course_id');
        const userId = params.get('user_id');

        if (!courseId || !userId) {
            return null;
        }

        return {
            course_id: courseId,
            course_title: params.get('course_title') || '',
            user_id: userId,
            user_name: params.get('user_name') || '',
            roles: params.get('roles')?.split(',') || [],
            session_id: params.get('session_id') || ''
        };
    },

    /**
     * Verifica si el usuario tiene rol de profesor
     * @param {string[]} roles - Lista de roles
     * @returns {boolean}
     */
    isTeacher(roles) {
        const teacherRoles = ['Instructor', 'Teacher', 'Administrator', 'Profesor', 'Administrador'];
        return roles.some(role =>
            teacherRoles.some(tr => role.includes(tr) || role === tr)
        );
    },

    /**
     * Verifica si el usuario tiene rol de estudiante
     * @param {string[]} roles - Lista de roles
     * @returns {boolean}
     */
    isStudent(roles) {
        const studentRoles = ['Learner', 'Student', 'Estudiante'];
        return roles.some(role =>
            studentRoles.some(sr => role.includes(sr) || role === sr)
        );
    }
};

export default ltiService;
