/**
 * @fileoverview Índice de rutas
 * Registra todas las rutas de la API
 */

import { Router } from 'express';
import oaRoutes from './oa.routes.js';
import courseRoutes from './course.routes.js';
import progressRoutes from './progress.routes.js';
import ltiRoutes from './lti.routes.js';
import healthRoutes from './health.routes.js';

import {
    requireAuth,
    getLTIData,
    logLTIAccess,
    logAuthenticatedAccess
} from '../middleware/index.js';

const router = Router();

/**
 * Registra todas las rutas de la aplicación
 * @param {Express} app - Aplicación Express
 */
export const registerRoutes = (app) => {
    // Rutas públicas (sin autenticación)
    app.use('/', healthRoutes);
    app.use('/', ltiRoutes);

    // Middleware de logging para API
    app.use('/api', logAuthenticatedAccess);

    // Rutas de API protegidas
    app.use('/api/oa', requireAuth, getLTIData, logLTIAccess, oaRoutes);
    app.use('/api/course', requireAuth, getLTIData, logLTIAccess, courseRoutes);
    app.use('/api/progress', requireAuth, getLTIData, logLTIAccess, progressRoutes);
};

export default {
    registerRoutes,
    oaRoutes,
    courseRoutes,
    progressRoutes,
    ltiRoutes,
    healthRoutes
};
