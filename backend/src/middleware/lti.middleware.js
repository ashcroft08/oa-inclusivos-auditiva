/**
 * @fileoverview Middleware LTI
 * Gestiona los datos LTI en los requests
 */

/**
 * Requiere sesión LTI válida
 */
export const requireLTISession = (req, res, next) => {
    if (!req.session.ltiData) {
        return res.status(401).json({
            error: 'LTI session required',
            message: 'Debe iniciar sesión a través de LTI'
        });
    }
    next();
};

/**
 * Obtiene datos LTI (opcional - no falla si no hay sesión)
 * Agrega req.ltiData para uso en controladores
 */
export const getLTIData = (req, res, next) => {
    req.ltiData = req.session.ltiData || null;
    next();
};

/**
 * Logging de acceso LTI
 */
export const logLTIAccess = (req, res, next) => {
    if (req.ltiData) {
        console.log(`🔍 LTI Access - User: ${req.ltiData.user.name} (${req.ltiData.user.id}) - Course: ${req.ltiData.context.title} - Path: ${req.path}`);
    }
    next();
};

/**
 * Valida acceso a recursos del curso
 */
export const validateCourseAccess = (req, res, next) => {
    if (!req.ltiData) {
        return res.status(401).json({
            error: 'LTI session required',
            message: 'Se requiere sesión LTI'
        });
    }
    next();
};

export default {
    requireLTISession,
    getLTIData,
    logLTIAccess,
    validateCourseAccess
};
