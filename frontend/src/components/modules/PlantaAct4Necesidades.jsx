import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

const loadImageUrlByName = async (nombreBase) => {
    const key = Object.keys(imagenesImport).find(path =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );
    if (key) {
        const module = await imagenesImport[key]();
        return module.default;
    }
    return null;
};

// Función para desordenar arrays
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- Datos de las Preguntas (Pool) ---
const PREGUNTAS_POOL = [
    {
        id: 'necesidades_planta',
        pregunta: "¿Qué necesita esta planta para vivir?",
        imagenBase: 'planta_feliz (2)',
        correctas: ["Agua", "Sol", "Tierra", "Aire"],
        distractores: ["Azúcar", "Sal", "Refresco", "Nieve", "Piedras", "Helado"],
    },
    {
        id: 'planta_grande',
        pregunta: "¿Cuáles son las plantas más grandes?",
        imagenBase: 'arbol_grande',
        correctas: ["Árboles", "Arbustos"],
        distractores: ["Hierba", "Musgo", "Flores pequeñas", "Cactus enano"],
    },
    {
        id: 'clorofila',
        pregunta: "¿Qué se necesita para la clorofila?",
        imagenBase: 'hoja_verde',
        correctas: ["Luz solar"],
        distractores: ["Oscuridad", "Viento fuerte", "Arena", "Hielo"],
    },
    {
        id: 'partes_flor',
        pregunta: "¿Cuáles son partes de una flor?",
        imagenBase: 'flor_partes',
        correctas: ["Pétalos", "Polen"],
        distractores: ["Tronco", "Raíz profunda", "Corteza", "Espinas"],
    },
    {
        id: 'frutos_planta',
        pregunta: "¿Cuáles son frutos de las plantas?",
        imagenBase: 'planta_fruto',
        correctas: ["Manzana", "Naranja", "Limón"],
        distractores: ["Carne", "Huevo", "Leche", "Queso", "Pescado"],
    },
    {
        id: 'utilidad_planta',
        pregunta: "¿Para qué sirven las plantas?",
        imagenBase: 'planta_feliz_2',
        correctas: ["Dar oxígeno", "Dar alimento", "Dar sombra"],
        distractores: ["Manejar autos", "Usar internet", "Ver televisión", "Jugar videojuegos"],
    }
];

