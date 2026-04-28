/**
 * @fileoverview Configuración de la API
 */

export const API_CONFIG = {
    BASE_URL: 'http://localhost:4000',
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
