import React, { useState, useRef } from 'react';
import { Play, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoPlayer = ({
  videoSrc,
  title = "¡Vamos a Aprender Juntos! 🌟",
  description = "Mira este video para comenzar nuestra aventura de aprendizaje",
  onVideoEnd,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

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
        {!isPlaying ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20">
            <button
              onClick={handlePlayVideo}
              className="group bg-white/20 backdrop-blur-sm border-4 border-white/50 rounded-full p-8 hover:bg-white/30 hover:scale-110 transition-all duration-300"
            >
              <Play className="w-16 h-16 text-white ml-2" />
            </button>
          </div>
        ) : null}

        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          controls={isPlaying}
          onEnded={onVideoEnd}
        >
          Tu navegador no soporta la reproducción de videos.
        </video>
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