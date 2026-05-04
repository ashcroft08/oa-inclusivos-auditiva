import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Home, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Extrae el ID del video de YouTube de diversas formas de URL.
 * Soporta: /embed/ID, /watch?v=ID, youtu.be/ID
 */
function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Formato /embed/ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Formato watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Formato youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  return null;
}

// Carga la API IFrame de YouTube una sola vez
let ytApiPromise = null;
function loadYouTubeApi() {
  if (ytApiPromise) return ytApiPromise;
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  ytApiPromise = new Promise((resolve) => {
    // Callback global que YouTube invoca al cargar la API
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

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
  const playerDivRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const endedFiredRef = useRef(false);

  const videoId = extractYouTubeId(videoSrc);

  // Resetear estados si cambia la URL del video (nueva actividad)
  useEffect(() => {
    setIsPlaying(false);
    setHasEnded(false);
    setHasError(false);
    endedFiredRef.current = false;

    // Destruir player anterior si existe
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch { /* ignore */ }
      ytPlayerRef.current = null;
    }
  }, [videoSrc]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch { /* ignore */ }
        ytPlayerRef.current = null;
      }
    };
  }, []);

  const handlePlayVideo = useCallback(async () => {
    if (!videoId || !playerDivRef.current) return;
    setIsPlaying(true);

    try {
      await loadYouTubeApi();

      // Crear un div contenedor fresco para el player
      const container = playerDivRef.current;
      // Limpiar contenedor
      container.innerHTML = '';
      const playerEl = document.createElement('div');
      playerEl.id = `yt-player-${videoId}-${Date.now()}`;
      container.appendChild(playerEl);

      ytPlayerRef.current = new window.YT.Player(playerEl.id, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          cc_load_policy: 1, // Mostrar subtítulos si están disponibles
        },
        events: {
          onStateChange: (event) => {
            // Estado 0 = video terminado
            if (event.data === window.YT.PlayerState.ENDED) {
              if (!endedFiredRef.current) {
                endedFiredRef.current = true;
                setIsPlaying(false);
                setHasEnded(true);
                if (onVideoEnd) onVideoEnd();
              }
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setHasError(true);
          }
        }
      });
    } catch (err) {
      console.error('Error inicializando YouTube Player:', err);
      setHasError(true);
    }
  }, [videoId, onVideoEnd]);

  if (!videoId) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl ${className}`}>
        <div className="text-center text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-bold">URL de video no válida</p>
          <p className="text-sm text-gray-500 mt-2">No se pudo extraer el ID del video de YouTube.</p>
        </div>
      </div>
    );
  }

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
          /* Overlay de Play con thumbnail de YouTube */
          <div className="absolute inset-0 z-10">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={`Miniatura del video: ${title}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayVideo}
                className="group bg-white/20 backdrop-blur-sm border-4 border-white/50 rounded-full p-8 hover:bg-white/30 hover:scale-110 transition-all duration-300"
                aria-label="Reproducir video"
              >
                <Play className="w-16 h-16 text-white ml-2" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Contenedor para el YouTube IFrame Player */}
        <div
          ref={playerDivRef}
          className="w-full h-full"
          style={{ display: isPlaying || hasEnded ? 'block' : 'none' }}
        />
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