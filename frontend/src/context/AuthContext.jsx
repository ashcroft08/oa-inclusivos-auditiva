/**
 * @fileoverview Contexto de Autenticación LTI
 * Proporciona estado de autenticación a toda la aplicación
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ltiService } from '../services/index.js';

/**
 * Contexto de autenticación
 */
const AuthContext = createContext(null);

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

/**
 * Proveedor de autenticación
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Inicializa la autenticación leyendo parámetros LTI
     */
    const initializeAuth = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Primero intentar leer parámetros de URL (vienen del LTI launch)
            const ltiParams = ltiService.parseLTIParams();
            
            if (ltiParams) {
                // Hay parámetros LTI en la URL
                setUser({
                    id: ltiParams.user_id,
                    name: ltiParams.user_name
                });
                setCourse({
                    id: ltiParams.course_id,
                    title: ltiParams.course_title
                });
                setRoles(ltiParams.roles);

                // Limpiar URL para evitar mostrar parámetros
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
            } else {
                // Intentar obtener datos de sesión del backend
                const ltiData = await ltiService.getLTIData();
                
                if (ltiData) {
                    setUser(ltiData.user);
                    setCourse(ltiData.context);
                    setRoles(ltiData.roles?.names || []);
                } else {
                    // No hay sesión
                    setUser(null);
                    setCourse(null);
                    setRoles([]);
                }
            }
        } catch (err) {
            console.error('Error inicializando autenticación:', err);
            setError(err.message);
            setUser(null);
            setCourse(null);
            setRoles([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Inicializar al montar
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /**
     * Cierra sesión
     */
    const logout = async () => {
        try {
            await ltiService.logout();
        } catch (err) {
            console.error('Error en logout:', err);
        } finally {
            setUser(null);
            setCourse(null);
            setRoles([]);
        }
    };

    /**
     * Recarga los datos de autenticación
     */
    const refresh = () => {
        initializeAuth();
    };

    // Valores derivados
    const isAuthenticated = !!user;
    const isTeacher = ltiService.isTeacher(roles);
    const isStudent = ltiService.isStudent(roles);

    const value = {
        // Estado
        user,
        course,
        roles,
        isLoading,
        error,
        
        // Derivados
        isAuthenticated,
        isTeacher,
        isStudent,
        
        // Acciones
        logout,
        refresh
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
