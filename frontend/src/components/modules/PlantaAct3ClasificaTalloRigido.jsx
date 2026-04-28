import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}");

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

// Helper para desordenar arrays 
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


// --- Datos de la Actividad ---
const TALLO_DATA = [
    // --- PINOS (Rígido) ---
    { id: 'pino_1', name: 'Pino', imageBase: 'pino_1', correct: 'R' },
    { id: 'pino_2', name: 'Pino', imageBase: 'pino_2', correct: 'R' },
    { id: 'pino_3', name: 'Pino', imageBase: 'pino_3', correct: 'R' },
    { id: 'pino_4', name: 'Pino', imageBase: 'pino_4', correct: 'R' },

    // --- SAUCES (Rígido) ---
    { id: 'sauce_1', name: 'Sauce', imageBase: 'sauce_1', correct: 'R' },
    { id: 'sauce_2', name: 'Sauce', imageBase: 'sauce_2', correct: 'R' },
    { id: 'sauce_3', name: 'Sauce', imageBase: 'sauce_3', correct: 'R' },
    { id: 'sauce_4', name: 'Sauce', imageBase: 'sauce_4', correct: 'R' },

    // --- ROBLES (Rígido) ---
    { id: 'roble_1', name: 'Roble', imageBase: 'roble_1', correct: 'R' },
    { id: 'roble_2', name: 'Roble', imageBase: 'roble_2', correct: 'R' },
    { id: 'roble_3', name: 'Roble', imageBase: 'roble_3', correct: 'R' },
    { id: 'roble_4', name: 'Roble', imageBase: 'roble_4', correct: 'R' },

    // --- MAÍZ (Flexible) ---
    { id: 'maiz_1', name: 'Maíz', imageBase: 'maiz_1', correct: 'F' },
    { id: 'maiz_2', name: 'Maíz', imageBase: 'maiz_2', correct: 'F' },
    { id: 'maiz_3', name: 'Maíz', imageBase: 'maiz_3', correct: 'F' },
    { id: 'maiz_4', name: 'Maíz', imageBase: 'maiz_4', correct: 'F' },

    // --- MENTA (Flexible) ---
    { id: 'menta_1', name: 'Menta', imageBase: 'menta_1', correct: 'F' },
    { id: 'menta_2', name: 'Menta', imageBase: 'menta_2', correct: 'F' },
    { id: 'menta_3', name: 'Menta', imageBase: 'menta_3', correct: 'F' },
    { id: 'menta_4', name: 'Menta', imageBase: 'menta_4', correct: 'F' },

    // --- PASTO (Flexible) ---
    { id: 'pasto_1', name: 'Pasto', imageBase: 'pasto_1', correct: 'F' },
    { id: 'pasto_2', name: 'Pasto', imageBase: 'pasto_2', correct: 'F' },
    { id: 'pasto_3', name: 'Pasto', imageBase: 'pasto_3', correct: 'F' },
    { id: 'pasto_4', name: 'Pasto', imageBase: 'pasto_4', correct: 'F' },
];


