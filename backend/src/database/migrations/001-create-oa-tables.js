/**
 * @fileoverview Migración para crear tablas del sistema de Objetos de Aprendizaje
 * Crea las tablas: mdl_oa, mdl_oa_status, mdl_oa_curso, mdl_oa_user_progress
 */

/**
 * Ejecuta la migración (crea tablas)
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */
export const up = async (queryInterface, Sequelize) => {
    // Tabla de estados de OA
    await queryInterface.createTable('mdl_oa_status', {
        id: {
            type: Sequelize.TINYINT(2),
            primaryKey: true,
            autoIncrement: true
        },
        status_name: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        }
    });

    // Tabla de Objetos de Aprendizaje
    await queryInterface.createTable('mdl_oa', {
        id: {
            type: Sequelize.BIGINT(10),
            primaryKey: true,
            autoIncrement: true
        },
        oa_name: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        created_at: {
            type: Sequelize.BIGINT(10),
            defaultValue: 0
        },
        updated_at: {
            type: Sequelize.BIGINT(10),
            defaultValue: 0
        }
    });

    // Índice para búsqueda por nombre
    await queryInterface.addIndex('mdl_oa', ['oa_name'], {
        name: 'idx_oa_name'
    });

    // Tabla de relación OA-Curso
    await queryInterface.createTable('mdl_oa_curso', {
        id: {
            type: Sequelize.BIGINT(10),
            primaryKey: true,
            autoIncrement: true
        },
        course_id: {
            type: Sequelize.BIGINT(10),
            allowNull: false
        },
        oa_id: {
            type: Sequelize.BIGINT(10),
            allowNull: false,
            references: {
                model: 'mdl_oa',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        status_id: {
            type: Sequelize.TINYINT(2),
            defaultValue: 2,
            references: {
                model: 'mdl_oa_status',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        }
    });

    // Índices para mdl_oa_curso
    await queryInterface.addIndex('mdl_oa_curso', ['course_id', 'oa_id'], {
        name: 'mdl_oa_curso_uniq',
        unique: true
    });
    await queryInterface.addIndex('mdl_oa_curso', ['course_id'], {
        name: 'idx_oa_curso_course'
    });
    await queryInterface.addIndex('mdl_oa_curso', ['oa_id'], {
        name: 'idx_oa_curso_oa'
    });
    await queryInterface.addIndex('mdl_oa_curso', ['status_id'], {
        name: 'idx_oa_curso_status'
    });

    // Tabla de progreso de usuario
    await queryInterface.createTable('mdl_oa_user_progress', {
        id: {
            type: Sequelize.BIGINT(10),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.BIGINT(10),
            allowNull: false,
            references: {
                model: 'mdl_user',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        oa_id: {
            type: Sequelize.BIGINT(10),
            allowNull: false,
            references: {
                model: 'mdl_oa',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        completion_status: {
            type: Sequelize.TINYINT(2),
            defaultValue: 0
        },
        progress: {
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        last_updated: {
            type: Sequelize.BIGINT(10),
            defaultValue: 0
        },
        custom_data: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    });

    // Índices para mdl_oa_user_progress
    await queryInterface.addIndex('mdl_oa_user_progress', ['user_id', 'oa_id'], {
        name: 'mdl_oa_user_progress_uniq',
        unique: true
    });
    await queryInterface.addIndex('mdl_oa_user_progress', ['user_id'], {
        name: 'idx_user_progress'
    });
    await queryInterface.addIndex('mdl_oa_user_progress', ['oa_id'], {
        name: 'idx_oa_progress'
    });
    await queryInterface.addIndex('mdl_oa_user_progress', ['completion_status'], {
        name: 'idx_completion_status'
    });
};

/**
 * Revierte la migración (elimina tablas)
 * @param {import('sequelize').QueryInterface} queryInterface
 */
export const down = async (queryInterface) => {
    await queryInterface.dropTable('mdl_oa_user_progress');
    await queryInterface.dropTable('mdl_oa_curso');
    await queryInterface.dropTable('mdl_oa');
    await queryInterface.dropTable('mdl_oa_status');
};

export default { up, down };
