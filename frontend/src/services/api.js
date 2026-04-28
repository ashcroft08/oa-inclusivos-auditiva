/**
 * @fileoverview Cliente HTTP base para comunicación con backend
 */

import { API_CONFIG } from '../config/api.js';

/**
 * Cliente HTTP para peticiones al backend
 */
class ApiClient {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * Realiza una petición HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Respuesta JSON
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            credentials: 'include', // Importante para cookies de sesión
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.message || `HTTP ${response.status}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Error de conexión con el servidor', 0, error);
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

/**
 * Error personalizado para errores de API
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Exportar instancia única
export const api = new ApiClient();
export { ApiError };
export default api;
