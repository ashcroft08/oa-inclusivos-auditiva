import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

const loadImageUrl = async (nombreBase) => {
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


// --- ⭐ POOL DE ANIMALES AMPLIADO (BASE DE DATOS) ⭐ ---
const ANIMAL_POOL_BASE = [
    // Ovíparos (O)
    { id: 'chicken', name: 'Gallina', imageBase: 'chicken_icon', correct: 'O' },
    { id: 'fish', name: 'Pez', imageBase: 'fish_icon', correct: 'O' },
    { id: 'turtle', name: 'Tortuga', imageBase: 'turtle_icon', correct: 'O' },
    { id: 'frog', name: 'Rana', imageBase: 'frog_icon', correct: 'O' },
    { id: 'snake', name: 'Serpiente', imageBase: 'snake_icon', correct: 'O' },
    { id: 'penguin', name: 'Pingüino', imageBase: 'penguin_icon', correct: 'O' },

    // Vivíparos (V)
    { id: 'cow', name: 'Vaca', imageBase: 'cow_icon', correct: 'V' },
    { id: 'dog', name: 'Perro', imageBase: 'dog_icon', correct: 'V' },
    { id: 'whale', name: 'Ballena', imageBase: 'whale_icon', correct: 'V' },
    { id: 'lion', name: 'León', imageBase: 'lion_icon', correct: 'V' },
    { id: 'cat', name: 'Gato', imageBase: 'cat_icon', correct: 'V' },
    { id: 'bear', name: 'Oso', imageBase: 'bear_icon', correct: 'V' },
];

const NUM_ANIMALS_TO_SHOW = 6; // Mostrar 6 animales al azar por sesión


const AniAct7ClasificarReproduccion = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);

    const [userSelections, setUserSelections] = useState({});
    // ⭐ El estado 'animalContent' ahora contendrá el set aleatorio de la sesión
    const [animalContent, setAnimalContent] = useState([]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira al animal en cada tarjeta.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Selecciona', description: 'Haz clic en la letra "O" si es ovíparo (huevo) o en la letra "V" si es vivíparo (vientre).' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Verifica tus respuestas usando el botón.' }
    ];

    // --- ⭐ LÓGICA DE CARGA ALEATORIA Y ÚNICA ⭐ ---
    const loadRandomContent = useCallback(async () => {
        setLoading(true);
        setUserSelections({});
        setVerified(false);

        // 1. Seleccionar un subconjunto aleatorio del pool
        const shuffledPool = shuffleArray(ANIMAL_POOL_BASE);
        const animalsForSession = shuffledPool.slice(0, NUM_ANIMALS_TO_SHOW);

        // 2. Cargar las URLs de las imágenes
        const loadedAnimals = await Promise.all(
            animalsForSession.map(async (data) => {
                const imageUrl = await loadImageUrl(data.imageBase);
                return { ...data, imageUrl };
            })
        );

        // 3. Actualizar el estado de contenido
        setAnimalContent(loadedAnimals);
        setLoading(false);
    }, []);


    useEffect(() => {
        loadRandomContent();
    }, [loadRandomContent]); // Se ejecuta al montar y al reiniciar

    // --- Lógica de Interacción ---

    const handleSelection = (animalId, choice) => {
        if (verified) return;
        setUserSelections(prev => ({ ...prev, [animalId]: choice }));
    };

    const verify = () => {
        let allCorrect = true;

        // Usamos animalContent (el set actual de la sesión) para verificar
        animalContent.forEach(animal => {
            // También verificamos que todos hayan sido respondidos
            if (userSelections[animal.id] !== animal.correct || !userSelections[animal.id]) {
                allCorrect = false;
            }
        });

        setVerified(true);
        if (allCorrect) {
            onComplete(true);
        }
    };

    const handleRestart = () => {
        // ⭐ Reinicia el juego cargando un NUEVO set aleatorio
        loadRandomContent();
    };

    // --- Renderizado y Variables ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-pink-700 text-xl">Cargando animales... 🐣</div>;
    }

    // Si la actividad está cargada, la longitud de userSelections debe coincidir con el contenido
    const isAllAnswered = animalContent.length > 0 && Object.keys(userSelections).length === animalContent.length;

    // Calcula si el set actual es perfecto
    const isPerfect = verified && animalContent.every(animal => userSelections[animal.id] === animal.correct);


    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-extrabold text-pink-800 text-center drop-shadow-sm">
                    🐣 ¿Cómo nace cada animalito?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-pink-600 hover:text-pink-800 hover:bg-pink-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                ✨ ¡Elige O si sale de un huevo o V si nace de mamá!
            </p>

            {/* --- Contenedor de Tarjetas de Clasificación --- */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl">
                {animalContent.map(animal => {
                    const selected = userSelections[animal.id];
                    const isCorrect = animal.correct === selected;

                    return (
                        <div
                            key={animal.id}
                            className={`
                                w-40 p-2 rounded-xl shadow-lg flex flex-col items-center bg-white border-4 transition-all duration-300
                                ${verified ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                            `}
                        >
                            <img
                                src={animal.imageUrl}
                                alt={animal.name}
                                className="w-32 h-32 object-contain mb-2"
                            />
                            <p className="text-lg font-bold text-gray-700 mb-3">{animal.name}</p>

                            {/* Botones de Selección O/V */}
                            <div className="flex gap-4">
                                {['O', 'V'].map(choice => {
                                    const isChosen = selected === choice;
                                    const feedbackStyle = isChosen && verified
                                        ? (isCorrect ? 'bg-green-600' : 'bg-red-600')
                                        : (isChosen ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400');

                                    const feedbackIcon = isChosen && verified ? (isCorrect ? '✅' : '❌') : '';

                                    return (
                                        <button
                                            key={choice}
                                            onClick={() => handleSelection(animal.id, choice)}
                                            disabled={verified}
                                            className={`
                                                w-12 h-12 text-xl font-extrabold text-white rounded-full transition-colors relative
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
                    ✅ Verificar Respuestas
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
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

export default AniAct7ClasificarReproduccion;