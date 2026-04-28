/**
 * @fileoverview Configuración de Express
 * Configura middlewares, CORS, sesiones y rutas
 */

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';

import { corsConfig, sessionConfig, serverConfig } from './config/index.js';
import { registerRoutes } from './routes/index.js';
import {
    notFoundHandler,
    errorHandler,
    sequelizeErrorHandler
} from './middleware/index.js';

/**
 * Crea y configura la aplicación Express
 * @returns {Express} Aplicación Express configurada
 */
export const createApp = () => {
    const app = express();

    // ============================================
    // MIDDLEWARES GLOBALES
    // ============================================

    // CORS
    app.use(cors({
        origin: corsConfig.origins,
        credentials: corsConfig.credentials
    }));

    // Logging de requests
    if (serverConfig.isDevelopment) {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

    // Parser de body
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Sesiones
    app.use(session({
        secret: sessionConfig.secret,
        resave: sessionConfig.resave,
        saveUninitialized: sessionConfig.saveUninitialized,
        cookie: sessionConfig.cookie
    }));

    // ============================================
    // RUTAS
    // ============================================

    registerRoutes(app);

    // ============================================
    // MANEJO DE ERRORES
    // ============================================

    // Ruta no encontrada
    app.use(notFoundHandler);

    // Errores de Sequelize
    app.use(sequelizeErrorHandler);

    // Error handler global
    app.use(errorHandler);

    return app;
};

export default createApp;
