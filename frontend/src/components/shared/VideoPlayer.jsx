import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Home, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';

const VideoPlayer = ({
  videoSrc,
  title = "¡Vamos a Aprender Juntos! 🌟",
  description = "Mira este video para comenzar nuestra aventura de aprendizaje",
  onVideoEnd,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const playerContainerRef = useRef(null);
  const endedFiredRef = useRef(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  const handleError = (e) => {
    console.error("Error al cargar el video:", e);
    setHasError(true);
  };

  // Handler unificado para cuando el video termina
  const handleVideoEnded = useCallback(() => {
    if (endedFiredRef.current) return;
    endedFiredRef.current = true;

    setIsPlaying(false);
    setHasEnded(true);

    if (onVideoEnd) {
      onVideoEnd();
    }
  }, [onVideoEnd]);

  // Resetear estados si cambia la URL del video (nueva actividad)
  useEffect(() => {
    setIsPlaying(false);
    setHasEnded(false);
    setHasError(false);
    endedFiredRef.current = false;
  }, [videoSrc]);

  // Normalizar la URL (asegurar que es un string válido para YouTube)
  const normalizedUrl = typeof videoSrc === 'string' ? videoSrc.trim() : '';

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl ${className}`}>
      <div className="flex justify-start mb-2 sm:mb-4">
        <Link
          to="/oa"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all duration-300 font-medium group border border-indigo-100"
          aria-label="Volver al Inicio"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
      </div>

      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto aspect-video">
        {hasError ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-800 text-white p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="font-bold text-lg mb-2">¡Ups! No pudimos cargar el video</p>
            <p className="text-sm text-gray-300 mb-4">Verifica tu conexión a internet o intenta recargar la página.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Recargar página
            </button>
          </div>
        ) : !isPlaying && !hasEnded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20">
            <button
              onClick={handlePlayVideo}
              className="group bg-white/20 backdrop-blur-sm border-4 border-white/50 rounded-full p-8 hover:bg-white/30 hover:scale-110 transition-all duration-300"
            >
              <Play className="w-16 h-16 text-white ml-2" />
            </button>
          </div>
        ) : null}

        <div className="w-full h-full" ref={playerContainerRef}>
          <ReactPlayer
            url={normalizedUrl}
            playing={isPlaying}
            controls
            width="100%"
            height="100%"
            playsinline
            onEnded={handleVideoEnded}
            onError={handleError}
            config={{
              youtube: {
                playerVars: { 
                  autoplay: 1,
                  modestbranding: 1, 
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3
                }
              }
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          Subtítulos integrados
        </span>
        <span className="text-xs font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
          Lengua de Señas
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;