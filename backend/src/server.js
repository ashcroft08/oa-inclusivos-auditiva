/**
 * @fileoverview Punto de entrada de la aplicación
 * Inicializa la base de datos e inicia el servidor
 */

import { createApp } from './app.js';
import { serverConfig } from './config/index.js';
import { syncDatabase, testConnection } from './database/index.js';
import './models/index.js'; // Importar modelos para registrar relaciones

/**
 * Inicia el servidor
 */
const startServer = async () => {
    try {
        // Probar conexión a base de datos
        await testConnection();

        // Sincronizar modelos con la base de datos
        await syncDatabase({ alter: true });

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
