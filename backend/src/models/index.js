/**
 * @fileoverview Índice de modelos y definición de relaciones
 * Centraliza la exportación de todos los modelos y define sus relaciones
 */

import { OA } from './OA.model.js';
import { OAStatus, OA_STATUS } from './OAStatus.model.js';
import { OACurso } from './OACurso.model.js';
import { OAUserProgress, COMPLETION_STATUS } from './OAUserProgress.model.js';

// ============================================
// DEFINICIÓN DE RELACIONES
// ============================================

/**
 * Relación OA → OACurso (uno a muchos)
 * Un OA puede estar en múltiples cursos
 */
OA.hasMany(OACurso, {
    foreignKey: 'oa_id',
    as: 'cursos'
});
OACurso.belongsTo(OA, {
    foreignKey: 'oa_id',
    as: 'oa'
});

/**
 * Relación OAStatus → OACurso (uno a muchos)
 * Un estado puede aplicar a múltiples relaciones OA-Curso
 */
OAStatus.hasMany(OACurso, {
    foreignKey: 'status_id',
    as: 'oaCursos'
});
OACurso.belongsTo(OAStatus, {
    foreignKey: 'status_id',
    as: 'status'
});

/**
 * Relación OA → OAUserProgress (uno a muchos)
 * Un OA puede tener progreso de múltiples usuarios
 */
OA.hasMany(OAUserProgress, {
    foreignKey: 'oa_id',
    as: 'progreso'
});
OAUserProgress.belongsTo(OA, {
    foreignKey: 'oa_id',
    as: 'oa'
});

// ============================================
// EXPORTACIONES
// ============================================

export {
    OA,
    OAStatus,
    OACurso,
    OAUserProgress,
    OA_STATUS,
    COMPLETION_STATUS
};

export default {
    OA,
    OAStatus,
    OACurso,
    OAUserProgress,
    OA_STATUS,
    COMPLETION_STATUS
};
