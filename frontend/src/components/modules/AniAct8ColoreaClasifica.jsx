import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (CORREGIDA) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

const loadImageUrl = async (nombreBase, type = 'lineart') => {
    const fileNamePartial = `${nombreBase}_${type}`.toLowerCase(); 
    
    const key = Object.keys(imagenesImport).find(path => 
        path.toLowerCase().includes(`/${fileNamePartial}.`)
    );

    if (key) {
        const module = await imagenesImport[key]();
        return module.default;
    }
    
    // Fallback (Usará un placeholder si no encuentra la imagen real)
    console.warn(`Imagen no encontrada: ${fileNamePartial}. Usando placeholder.`);
    return `https://via.placeholder.com/150x150/D3D3D3/000000?text=${nombreBase}`;
};


// Función para desordenar (reutilizada)
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


// --- ⭐ POOL DE ANIMALES PARA HÁBITAT (Terrestre vs. Acuático) ⭐ ---
const ANIMAL_POOL_BASE = [
    // Terrestres
    { id: 'lion', name: 'León', imageBase: 'lion', correctHabitat: 'Terrestre' },
    { id: 'dog', name: 'Perro', imageBase: 'dog', correctHabitat: 'Terrestre' },
    { id: 'elephant', name: 'Elefante', imageBase: 'elephant', correctHabitat: 'Terrestre' },
    { id: 'zebra', name: 'Cebra', imageBase: 'zebra', correctHabitat: 'Terrestre' },
    { id: 'giraffe', name: 'Jirafa', imageBase: 'giraffe', correctHabitat: 'Terrestre' },
    { id: 'monkey', name: 'Mono', imageBase: 'monkey', correctHabitat: 'Terrestre' },
    
    // Acuáticos
    { id: 'whale', name: 'Ballena', imageBase: 'whale', correctHabitat: 'Acuático' },
    { id: 'fish', name: 'Pez Payaso', imageBase: 'fish', correctHabitat: 'Acuático' },
    { id: 'shark', name: 'Tiburón', imageBase: 'shark', correctHabitat: 'Acuático' },
    { id: 'octopus', name: 'Pulpo', imageBase: 'octopus', correctHabitat: 'Acuático' },
    { id: 'dolphin', name: 'Delfín', imageBase: 'dolphin', correctHabitat: 'Acuático' },
    { id: 'jellyfish', name: 'Medusa', imageBase: 'jellyfish', correctHabitat: 'Acuático' },
];

const NUM_ANIMALS_TO_SHOW = 6;


