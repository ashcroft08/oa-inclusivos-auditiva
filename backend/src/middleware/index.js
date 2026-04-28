/**
 * @fileoverview Índice de middlewares
 * Centraliza la exportación de todos los middlewares
 */

import {
    requireAuth,
    requireRole,
    requireTeacher,
    requireStudent,
    logAuthenticatedAccess
} from './auth.middleware.js';

import {
    requireLTISession,
    getLTIData,
    logLTIAccess,
    validateCourseAccess
} from './lti.middleware.js';

import {
    notFoundHandler,
    errorHandler,
    sequelizeErrorHandler,
    asyncHandler
} from './error.middleware.js';

export {
    // Auth middleware
    requireAuth,
    requireRole,
    requireTeacher,
    requireStudent,
    logAuthenticatedAccess,

    // LTI middleware
    requireLTISession,
    getLTIData,
    logLTIAccess,
    validateCourseAccess,

    // Error middleware
    notFoundHandler,
    errorHandler,
    sequelizeErrorHandler,
    asyncHandler
};

export default {
    requireAuth,
    requireRole,
    requireTeacher,
    requireStudent,
    logAuthenticatedAccess,
    requireLTISession,
    getLTIData,
    logLTIAccess,
    validateCourseAccess,
    notFoundHandler,
    errorHandler,
    sequelizeErrorHandler,
    asyncHandler
};
