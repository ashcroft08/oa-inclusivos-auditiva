import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Header from '../shared/Header'; 
import VideoPlayer from '../shared/VideoPlayer';
import { modulesData } from '../../data/activitiesData'; 

const videoFile = 'https://www.youtube.com/watch?v=Ay9mg4mjOrw'; 

const IntroView = ({ onNavigate, moduleId }) => {
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [triedToContinue, setTriedToContinue] = useState(false);
    
    const currentModule = modulesData.find(m => m.id === moduleId);
    const moduleTitle = currentModule?.title || "Módulo de Aprendizaje";
    const firstActivityId = currentModule?.activities?.[0]?.id;

    const handleVideoEnd = () => {
        setVideoCompleted(true);
    };

    const handleStart = () => {
        if (videoCompleted && firstActivityId) {
            onNavigate(firstActivityId, moduleId); 
        } else {
            setTriedToContinue(true);
            setTimeout(() => setTriedToContinue(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-6">
            <div className="max-w-4xl mx-auto">
                <Header 
                    title={`Módulo: ${moduleTitle}`}
                    subtitle="Observa la lección en Lengua de Señas"
                    showAccessibility={true}
                    className="mb-6"
                />

                {/* Usamos el componente especializado */}
                <VideoPlayer 
                    videoSrc={videoFile}
                    onVideoEnd={handleVideoEnd}
                />

                <div className="text-center mt-8 flex flex-col items-center gap-4">
                    {videoCompleted && (
                        <p className="text-xl text-green-600 font-semibold animate-bounce">
                            ✓ ¡Excelente! Ahora puedes continuar.
                        </p>
                    )}
                    
                    <button
                        onClick={handleStart}
                        className={`group px-8 py-4 rounded-full font-bold text-white transition-all shadow-xl flex items-center gap-2
                            ${videoCompleted 
                                ? "bg-blue-600 hover:bg-blue-700 hover:scale-105" 
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {videoCompleted ? "Comenzar Actividades" : "Mira el video para habilitar"}
                        <ChevronRight className={`w-6 h-6 ${videoCompleted ? "group-hover:translate-x-1" : ""} transition-transform`} />
                    </button>

                    {triedToContinue && !videoCompleted && (
                        <p className="text-red-500 font-medium animate-shake">
                            Por favor, termina de ver el video primero.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntroView;