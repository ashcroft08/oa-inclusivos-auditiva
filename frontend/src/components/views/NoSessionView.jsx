/**
 * @fileoverview Vista de No Sesión
 * Se muestra cuando el usuario no ha iniciado sesión a través de Moodle
 */

import React from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const NoSessionView = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 text-center">
                
                {/* Icono */}
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-12 h-12 text-amber-600" />
                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Sesión No Iniciada
                </h1>

                {/* Descripción */}
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Para acceder a los Objetos de Aprendizaje, debes iniciar sesión a través de 
                    <strong className="text-indigo-600"> Moodle</strong>.
                </p>

                {/* Instrucciones */}
                <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-blue-900 mb-3">¿Cómo acceder?</h3>
                    <ol className="text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Ingresa a la plataforma Moodle de tu institución</li>
                        <li>Busca el curso correspondiente</li>
                        <li>Haz clic en la actividad <strong>"OA Inclusivos"</strong></li>
                        <li>La herramienta se abrirá automáticamente</li>
                    </ol>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Reintentar
                    </button>
                    
                    <a
                        href="http://localhost/moodle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-full font-semibold transition-all"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Ir a Moodle
                    </a>
                </div>

                {/* Información adicional */}
                <p className="mt-10 text-sm text-gray-600">
                    Si crees que esto es un error, contacta a tu administrador de Moodle.
                </p>
            </div>
        </div>
    );
};

export default NoSessionView;
