/**
 * @fileoverview Contexto de Progreso
 * Maneja el estado del progreso del usuario en las actividades
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { progressService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';

const STORAGE_KEY = 'oa_progress';

/**
 * Contexto de progreso
 */
const ProgressContext = createContext(null);

/**
 * Hook para usar el contexto de progreso
 */
export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress debe usarse dentro de ProgressProvider');
    }
    return context;
};

/**
 * Mapea moduleId del frontend a oaId del backend
 */
const MODULE_TO_OA_MAP = {
    'ciclo-vida': 1,
    'animales': 2,
    'plantas': 3,
    'ecosistemas': 4
};

/**
 * Prefijos de actividades por módulo
 */
const MODULE_PREFIXES = {
    'ciclo-vida': ['cv-', 'ci-'],
    'animales': ['an-'],
    'plantas': ['pl-'],
    'ecosistemas': ['ec-', 'eco-']
};

function getOAIdFromModuleId(moduleId) {
    return MODULE_TO_OA_MAP[moduleId] || 1;
}

function getModulePrefixes(moduleId) {
    return MODULE_PREFIXES[moduleId] || [];
}

/**
 * Proveedor de progreso
 */
export const ProgressProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    // Set de IDs de actividades completadas
    const [completedActivities, setCompletedActivities] = useState(new Set());
    
    // Marcador de posición: último recurso visitado por módulo
    // Formato: { 'ciclo-vida': 'cv-video-intro', 'animales': 'an-video-intro', ... }
    const [currentResource, setCurrentResourceState] = useState({});
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);



    /**
     * Carga el progreso del usuario desde el backend
     */
    const loadProgress = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await progressService.getMyProgress();
            
            if (data?.progress) {
                const completed = new Set(completedActivities);
                const resources = {};

                data.progress.forEach(p => {
                    if (p.custom_data) {
                        try {
                            const customData = JSON.parse(p.custom_data);
                            if (customData.completed_activities) {
                                customData.completed_activities.forEach(id => completed.add(id));
                            }
                            // Extraer el último recurso visitado por módulo
                            if (customData.current_resource && customData.module_id) {
                                resources[customData.module_id] = customData.current_resource;
                            }
                        } catch (e) {
                            // Ignorar errores de parsing
                        }
                    }
                });

                setCompletedActivities(completed);
                setCurrentResourceState(prev => ({ ...prev, ...resources }));
            }
        } catch (error) {
            console.error('Error cargando progreso:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Cargar progreso al autenticarse
    useEffect(() => {
        if (isAuthenticated) {
            loadProgress();
        }
    }, [isAuthenticated, loadProgress]);

    /**
     * Marca una actividad como completada
     */
    const completeActivity = useCallback(async (activityId, moduleId, totalActivities) => {
        console.log('✅ Completando actividad:', activityId, 'módulo:', moduleId);
        
        // Actualizar estado local inmediatamente
        setCompletedActivities(prev => {
            const next = new Set(prev);
            next.add(activityId);
            
            // Guardar en backend si está autenticado
            if (isAuthenticated) {
                const prefixes = getModulePrefixes(moduleId);
                const moduleCompleted = Array.from(next).filter(id => 
                    prefixes.some(prefix => id.startsWith(prefix))
                );
                
                const completedCount = moduleCompleted.length;
                const progress = Math.round((completedCount / totalActivities) * 100);

                progressService.updateProgress(getOAIdFromModuleId(moduleId), {
                    completion_status: completedCount >= totalActivities ? 2 : 5,
                    progress: progress,
                    custom_data: JSON.stringify({
                        completed_activities: moduleCompleted,
                        current_resource: activityId,
                        module_id: moduleId,
                        last_activity: activityId,
                        updated_at: Date.now()
                    })
                }).catch(err => console.error('Error guardando progreso:', err));
            }
            
            return next;
        });
    }, [isAuthenticated]);

    /**
     * Reinicia el progreso de un módulo
     */
    const resetModuleProgress = useCallback((moduleId) => {
        const prefixes = getModulePrefixes(moduleId);
        
        setCompletedActivities(prev => {
            const next = new Set(prev);
            prev.forEach(id => {
                if (prefixes.some(prefix => id.startsWith(prefix))) {
                    next.delete(id);
                }
            });
            return next;
        });
    }, []);

    /**
     * Reinicia todo el progreso
     */
    const resetAllProgress = useCallback(() => {
        setCompletedActivities(new Set());
    }, []);

    /**
     * Verifica si una actividad está completada
     */
    const isActivityCompleted = useCallback((activityId) => {
        return completedActivities.has(activityId);
    }, [completedActivities]);

    const loadModuleProgress = useCallback(async (moduleId) => {
        if (!isAuthenticated) return;
        const oaId = getOAIdFromModuleId(moduleId);
        try {
            const data = await progressService.getUserProgress(oaId);
            if (data?.progress?.custom_data) {
                try {
                    const customData = JSON.parse(data.progress.custom_data);
                    if (customData.completed_activities) {
                        setCompletedActivities(prev => {
                            const completed = new Set(prev);
                            customData.completed_activities.forEach(id => completed.add(id));
                            return completed;
                        });
                    }
                    // Extraer el último recurso visitado
                    if (customData.current_resource) {
                        setCurrentResourceState(prev => ({
                            ...prev,
                            [moduleId]: customData.current_resource
                        }));
                    }
                } catch (e) {
                    // Ignorar error parsing
                }
            }
        } catch (error) {
            console.error('Error cargando progreso del módulo:', error);
        }
    }, [isAuthenticated]);

    /**
     * Registra el recurso actual que el usuario está visitando
     * Se dispara al montar un video o actividad
     */
    const setCurrentResource = useCallback(async (activityId, moduleId) => {
        console.log('📍 Marcador de posición:', activityId, 'en módulo:', moduleId);
        
        // Actualizar estado local
        setCurrentResourceState(prev => ({ ...prev, [moduleId]: activityId }));

        // Persistir en backend
        if (isAuthenticated) {
            try {
                const prefixes = getModulePrefixes(moduleId);
                const moduleCompleted = Array.from(completedActivities).filter(id =>
                    prefixes.some(prefix => id.startsWith(prefix))
                );

                await progressService.updateProgress(getOAIdFromModuleId(moduleId), {
                    completion_status: 5, // En progreso
                    progress: -1, // -1 indica que no se recalcula, solo actualiza custom_data
                    custom_data: JSON.stringify({
                        completed_activities: moduleCompleted,
                        current_resource: activityId,
                        module_id: moduleId,
                        last_activity: activityId,
                        updated_at: Date.now()
                    })
                });
            } catch (err) {
                console.error('Error guardando marcador de posición:', err);
            }
        }
    }, [isAuthenticated, completedActivities]);

    /**
     * Obtiene el último recurso visitado de un módulo
     */
    const getCurrentResource = useCallback((moduleId) => {
        return currentResource[moduleId] || null;
    }, [currentResource]);

    /**
     * Sincronización de salida: beforeunload
     * Intenta guardar el estado antes de cerrar la pestaña
     */
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Usar sendBeacon para envíos no-bloqueantes al cerrar
            Object.entries(currentResource).forEach(([modId, actId]) => {
                if (actId && isAuthenticated) {
                    const prefixes = getModulePrefixes(modId);
                    const moduleCompleted = Array.from(completedActivities).filter(id =>
                        prefixes.some(prefix => id.startsWith(prefix))
                    );
                    const oaId = getOAIdFromModuleId(modId);
                    const payload = JSON.stringify({
                        oa_id: oaId,
                        completion_status: 5,
                        progress: -1,
                        custom_data: JSON.stringify({
                            completed_activities: moduleCompleted,
                            current_resource: actId,
                            module_id: modId,
                            last_activity: actId,
                            updated_at: Date.now()
                        })
                    });
                    // sendBeacon es la forma más fiable de enviar datos al cerrar pestaña
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                    navigator.sendBeacon(
                        `${apiBase}/progress`,
                        new Blob([payload], { type: 'application/json' })
                    );
                }
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentResource, completedActivities, isAuthenticated]);

    const value = {
        completedActivities,
        currentResource,
        isLoading,
        isSaving,
        completeActivity,
        setCurrentResource,
        getCurrentResource,
        resetModuleProgress,
        resetAllProgress,
        loadProgress,
        loadModuleProgress,
        isActivityCompleted
    };

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
};

export default ProgressContext;

