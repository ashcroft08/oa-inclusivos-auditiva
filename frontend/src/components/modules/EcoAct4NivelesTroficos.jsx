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

// Función para desordenar
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- ⭐ DATOS DE LA ACTIVIDAD ⭐ ---
const ROLES = [
    { id: 'productor', name: 'Productor ☀️' },
    { id: 'c_primario', name: 'Consumidor Primario 🐖​' },
    { id: 'c_secundario', name: 'Consumidor Secundario ​🐅​' },
    { id: 'descomponedor', name: 'Descomponedor 🍄' },
];

const ORGANISMOS_POOL_ROLES = [
    { id: 'pasto', name: 'Pasto', imageBase: 'pasto_icon', correctRole: 'productor' },
    { id: 'hoja', name: 'Hoja', imageBase: 'hojas_icon', correctRole: 'productor' },

    { id: 'conejo', name: 'Conejo', imageBase: 'conejo_icon', correctRole: 'c_primario' },
    { id: 'vaca', name: 'Vaca', imageBase: 'vaca_icon', correctRole: 'c_primario' },

    { id: 'zorro', name: 'Zorro', imageBase: 'zorro_icon', correctRole: 'c_secundario' },
    { id: 'aguila', name: 'Águila', imageBase: 'aguila_icon', correctRole: 'c_secundario' },

    { id: 'hongo', name: 'Hongo', imageBase: 'hongo_icon', correctRole: 'descomponedor' },
    { id: 'bacteria', name: 'Bacteria', imageBase: 'bacteria_icon', correctRole: 'descomponedor' },
];

const NUM_QUESTIONS = 4; // Mostrar 4 preguntas por sesión


const EcoAct4NivelesTroficos = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [selections, setSelections] = useState({}); // { organismId: 'c_primario', ... }
    const [verified, setVerified] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira el organismo en cada tarjeta.' },
        { iconName: 'MousePointer', colorTheme: 'green', title: '2. Selecciona', description: 'Elige su rol en el ecosistema.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar las 4, presiona Verificar.' }
    ];

    // --- Lógica de Carga Inicial y Aleatoria ---
    const loadRandomQuestions = useCallback(async () => {
        setVerified(false);
        setSelections({});

        // 1. Seleccionar 4 organismos al azar (idealmente uno de cada rol)
        const shuffledPool = shuffleArray(ORGANISMOS_POOL_ROLES);
        const organismsForSession = shuffledPool.slice(0, NUM_QUESTIONS);

        // 2. Cargar imágenes
        const loadedQuestions = await Promise.all(
            organismsForSession.map(async (q) => {
                const imageUrl = await loadImageUrlByName(q.imageBase);
                return { ...q, imageUrl };
            })
        );

        // 3. Barajar el orden de las preguntas
        setQuestions(shuffleArray(loadedQuestions));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomQuestions();
    }, [loadRandomQuestions]);


    // --- Lógica de Interacción ---

    const handleSelectRole = (organismId, roleId) => {
        if (verified) return;
        setSelections(prev => ({ ...prev, [organismId]: roleId }));
    };

    const verify = () => {
        if (Object.keys(selections).length !== NUM_QUESTIONS) {
            alert(`Debes responder las ${NUM_QUESTIONS} preguntas antes de verificar.`);
            return;
        }

        let totalCorrect = 0;

        questions.forEach(q => {
            if (selections[q.id] === q.correctRole) {
                totalCorrect++;
            }
        });

        const isFullyCorrect = totalCorrect === NUM_QUESTIONS;

        setVerified(true);

        if (isFullyCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        loadRandomQuestions(); // Carga un nuevo set aleatorio
    };

    // --- Renderizado Auxiliar ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-green-700 text-xl">Cargando roles tróficos... 🔄</div>;
    }

    const isAllAnswered = Object.keys(selections).length === NUM_QUESTIONS;
    const finalCheck = verified && questions.every(q => selections[q.id] === q.correctRole);


    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-teal-50 to-green-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-5xl">
                <h2 className="text-4xl font-extrabold text-teal-800 text-center drop-shadow-sm flex-grow">
                    ✨ ¿Cuál es el trabajo de cada amigo en la naturaleza?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                🎯 ¡Clasifica si son Productores, Consumidores o Descomponedores!
            </p>

            <div className="grid grid-cols-1 gap-10 w-full max-w-5xl">
                {questions.map((q, index) => {
                    const selectedRole = selections[q.id];

                    return (
                        <div
                            key={q.id}
                            className="p-4 bg-white rounded-xl shadow-xl flex flex-col md:flex-row items-center transition-all duration-300"
                        >
                            {/* Imagen del Organismo (Izquierda) */}
                            <div className="md:w-1/4 flex flex-col items-center p-3 border-r border-gray-200 md:mr-4">
                                <span className="text-sm font-bold text-teal-600 mb-2">Pregunta {index + 1}</span>
                                <img
                                    src={q.imageUrl}
                                    alt={q.name}
                                    className="w-36 h-36 object-contain rounded-2xl drop-shadow-md bg-white"
                                />
                                <p className="font-extrabold text-xl mt-3 text-center text-teal-900">{q.name}</p>
                            </div>

                            {/* Opciones de Roles (Derecha) */}
                            <div className="md:w-3/4 flex flex-wrap justify-center gap-4 p-3">
                                {ROLES.map(role => {
                                    const isChosen = selectedRole === role.id;
                                    const isCorrect = q.correctRole === role.id;

                                    let style = 'bg-teal-100 hover:bg-teal-200';

                                    if (verified) {
                                        if (isCorrect) style = 'bg-green-500 text-white';
                                        else if (isChosen) style = 'bg-red-500 text-white';
                                        else style = 'bg-gray-200 opacity-60';
                                    } else if (isChosen) {
                                        style = 'bg-teal-400 text-white ring-2 ring-teal-600';
                                    }

                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleSelectRole(q.id, role.id)}
                                            disabled={verified}
                                            className={`
                                                px-4 py-2 font-semibold text-base rounded-full transition-all duration-200 shadow-sm
                                                ${style} ${verified ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {role.name}
                                            {verified && (isCorrect || isChosen) && (
                                                <span className="ml-1">{isCorrect ? '✅' : '❌'}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- Botones de Control y Feedback --- */}
            <div className="mt-10 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || !isAllAnswered}
                    className={`px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition-all ${verified || !isAllAnswered ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                        }`}
                >
                    ✅ Verificar Respuestas
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {verified && (
                <p className={`mt-6 text-2xl font-bold ${finalCheck ? "text-green-600" : "text-red-600"}`}>
                    {finalCheck
                        ? "¡Clasificación Perfecta! 🎉"
                        : "😕 Hay errores. Revisa los roles asignados e intenta de nuevo."}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct4NivelesTroficos;