const PlantaAct3ClasificaTalloRigido = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);

    // ⭐ ESTADO PRINCIPAL: { plantaId: 'R' | 'F' }
    const [userSelections, setUserSelections] = useState({});
    const [plantasContent, setPlantasContent] = useState([]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira la imagen de cada planta y piensa en su tallo.' },
        { iconName: 'MousePointer', colorTheme: 'green', title: '2. Selecciona', description: 'Toca R si es Rígido, o F si es Flexible.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Cuando clasifiques todas, verifica.' }
    ];


    const cargarPlantas = async () => {
        setLoading(true);
        // Seleccionar 3 plantas rígidas y 3 flexibles de forma aleatoria (6 en total cada partida)
        const rigidos = shuffleArray(TALLO_DATA.filter(p => p.correct === 'R')).slice(0, 3);
        const flexibles = shuffleArray(TALLO_DATA.filter(p => p.correct === 'F')).slice(0, 3);
        const selectedPlants = [...rigidos, ...flexibles];

        const loadedPlants = await Promise.all(
            selectedPlants.map(async item => {
                const url = await loadImageUrlByName(item.imageBase);
                return { ...item, imageUrl: url };
            })
        );
        // Cargar el contenido (incluso sin imagen) y mezclar el orden de las tarjetas
        setPlantasContent(shuffleArray(loadedPlants));
        setLoading(false);
    };

    // --- Lógica de Carga Inicial y Mezcla ---
    useEffect(() => {
        cargarPlantas();
    }, []);

    // --- Lógica de Interacción ---

    const handleSelection = (plantaId, choice) => {
        if (verified) return;
        setUserSelections(prev => ({ ...prev, [plantaId]: choice }));
    };

    const verify = () => {
        let allCorrect = true;

        plantasContent.forEach(planta => {
            if (userSelections[planta.id] !== planta.correct) {
                allCorrect = false;
            }
        });

        setVerified(true);
        if (allCorrect) {
            onComplete(true);
        }
    };

    const handleRestart = () => {
        setUserSelections({});
        setVerified(false);
        // Cargar 6 nuevas plantas aleatorias
        cargarPlantas();
    };

    // --- Renderizado ---

    if (loading) {
        return <div className="min-h-screen"></div>;
    }

    // Se requiere que todas las plantas sean clasificadas antes de verificar
    const isAllAnswered = Object.keys(userSelections).length === plantasContent.length;
    const isPerfect = verified && Object.keys(userSelections).every(id => userSelections[id] === TALLO_DATA.find(a => a.id === id).correct);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-6xl">
                <h2 className="text-4xl font-extrabold text-green-800 text-center flex-grow">
                    🌿 R = Rígido (¡Duro!) | F = Flexible (¡Blandito!)
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-700 mb-8">
                ✅ ¡Ponle su etiqueta secreta a cada una!
            </p>

            {/* --- Contenedor de Tarjetas de Clasificación --- */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl">
                {plantasContent.map(planta => {
                    const selected = userSelections[planta.id];
                    const isCorrect = planta.correct === selected;

                    return (
                        <div
                            key={planta.id}
                            className={`
                                w-44 p-4 rounded-xl shadow-lg flex flex-col items-center bg-white border-4 transition-all duration-300
                                ${verified ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                            `}
                        >
                            {/* ⭐ IMAGEN GRANDE Y DOMINANTE O PLACEHOLDER DE AYUDA */}
                            {planta.imageUrl ? (
                                <img
                                    src={planta.imageUrl}
                                    alt={planta.name}
                                    className="w-32 h-32 object-contain mb-3"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center mb-3 rounded-lg">
                                    <span className="text-gray-500 text-xs text-center px-2 font-mono">
                                        Falta imagen:<br />
                                        <b className="text-gray-800">{planta.imageBase}.png|jpg</b>
                                    </span>
                                </div>
                            )}
                            <p className="text-xl font-bold text-gray-700 mb-3">{planta.name}</p>

                            {/* Botones de Selección R/F */}
                            <div className="flex gap-4">
                                {['R', 'F'].map(choice => {
                                    const isChosen = selected === choice;
                                    const feedbackStyle = isChosen && verified
                                        ? (isCorrect ? 'bg-green-600' : 'bg-red-600')
                                        : (isChosen ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400');

                                    const feedbackIcon = isChosen && verified ? (isCorrect ? '✅' : '❌') : '';

                                    return (
                                        <button
                                            key={choice}
                                            onClick={() => handleSelection(planta.id, choice)}
                                            disabled={verified}
                                            className={`
                                                w-14 h-14 text-2xl font-extrabold text-white rounded-full transition-colors relative
                                                ${feedbackStyle}
                                                ${verified ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {choice}
                                            {feedbackIcon && (
                                                <span className="absolute -top-2 -right-2 text-sm bg-white rounded-full p-1 shadow-md">
                                                    {feedbackIcon}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- Botones de Control --- */}
            <div className="mt-10 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || !isAllAnswered}
                    className={`px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || !isAllAnswered ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                    ✅ Verificar Clasificación
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar
                </button>
            </div>

            {/* Mensaje de Feedback */}
            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? 'text-green-600' : 'text-red-600'}`}>
                    {isPerfect
                        ? '¡Clasificación Perfecta! 🎉'
                        : '😕 Hay errores. Revisa las tarjetas rojas e intenta de nuevo.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default PlantaAct3ClasificaTalloRigido;