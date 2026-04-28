/**
 * @fileoverview Seeder para insertar estados iniciales de OA
 * Estados: Inactivo (1), Activo (2)
 */

/**
 * Ejecuta el seeder (inserta datos)
 * @param {import('sequelize').QueryInterface} queryInterface
 */
export const up = async (queryInterface) => {
    await queryInterface.bulkInsert('mdl_oa_status', [
        { id: 1, status_name: 'Inactivo' },
        { id: 2, status_name: 'Activo' }
    ], {});
};

/**
 * Revierte el seeder (elimina datos)
 * @param {import('sequelize').QueryInterface} queryInterface
 */
export const down = async (queryInterface) => {
    await queryInterface.bulkDelete('mdl_oa_status', null, {});
};

export default { up, down };
