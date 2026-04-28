/**
 * @fileoverview Rutas LTI
 * Endpoints para integración LTI con Moodle
 */

import { Router } from 'express';
import { LTIController } from '../controllers/index.js';
import { requireAuth, getLTIData } from '../middleware/index.js';

const router = Router();

/**
 * POST /lti-launch
 * Maneja el launch LTI desde Moodle
 */
router.post('/lti-launch', LTIController.handleLaunch);

/**
 * GET /lti-launch
 * Página informativa de configuración LTI
 */
router.get('/lti-launch', LTIController.showLaunchInfo);

/**
 * GET /api/lti-data
 * Obtiene datos LTI de la sesión actual
 */
router.get('/api/lti-data', getLTIData, LTIController.getLTIData);

/**
 * POST /api/lti-logout
 * Cierra la sesión LTI
 */
router.post('/api/lti-logout', requireAuth, LTIController.logout);

export default router;
