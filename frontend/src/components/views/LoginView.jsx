import React from 'react';
import { GraduationCap, School, ChevronRight } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      
      <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl max-w-4xl w-full text-center">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">
          ¡Bienvenidos!
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Unidad Educativa Sordos de Chimborazo
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* TARJETA ESTUDIANTE */}
          <button
            onClick={() => onLogin('student')}
            className="group relative bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 hover:border-blue-300 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 text-center flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Soy Estudiante</h2>
            <p className="text-gray-600 mb-6">Ingresa para aprender y jugar.</p>
            <div className="mt-auto px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              Ingresar <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* TARJETA DOCENTE */}
          <button
            onClick={() => onLogin('teacher')}
            className="group relative bg-purple-50 hover:bg-purple-100 border-2 border-purple-100 hover:border-purple-300 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 text-center flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <School className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Soy Docente</h2>
            <p className="text-gray-600 mb-6">Panel de control y configuración.</p>
            <div className="mt-auto px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              Acceder <ChevronRight className="w-4 h-4" />
            </div>
          </button>

        </div>
        
        <p className="mt-10 text-sm text-gray-400">
          Selecciona una opción para continuar
        </p>
      </div>
    </div>
  );
};

export default LoginView;