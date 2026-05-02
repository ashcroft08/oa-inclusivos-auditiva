/**
 * @fileoverview Seeder para insertar los Objetos de Aprendizaje iniciales
 * Los IDs deben coincidir con MODULE_TO_OA_MAP en el frontend
 */

/**
 * Ejecuta el seeder (inserta datos)
 * @param {import('sequelize').QueryInterface} queryInterface
 */
export const up = async (queryInterface) => {
    const now = Math.floor(Date.now() / 1000);

    await queryInterface.bulkInsert('mdl_oa', [
        {
            id: 1,
            oa_name: 'Ciclo de Vida',
            description: 'Objeto de aprendizaje sobre el ciclo de vida de los seres vivos, los cinco sentidos y las etapas del desarrollo.',
            created_at: now,
            updated_at: now
        },
        {
            id: 2,
            oa_name: 'Reino Animal',
            description: 'Objeto de aprendizaje sobre clasificación de animales: vertebrados, invertebrados, alimentación y reproducción.',
            created_at: now,
            updated_at: now
        },
        {
            id: 3,
            oa_name: 'Las Plantas',
            description: 'Objeto de aprendizaje sobre las partes de las plantas, tipos de tallos, necesidades y ciclo de vida vegetal.',
            created_at: now,
            updated_at: now
        },
        {
            id: 4,
            oa_name: 'Ecosistemas',
            description: 'Objeto de aprendizaje sobre ecosistemas, factores bióticos y abióticos, cadenas alimentarias, sistema solar y estaciones.',
            created_at: now,
            updated_at: now
        }
    ], {});
};

/**
 * Revierte el seeder (elimina datos)
 * @param {import('sequelize').QueryInterface} queryInterface
 */
export const down = async (queryInterface) => {
    await queryInterface.bulkDelete('mdl_oa', null, {});
};

export default { up, down };
