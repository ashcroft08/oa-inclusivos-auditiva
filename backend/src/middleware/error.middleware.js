/**
 * @fileoverview Middleware de manejo de errores
 * Proporciona manejo centralizado de errores para toda la aplicación
 */

import { serverConfig } from '../config/index.js';

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `La ruta ${req.method} ${req.path} no existe`,
        path: req.path,
        method: req.method
    });
};

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Determinar código de estado HTTP
    const statusCode = err.statusCode || err.status || 500;

    // Preparar respuesta de error
    const errorResponse = {
        error: err.name || 'Internal Server Error',
        message: err.message || 'Ha ocurrido un error interno'
    };

    // Agregar detalles adicionales en desarrollo
    if (serverConfig.isDevelopment) {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details;
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para errores de validación de Sequelize
 */
export const sequelizeErrorHandler = (err, req, res, next) => {
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Error de validación en los datos',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Conflict',
            message: 'El recurso ya existe',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Foreign Key Error',
            message: 'Referencia a un recurso inexistente'
        });
    }

    next(err);
};

/**
 * Wrapper para manejar errores async automáticamente
 * @param {Function} fn - Función async del controlador
 * @returns {Function} Función wrapped con manejo de errores
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default {
    notFoundHandler,
    errorHandler,
    sequelizeErrorHandler,
    asyncHandler
};
