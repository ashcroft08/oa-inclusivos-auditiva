import React from 'react';
import { Users, Eye, Volume2 } from 'lucide-react';

const Header = ({ 
  title = "Bienvenidos", 
  subtitle = "Unidad Educativa Sordos de Chimborazo",
  showAccessibility = true,
  className = ""
}) => {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        {showAccessibility && (
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Visual</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Audio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
