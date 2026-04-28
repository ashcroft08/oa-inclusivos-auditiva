import React, { useEffect, useRef } from 'react';
import { X, Eye, Hand, Target, Check, MousePointer, Edit2, Search, Zap, Volume2, Move, List } from 'lucide-react';

const iconMap = {
    Eye, Hand, Target, Check, MousePointer, Edit2, Search, Zap, Volume2, Move, List
};

const themeClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    pink: 'bg-pink-100 text-pink-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
};

// Pasos de Arrastrar y Soltar predeterminados (por si no se envían props custom)
const defaultSteps = [
    { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira atentamente las señas de arriba y las imágenes abajo.' },
    { iconName: 'Hand', colorTheme: 'indigo', title: '2. Arrastra', description: 'Haz clic y mantén presionada la seña que creas que corresponde.' },
    { iconName: 'Target', colorTheme: 'purple', title: '3. Suelta', description: 'Lleva la seña hasta la imagen correcta y suéltala encima.' },
    { iconName: 'Check', colorTheme: 'green', title: '4. ¡Completa!', description: 'Si la respuesta es correcta, verás un check verde. Continúa con el resto.' }
];

const InstructionModal = ({ isOpen, onClose, steps = defaultSteps }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            
            // Focus trapping
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Colocar foco inmediatamente sobre el modal cuando se abre
            setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                     focusableElements[0].focus();
                }
            }, 50);
            
            // Pausar el scroll del body
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm shadow-xl transition-all">
            <div 
                ref={modalRef}
                className="bg-white rounded-3xl p-8 max-w-xl w-full relative shadow-2xl animate-fade-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Botón Cerrar (Accesible atrapando el foco) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors focus:ring-2 focus:ring-indigo-500"
                    aria-label="Cerrar ayuda"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 id="modal-title" className="text-3xl font-extrabold text-indigo-800 mb-6 text-center">
                    ¿Cómo jugar?
                </h2>

                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const IconComponent = iconMap[step.iconName] || Check;
                        const theme = themeClasses[step.colorTheme] || themeClasses.blue;
                        
                        return (
                            <div key={index} className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl flex-shrink-0 ${theme}`}>
                                    <IconComponent className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 hover:scale-105 transition-all shadow-md focus:ring-4 focus:ring-indigo-300"
                    >
                        ¡Listos para Aprender!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionModal;
