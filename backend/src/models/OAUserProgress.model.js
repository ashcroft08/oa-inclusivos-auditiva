/**
 * @fileoverview Modelo OAUserProgress
 * Representa el progreso de un usuario en un objeto de aprendizaje
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../database/index.js';

/**
 * Estados de completitud
 * @constant
 * @type {Object}
 */
export const COMPLETION_STATUS = {
    NOT_ATTEMPTED: 0,   // No intentado
    INCOMPLETE: 1,      // Incompleto
    COMPLETED: 2,       // Completado
    PASSED: 3,          // Aprobado
    FAILED: 4,          // Reprobado
    IN_PROGRESS: 5      // En progreso
};

/**
 * Modelo de Progreso de Usuario en OA
 * @typedef {Object} OAUserProgress
 * @property {number} id - ID único del registro
 * @property {number} user_id - ID del usuario en Moodle
 * @property {number} oa_id - ID del objeto de aprendizaje
 * @property {number} completion_status - Estado de completitud
 * @property {number} progress - Porcentaje de progreso (0-100)
 * @property {number} last_updated - Timestamp de última actualización
 * @property {string} custom_data - Datos personalizados en JSON
 */
export const OAUserProgress = sequelize.define('mdl_oa_user_progress', {
    id: {
        type: DataTypes.BIGINT(10),
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único del registro de progreso'
    },
    user_id: {
        type: DataTypes.BIGINT(10),
        allowNull: false,
        references: {
            model: 'mdl_user',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario en Moodle'
    },
    oa_id: {
        type: DataTypes.BIGINT(10),
        allowNull: false,
        comment: 'ID del objeto de aprendizaje'
    },
    completion_status: {
        type: DataTypes.TINYINT(2),
        defaultValue: COMPLETION_STATUS.NOT_ATTEMPTED,
        comment: 'Estado de completitud (0=No intentado, 1=Incompleto, 2=Completado, etc.)'
    },
    progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'Porcentaje de progreso (0-100)'
    },
    last_updated: {
        type: DataTypes.BIGINT(10),
        defaultValue: 0,
        comment: 'Timestamp Unix de última actualización'
    },
    custom_data: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Datos personalizados en formato JSON'
    }
}, {
    timestamps: false,
    tableName: 'mdl_oa_user_progress',
    indexes: [
        {
            name: 'mdl_oa_user_progress_uniq',
            unique: true,
            fields: ['user_id', 'oa_id']
        },
        {
            name: 'idx_user_progress',
            fields: ['user_id']
        },
        {
            name: 'idx_oa_progress',
            fields: ['oa_id']
        },
        {
            name: 'idx_completion_status',
            fields: ['completion_status']
        }
    ]
});

export default OAUserProgress;
