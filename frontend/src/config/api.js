/**
 * @fileoverview Configuración de la API
 */

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://api-oa.ueesch.org',
    ENDPOINTS: {
        // LTI
        LTI_DATA: '/api/lti-data',
        LTI_LOGOUT: '/api/lti-logout',

        // OA
        OA: '/api/oa',
        OA_ME: '/api/oa/me',

        // Course
        COURSE: '/api/course',

        // Progress
        PROGRESS: '/api/progress',
        MY_PROGRESS: '/api/progress/my-progress',
        COURSE_STATS: '/api/progress/course-stats',

        // Health
        HEALTH: '/health',
        TEST_DB: '/test-db'
    }
};

export default API_CONFIG;
