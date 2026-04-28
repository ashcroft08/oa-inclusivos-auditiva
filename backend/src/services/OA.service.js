/**
 * @fileoverview Servicio de Objetos de Aprendizaje
 * Encapsula la lógica de negocio para operaciones con OAs
 */

import { OA, OACurso, OAStatus, OA_STATUS } from '../models/index.js';

/**
 * Servicio para gestión de Objetos de Aprendizaje
 */
class OAService {
    /**
     * Obtiene todos los OAs disponibles
     * @returns {Promise<Array>} Lista de OAs
     */
    async findAll() {
        return await OA.findAll({
            attributes: ['id', 'oa_name', 'description', 'created_at', 'updated_at']
        });
    }

    /**
     * Obtiene un OA por su ID
     * @param {number} id - ID del OA
     * @returns {Promise<Object|null>} OA encontrado o null
     */
    async findById(id) {
        return await OA.findByPk(id);
    }

    /**
     * Obtiene los OAs activos para un curso específico
     * @param {number} courseId - ID del curso en Moodle
     * @returns {Promise<Array>} Lista de OAs activos con detalles
     */
    async findActiveForCourse(courseId) {
        const oaCursos = await OACurso.findAll({
            where: {
                course_id: courseId,
                status_id: OA_STATUS.ACTIVO
            },
            raw: true
        });

        if (oaCursos.length === 0) {
            return [];
        }

        const oaIds = oaCursos.map(oc => oc.oa_id);
        const oaDetails = await OA.findAll({
            where: { id: oaIds },
            attributes: ['id', 'oa_name', 'description'],
            raw: true
        });

        return oaCursos.map(oc => {
            const oaDetail = oaDetails.find(oa => oa.id === oc.oa_id);
            return {
                id: oc.oa_id,
                oa_name: oaDetail?.oa_name || 'OA no encontrado',
                description: oaDetail?.description || '',
                status_id: oc.status_id
            };
        });
    }

    /**
     * Obtiene todos los OAs con su estado para un curso (para docentes)
     * @param {number} courseId - ID del curso
     * @returns {Promise<Array>} Lista de OAs con estado en el curso
     */
    async findAllWithCourseStatus(courseId) {
        const allOAs = await OA.findAll({
            attributes: ['id', 'oa_name', 'description']
        });

        const courseOAs = await OACurso.findAll({
            where: { course_id: courseId },
            raw: true
        });

        const statusList = await OAStatus.findAll({ raw: true });
        const statusMap = new Map(statusList.map(s => [s.id, s.status_name]));

        const courseOAMap = new Map();
        courseOAs.forEach(oc => {
            courseOAMap.set(oc.oa_id, {
                status_id: oc.status_id,
                status: statusMap.get(oc.status_id) || ''
            });
        });

        return allOAs.map(oa => {
            const courseData = courseOAMap.get(oa.id);
            if (courseData) {
                return {
                    id: oa.id,
                    oa_name: oa.oa_name,
                    description: oa.description,
                    status_id: courseData.status_id,
                    status: courseData.status,
                    is_in_course: true
                };
            }
            return {
                id: oa.id,
                oa_name: oa.oa_name,
                description: oa.description,
                status_id: null,
                status: 'No agregado',
                is_in_course: false
            };
        });
    }

    /**
     * Crea un nuevo OA
     * @param {Object} data - Datos del OA
     * @returns {Promise<Object>} OA creado
     */
    async create(data) {
        return await OA.create({
            oa_name: data.oa_name,
            description: data.description || '',
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000)
        });
    }

    /**
     * Actualiza un OA existente
     * @param {number} id - ID del OA
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object|null>} OA actualizado o null
     */
    async update(id, data) {
        const oa = await this.findById(id);
        if (!oa) return null;

        oa.oa_name = data.oa_name ?? oa.oa_name;
        oa.description = data.description ?? oa.description;
        oa.updated_at = Math.floor(Date.now() / 1000);

        await oa.save();
        return oa;
    }

    /**
     * Elimina un OA
     * @param {number} id - ID del OA
     * @returns {Promise<boolean>} true si se eliminó
     */
    async delete(id) {
        const oa = await this.findById(id);
        if (!oa) return false;

        await oa.destroy();
        return true;
    }
}

export default new OAService();
