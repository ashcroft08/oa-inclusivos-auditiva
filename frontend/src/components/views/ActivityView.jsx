import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Home, CheckCircle2, Lock, Menu, X, Video } from "lucide-react";

// === 1. COMPONENTES COMPARTIDOS ===
import Header from "../shared/Header";
import VideoPlayer from "../shared/VideoPlayer";
import CompletionAnimation from "../CompletionAnimation";
import { modulesData } from "../../data/activitiesData";
import { useProgress } from "../../context/ProgressContext";

// === 2. MAPA DE VIDEOS (Archivos estáticos en public/Videos y YouTube) ===
const videoMap = {
    'ciclo_intro': 'https://www.youtube.com/watch?v=Ay9mg4mjOrw',
    'ciclo_etapas': 'https://www.youtube.com/watch?v=L9TBMnpJujM',
    'ciclo_sentidos': 'https://www.youtube.com/watch?v=V2LigiVUCyg',
    'animales_intro': 'https://www.youtube.com/watch?v=_nCkrYKet4s',
    'animales_dieta': 'https://www.youtube.com/watch?v=ycRvmh4bgX4',
    'animales_repro': 'https://www.youtube.com/watch?v=PzKjZ3ibOYk',
    'plantas_partes': 'https://www.youtube.com/watch?v=NmJ02tnJb_g',
    'plantas_tallos': 'https://www.youtube.com/watch?v=1xEb6ESa-Uk',
    'eco_intro': 'https://www.youtube.com/watch?v=7aBNHYZduMk',
    'eco_solar': 'https://www.youtube.com/watch?v=pu4DOE2hDKg',
    'eco_estaciones': 'https://www.youtube.com/watch?v=C7JgI5MvuhA',
};


// === 4. IMPORTACIÓN DE ACTIVIDADES (JUEGOS) ===
import CiAct1UnirSeñas from "../modules/CiAct1UnirSeñas";
import CiAct2OrdenCicloVida from "../modules/CiAct2OrdenCicloVida";
import CiAct3DibujaMamifero from "../modules/CiAct3DibujaMamifero";
import CiAct4Describir from "../modules/CiAct4Describir";
import CiAct5AsociarSentidoObjeto from "../modules/CiAct5AsociarSentidoObjeto";
import CiAct6SenasSentidos from "../modules/CiAct6SenasSentidos";
import CiAct7EtiquetarCuerpo from "../modules/CiAct7EtiquetarCuerpo";

// Animales
import AniAct1SeleccionalosAnimales from "../modules/AniAct1SeleccionalosAnimales";
import AniAct2ClasificarTabla from "../modules/AniAct2ClasificarTabla";
import AniAct3ClasificarDragDrop from "../modules/AniAct3ClasificarDragDrop";
import AniAct4SopaDeLetras from "../modules/AniAct4SopaDeLetras";
import AniAct5UnirComida from "../modules/AniAct5UnirComida";
import AniAct6ClasificarDietaCorregida from "../modules/AniAct6ClasificarDieta";
import AniAct7ClasificarReproduccion from "../modules/AniAct7ClasificarReproduccion";
import AniAct9ClasificaLineas from "../modules/Anict9ClasificaLineas";

// Plantas
import PlantaAct1PartesDeLaPlanta from "../modules/PlantaAct1PartesDeLaPlanta";
import PlantaAct2ClasificaTipos from "../modules/PlantaAct2ClasificaTipos";
import PlantaAct3ClasificaTalloRigido from "../modules/PlantaAct3ClasificaTalloRigido";
import PlantaAct4Necesidades from "../modules/PlantaAct4Necesidades";
import PlantaAct5CicloVida from "../modules/PlantaAct5CicloVida";

// Ecosistemas
import EcoAct1ClasificaFactores from "../modules/EcoAct1ClasificaFactores";
import EcoAct2CadenaAlimentaria from "../modules/EcoAct2CadenaAlimentaria";
import EcoAct3OrganismoHabitat from "../modules/EcoAct3OrganismoHabitat";
import EcoAct4NivelesTroficos from "../modules/EcoAct4NivelesTroficos";
import EcoAct5EtiquetaSistema from "../modules/EcoAct5EtiquetaSistema";
import EcoAct6ClasificaEstaciones from "../modules/EcoAct6ClasificaEstaciones";

