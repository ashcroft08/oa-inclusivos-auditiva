/**
 * @fileoverview Panel de Control del Docente
 * Permite activar/desactivar OAs y ver progreso de estudiantes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ToggleLeft, 
    ToggleRight, 
    Users, 
    BookOpen, 
    TrendingUp,
    ChevronRight,
    LogOut,
    RefreshCw,
    Search,
    FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { courseService, progressService } from '../../services/index.js';
import { modulesData } from '../../data/activitiesData.js';

const TeacherDashboardView = () => {
    const navigate = useNavigate();
    const { user, course, logout } = useAuth();
    
    const [oaStatuses, setOaStatuses] = useState({});
    const [studentsProgress, setStudentsProgress] = useState([]);
    const [studentsCount, setStudentsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async (refreshing = false) => {
        if (!course?.id) return;
        
        if (!refreshing) setIsLoading(true);
        try {
            // Cargar OAs del curso
            const oas = await courseService.getCourseOAs(course.id);
            const statuses = {};
            oas.forEach(oa => {
                statuses[oa.id] = oa.status_id === 2; // 2 = activo
            });
            setOaStatuses(statuses);

            // Cargar cantidad de estudiantes
            const count = await courseService.getStudentsCount(course.id);
            setStudentsCount(count);

            // Cargar progreso de estudiantes
            const progress = await progressService.getCourseStudentsProgress(course.id);
            setStudentsProgress(progress || []);

        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
            if (refreshing) setIsRefreshing(false);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course?.id]);

    /**
     * Toggle estado de un OA
     */
    const handleToggleOA = async (oaId, moduleId) => {
        if (!course?.id) return;

        const newStatus = !oaStatuses[oaId];
        setIsSaving(prev => ({ ...prev, [oaId]: true }));

        try {
            await courseService.updateOAStatus(
                course.id, 
                oaId, 
                newStatus ? 2 : 1 // 2=Activo, 1=Inactivo
            );
            
            setOaStatuses(prev => ({
                ...prev,
                [oaId]: newStatus
            }));
        } catch (error) {
            console.error('Error actualizando estado:', error);
        } finally {
            setIsSaving(prev => ({ ...prev, [oaId]: false }));
        }
    };

    /**
     * Mapea módulos del frontend a OAs del backend
     */
    const getOAIdForModule = (moduleId) => {
        const map = {
            'ciclo-vida': 1,
            'animales': 2,
            'plantas': 3,
            'ecosistemas': 4
        };
        return map[moduleId] || 0;
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadData(true);
    };

    const exportToExcel = () => {
        if (!studentsProgress.length) return;
        
        const data = studentsProgress.map(student => {
            const row = { Estudiante: student.nombre };
            student.modulos?.forEach(mod => {
                row[mod.nombre] = `${Math.round(mod.progreso)}%`;
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Progreso");
        XLSX.writeFile(wb, `Progreso_Estudiantes_${course?.title || 'Curso'}.xlsx`);
    };

    const filteredStudents = studentsProgress.filter(student =>
        student.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando panel de control...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Panel del Docente
                            </h1>
                            <p className="text-gray-600 mt-1">
                                👋 Bienvenido, <strong>{user?.name || 'Docente'}</strong>
                            </p>
                            <p className="text-sm text-indigo-600 mt-1">
                                📚 Curso: {course?.title || 'Sin curso'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{studentsCount}</p>
                                <p className="text-gray-600">Estudiantes</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">
                                    {Object.values(oaStatuses).filter(Boolean).length}
                                </p>
                                <p className="text-gray-600">Módulos Activos</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{modulesData.length}</p>
                                <p className="text-gray-600">Módulos Totales</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gestión de Módulos */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Gestión de Módulos
                    </h2>

                    <div className="space-y-4">
                        {modulesData.map((module) => {
                            const oaId = getOAIdForModule(module.id);
                            const isActive = oaStatuses[oaId] ?? true;
                            const saving = isSaving[oaId];

                            return (
                                <div 
                                    key={module.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                                        isActive 
                                            ? 'border-green-200 bg-green-50' 
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{module.emoji}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{module.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                {module.activities.length} actividades
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-medium ${
                                            isActive ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {isActive ? 'Activo' : 'Inactivo'}
                                        </span>

                                        <button
                                            onClick={() => handleToggleOA(oaId, module.id)}
                                            disabled={saving}
                                            className={`p-2 rounded-lg transition-all ${
                                                saving ? 'opacity-50 cursor-wait' : 'hover:scale-110'
                                            }`}
                                        >
                                            {isActive ? (
                                                <ToggleRight className="w-10 h-10 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-10 h-10 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Progreso de Estudiantes */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                            Progreso de Estudiantes
                        </h2>
                        {studentsProgress.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar estudiante..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
                                    />
                                </div>
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Exportar Excel
                                </button>
                            </div>
                        )}
                    </div>

                    {studentsProgress.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No hay datos de progreso disponibles</p>
                            <p className="text-sm mt-2">Los estudiantes aún no han comenzado las actividades</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No se encontraron estudiantes con ese nombre.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-3 font-semibold text-gray-600">Estudiante</th>
                                        {filteredStudents[0]?.modulos?.map((mod, i) => (
                                            <th key={i} className="pb-3 font-semibold text-gray-600 text-center">
                                                {mod.nombre}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student, idx) => {
                                        // Verificar si hay algún módulo activo con menos de 20%
                                        const hasLowProgressWarning = student.modulos?.some(mod => {
                                            const moduleInfo = modulesData.find(m => m.title.toLowerCase() === mod.nombre.toLowerCase());
                                            if (!moduleInfo) return false;
                                            const oaId = getOAIdForModule(moduleInfo.id);
                                            const isActive = oaStatuses[oaId] ?? true;
                                            return isActive && mod.progreso < 20;
                                        });

                                        return (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 font-medium text-gray-800 flex items-center gap-2">
                                                    {student.nombre}
                                                    {hasLowProgressWarning && (
                                                        <span 
                                                            className="w-2.5 h-2.5 rounded-full bg-red-400" 
                                                            title="Alerta: Progreso muy bajo en un módulo activo"
                                                        />
                                                    )}
                                                </td>
                                                {student.modulos?.map((mod, i) => (
                                                    <td key={i} className="py-4 text-center">
                                                        <div className="inline-flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all ${Math.round(mod.progreso) < 20 ? 'bg-red-400' : 'bg-green-500'}`}
                                                                    style={{ width: `${mod.progreso}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {Math.round(mod.progreso)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboardView;
