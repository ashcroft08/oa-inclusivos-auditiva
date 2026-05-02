/**
 * @fileoverview Vista de No Sesión
 * Se muestra cuando el usuario no ha iniciado sesión a través de Moodle
 */

import React from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const NoSessionView = () => {
    const handleRetry = () => {
        sessionStorage.removeItem('oa_manual_logout');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 text-center">
                
                {/* Icono con animación sutil */}
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-100 animate-pulse">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                </div>

                {/* Título Premium */}
                <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                    Sesión No Iniciada
                </h1>

                {/* Descripción */}
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                    Para acceder a los <span className="text-indigo-600 font-semibold">Objetos de Aprendizaje</span>, es indispensable iniciar sesión a través del Aula Virtual.
                </p>

                {/* Instrucciones Interactivas */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-200/60 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-5 bg-indigo-600 rounded-full block"></span>
                        ¿Cómo acceder?
                    </h3>
                    <ol className="text-slate-600 space-y-3 list-decimal list-inside">
                        <li>Ingresa a la plataforma <span className="font-medium text-slate-800">Moodle</span> de tu institución.</li>
                        <li>Busca el curso correspondiente.</li>
                        <li>Haz clic en la actividad <strong className="text-indigo-600">"Objetos de Aprendizaje Interactivos"</strong>.</li>
                        <li>La herramienta se cargará automáticamente en este espacio.</li>
                    </ol>
                </div>

                {/* Acciones con Hover Effects */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-indigo-200 active:scale-95"
                    >
                        <RefreshCw className="w-5 h-5 animate-spin-slow" />
                        Reintentar
                    </button>
                    
                    <a
                        href="https://ueesch.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
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
