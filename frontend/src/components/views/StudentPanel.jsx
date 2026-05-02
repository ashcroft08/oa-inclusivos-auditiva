import React, { useState } from 'react';
import { Play, RotateCcw, Award, Star, Zap, BookOpen, LogOut } from 'lucide-react';
import { modulesData } from "../../data/activitiesData";

/**
 * Vista del Dashboard para los niños (Student Panel)
 */
const StudentPanel = ({ onNavigate, visibleModules, completedActivities = new Set(), getCurrentResource, user, onLogout }) => {
    // Usamos el hook de React de navigate si es necesario, o la prop 'onNavigate'
    // que viene inyectada (igual que en HomeView.jsx).
    const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' o 'modulos'

    const handleModuleClick = (moduleId) => {
        const selectedModule = modulesData.find(m => m.id === moduleId);
        if (!selectedModule) return;

        // 1. PRIORIDAD DEL MARCADOR: Si existe un recurso guardado, ir directo a él
        if (typeof getCurrentResource === 'function') {
            const savedResource = getCurrentResource(moduleId);
            if (savedResource && selectedModule.activities.some(a => a.id === savedResource)) {
                console.log(`StudentPanel: Restaurando posición guardada prioritaria -> ${savedResource}`);
                onNavigate(savedResource, moduleId);
                return;
            }
        }

        // 2. Si no hay marcador, buscar la primera actividad no completada
        const firstUncompleted = selectedModule.activities.find(a => !completedActivities.has(a.id));
        
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
        const activities = module.activities;
        const completed = activities.filter(a => completedActivities.has(a.id)).length;
        return {
            completed,
            total: activities.length,
            percentage: activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0
        };
    };

    const activeModules = modulesData.filter(module => visibleModules ? visibleModules[module.id] : true);
    
    // Clasificar módulos para el inicio
    const completedMissions = activeModules.filter(m => getModuleProgress(m).percentage === 100);
    const inProgressMissions = activeModules.filter(m => {
        const p = getModuleProgress(m).percentage;
        return p > 0 && p < 100;
    });
    const newMissions = activeModules.filter(m => getModuleProgress(m).percentage === 0);

    const renderMiniCard = (module) => {
        const progress = getModuleProgress(module);
        const isComplete = progress.percentage === 100;
        
        return (
            <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`flex flex-col bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 text-left border-b-[6px] hover:-translate-y-1 ${
                    isComplete ? 'border-amber-400' : progress.percentage > 0 ? 'border-blue-400' : 'border-emerald-400'
                }`}
            >
                <div className="flex items-center justify-between mb-4 w-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isComplete ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        {module.emoji}
                    </div>
                    {isComplete && (
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" title="¡Eres un experto en este tema!">🏅</span>
                        </div>
                    )}
                </div>
                <h3 className="font-extrabold text-gray-800 text-xl mb-2 line-clamp-2">{module.title}</h3>
                
                <div className="w-full mt-auto pt-4">
                    <div className="flex justify-between text-sm mb-2 font-bold text-gray-500">
                        <span>{progress.percentage}%</span>
                        <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full text-xs">{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full transition-all duration-700 ${isComplete ? 'bg-amber-400' : progress.percentage > 0 ? 'bg-blue-400' : 'bg-emerald-400'}`}
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-[20px] flex items-center justify-center shadow-inner">
                             <span className="text-3xl">🚀</span>
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-800 text-xl">¡Hola, {user?.name?.split(' ')[0] || 'Explorador'}!</p>
                            <p className="text-sm text-indigo-500 font-bold tracking-wide uppercase">Tu Panel Especial</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                        <button 
                            onClick={() => setActiveTab('inicio')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                                activeTab === 'inicio' ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            <Star className={`w-5 h-5 ${activeTab === 'inicio' ? 'fill-indigo-100' : ''}`} />
                            <span className="hidden sm:inline">Inicio</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('modulos')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                                activeTab === 'modulos' ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            <BookOpen className={`w-5 h-5 ${activeTab === 'modulos' ? 'fill-blue-100' : ''}`} />
                            <span className="hidden sm:inline">Módulos</span>
                        </button>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110"
                        title="Salir"
                    >
                        <LogOut className="w-7 h-7" />
                    </button>
                </div>
            </nav>

            <main className="pb-20">
                {/* INICIO TAB */}
                {activeTab === 'inicio' && (
                    <div className="max-w-7xl mx-auto p-6 space-y-12 animate-[fadeIn_0.3s_ease-out]">
                        
                        {/* En Progreso */}
                        {inProgressMissions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-800">
                                        ¡Aprendiendo ahora!
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {inProgressMissions.map(renderMiniCard)}
                                </div>
                            </section>
                        )}

                        {/* Mensaje de Todo Terminado (Empty State) */}
                        {inProgressMissions.length === 0 && newMissions.length === 0 && completedMissions.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-[2rem] border-2 border-emerald-100 shadow-sm text-center transform hover:scale-[1.01] transition-transform">
                                <span className="text-5xl block mb-4">🎉</span>
                                <h3 className="text-2xl font-extrabold text-emerald-800 mb-2">¡Increíble! Has terminado todo por ahora.</h3>
                                <p className="text-emerald-600 font-medium">¡Ve a repasar tus misiones para no olvidar lo aprendido!</p>
                            </div>
                        )}

                        {/* Nuevas */}
                        {newMissions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Star className="w-6 h-6 fill-current text-white stroke-emerald-600" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-800">
                                        ¡Nuevos Retos!
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {newMissions.map(renderMiniCard)}
                                </div>
                            </section>
                        )}

                        {/* Completadas */}
                        {completedMissions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                        <Award className="w-6 h-6 fill-current" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-800">
                                        ¡Misiones Completadas!
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {completedMissions.map(renderMiniCard)}
                                </div>
                            </section>
                        )}

                        {activeModules.length === 0 && (
                            <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                                <span className="text-6xl block mb-4">💤</span>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay misiones activas</h3>
                                <p className="text-gray-500">Espera a que tu profesor active nuevas aventuras.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* MÓDULOS TAB */}
                {activeTab === 'modulos' && (
                    <div className="max-w-4xl mx-auto p-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <BookOpen className="w-7 h-7 text-indigo-500 fill-indigo-100" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-800">
                                         Todos tus Módulos
                                    </h2>
                                    <p className="text-gray-500 font-medium">Elige cualquier aventura para aprender jugando.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {activeModules.map((module) => {
                                    const progress = getModuleProgress(module);
                                    const isComplete = progress.percentage === 100;
                                    const isStarted = progress.percentage > 0;

                                    return (
                                        <div 
                                            key={module.id}
                                            className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all duration-300 gap-6 group"
                                        >
                                            <div className="flex items-center gap-5 w-full md:w-auto">
                                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${isComplete ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-200'}`}>
                                                    {module.emoji}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-extrabold text-gray-800">{module.title}</h3>
                                                        {isComplete && <span className="text-2xl animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" title="¡Eres un experto en este tema!">🏅</span>}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-bold bg-gray-200/60 inline-flex px-3 py-1 rounded-full">
                                                        {module.activities.length} retos divertidos
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                                                {/* Barra de progreso */}
                                                <div className="w-full md:w-40 flex-shrink-0">
                                                    <div className="flex justify-between text-xs mb-1.5 font-bold text-gray-500">
                                                        <span>Progreso</span>
                                                        <span className={isComplete ? 'text-amber-600' : 'text-blue-600'}>{progress.percentage}%</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`h-full transition-all duration-700 ${isComplete ? 'bg-amber-400' : 'bg-blue-500'}`}
                                                            style={{ width: `${progress.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Botón */}
                                                <button
                                                    onClick={() => handleModuleClick(module.id)}
                                                    className={`min-w-[160px] h-12 rounded-2xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg ${
                                                        isComplete 
                                                            ? 'bg-gradient-to-r from-orange-200 to-orange-300 hover:from-orange-300 hover:to-orange-400 text-orange-900 border border-orange-300' 
                                                            : isStarted 
                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' 
                                                                : 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white'
                                                    }`}
                                                >
                                                    {isComplete ? (
                                                        <> <RotateCcw className="w-5 h-5 flex-shrink-0" /> Repasar </>
                                                    ) : isStarted ? (
                                                        <> <Play className="w-5 h-5 fill-current flex-shrink-0" /> ¡Continuar! </>
                                                    ) : (
                                                        <> <Zap className="w-5 h-5 flex-shrink-0" /> ¡Empezar! </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentPanel;