const AniAct8ColoreaClasifica = ({ onComplete }) => {
    
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    
    const [userColorSelections, setUserColorSelections] = useState({}); 
    const [animalContent, setAnimalContent] = useState([]); 
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira los animales sin color.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Colorea', description: 'Haz clic en "Terrestre" o "Acuático" para indicar su hábitat y colorearlo.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Verifica tus respuestas usando el botón correspondiente.' }
    ];

    const loadRandomContent = useCallback(async () => {
        setLoading(true);
        setUserColorSelections({});
        setVerified(false);

        const shuffledPool = shuffleArray(ANIMAL_POOL_BASE);
        const animalsForSession = shuffledPool.slice(0, NUM_ANIMALS_TO_SHOW);

        // Carga las imágenes en formato 'lineart' (sin colorear) inicialmente
        const loadedAnimals = await Promise.all(
            animalsForSession.map(async (data) => {
                const imageUrl = await loadImageUrl(data.imageBase, 'lineart');
                return { ...data, imageUrl };
            })
        );
        
        setAnimalContent(loadedAnimals);
        setLoading(false);
    }, []);


    useEffect(() => {
        loadRandomContent();
    }, [loadRandomContent]); 

    // --- Lógica de Interacción "Colorear" (Selección de Hábitat) ---
    const handleColorSelection = (animalId, selectedHabitat) => {
        if (verified) return; 
        setUserColorSelections(prev => ({ ...prev, [animalId]: selectedHabitat }));
    };

    const verify = async () => {
        let allCorrect = true;
        
        const updatedAnimalContent = await Promise.all(
            animalContent.map(async (animal) => {
                const userChoice = userColorSelections[animal.id];
                const isCorrect = userChoice === animal.correctHabitat;

                if (!userChoice || !isCorrect) {
                    allCorrect = false;
                }

                // Si la respuesta es correcta, CAMBIA LA IMAGEN A LA VERSIÓN A COLOR
                if (isCorrect) {
                    const coloredImageUrl = await loadImageUrl(animal.imageBase, 'color');
                    return { ...animal, imageUrl: coloredImageUrl };
                }
                return animal; 
            })
        );

        setAnimalContent(updatedAnimalContent); 
        setVerified(true);
        if (allCorrect) {
            onComplete(true);
        }
    };
    
    const handleRestart = () => {
        loadRandomContent(); 
    };

    // --- Renderizado y Variables ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-blue-700 text-xl">Preparando tus crayones... 🖍️</div>;
    }
    
    const isAllAnswered = animalContent.length > 0 && Object.keys(userColorSelections).length === animalContent.length;
    const isPerfect = verified && animalContent.every(animal => userColorSelections[animal.id] === animal.correctHabitat);


    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center drop-shadow-sm">
                    🎨 Colorea y Clasifica el Hábitat
                </h2>
                <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                Haz clic en el hábitat correcto para "colorear" la imagen.
            </p>

            {/* --- Contenedor de Tarjetas de Colorear --- */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl"> 
                {animalContent.map(animal => {
                    const selectedHabitat = userColorSelections[animal.id];
                    const isCorrect = animal.correctHabitat === selectedHabitat;
                    
                    return (
                        <div 
                            key={animal.id}
                            className={`
                                w-48 p-3 rounded-xl shadow-lg flex flex-col items-center bg-white border-4 transition-all duration-300
                                ${verified ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                            `}
                        >
                            <img 
                                src={animal.imageUrl} 
                                alt={animal.name} 
                                className="w-36 h-36 object-contain mb-3" 
                            />
                            <p className="text-xl font-bold text-gray-800 mb-4">{animal.name}</p> 

                            {/* Botones de Selección que actúan como "Colorear" */}
                            <div className="flex flex-col gap-2 w-full"> 
                                {['Terrestre', 'Acuático'].map(habitatChoice => {
                                    const isChosen = selectedHabitat === habitatChoice;
                                    
                                    const buttonBgColor = 
                                        habitatChoice === 'Terrestre' ? 'bg-amber-600' : 'bg-cyan-600';
                                    const buttonHoverColor = 
                                        habitatChoice === 'Terrestre' ? 'hover:bg-amber-700' : 'hover:bg-cyan-700';

                                    const feedbackBorder = 
                                        verified && isChosen 
                                            ? (isCorrect ? 'border-2 border-green-300' : 'border-2 border-red-300')
                                            : '';

                                    return (
                                        <button
                                            key={habitatChoice}
                                            onClick={() => handleColorSelection(animal.id, habitatChoice)}
                                            disabled={verified}
                                            className={`
                                                w-full py-2 px-4 text-white font-semibold rounded-full shadow-md transition-all duration-200 flex items-center justify-center
                                                ${buttonBgColor} ${buttonHoverColor}
                                                ${isChosen ? 'ring-4 ring-offset-1 ring-blue-400' : ''}
                                                ${verified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                                                ${feedbackBorder}
                                            `}
                                    >
                                        {habitatChoice === 'Terrestre' ? '⛰️ Terrestre' : '🌊 Acuático'}
                                        {verified && isChosen && (isCorrect ? ' ✅' : ' ❌')}
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
                    className="px-10 py-4 bg-purple-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-purple-700"
                >
                    🔄 Nuevo Set
                </button>
            </div>
            
            {/* Mensaje de Feedback */}
            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? 'text-green-600' : 'text-red-600'}`}>
                    {isPerfect 
                        ? '¡Has coloreado perfectamente! 🎉' 
                        : '😕 Hay errores. Revisa las tarjetas rojas e intenta de nuevo.'}
                </p>
            )}
            
            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct8ColoreaClasifica;