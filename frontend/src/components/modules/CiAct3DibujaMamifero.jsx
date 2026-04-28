import React, { useRef, useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// Cargar automáticamente todas las imágenes de ejemplo
const ejemplosImport = import.meta.glob("/src/assets/images/dibujo*.png", { eager: true });
const ejemplosArray = Object.values(ejemplosImport).map((i) => i.default);

// Títulos representativos de cada nivel
const niveles = ["Fácil", "Intermedio", "Difícil"];

// Dimensiones ajustadas para un mejor diseño horizontal
const CANVAS_WIDTH = 650; // Aumentamos el ancho
const CANVAS_HEIGHT = 450; // Mantenemos una altura razonable


const CiAct3DibujaMamifero = ({ onComplete }) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(4);

    const [selectedLevelIndex, setSelectedLevelIndex] = useState(null);
    const [showCompletionOptions, setShowCompletionOptions] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Nivel', description: 'Selecciona la dificultad que prefieras para dibujar.' },
        { iconName: 'Edit2', colorTheme: 'purple', title: '2. Dibuja', description: 'Usa las herramientas de color y tamaño para trazar tu animal.' },
        { iconName: 'Target', colorTheme: 'indigo', title: '3. Guíate', description: 'Observa la imagen de la derecha como guía.' },
        { iconName: 'Check', colorTheme: 'green', title: '4. Finaliza', description: 'Haz clic en "Terminé mi dibujo" para completar.' }
    ];

    // ⭐ CORRECCIÓN CLAVE: initCanvas ya NO depende de color ni brushSize.
    // Solo se encarga de configurar el contexto y el lienzo en blanco.
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Validación de seguridad

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Establecer valores iniciales (o por defecto)
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";

        // Esto limpia el canvas al inicio y al cambiar de nivel
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctxRef.current = ctx;
    }, []); // Array de dependencias vacío para que la función sea estable

    // -----------------------------------------------------
    // EFECTOS DE RENDERIZADO
    // -----------------------------------------------------

    // 1. Inicializa el canvas solo cuando se selecciona un nivel.
    useEffect(() => {
        if (selectedLevelIndex !== null) {
            initCanvas();
        }
    }, [selectedLevelIndex, initCanvas]);

    // 2. ⭐ CLAVE: Actualiza el color y tamaño del pincel SIN borrar el contenido del canvas.
    useEffect(() => {
        if (ctxRef.current) {
            ctxRef.current.strokeStyle = color;
            ctxRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    // -----------------------------------------------------
    // FUNCIONES DE DIBUJO
    // -----------------------------------------------------

    const startDrawing = (e) => {
        if (showCompletionOptions || !ctxRef.current) return;
        setDrawing(true);
        draw(e);
    };

    const endDrawing = () => {
        setDrawing(false);
        if (ctxRef.current) ctxRef.current.beginPath();
    };

    const draw = (e) => {
        if (!drawing || !ctxRef.current) return;

        const nativeEvent = e.nativeEvent;
        // Manejo unificado de eventos de ratón y táctiles
        const touch = nativeEvent.touches ? nativeEvent.touches[0] : nativeEvent;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Calcula las coordenadas relativas al canvas
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
    };

    const limpiarCanvas = () => {
        if (!canvasRef.current || !ctxRef.current) return;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;

        // Limpia el área y la rellena de blanco
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reinicia el camino
        ctx.beginPath();

        setShowCompletionOptions(false);
    };

    const guardarDibujo = () => {
        const enlace = document.createElement("a");
        enlace.download = "mi_mamifero.png";
        enlace.href = canvasRef.current.toDataURL("image/png");
        enlace.click();
    };

    const completarActividad = () => {
        setDrawing(false);
        setShowCompletionOptions(true);
    };

    const backToLevelSelection = () => {
        setSelectedLevelIndex(null);
        setShowCompletionOptions(false);
    }
    // -----------------------------------------------------

    // -----------------------------------------------------
    // VISTA DE SELECCIÓN DE NIVEL
    // -----------------------------------------------------
    if (selectedLevelIndex === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-6">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <h2 className="text-4xl font-bold text-orange-800 text-center">
                        🖼️ Elige tu nivel para dibujar
                    </h2>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-full transition-colors relative z-10"
                    >
                        <HelpCircle className="w-8 h-8" />
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-10">
                    {ejemplosArray.map((img, i) => (
                        <div key={i} className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-xl transition-transform hover:scale-105">
                            <img
                                src={img}
                                alt={`Ejemplo ${niveles[i]}`}
                                className="w-64 h-52 object-contain rounded-xl shadow-inner mb-3"
                            />
                            <p className="mt-2 font-bold text-gray-800 text-xl">{niveles[i]}</p>
                            <button
                                onClick={() => setSelectedLevelIndex(i)}
                                className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all"
                            >
                                Seleccionar este nivel
                            </button>
                        </div>
                    ))}
                </div>
                <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
            </div>
        );
    }

    // -----------------------------------------------------
    // VISTA DE DIBUJO ACTIVA
    // -----------------------------------------------------

    const currentExampleImage = ejemplosArray[selectedLevelIndex];

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-6">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-orange-800 text-center">
                    Dibujando: <span className="text-blue-700">{niveles[selectedLevelIndex]}</span>
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-lg text-orange-700 mb-6 text-center">
                🎨 ¡Sé creativo! Dibuja el mamífero que elegiste.
            </p>

            {/* ⭐ CONTENEDOR PRINCIPAL: Flex en Escritorio, Columna en Móvil */}
            <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-3xl shadow-2xl w-full max-w-7xl">

                {/* 1. COLUMNA IZQUIERDA: CANVAS */}
                <div className="flex flex-col items-center flex-grow">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        // Eventos de ratón
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        // Eventos táctiles
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={endDrawing}
                        className={`border-4 rounded-2xl shadow-inner bg-white ${showCompletionOptions
                                ? "border-green-500 opacity-70 cursor-not-allowed"
                                : "border-orange-400 cursor-crosshair"
                            }`}
                    />
                </div>

                {/* 2. COLUMNA DERECHA: REFERENCIA Y CONTROLES */}
                <div className="flex flex-col items-center justify-start md:w-80 flex-shrink-0">

                    {/* Referencia */}
                    <div className="mb-4 p-2 bg-gray-50 border rounded-xl shadow-inner">
                        <h3 className="text-md font-bold text-center mb-2">Guía {niveles[selectedLevelIndex]}</h3>
                        <img
                            src={currentExampleImage}
                            alt={`Referencia ${niveles[selectedLevelIndex]}`}
                            className="w-40 h-32 object-contain"
                        />
                    </div>

                    {/* Controles de Dibujo */}
                    <div className={`p-4 bg-gray-100 rounded-xl w-full ${showCompletionOptions ? "opacity-50 pointer-events-none" : ""}`}>
                        <h3 className="font-bold text-lg mb-3">Herramientas</h3>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center justify-between gap-2 text-sm">
                                🎨 Color:
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                ✏️ Tamaño ({brushSize}px):
                                <input
                                    type="range"
                                    min="2"
                                    max="12"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    {!showCompletionOptions && (
                        <div className="mt-6 flex flex-col gap-3 w-full">
                            {/* ✅ Terminé (llama a la vista de opciones) */}
                            <button
                                onClick={completarActividad}
                                className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-full shadow-xl hover:bg-green-700 transition-all"
                            >
                                ✅ Terminé mi dibujo
                            </button>

                            {/* 🔄 Limpiar (Azul/Púrpura) */}
                            <button
                                onClick={limpiarCanvas}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl hover:bg-indigo-700 transition-all"
                            >
                                🔄 Limpiar
                            </button>

                            {/* Guardar Borrador (Gris) */}
                            <button
                                onClick={guardarDibujo}
                                className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-full shadow-xl hover:bg-gray-700 transition-all"
                            >
                                💾 Guardar (Borrador)
                            </button>
                        </div>
                    )}

                    {/* ⭐ PANELES DE OPCIONES DE FINALIZACIÓN */}
                    {showCompletionOptions && (
                        <div className="mt-8 p-6 bg-green-50 border-4 border-green-500 rounded-2xl shadow-2xl text-center w-full">
                            <div className="text-5xl mb-3">✨ ¡Excelente trabajo! ✨</div>
                            <p className="text-xl font-semibold text-gray-700 mb-6">
                                ¿Qué deseas hacer ahora?
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        guardarDibujo();
                                        onComplete?.(true);
                                    }}
                                    className="px-10 py-3 bg-green-700 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-800 transition-all"
                                >
                                    💾 Guardar y Finalizar
                                </button>

                                <button
                                    onClick={backToLevelSelection}
                                    className="px-10 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transition-all"
                                >
                                    🖼️ Elegir otro nivel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct3DibujaMamifero;