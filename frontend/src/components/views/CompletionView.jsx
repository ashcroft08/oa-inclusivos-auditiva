import React from 'react';
import { modulesData } from '../../data/activitiesData'; 

const CompletionView = ({ 
  totalActivities = 6,
  moduleId, 
  onNavigate,
  onRestart
}) => {

  const currentModule = modulesData.find(m => m.id === moduleId);
  const moduleTitle = currentModule ? currentModule.title : "el Módulo";

  const handleGoHome = () => onNavigate('home');
  const handleRestartAll = () => onRestart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-xl text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <span className="text-5xl">🎉</span>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            ¡Felicitaciones!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Has completado todas las actividades del <strong>{moduleTitle}</strong> exitosamente.
          </p>

          {/* 🔹 BLOQUE ESTADÍSTICAS — diseño horizontal con gran separación */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-10 mb-10 flex flex-col items-center w-full">
            {/* Línea superior: número y “¡Logrado!” */}
            <div className="flex flex-row items-end justify-between w-full px-24 mb-4">
              {/* Número de actividades */}
              <div className="text-center  ml-16">
                <p className="text-5xl font-extrabold text-green-600 leading-none">{totalActivities}</p>
              </div>

              {/* Logrado */}
              <div className="text-center">
                <p className="text-4xl font-extrabold text-blue-600 leading-none">¡Logrado!</p>
              </div>
            </div>

            {/* Línea inferior: etiquetas descriptivas */}
            <div className="flex flex-row justify-between w-full px-24">
              <p className="text-lg text-gray-700 font-semibold">Actividades completadas</p>
              <p className="text-lg text-gray-700 font-semibold">Progreso del módulo</p>
            </div>
          </div>

          {/* 🔹 BOTONES */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            >
              🏠 Ir al Menú Principal
            </button>
            <button
              onClick={handleRestartAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            >
              🔄 Reiniciar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionView;
