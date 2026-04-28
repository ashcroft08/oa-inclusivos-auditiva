/**
 * @fileoverview Controlador LTI
 * Maneja los endpoints relacionados con la integración LTI
 */

import { LTIService } from '../services/index.js';

/**
 * Controlador para operaciones LTI
 */
class LTIController {
    /**
     * POST /lti-launch
     * Maneja el launch LTI desde Moodle
     */
    async handleLaunch(req, res, next) {
        try {
            console.log('📝 LTI Launch recibido:', Object.keys(req.body));

            // Validar request
            LTIService.validateRequest(req.body);
            console.log('✅ Request LTI validado');

            // Extraer datos
            const ltiData = LTIService.extractLTIData(req.body);
            console.log('🆔 Curso id:', ltiData.context.id);
            console.log('🎓 Curso:', ltiData.context.title);
            console.log('🆔 Usuario id:', ltiData.user.id);
            console.log('👤 Usuario:', ltiData.user.name);
            console.log('🎭 Roles:', ltiData.roles.names.join(', '));

            // Guardar datos LTI en sesión
            req.session.ltiData = ltiData;

            req.session.save((err) => {
                if (err) {
                    console.error('❌ Error guardando sesión:', err);
                    return res.status(500).json({
                        error: 'Error al guardar sesión LTI',
                        message: err.message
                    });
                }

                console.log('✅ Datos LTI guardados en sesión:', req.sessionID);

                // Generar URL de redirección
                const redirectUrl = LTIService.generateRedirectUrl(
                    ltiData,
                    req.sessionID
                );

                console.log('🔄 Redirigiendo a:', redirectUrl);
                res.redirect(redirectUrl);
            });
        } catch (error) {
            console.error('❌ Error en LTI Launch:', error);
            res.status(400).json({
                error: 'LTI Launch failed',
                message: error.message
            });
        }
    }

    /**
     * GET /lti-launch
     * Página informativa para testing
     */
    async showLaunchInfo(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LTI Tool - Test</title>
                <meta charset="utf-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        background: #f5f5f5;
                    }
                    .info { 
                        background: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .config { 
                        background: #e8f5e8; 
                        padding: 15px; 
                        border-radius: 5px; 
                        margin: 15px 0;
                    }
                    code { 
                        background: #f0f0f0; 
                        padding: 2px 5px; 
                        border-radius: 3px; 
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <div class="info">
                    <h1>🎯 LTI Tool - Objetos de Aprendizaje</h1>
                    <p><strong>Estado:</strong> ✅ Activo</p>
                    <p><strong>Versión LTI:</strong> 1.0/1.1</p>
                    <p><strong>Endpoint:</strong> <code>${process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch'}</code></p>
                    
                    <h2>📝 Configuración en Moodle:</h2>
                    <div class="config">
                        <strong>Nombre de la herramienta:</strong> OA Inclusivos (Dev)<br>
                        <strong>URL de la herramienta:</strong> <code>${process.env.LTI_LAUNCH_URL || 'http://localhost:4000/lti-launch'}</code><br>
                        <strong>Clave de cliente:</strong> <code>${process.env.LTI_CONSUMER_KEY || 'moodle-oa-dev'}</code><br>
                        <strong>Secreto compartido:</strong> <code>••••••••</code><br>
                        <strong>Versión LTI:</strong> LTI 1.0/1.1<br>
                        <strong>Mostrar como:</strong> Herramienta preconfigurada
                    </div>
                    
                    <h2>⚙️ Configuración recomendada:</h2>
                    <ul>
                        <li>Activar "Aceptar calificaciones desde la herramienta"</li>
                        <li>Activar "Activar compartir nombre del launcher"</li>
                        <li>Activar "Activar compartir email del launcher"</li>
                        <li>Configurar "Configuración de privacidad" según necesidades</li>
                    </ul>
                    
                    <p><em>Este endpoint solo acepta requests POST con parámetros LTI válidos.</em></p>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * GET /api/lti-data
     * Obtiene los datos LTI de la sesión actual
     */
    async getLTIData(req, res) {
        if (!req.ltiData) {
            return res.status(404).json({
                error: 'No LTI session found',
                message: 'No hay sesión LTI activa'
            });
        }

        res.json({
            user: req.ltiData.user,
            context: req.ltiData.context,
            roles: req.ltiData.roles,
            session_id: req.sessionID
        });
    }

    /**
     * POST /api/lti-logout
     * Cierra la sesión LTI
     */
    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    error: 'Error al cerrar sesión',
                    message: err.message
                });
            }
            res.json({
                message: 'Sesión LTI cerrada exitosamente'
            });
        });
    }
}

export default new LTIController();
