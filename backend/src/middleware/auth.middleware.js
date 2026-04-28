/**
 * @fileoverview Middleware de autenticación LTI
 * Verifica y gestiona la autenticación de usuarios via LTI
 */

/**
 * Requiere autenticación LTI
 * Si no hay sesión LTI, devuelve error 401
 */
export const requireAuth = (req, res, next) => {
    if (!req.session.ltiData) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Debe iniciar sesión a través de LTI para acceder a este recurso',
                redirect_url: process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch'
            });
        }
        return res.redirect(process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch');
    }
    next();
};

/**
 * Requiere roles específicos
 * @param {string[]} allowedRoles - Roles permitidos
 * @returns {Function} Middleware
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.ltiData) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Debe iniciar sesión a través de LTI'
            });
        }

        const userRoles = req.session.ltiData.roles.names;
        const hasRequiredRole = userRoles.some(role =>
            allowedRoles.some(allowedRole =>
                role.includes(allowedRole) || role === allowedRole
            )
        );

        if (!hasRequiredRole) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `Se requieren los roles: ${allowedRoles.join(', ')}`,
                user_roles: userRoles
            });
        }

        next();
    };
};

/**
 * Requiere rol de profesor
 */
export const requireTeacher = requireRole([
    'Instructor',
    'Teacher',
    'Administrator',
    'Profesor',
    'Administrador'
]);

/**
 * Requiere rol de estudiante
 */
export const requireStudent = requireRole([
    'Learner',
    'Student',
    'Estudiante'
]);

/**
 * Logging de acceso autenticado
 */
export const logAuthenticatedAccess = (req, res, next) => {
    if (req.session.ltiData) {
        console.log(`🔐 Auth Access - User: ${req.session.ltiData.user.name} (${req.session.ltiData.user.id}) - Path: ${req.path} - Method: ${req.method}`);
    } else {
        console.log(`🚫 Unauth Access - Path: ${req.path} - Method: ${req.method}`);
    }
    next();
};

export default {
    requireAuth,
    requireRole,
    requireTeacher,
    requireStudent,
    logAuthenticatedAccess
};
