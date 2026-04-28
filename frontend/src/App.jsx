/**
 * @fileoverview Aplicación principal
 * Configura React Router y proveedores de contexto
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProgressProvider, useProgress } from './context/ProgressContext.jsx';
import { courseService } from './services/index.js';

// Vistas
import NoSessionView from './components/views/NoSessionView.jsx';
import StudentPanel from './components/views/StudentPanel.jsx';
import ActivityView from './components/views/ActivityView.jsx';
import CompletionView from './components/views/CompletionView.jsx';
import TeacherDashboardView from './components/views/TeacherDashboardView.jsx';

// Datos
import { modulesData } from './data/activitiesData.js';

// Estilos
import './App.css';

/**
 * Rutas protegidas que requieren autenticación
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <NoSessionView />;
    }

    return children;
};

/**
 * Componente principal de la aplicación OA
 */
const OAApp = () => {
    const { isTeacher, course, user, logout } = useAuth();
    const { completedActivities, completeActivity, resetAllProgress, getCurrentResource } = useProgress();
    const location = useLocation();
    
    // Estado para módulos visibles (desde backend)
    const [visibleModules, setVisibleModules] = useState({});
    const [isLoadingModules, setIsLoadingModules] = useState(true);

    // Cargar módulos activos desde el backend
    useEffect(() => {
        const loadActiveModules = async () => {
            setIsLoadingModules(true);
            try {
                // Obtener OAs activos desde el backend
                const activeOAs = await courseService.getActiveOAs();
                
                // Mapear IDs de OA del backend a IDs de módulos del frontend
                const oaToModuleMap = {
                    1: 'ciclo-vida',
                    2: 'animales',
                    3: 'plantas',
                    4: 'ecosistemas'
                };

                const visible = {};
                // Inicializar todos como invisibles
                modulesData.forEach(m => {
                    visible[m.id] = false;
                });
                
                // Marcar como visibles solo los activos
                if (Array.isArray(activeOAs)) {
                    activeOAs.forEach(oa => {
                        const moduleId = oaToModuleMap[oa.id];
                        if (moduleId) {
                            visible[moduleId] = true;
                        }
                    });
                }

                setVisibleModules(visible);
            } catch (error) {
                console.error('Error cargando módulos activos:', error);
                // Si hay error, mostrar todos por defecto
                const visible = {};
                modulesData.forEach(m => {
                    visible[m.id] = true;
                });
                setVisibleModules(visible);
            } finally {
                setIsLoadingModules(false);
            }
        };

        if (!isTeacher) {
            loadActiveModules();
        }
    }, [isTeacher]);

    // Si es profesor, mostrar dashboard
    if (isTeacher) {
        return <TeacherDashboardView />;
    }

    // Mostrar loading mientras carga módulos
    if (isLoadingModules) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando módulos...</p>
                </div>
            </div>
        );
    }

    /**
     * Navegación centralizada
     */
    const handleNavigate = (target, moduleId = null) => {
        if (target === 'home') {
            window.location.href = '/oa';
        } else if (target === 'completion') {
            window.location.href = `/oa/completion/${moduleId}`;
        } else {
            // Navegar a actividad
            window.location.href = `/oa/module/${moduleId}/activity/${target}`;
        }
    };

    /**
     * Completar actividad
     */
    const handleCompleteActivity = (activityId, moduleId) => {
        const module = modulesData.find(m => m.id === moduleId);
        if (module) {
            completeActivity(activityId, moduleId, module.activities.length);
        }
    };

    /**
     * Reiniciar progreso
     */
    const handleRestart = () => {
        resetAllProgress();
        window.location.href = '/oa';
    };

    return (
        <Routes>
            {/* Página principal - Lista de módulos */}
            <Route 
                path="/" 
                element={
                    <StudentPanel 
                        onNavigate={handleNavigate}
                        visibleModules={visibleModules}
                        completedActivities={completedActivities}
                        getCurrentResource={getCurrentResource}
                        user={user}
                        onLogout={() => {
                            logout();
                            window.location.href = '/';
                        }}
                    />
                } 
            />

            {/* Actividad */}
            <Route 
                path="/module/:moduleId/activity/:activityId" 
                element={
                    <ActivityViewWrapper 
                        onNavigate={handleNavigate}
                        completedActivities={completedActivities}
                        onCompleteActivity={handleCompleteActivity}
                    />
                } 
            />

            {/* Completado de módulo */}
            <Route 
                path="/completion/:moduleId" 
                element={
                    <CompletionViewWrapper 
                        onNavigate={handleNavigate}
                        onRestart={handleRestart}
                    />
                } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/oa" replace />} />
        </Routes>
    );
};

const ActivityViewWrapper = ({ onNavigate, completedActivities, onCompleteActivity }) => {
    const params = useParams();
    const { moduleId, activityId } = params;
    const { loadModuleProgress, isLoading: isGlobalLoading, getCurrentResource } = useProgress();
    const [isModuleLoading, setIsModuleLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (moduleId) {
            setIsModuleLoading(true);
            loadModuleProgress(moduleId).finally(() => {
                if (isMounted) setIsModuleLoading(false);
            });
        }
        return () => { isMounted = false; };
    }, [moduleId, loadModuleProgress]);

    // 1. Mostrar estado de carga mientras se obtienen datos del backend
    if (isGlobalLoading || isModuleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando progreso del módulo...</p>
                </div>
            </div>
        );
    }

    const module = modulesData.find(m => m.id === moduleId);
    
    // Si no existe el módulo, por defecto retroceder
    if (!module || !module.activities || module.activities.length === 0) {
        return <Navigate to="/oa" replace />;
    }

    const firstActivity = module.activities[0];
    const savedResource = getCurrentResource(moduleId);
    
    // 2. Lógica de Rutas Protegidas y Redirección Preventiva (Component Guard)
    // Si la primera actividad (video intro) NO ha sido completada...
    if (activityId !== firstActivity.id && !completedActivities.has(firstActivity.id)) {
        // Redirigir al último recurso visitado si existe, o al video introductorio
        const targetId = savedResource || firstActivity.id;
        console.log(`Guard: Redirigiendo preventivamente de ${activityId} a ${targetId}`);
        const redirectUrl = `/oa/module/${moduleId}/activity/${targetId}`;
        return <Navigate to={redirectUrl} replace />;
    }

    // 3. [REMOVED] Lógica redundante que bloqueaba visualizar el primer video desde el sidebar.
    // HomeView.jsx ya se encarga de redirigir al recurso guardado al entrar al módulo desde inicio.

    return (
        <ActivityView
            activityId={activityId}
            moduleId={moduleId}
            onNavigate={onNavigate}
            completedActivities={completedActivities}
            onCompleteActivity={(id) => onCompleteActivity(id, moduleId)}
        />
    );
};

/**
 * Wrapper para CompletionView con parámetros de URL
 */
const CompletionViewWrapper = ({ onNavigate, onRestart }) => {
    const params = useParams();
    const { moduleId } = params;
    const module = modulesData.find(m => m.id === moduleId);

    return (
        <CompletionView
            moduleId={moduleId}
            totalActivities={module?.activities?.length || 0}
            onNavigate={onNavigate}
            onRestart={onRestart}
        />
    );
};

/**
 * Aplicación con proveedores
 */
const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ProgressProvider>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<Navigate to="/oa" replace />} />

                        {/* Rutas de OA (protegidas) */}
                        <Route 
                            path="/oa/*" 
                            element={
                                <ProtectedRoute>
                                    <OAApp />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/oa" replace />} />
                    </Routes>
                </ProgressProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
