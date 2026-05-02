/**
 * @fileoverview Punto de entrada de la aplicación
 * Inicializa la base de datos e inicia el servidor
 */

import { createApp } from './app.js';
import { serverConfig } from './config/index.js';
import { syncDatabase, testConnection, sequelize } from './database/index.js';
import './models/index.js'; // Importar modelos para registrar relaciones

// Seeders
import { up as seedOAStatus } from './database/seeders/001-seed-oa-status.js';
import { up as seedOA } from './database/seeders/002-seed-oa.js';

/**
 * Ejecuta los seeders si los datos no existen
 */
const runSeeders = async () => {
    const qi = sequelize.getQueryInterface();

    try {
        // Verificar si ya existen datos en mdl_oa_status
        const [statusRows] = await sequelize.query('SELECT COUNT(*) as count FROM mdl_oa_status');
        if (!statusRows[0]?.count || statusRows[0].count === 0) {
            console.log('🌱 Ejecutando seeder: OA Status...');
            await seedOAStatus(qi);
            console.log('✅ Seeder OA Status completado');
        }

        // Verificar si ya existen datos en mdl_oa
        const [oaRows] = await sequelize.query('SELECT COUNT(*) as count FROM mdl_oa');
        if (!oaRows[0]?.count || oaRows[0].count === 0) {
            console.log('🌱 Ejecutando seeder: OA...');
            await seedOA(qi);
            console.log('✅ Seeder OA completado');
        }
    } catch (error) {
        console.error('⚠️ Error ejecutando seeders:', error.message);
        // No detener el servidor por error en seeders
    }
};

/**
 * Inicia el servidor
 */
const startServer = async () => {
    try {
        // Probar conexión a base de datos
        await testConnection();

        // Sincronizar modelos con la base de datos
        await syncDatabase({ alter: true });

        // Ejecutar seeders (solo inserta si no existen datos)
        await runSeeders();

        // Crear aplicación Express
        const app = createApp();

        // Iniciar servidor
        app.listen(serverConfig.port, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`✅ Servidor LTI corriendo en http://localhost:${serverConfig.port}`);
            console.log(`🔗 LTI Endpoint: http://localhost:${serverConfig.port}/lti-launch`);
            console.log(`📊 Health Check: http://localhost:${serverConfig.port}/health`);
            console.log(`🧪 Test DB: http://localhost:${serverConfig.port}/test-db`);
            console.log('═══════════════════════════════════════════════════════════');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
};

// Iniciar
startServer();

