/**
 * @fileoverview Configuración centralizada de la aplicación
 * Lee todas las variables de entorno y las exporta de forma estructurada
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Configuración del servidor
 */
export const serverConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 4000,
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production'
};

/**
 * Configuración de base de datos
 */
export const databaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME || 'moodle',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true'
};

/**
 * Configuración LTI 1.0/1.1
 */
export const ltiConfig = {
    consumerKey: process.env.LTI_CONSUMER_KEY || 'moodle-oa-dev',
    sharedSecret: process.env.LTI_SHARED_SECRET || '',
    launchUrl: process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch'
};

/**
 * Configuración de sesiones
 */
export const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000, // 24 horas
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiado a false temporalmente para desarrollo por IP local HTTP
        sameSite: 'lax',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000
    }

};

/**
 * Configuración CORS
 */
export const corsConfig = {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    origins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
};

/**
 * Configuración completa exportada como objeto único
 */
const config = {
    server: serverConfig,
    database: databaseConfig,
    lti: ltiConfig,
    session: sessionConfig,
    cors: corsConfig
};

export default config;
