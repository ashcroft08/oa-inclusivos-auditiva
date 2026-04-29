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
     * Inicializa la autenticación leyendo parámetros LTI o localStorage
     */
    const initializeAuth = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Intentar leer parámetros de URL (vienen del LTI launch inicial)
            const ltiParams = ltiService.parseLTIParams();
            
            if (ltiParams) {
                const userData = { id: ltiParams.user_id, name: ltiParams.user_name };
                const courseData = { id: ltiParams.course_id, title: ltiParams.course_title };
                const rolesData = ltiParams.roles;

                setUser(userData);
                setCourse(courseData);
                setRoles(rolesData);

                // Guardar en localStorage para persistencia en recargas
                localStorage.setItem('oa_user', JSON.stringify(userData));
                localStorage.setItem('oa_course', JSON.stringify(courseData));
                localStorage.setItem('oa_roles', JSON.stringify(rolesData));

                // Limpiar URL para evitar mostrar parámetros sensibles
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
            } else {
                // 2. Intentar cargar desde localStorage (para F5/Recarga)
                const storedUser = localStorage.getItem('oa_user');
                const storedCourse = localStorage.getItem('oa_course');
                const storedRoles = localStorage.getItem('oa_roles');

                if (storedUser && storedCourse && storedRoles) {
                    setUser(JSON.parse(storedUser));
                    setCourse(JSON.parse(storedCourse));
                    setRoles(JSON.parse(storedRoles));
                } else {
                    // 3. Como último recurso, pedir datos de sesión al backend
                    const ltiData = await ltiService.getLTIData();
                    
                    if (ltiData) {
                        setUser(ltiData.user);
                        setCourse(ltiData.context);
                        setRoles(ltiData.roles?.names || []);
                    } else {
                        setUser(null);
                        setCourse(null);
                        setRoles([]);
                    }
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
            localStorage.removeItem('oa_user');
            localStorage.removeItem('oa_course');
            localStorage.removeItem('oa_roles');
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