// === 5. MAPEO DE COMPONENTES DE ACTIVIDAD ===
const activityComponents = {
    // Ciclo
    senas: CiAct1UnirSeñas,
    ordenar: CiAct2OrdenCicloVida,
    dibujar: CiAct3DibujaMamifero,
    describir: CiAct4Describir,
    'asociar-sentido-objeto': CiAct5AsociarSentidoObjeto,
    'señas-sentidos': CiAct6SenasSentidos,
    'etiquetar-cuerpo': CiAct7EtiquetarCuerpo,
    // Animales
    'seleccionar-animales': AniAct1SeleccionalosAnimales,
    'clasificar-tabla': AniAct2ClasificarTabla,
    'clasificar-dragdrop': AniAct3ClasificarDragDrop,
    'sopa-letras': AniAct4SopaDeLetras,
    'unir-comida-drag': AniAct5UnirComida,
    'clasificar-dieta-aleatoria': AniAct6ClasificarDietaCorregida,
    'clasificar-reproduccion': AniAct7ClasificarReproduccion,
    'clasifica-lineas': AniAct9ClasificaLineas,
    // Plantas
    'etiquetar-partes': PlantaAct1PartesDeLaPlanta,
    'clasifica-tipos-tallo': PlantaAct2ClasificaTipos,
    'clasifica-tallo-rigido': PlantaAct3ClasificaTalloRigido,
    'clasifica-necesidades': PlantaAct4Necesidades,
    'ordena-ciclo': PlantaAct5CicloVida,
    // Ecosistemas
    'clasifica-factores': EcoAct1ClasificaFactores,
    'ordena-cadena': EcoAct2CadenaAlimentaria,
    'organismo-habitat': EcoAct3OrganismoHabitat,
    'niveles-troficos': EcoAct4NivelesTroficos,
    'etiqueta-planetas': EcoAct5EtiquetaSistema,
    'clasifica-estaciones': EcoAct6ClasificaEstaciones,
};

const moduleThemeMap = {
    'ciclo-vida': { border: 'border-blue-500', bgHover: 'hover:bg-blue-50', bgActive: 'bg-blue-100', textActive: 'text-blue-800' },
    'animales': { border: 'border-yellow-500', bgHover: 'hover:bg-yellow-50', bgActive: 'bg-yellow-100', textActive: 'text-yellow-800' },
    'plantas': { border: 'border-green-500', bgHover: 'hover:bg-green-50', bgActive: 'bg-green-100', textActive: 'text-green-800' },
    'ecosistemas': { border: 'border-purple-500', bgHover: 'hover:bg-purple-50', bgActive: 'bg-purple-100', textActive: 'text-purple-800' }
};

