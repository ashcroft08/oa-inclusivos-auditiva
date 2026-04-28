import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";
import bipError from "../../assets/sounds/error_bip.mp3";
import sonidoCorrectoFile from "../../assets/sounds/correcto.mp3";

// 🔹 Cargar automáticamente las imágenes de señas (asumo que estas funciones están en el archivo)
const senas = import.meta.glob("../../assets/senas/*.{png,jpg,jpeg,webp,JPG}", { eager: true });
const sonidoError = new Audio(bipError);
sonidoError.volume = 0.3; // volumen moderado
const sonidoCorrecto = new Audio(sonidoCorrectoFile);
sonidoCorrecto.volume = 0.3;

const obtenerSena = (nombreBase) => {
    const clave = Object.keys(senas).find((path) =>
        path.toLowerCase().includes(nombreBase)
    );
    return clave ? senas[clave].default : null;
};

// 🔹 Datos del ciclo de vida
const etapasCorrectas = [
    { id: "1", nombre: "Nace", imagen: obtenerSena("nacer") },
    { id: "2", nombre: "Crece", imagen: obtenerSena("crecer") },
    { id: "3", nombre: "Reproduce", imagen: obtenerSena("reproducir") },
    { id: "4", nombre: "Muere", imagen: obtenerSena("morir") },
];

const CiAct2OrdenCicloVida = ({ onComplete }) => {
    const [etapas, setEtapas] = useState(
        [...etapasCorrectas].sort(() => Math.random() - 0.5)
    );
    const [completado, setCompletado] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [movido, setMovido] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Revisa las etapas del ciclo de vida.' },
        { iconName: 'Hand', colorTheme: 'indigo', title: '2. Ordena', description: 'Arrastra las tarjetas a su posición correcta.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Cuando termines, haz clic en "Verificar orden".' }
    ];

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(etapas);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        requestAnimationFrame(() => {
            setEtapas(items);
        });

        // ⭐ MEJORA: Limpiar el mensaje de feedback al interactuar de nuevo
        setMensaje("");
        setMovido(true);
    };

    const verificarOrden = () => {
        if (!movido) {
            setMensaje("👆 Arrastra las imágenes antes de verificar.");
            return;
        }

        const correcto = etapas.every(
            (item, index) => item.id === etapasCorrectas[index].id
        );

        if (correcto) {
            sonidoCorrecto.currentTime = 0;
            sonidoCorrecto.play();   // 🔊 sonido de acierto

            setCompletado(true);
            setMensaje("🎉 ¡Excelente! Ordenaste correctamente las etapas del ciclo de vida.");
            onComplete?.(true);
        }
        else {
            setMensaje("❌ Aún no está en el orden correcto, intenta nuevamente.");
            sonidoError.currentTime = 0;
            sonidoError.play();   // 🔊 reproducir bip
            animarError();        // animación shake
        }

    };

    const animarError = () => {
        const tarjetas = document.querySelectorAll(".tarjeta-etapa");
        tarjetas.forEach((t) => {
            t.classList.add("error-shake");
            setTimeout(() => t.classList.remove("error-shake"), 600);
        });
    };

    const reiniciar = () => {
        setEtapas([...etapasCorrectas].sort(() => Math.random() - 0.5));
        setCompletado(false);
        setMensaje("");
        setMovido(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-yellow-100 flex flex-col items-center justify-center p-6">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-green-800 text-center flex-1">
                    🌱 ¡Ayuda a la naturaleza a seguir su camino!
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-lg text-green-700 mb-4 text-center">
                ✅ Arrastra las imágenes a su lugar correcto: 1, 2, 3 y 4.
            </p>

            <div className="w-full max-w-6xl">

                {/* ⭐ MEJORA: Indicadores de Posición 1, 2, 3, 4 */}
                <div className="flex justify-center gap-6 flex-wrap mb-2">
                    {etapasCorrectas.map((_, index) => (
                        <div key={index} className="w-44 h-8 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-700">Paso {index + 1}</span>
                        </div>
                    ))}
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="etapas" direction="horizontal">
                        {(provided) => (
                            <div
                                className="flex justify-center gap-6 flex-wrap p-4 bg-white/50 rounded-xl shadow-inner"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {etapas.map((etapa, index) => (
                                    <Draggable
                                        key={etapa.id}
                                        draggableId={etapa.id}
                                        index={index}
                                        isDragDisabled={completado}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                }}
                                                className={`tarjeta-etapa flex flex-col items-center bg-white rounded-3xl shadow-lg p-3 w-44 h-48
                                                    ${snapshot.isDragging ? "scale-105 ring-4 ring-green-300 shadow-2xl z-30" : ""}
                                                    ${completado ? "opacity-70 cursor-not-allowed" : "cursor-grab"}
                                                `}
                                            >
                                                <img
                                                    src={etapa.imagen}
                                                    alt={etapa.nombre}
                                                    loading="lazy"
                                                    className="w-full h-32 object-contain mb-2 select-none"
                                                />
                                                <p className="text-base font-semibold text-gray-700 select-none">
                                                    {etapa.nombre}
                                                </p>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Botones */}
            <div className="mt-6 flex gap-4">
                {!completado && (
                    <button
                        onClick={verificarOrden}
                        className={`px-8 py-3 font-bold rounded-full shadow-md transition-all ${!movido ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                            }`}
                        disabled={!movido}
                    >
                        ✅ Verificar orden
                    </button>
                )}

                <button
                    onClick={reiniciar}
                    className="mt-0 px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl 
                    hover:bg-indigo-700 hover:scale-105 transition-all relative group overflow-hidden"
                >
                    <span className="relative z-10">🔄 Reiniciar actividad</span>
                </button>
            </div>

            {/* Mensaje de Feedback */}
            {mensaje && (
                <div
                    className={`mt-6 p-4 rounded-xl shadow-lg text-center ${completado
                        ? "bg-green-200 text-green-800 animate-bounce"
                        : "bg-red-200 text-red-800"
                        }`}
                >
                    <p className="text-xl font-semibold">
                        {mensaje}
                    </p>
                </div>
            )}

            {/* ⭐ Estilos para el shake de error (se puede poner en un archivo CSS global) */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-10px); }
                    40%, 80% { transform: translateX(10px); }
                }
                .error-shake {
                    animation: shake 0.5s ease-in-out;
                    border: 3px solid #ef4444; /* Rojo */
                }
            `}</style>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct2OrdenCicloVida;