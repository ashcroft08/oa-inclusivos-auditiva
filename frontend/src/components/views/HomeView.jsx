import React from 'react';
import { modulesData } from "../../data/activitiesData";

/**
 * Vista Home - Muestra los módulos disponibles con progreso
 */
const HomeView = ({ onNavigate, visibleModules, completedActivities = new Set() }) => {

    // Importamos useProgress dentro de los parámetros o lo sacamos del contexto si fue inyectado.
    // Dado que HomeView recibe getCurrentResource desde App.jsx tras la próxima modificación, lo utilizamos:
    const handleModuleClick = (moduleId) => {
        const selectedModule = modulesData.find(m => m.id === moduleId);
        if (!selectedModule) return;

        // 1. PRIORIDAD DEL MARCADOR: Si existe un recurso guardado, ir directo a él
        if (typeof getCurrentResource === 'function') {
            const savedResource = getCurrentResource(moduleId);
            if (savedResource && selectedModule.activities.some(a => a.id === savedResource)) {
                console.log(`HomeView: Restaurando posición guardada prioritaria -> ${savedResource}`);
                onNavigate(savedResource, moduleId);
                return;
            }
        }

        // 2. Si no hay marcador, buscar la primera actividad no completada
        const activities = selectedModule.activities.filter(a => a.activity !== 'video');
        const firstUncompleted = activities.find(a => !completedActivities.has(a.id));
        
        // Si hay una no completada, ir a ella; si no, ir a la primera (video intro)
        const targetActivity = firstUncompleted || selectedModule.activities[0];
        
        if (targetActivity) {
            onNavigate(targetActivity.id, moduleId); 
        }
    };

    /**
     * Calcula el progreso de un módulo (sin contar videos)
     */
    const getModuleProgress = (module) => {
        const activities = module.activities.filter(a => a.activity !== 'video');
        const completed = activities.filter(a => completedActivities.has(a.id)).length;
        return {
            completed,
            total: activities.length,
            percentage: activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0
        };
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4 text-center mt-8">
                Bienvenido al Objeto de Aprendizaje
            </h1>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl">
                Selecciona uno de los módulos temáticos para comenzar tu aprendizaje.
            </p>

            <div className="flex flex-wrap justify-center gap-8 max-w-7xl w-full">
                {modulesData
                    .filter(module => visibleModules ? visibleModules[module.id] : true)
                    .map((module) => {
                        const progress = getModuleProgress(module);
                        
                        return (
                            <button
                                key={module.id}
                                onClick={() => handleModuleClick(module.id)}
                                className={`
                                    p-6 rounded-3xl shadow-xl transform transition-all duration-300
                                    hover:scale-[1.03] hover:shadow-2xl text-white
                                    ${module.color} flex flex-col items-center text-center
                                    w-64 min-h-[320px] relative
                                `}
                            >
                                <div className="text-7xl mb-4">{module.emoji}</div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {module.title}
                                </h2>
                                <p className="text-sm opacity-90 mb-4">
                                    {module.description}
                                </p>
                                
                                {/* Barra de progreso */}
                                <div className="w-full mt-auto">
                                    <div className="flex justify-between text-xs mb-1 opacity-90">
                                        <span>{progress.completed}/{progress.total} actividades</span>
                                        <span>{progress.percentage}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-white transition-all duration-500"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    {progress.percentage === 100 && (
                                        <span className="text-xs mt-2 inline-block">✅ Completado</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500 max-w-3xl">
                <p className="text-gray-700 font-medium">
                    👋 Recuerda: Usa los colores como guía visual. <strong>Verde</strong> para finalizar o avanzar, <strong>Azul/Índigo</strong> para reiniciar o limpiar.
                </p>
            </div>
        </div>
    );
};

export default HomeView;