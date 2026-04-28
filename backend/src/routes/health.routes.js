/**
 * @fileoverview Rutas de Health Check
 * Endpoints para monitoreo y debugging del sistema
 */

import { Router } from 'express';
import { HealthController } from '../controllers/index.js';
import { getLTIData } from '../middleware/index.js';

const router = Router();

/**
 * GET /health
 * Estado general del servidor
 */
router.get('/health', HealthController.getHealth);

/**
 * GET /test-db
 * Prueba conexión a base de datos
 */
router.get('/test-db', HealthController.testDatabase);

/**
 * GET /api/debug
 * Información de debug del sistema
 */
router.get('/api/debug', getLTIData, HealthController.getDebugInfo);

/**
 * GET /api/debug-oa/:courseId
 * Debug específico de OAs de un curso
 */
router.get('/api/debug-oa/:courseId', HealthController.debugCourseOAs);

export default router;
