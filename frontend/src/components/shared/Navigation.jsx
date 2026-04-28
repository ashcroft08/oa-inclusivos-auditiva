import React from 'react';
import { Home, Video, ChevronLeft, ChevronRight } from 'lucide-react';

const Navigation = ({ 
  title = "Actividades de Aprendizaje",
  subtitle = "Tercero de Básica",
  className = ""
}) => {

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow ${className}`}>
      <div className="flex items-center justify-between">

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
        </div>

        <div className="w-20"></div> {/* Spacer for balance */}
      </div>
    </div>
  );
};

export default Navigation;
