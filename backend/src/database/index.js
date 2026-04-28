/**
 * @fileoverview Configuración y conexión de Sequelize
 * Utiliza la configuración centralizada del módulo config
 */

import Sequelize from 'sequelize';
import { databaseConfig, serverConfig } from '../config/index.js';

/**
 * Instancia de Sequelize configurada con las variables de entorno
 */
export const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
        host: databaseConfig.host,
        port: databaseConfig.port,
        dialect: databaseConfig.dialect,
        logging: databaseConfig.logging ? console.log : false,
        define: {
            timestamps: false,
            freezeTableName: true
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a base de datos:', error.message);
        throw error;
    }
};

/**
 * Sincroniza los modelos con la base de datos
 * @param {Object} options - Opciones de sincronización de Sequelize
 * @returns {Promise<void>}
 */
export const syncDatabase = async (options = { alter: true }) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Base de datos sincronizada');
    } catch (error) {
        console.error('❌ Error sincronizando base de datos:', error.message);
        throw error;
    }
};

export default sequelize;