const ActivityView = ({
    activityId,
    moduleId,
    onNavigate,
    completedActivities,
    onCompleteActivity,
}) => {
    const DEBUG_MODE = false; // Pon en false para producción
    const { setCurrentResource } = useProgress();

    // --- LÓGICA DE DATOS ---
    const currentModule = modulesData.find(m => m.id === moduleId);
    const currentActivitiesList = currentModule ? currentModule.activities : [];
    const currentIndex = currentActivitiesList.findIndex((a) => a.id === activityId);
    const currentActivity = currentActivitiesList[currentIndex];
    const totalActivities = currentActivitiesList.length;

    const themeColors = moduleThemeMap[moduleId] || { border: 'border-gray-500', bgHover: 'hover:bg-gray-50', bgActive: 'bg-gray-100', textActive: 'text-gray-800' };

    // --- ESTADOS GENERALES ---
    const [showAnimation, setShowAnimation] = useState(false);
    const [animationType, setAnimationType] = useState("success");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- ESTADOS EXCLUSIVOS PARA VISTA DE VIDEO ---
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [triedToContinue, setTriedToContinue] = useState(false);

    // Resetear estados al cambiar de actividad/paso
    useEffect(() => {
        setVideoCompleted(false);
        setTriedToContinue(false);
        setShowAnimation(false);
    }, [activityId]);

    // Registro OnMount: marcar el recurso actual al renderizar
    useEffect(() => {
        if (activityId && moduleId) {
            setCurrentResource(activityId, moduleId);
        }
    }, [activityId, moduleId, setCurrentResource]);

    // Ocultar el Sidebar en pantallas pequeñas automáticamente (eliminamos el auto-open en desktop para que sea por defecto cerrado)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        handleResize(); // trigger on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- FUNCIONES DE NAVEGACIÓN ---
    const handleNext = () => {
        if (currentIndex < totalActivities - 1) {
            onNavigate(currentActivitiesList[currentIndex + 1].id, moduleId);
        } else {
            onNavigate("completion", moduleId);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            onNavigate(currentActivitiesList[currentIndex - 1].id, moduleId);
        }
    };

    const handleSidebarNavigate = (targetActivityId) => {
        onNavigate(targetActivityId, moduleId);
    };

    // --- COMPLETADO DE JUEGO ---
    const handleCompleteGame = (success = true) => {
        setAnimationType(success ? "success" : "failure");
        setShowAnimation(true);
        setTimeout(() => {
            setShowAnimation(false);
            if (success) onCompleteActivity(activityId);
        }, 3000);
    };

    // --- COMPLETADO DE VIDEO ---
    const handleVideoEnd = () => {
        setVideoCompleted(true);
        // Marcamos la actividad como completada automáticamente al terminar de ver
        onCompleteActivity(activityId);
    };

    const handleProceedNext = () => {
        if (isCompleted || (isVideo && videoCompleted) || DEBUG_MODE) {
            handleNext();
        } else if (isVideo) {
            setTriedToContinue(true);
            setTimeout(() => setTriedToContinue(false), 2000);
        }
    };

    // Validación de seguridad
    if (currentIndex === -1 || !currentModule) return <div className="p-10">Cargando...</div>;

    const isVideo = currentActivity.activity === 'video';
    const ActivityComponent = !isVideo ? activityComponents[currentActivity.activity] : null;
    const isCompleted = completedActivities.has(activityId);

    // Permitir avance
    const isNextEnabled = isCompleted || (isVideo && videoCompleted) || DEBUG_MODE;

    // Selector de fondo dependiendo si es video o actividad
    const gradientBgClass = isVideo
        ? "bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200"
        : "bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200";

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
            {/* Overlay background for Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Colapsable */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-md shadow-[4px_0_24px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-hidden={!isSidebarOpen}
            >
                {/* Header de Sidebar */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-3xl mr-2">{currentModule.emoji}</span>
                        <h3 className="font-bold text-gray-800 text-lg">{currentModule.title}</h3>
                    </div>
                    {/* Botón Cerrar en móvil (opcional, en pantallas grandes empuja el contenido) */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-full"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Lista de Actividades en Sidebar */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                    {currentActivitiesList.map((item, index) => {
                        const isItemCompleted = completedActivities.has(item.id);
                        const isCurrent = item.id === activityId;
                        const isLocked = !isItemCompleted && !isCurrent && (!DEBUG_MODE) &&
                            // Un ítem está bloqueado si el anterior no está completado
                            (index > 0 && !completedActivities.has(currentActivitiesList[index - 1].id));

                        return (
                            <button
                                key={item.id}
                                disabled={isLocked}
                                onClick={() => !isLocked && handleSidebarNavigate(item.id)}
                                className={`w-full text-left flex items-start p-3 rounded-xl transition-all duration-200 
                                    ${isCurrent ? `border-l-4 ${themeColors.border} ${themeColors.bgActive} shadow-sm` : `border-l-4 border-transparent ${isLocked ? 'opacity-60 cursor-not-allowed' : themeColors.bgHover}`}
                                `}
                            >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                    {isItemCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : isLocked ? (
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    ) : item.activity === 'video' ? (
                                        <Video className={`w-5 h-5 ${isCurrent ? themeColors.textActive : 'text-blue-500'}`} />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full border-2 ${isCurrent ? `border-current ${themeColors.textActive}` : 'border-gray-300'}`} />
                                    )}
                                </div>
                                <div>
                                    <p className={`font-medium text-sm ${isCurrent ? themeColors.textActive : 'text-gray-700'}`}>
                                        {index + 1}. {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.activity === 'video' ? 'Video Interactivo' : 'Actividad'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200"
                    >
                        <Home className="w-5 h-5" />
                        <span>Volver al Inicio</span>
                    </button>
                </div>
            </div>

            {/* Contenido Principal con Flechas (Unificado) */}
            <div className={`flex-1 h-screen relative transition-all duration-300 ease-in-out w-full ${gradientBgClass}`}>

                {/* Botón Hamburguesa Flotante (siempre disponible para abrir, si está cerrado) */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label={isSidebarOpen ? "Cerrar menú del módulo" : "Abrir menú del módulo"}
                    aria-expanded={isSidebarOpen}
                    className={`absolute top-6 left-6 z-40 p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all duration-300 ${isSidebarOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>

                {/* Área Scrollable del contenido central */}
                <div className="h-full overflow-y-auto px-16 py-10 flex flex-col items-center">

                    <div className="w-full max-w-[95%] mx-auto flex-1 flex flex-col justify-center pb-20">
                        {isVideo ? (
                            <div className="w-full max-w-4xl mx-auto">
                                <Header
                                    title={`Módulo: ${currentModule.title}`}
                                    subtitle={currentActivity.title}
                                    showAccessibility={true}
                                    className="mb-6"
                                />
                                <VideoPlayer
                                    videoSrc={videoMap[currentActivity.videoKey]}
                                    title={currentActivity.title}
                                    onVideoEnd={handleVideoEnd}
                                />
                                {/* Mensaje de Video y Continuar Opcional del diseño pedido */}
                                <div className="text-center mt-8 flex flex-col items-center gap-4">
                                    {videoCompleted && (
                                        <p className="text-xl text-green-600 font-bold animate-bounce bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                                            ✓ ¡Excelente! Ahora puedes continuar.
                                        </p>
                                    )}
                                    {triedToContinue && !videoCompleted && !isCompleted && (
                                        <p className="text-red-600 font-bold animate-shake bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm ring-2 ring-red-200">
                                            Haz clic en el botón central Iniciar para reproducir el video.
                                            Necesitas terminar de ver el video antes de pasar al siguiente juego.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Renderizado Actividad
                            <div className="w-full">
                                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative mt-10">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-20" /> {/* Espaciador */}
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${currentModule.color} shadow-md`}>
                                                {currentModule.emoji} {currentModule.title}
                                            </span>
                                            <div className="w-20" /> {/* Espaciador */}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 text-center">{currentActivity.title}</h2>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 min-h-[400px]">
                                        {ActivityComponent ? (
                                            <ActivityComponent
                                                onComplete={handleCompleteGame}
                                                activityId={activityId}
                                                moduleId={moduleId}
                                            />
                                        ) : (
                                            <div className="text-center p-10 text-gray-400">
                                                Actividad no encontrada
                                            </div>
                                        )}
                                    </div>

                                    {/* Puntos de Progreso (Dots) mantenidos para el componente original opcional */}
                                    <div className="flex justify-center items-center">
                                        <div className="flex gap-2">
                                            {currentActivitiesList.map((activity, i) => (
                                                <div
                                                    key={activity.id}
                                                    className={`w-3 h-3 rounded-full transition-all ${completedActivities.has(activity.id)
                                                        ? "bg-green-500"
                                                        : i === currentIndex
                                                            ? "bg-blue-500 scale-125"
                                                            : "bg-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de Navegación Absolutos (Unificados) */}

                {/* Flecha Anterior */}
                <button
                    onClick={handlePrevious}
                    className={`absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center border-2 border-white shadow-xl z-40 ${currentIndex > 0
                        ? "bg-white text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 hover:scale-110 active:scale-95 transition-all"
                        : "bg-white/50 text-gray-400 opacity-50 cursor-not-allowed"
                        }`}
                    disabled={currentIndex <= 0}
                    aria-label="Ir a la actividad anterior"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Flecha Siguiente */}
                <div className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-40">
                    {/* Tooltip opcional si está bloqueado en video */}
                    {isVideo && !isCompleted && !videoCompleted && (
                        <div className="hidden lg:block bg-white/80 backdrop-blur text-sm text-gray-700 px-3 py-2 rounded-lg font-medium shadow-md">
                            Termina el video para avanzar 👉
                        </div>
                    )}

                    <button
                        onClick={handleProceedNext}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl shrink-0 transition-all ${isNextEnabled
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-white focus:ring-4 focus:ring-blue-300 hover:scale-110 active:scale-95"
                            : "bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
                            }`}
                        aria-label="Ir a la actividad siguiente"
                        aria-disabled={!isNextEnabled}
                    >
                        {isNextEnabled ? (
                            <ChevronRight className="w-8 h-8" />
                        ) : (
                            <Lock className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Animación al completar juego */}
                {showAnimation && (
                    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                        <CompletionAnimation type={animationType} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityView;