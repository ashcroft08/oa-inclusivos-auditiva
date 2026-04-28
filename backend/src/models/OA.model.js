/**
 * @fileoverview Modelo OA (Objeto de Aprendizaje)
 * Representa un objeto de aprendizaje en el sistema
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../database/index.js';

/**
 * Modelo de Objeto de Aprendizaje
 * @typedef {Object} OA
 * @property {number} id - ID único del OA
 * @property {string} oa_name - Nombre del objeto de aprendizaje
 * @property {string} description - Descripción del OA
 * @property {number} created_at - Timestamp de creación (Unix)
 * @property {number} updated_at - Timestamp de última actualización (Unix)
 */
export const OA = sequelize.define('mdl_oa', {
    id: {
        type: DataTypes.BIGINT(10),
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único del objeto de aprendizaje'
    },
    oa_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre del objeto de aprendizaje'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del OA'
    },
    created_at: {
        type: DataTypes.BIGINT(10),
        defaultValue: 0,
        comment: 'Timestamp Unix de creación'
    },
    updated_at: {
        type: DataTypes.BIGINT(10),
        defaultValue: 0,
        comment: 'Timestamp Unix de última actualización'
    }
}, {
    timestamps: false,
    tableName: 'mdl_oa',
    indexes: [
        {
            name: 'idx_oa_name',
            fields: ['oa_name']
        }
    ]
});

export default OA;