const PlantaAct4Necesidades = ({ onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [currentQuestionData, setCurrentQuestionData] = useState(null); // Datos de la pregunta actual

    const [seleccionadas, setSeleccionadas] = useState([]);
    const [verificado, setVerificado] = useState(false);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Opciones mezcladas para la pregunta actual
    const [opcionesMezcladas, setOpcionesMezcladas] = useState([]);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Lee', description: 'Lee la pregunta y fíjate cuántas opciones son correctas.' },
        { iconName: 'MousePointer', colorTheme: 'green', title: '2. Selecciona', description: 'Toca las palabras que respondan correctamente la pregunta.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar, presiona Verificar para ver tus resultados.' }
    ];

    // --- Función para Cargar UNA Pregunta Aleatoria ---
    const cargarPreguntaAleatoria = useCallback(async () => {
        setLoading(true);
        setVerificado(false);
        setIsPerfect(false);
        setSeleccionadas([]);

        // 1. Seleccionar una pregunta al azar del pool
        const randomIndex = Math.floor(Math.random() * PREGUNTAS_POOL.length);
        const preguntaSeleccionada = PREGUNTAS_POOL[randomIndex];

        // 2. Cargar imagen
        const url = await loadImageUrlByName(preguntaSeleccionada.imagenBase);

        // 3. Mezclar opciones (Correctas + Distractores)
        // Límite de distractores para que no se llene la pantalla
        const maxDistractores = 4;
        const distractoresUsados = shuffleArray(preguntaSeleccionada.distractores).slice(0, maxDistractores);
        const todasOpciones = shuffleArray([...preguntaSeleccionada.correctas, ...distractoresUsados]);

        setCurrentQuestionData({ ...preguntaSeleccionada, imagenUrl: url });
        setOpcionesMezcladas(todasOpciones);
        setLoading(false);
    }, []);

    // --- Carga Inicial ---
    useEffect(() => {
        cargarPreguntaAleatoria();
    }, [cargarPreguntaAleatoria]);

    // --- Lógica de Interacción ---
    const toggleSeleccion = (palabra) => {
        if (verificado) return;
        setSeleccionadas((prev) =>
            prev.includes(palabra)
                ? prev.filter((p) => p !== palabra)
                : [...prev, palabra]
        );
    };

    const verificar = () => {
        if (!currentQuestionData) return;

        const correctas = currentQuestionData.correctas;
        const aciertos = seleccionadas.filter(p => correctas.includes(p));
        const errores = seleccionadas.filter(p => !correctas.includes(p));

        // Condición de éxito: Encontrar TODAS las correctas y CERO errores
        const esPerfecto = (aciertos.length === correctas.length) && (errores.length === 0);

        setVerificado(true);
        setIsPerfect(esPerfecto);

        if (esPerfecto) {
            setTimeout(() => onComplete?.(true), 2000);
        }
    };

    const reiniciar = () => {
        // Carga OTRA pregunta aleatoria
        cargarPreguntaAleatoria();
    };

    if (loading || !currentQuestionData) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-green-700">Cargando pregunta... 🌱</div>;

    const { pregunta, imagenUrl, correctas } = currentQuestionData;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-lime-100 to-yellow-100 p-6">

            <div className="flex items-center justify-center gap-4 mb-4 w-full max-w-4xl">

                <h2 className="text-4xl font-extrabold text-green-800 text-center drop-shadow-sm flex-grow">

                    {pregunta}
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>

            <p className="text-lg text-green-700 mb-6 text-center max-w-xl font-semibold">
                Selecciona las <span className="text-xl text-green-900 font-extrabold">{correctas.length}</span> opciones correctas.
            </p>

            {/* Imagen principal */}
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-8 border-4 border-green-200">
                <img
                    src={imagenUrl}
                    alt="Imagen de la pregunta"
                    className="w-64 h-64 object-contain rounded-2xl"
                />
            </div>

            {/* Opciones */}
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                {opcionesMezcladas.map((palabra) => {
                    const seleccionada = seleccionadas.includes(palabra);
                    const esCorrecta = correctas.includes(palabra);

                    let color = "bg-white";
                    let icono = null;
                    let bordeAdicional = "border-green-500";

                    if (verificado) {
                        if (seleccionada && esCorrecta) {
                            color = "bg-green-300"; icono = "✅"; bordeAdicional = "border-green-600";
                        } else if (seleccionada && !esCorrecta) {
                            color = "bg-red-300"; icono = "❌"; bordeAdicional = "border-red-600";
                        } else if (!seleccionada && esCorrecta) {
                            // Error por omisión
                            color = "bg-yellow-100"; bordeAdicional = "border-yellow-500 border-dashed";
                            icono = "👆";
                        } else {
                            color = "bg-gray-100 opacity-60";
                        }
                    } else if (seleccionada) {
                        color = "bg-lime-200";
                    }

                    return (
                        <button
                            key={palabra}
                            onClick={() => toggleSeleccion(palabra)}
                            disabled={verificado}
                            className={`px-6 py-3 rounded-full shadow-md font-semibold text-lg relative border-2 transition-transform 
                                ${color} ${bordeAdicional}
                                ${verificado ? "opacity-80 cursor-not-allowed" : "hover:scale-105"}`}
                        >
                            {palabra}
                            {icono && (
                                <span className="absolute -top-1 -right-1 text-base bg-white rounded-full p-1 shadow">
                                    {icono}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Botones de control */}
            <div className="flex gap-6 mt-10">
                {!(verificado && isPerfect) && (
                    <button
                        onClick={reiniciar}
                        className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
                    >
                        🔄 Reiniciar actividad
                    </button>
                )}

                {!verificado && (
                    <button
                        onClick={verificar}
                        disabled={seleccionadas.length === 0}
                        className={`px-10 py-4 font-bold rounded-full shadow-xl transition-transform ${seleccionadas.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                            }`}
                    >
                        ✅ Verificar
                    </button>
                )}
            </div>

            {/* Mensaje final de retroalimentación */}
            {verificado && (
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? 'text-green-600' : 'text-red-600'}`}>
                    {isPerfect
                        ? '¡Excelente! Respuesta correcta. 🎉'
                        : '😕 Hay errores. Intenta con otra pregunta.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default PlantaAct4Necesidades;