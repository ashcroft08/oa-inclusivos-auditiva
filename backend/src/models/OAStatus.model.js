/**
 * @fileoverview Modelo OAStatus
 * Representa los estados posibles de un OA en un curso
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../database/index.js';

/**
 * Estados de OA
 * @constant
 * @type {Object}
 */
export const OA_STATUS = {
    INACTIVO: 1,
    ACTIVO: 2
};

/**
 * Modelo de Estado de OA
 * @typedef {Object} OAStatus
 * @property {number} id - ID del estado
 * @property {string} status_name - Nombre del estado
 */
export const OAStatus = sequelize.define('mdl_oa_status', {
    id: {
        type: DataTypes.TINYINT(2),
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID del estado'
    },
    status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre descriptivo del estado'
    }
}, {
    timestamps: false,
    tableName: 'mdl_oa_status'
});

export default OAStatus;
