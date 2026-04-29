/**
 * @fileoverview Servicio LTI 1.0/1.1
 * Encapsula la lógica de validación y procesamiento de requests LTI
 */

import crypto from 'crypto';
import querystring from 'querystring';
import { ltiConfig, corsConfig } from '../config/index.js';

/**
 * Servicio para operaciones LTI
 */
class LTIService {
    constructor() {
        this.consumerKey = ltiConfig.consumerKey;
        this.sharedSecret = ltiConfig.sharedSecret;
        this.launchUrl = ltiConfig.launchUrl;
    }

    /**
     * Codifica strings según el estándar RFC 3986 para OAuth 1.0a
     */
    rfc3986(str) {
        return encodeURIComponent(str)
            .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    }

    /**
     * Genera firma OAuth 1.0 para validación
     * @param {string} method - Método HTTP
     * @param {string} url - URL del endpoint
     * @param {Object} params - Parámetros del request
     * @param {string} consumerSecret - Secret del consumidor
     * @param {string} tokenSecret - Secret del token (opcional)
     * @returns {string} Firma generada en Base64
     */
    generateSignature(method, url, params, consumerSecret, tokenSecret = '') {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${this.rfc3986(key)}=${this.rfc3986(params[key])}`)
            .join('&');

        const baseString = `${method.toUpperCase()}&${this.rfc3986(url)}&${this.rfc3986(sortedParams)}`;
        const signingKey = `${this.rfc3986(consumerSecret)}&${this.rfc3986(tokenSecret)}`;

        return crypto
            .createHmac('sha1', signingKey)
            .update(baseString)
            .digest('base64');
    }


    /**
     * Valida un request LTI
     * @param {Object} body - Body del request
     * @throws {Error} Si la validación falla
     * @returns {boolean} true si es válido
     */
    validateRequest(body) {
        const requiredParams = [
            'lti_message_type',
            'lti_version',
            'resource_link_id',
            'oauth_consumer_key',
            'oauth_signature_method',
            'oauth_timestamp',
            'oauth_nonce',
            'oauth_version',
            'oauth_signature'
        ];

        // Verificar parámetros requeridos
        for (const param of requiredParams) {
            if (!body[param]) {
                throw new Error(`Missing required parameter: ${param}`);
            }
        }

        // Verificar consumer key
        if (body.oauth_consumer_key !== this.consumerKey) {
            throw new Error('Invalid consumer key');
        }

        // Verificar versión LTI
        if (!['LTI-1p0', 'LTI-1p1'].includes(body.lti_version)) {
            throw new Error('Unsupported LTI version');
        }

        // Verificar message type
        if (body.lti_message_type !== 'basic-lti-launch-request') {
            throw new Error('Invalid message type');
        }

        // Verificar timestamp (no más de 5 minutos de diferencia)
        const now = Math.floor(Date.now() / 1000);
        const timestamp = parseInt(body.oauth_timestamp);
        if (Math.abs(now - timestamp) > 300) {
            throw new Error('Request timestamp too old');
        }

        // Verificar firma
        const params = { ...body };
        delete params.oauth_signature;

        const expectedSignature = this.generateSignature(
            'POST',
            this.launchUrl,
            params,
            this.sharedSecret
        );

        console.log('🔑 VALIDACIÓN DE FIRMA LTI:');
        console.log('   -> URL Configurada en Servidor:', this.launchUrl);
        console.log('   -> Firma que envió Moodle: ', body.oauth_signature);
        console.log('   -> Firma calculada aquí:    ', expectedSignature);

        if (body.oauth_signature !== expectedSignature) {
            console.error('❌ Firma LTI inválida.');
            throw new Error('Invalid signature');
        }


        return true;
    }

    /**
     * Extrae datos del usuario y contexto desde el body LTI
     * @param {Object} body - Body del request LTI
     * @returns {Object} Datos estructurados del LTI
     */
    extractLTIData(body) {
        const rawRoles = body.roles ? body.roles.split(',') : [];

        return {
            user: {
                id: body.user_id || 'anonymous',
                name: body.lis_person_name_full || 'Usuario desconocido',
                email: body.lis_person_contact_email_primary || ''
            },
            context: {
                id: body.context_id,
                title: body.context_title,
                label: body.context_label
            },
            roles: {
                names: rawRoles.map(role =>
                    role.includes('Administrator') ? 'Administrador' : role
                ),
                codes: rawRoles
            }
        };
    }

    /**
     * Genera URL de redirección al frontend con datos LTI
     * @param {Object} ltiData - Datos LTI extraídos
     * @param {string} sessionId - ID de sesión
     * @returns {string} URL de redirección
     */
    generateRedirectUrl(ltiData, sessionId) {
        const params = querystring.stringify({
            course_id: ltiData.context.id,
            course_title: ltiData.context.title,
            user_id: ltiData.user.id,
            user_name: ltiData.user.name,
            roles: ltiData.roles.names.join(','),
            session_id: sessionId
        });

        return `${corsConfig.frontendUrl}/oa?${params}`;
    }

    /**
     * Verifica si el usuario es profesor
     * @param {Object} ltiData - Datos LTI
     * @returns {boolean}
     */
    isTeacher(ltiData) {
        if (!ltiData) return false;

        const teacherRoles = ['Instructor', 'Teacher', 'Administrator', 'Profesor', 'Administrador'];
        return ltiData.roles.names.some(role =>
            teacherRoles.some(teacherRole =>
                role.includes(teacherRole) || role === teacherRole
            )
        );
    }

    /**
     * Verifica si el usuario es estudiante
     * @param {Object} ltiData - Datos LTI
     * @returns {boolean}
     */
    isStudent(ltiData) {
        if (!ltiData) return false;

        const studentRoles = ['Learner', 'Student', 'Estudiante'];
        return ltiData.roles.names.some(role =>
            studentRoles.some(studentRole =>
                role.includes(studentRole) || role === studentRole
            )
        );
    }

    /**
     * Obtiene información del usuario actual
     * @param {Object} ltiData - Datos LTI de la sesión
     * @returns {Object|null} Información del usuario
     */
    getCurrentUser(ltiData) {
        if (!ltiData) return null;
        return {
            id: ltiData.user.id,
            name: ltiData.user.name,
            email: ltiData.user.email,
            roles: ltiData.roles.names
        };
    }

    /**
     * Obtiene información del contexto actual
     * @param {Object} ltiData - Datos LTI de la sesión
     * @returns {Object|null} Información del contexto
     */
    getCurrentContext(ltiData) {
        if (!ltiData) return null;
        return {
            id: ltiData.context.id,
            title: ltiData.context.title,
            label: ltiData.context.label
        };
    }
}

export default new LTIService();
