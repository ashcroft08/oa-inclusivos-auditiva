/**
 * @fileoverview Servicio de Cursos
 * Encapsula la lógica de negocio para operaciones de OAs en cursos
 */

import { OACurso, OA, OAStatus, OA_STATUS } from '../models/index.js';
import { sequelize } from '../database/index.js';

/**
 * Servicio para gestión de OAs en cursos
 */
class CourseService {
    /**
     * Agrega un OA a un curso
     * @param {number} courseId - ID del curso
     * @param {number} oaId - ID del OA
     * @param {number} statusId - ID del estado (por defecto inactivo)
     * @returns {Promise<Object>} Resultado de la operación
     */
    async addOAToCourse(courseId, oaId, statusId = OA_STATUS.INACTIVO) {
        const existing = await OACurso.findOne({
            where: { course_id: courseId, oa_id: oaId }
        });

        if (existing) {
            return { success: false, error: 'OA ya está en el curso' };
        }

        await OACurso.create({
            course_id: courseId,
            oa_id: oaId,
            status_id: statusId
        });

        return {
            success: true,
            oa_id: oaId,
            status_id: statusId,
            message: 'OA agregado al curso'
        };
    }

    /**
     * Actualiza el estado de un OA en un curso
     * @param {number} courseId - ID del curso
     * @param {number} oaId - ID del OA
     * @param {number} statusId - Nuevo estado (1=Inactivo, 2=Activo)
     * @returns {Promise<Object>} Resultado de la operación
     */
    async updateOAStatus(courseId, oaId, statusId) {
        let oaCurso = await OACurso.findOne({
            where: { course_id: courseId, oa_id: oaId }
        });

        if (!oaCurso) {
            oaCurso = await OACurso.create({
                course_id: courseId,
                oa_id: oaId,
                status_id: statusId
            });
        } else {
            oaCurso.status_id = statusId;
            await oaCurso.save();
        }

        return { success: true, oa_id: oaId, status_id: statusId };
    }

    /**
     * Obtiene el número de estudiantes inscritos en un curso
     * @param {number} courseId - ID del curso
     * @returns {Promise<number>} Número de estudiantes
     */
    async getEnrolledStudentsCount(courseId) {
        const [result] = await sequelize.query(`
            SELECT COUNT(DISTINCT u.id) AS total_estudiantes
            FROM mdl_user u
            JOIN mdl_user_enrolments ue ON ue.userid = u.id
            JOIN mdl_enrol e ON e.id = ue.enrolid
            JOIN mdl_role_assignments ra ON ra.userid = u.id
            JOIN mdl_context ctx ON ctx.id = ra.contextid AND ctx.instanceid = e.courseid
            JOIN mdl_role r ON r.id = ra.roleid
            WHERE e.courseid = :courseId
            AND r.shortname = 'student'
        `, {
            replacements: { courseId },
            type: sequelize.QueryTypes.SELECT
        });

        return result?.total_estudiantes || 0;
    }

    /**
     * Obtiene la lista de estudiantes de un curso
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de estudiantes
     */
    async getEnrolledStudents(courseId) {
        const estudiantes = await sequelize.query(`
            SELECT DISTINCT u.id, u.firstname, u.lastname
            FROM mdl_user u
            JOIN mdl_user_enrolments ue ON ue.userid = u.id
            JOIN mdl_enrol e ON e.id = ue.enrolid
            JOIN mdl_role_assignments ra ON ra.userid = u.id
            JOIN mdl_context ctx ON ctx.id = ra.contextid AND ctx.instanceid = e.courseid
            JOIN mdl_role r ON r.id = ra.roleid
            WHERE e.courseid = :courseId
            AND r.shortname = 'student'
        `, {
            replacements: { courseId },
            type: sequelize.QueryTypes.SELECT
        });

        return estudiantes || [];
    }

    /**
     * Obtiene los OAs activos de un curso con sus nombres (usando SQL directo)
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de OAs activos con nombres
     */
    async getActiveOAsWithNames(courseId) {
        return await sequelize.query(`
            SELECT oc.oa_id, oc.course_id, oc.status_id, o.oa_name
            FROM mdl_oa_curso oc
            JOIN mdl_oa o ON o.id = oc.oa_id
            WHERE oc.course_id = :courseId AND oc.status_id = :activeStatus
            ORDER BY oc.oa_id ASC
        `, {
            replacements: { courseId, activeStatus: OA_STATUS.ACTIVO },
            type: sequelize.QueryTypes.SELECT
        });
    }

    /**
     * Elimina un OA de un curso
     * @param {number} courseId - ID del curso
     * @param {number} oaId - ID del OA
     * @returns {Promise<boolean>} true si se eliminó
     */
    async removeOAFromCourse(courseId, oaId) {
        const result = await OACurso.destroy({
            where: { course_id: courseId, oa_id: oaId }
        });
        return result > 0;
    }
}

export default new CourseService();
