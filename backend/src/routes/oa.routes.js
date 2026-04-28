/**
 * @fileoverview Rutas de Objetos de Aprendizaje
 * Endpoints para gestión de OAs
 */

import { Router } from 'express';
import { OAController } from '../controllers/index.js';
import { requireLTISession, getLTIData, logLTIAccess } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/oa
 * Obtiene OAs activos para el curso del usuario
 */
router.get('/', OAController.getActiveOAs);

/**
 * GET /api/oa/me
 * Obtiene información del usuario actual
 */
router.get('/me', requireLTISession, OAController.getCurrentUser);

/**
 * GET /api/oa/:oaId
 * Obtiene detalles de un OA específico
 */
router.get('/:oaId', OAController.getOAById);

export default router;
