/**
 * @fileoverview Modelo OACurso
 * Representa la relación entre un OA y un curso de Moodle
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../database/index.js';

/**
 * Modelo de relación OA-Curso
 * @typedef {Object} OACurso
 * @property {number} id - ID único de la relación
 * @property {number} course_id - ID del curso en Moodle
 * @property {number} oa_id - ID del objeto de aprendizaje
 * @property {number} status_id - ID del estado (1=Inactivo, 2=Activo)
 */
export const OACurso = sequelize.define('mdl_oa_curso', {
    id: {
        type: DataTypes.BIGINT(10),
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único de la relación'
    },
    course_id: {
        type: DataTypes.BIGINT(10),
        allowNull: false,
        comment: 'ID del curso en Moodle'
    },
    oa_id: {
        type: DataTypes.BIGINT(10),
        allowNull: false,
        comment: 'ID del objeto de aprendizaje'
    },
    status_id: {
        type: DataTypes.TINYINT(2),
        defaultValue: 2, // Activo por defecto
        comment: 'Estado del OA en el curso (1=Inactivo, 2=Activo)'
    }
}, {
    timestamps: false,
    tableName: 'mdl_oa_curso',
    indexes: [
        {
            name: 'mdl_oa_curso_uniq',
            unique: true,
            fields: ['course_id', 'oa_id']
        },
        {
            name: 'idx_oa_curso_course',
            fields: ['course_id']
        },
        {
            name: 'idx_oa_curso_oa',
            fields: ['oa_id']
        },
        {
            name: 'idx_oa_curso_status',
            fields: ['status_id']
        }
    ]
});

export default OACurso;
