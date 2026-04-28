import React, { useState, useEffect, useCallback, useMemo } from "react";
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


// --- DIET POOL CENTRALIZADO (Para selección aleatoria) ---
const DIET_POOL = [
    // Carnívoros
    { id: 'leon', name: 'LEÓN', imageBase: 'leon_icon', diet: ['carne_icon', 'hueso_icon'], type: 'CARNÍVORO' },
    { id: 'tigre', name: 'TIGRE', imageBase: 'tigre_icon', diet: ['carne_icon', 'pez_icon'], type: 'CARNÍVORO' },
    { id: 'aguila', name: 'ÁGUILA', imageBase: 'aguila_icon', diet: ['raton_icon', 'pez_icon'], type: 'CARNÍVORO' },

    // Herbívoros
    { id: 'vaca', name: 'VACA', imageBase: 'vaca_icon', diet: ['pasto_icon', 'manzana_icon'], type: 'HERBÍVORO' },
    { id: 'jirafa', name: 'JIRAFA', imageBase: 'jirafa_icon', diet: ['pasto_icon', 'hojas_icon'], type: 'HERBÍVORO' },
    { id: 'conejo', name: 'CONEJO', imageBase: 'conejo_icon', diet: ['zanahoria_icon', 'hojas_icon'], type: 'HERBÍVORO' },

    // Omnívoros
    { id: 'cerdo', name: 'CERDO', imageBase: 'cerdo_icon', diet: ['maiz_icon', 'restos_icon', 'carne_icon'], type: 'OMNÍVORO' },
    { id: 'oso', name: 'OSO', imageBase: 'oso_icon', diet: ['pez_icon', 'manzana_icon', 'hueso_icon'], type: 'OMNÍVORO' },
];

// Pool de todos los alimentos posibles
const ALL_FOODS = [
    { id: 'carne_icon', name: 'Carne' },
    { id: 'hueso_icon', name: 'Hueso' },
    { id: 'zanahoria_icon', name: 'Zanahoria' },
    { id: 'pasto_icon', name: 'Pasto' },
    { id: 'raton_icon', name: 'Ratón' },
    { id: 'maiz_icon', name: 'Maíz' },
    { id: 'restos_icon', name: 'Restos' },
    { id: 'pez_icon', name: 'Pez' },
    { id: 'hojas_icon', name: 'Hojas' },
    { id: 'manzana_icon', name: 'Manzana' },
];

const VALID_FOODS_BY_TYPE = {
    'CARNÍVORO': ['carne_icon', 'hueso_icon', 'pez_icon', 'raton_icon'],
    'HERBÍVORO': ['pasto_icon', 'manzana_icon', 'zanahoria_icon', 'hojas_icon', 'maiz_icon'],
    'OMNÍVORO': ['carne_icon', 'hueso_icon', 'pez_icon', 'raton_icon', 'pasto_icon', 'manzana_icon', 'zanahoria_icon', 'hojas_icon', 'maiz_icon', 'restos_icon']
};

const AniAct5UnirComida = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [isVerificationPerfect, setIsVerificationPerfect] = useState(false);

    const [sessionAnimal, setSessionAnimal] = useState(null);
    const [sessionFoods, setSessionFoods] = useState([]);
    const [foodLocations, setFoodLocations] = useState({});
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Hand', colorTheme: 'blue', title: '1. Agarra', description: 'Haz clic y mantén presionado un alimento disponible.' },
        { iconName: 'Target', colorTheme: 'indigo', title: '2. Arrastra', description: 'Llévalo hacia el animal que lo come y suéltalo allí.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Usa el botón para comprobar la dieta.' }
    ];

    const NUM_FOODS_TO_SHOW = 4;
    const ANIMAL_ID = sessionAnimal ? sessionAnimal.id : 'target';

    // --- LÓGICA DE CARGA ALEATORIA Y ÚNICA ---
    const loadRandomSession = useCallback(async () => {
        setLoading(true);
        setVerified(false);
        setIsVerificationPerfect(false);
        setFoodLocations({});

        // 1. Seleccionar 1 animal único
        const selectedAnimalBase = shuffleArray(DIET_POOL)[0];
        const requiredFoodIds = new Set(selectedAnimalBase.diet);

        // 2. Seleccionar los alimentos requeridos y distractores (Total 4)
        let finalFoods = ALL_FOODS.filter(food => requiredFoodIds.has(food.id));
        const distractorFoods = ALL_FOODS.filter(food => !requiredFoodIds.has(food.id));

        // Rellenar con distractores hasta NUM_FOODS_TO_SHOW
        const remainingSlots = NUM_FOODS_TO_SHOW - finalFoods.length;
        if (remainingSlots > 0) {
            finalFoods = finalFoods.concat(shuffleArray(distractorFoods).slice(0, remainingSlots));
        }

        finalFoods = finalFoods.slice(0, NUM_FOODS_TO_SHOW);

        // 3. Cargar assets
        const allAssetsToLoad = [selectedAnimalBase.imageBase, ...finalFoods.map(f => f.id)];
        const loadedAssets = {};

        await Promise.all(allAssetsToLoad.map(async base => {
            loadedAssets[base] = await loadImageUrl(base);
        }));

        // 4. Inicializar estado de comida en 'source'
        const initialLocations = finalFoods.reduce((acc, food) => {
            acc[food.id] = 'source';
            return acc;
        }, {});

        // 5. Actualizar estados
        setSessionAnimal({ ...selectedAnimalBase, imageUrl: loadedAssets[selectedAnimalBase.imageBase] });
        setSessionFoods(shuffleArray(finalFoods).map(f => ({ ...f, imageUrl: loadedAssets[f.id] })));
        setFoodLocations(initialLocations);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomSession();
    }, [loadRandomSession]);

    // --- Definiciones de variables de UI y Lógica de Arrastre ---

    const unassignedFood = sessionFoods.filter(food => foodLocations[food.id] === 'source');
    const assignedFood = sessionFoods.filter(food => foodLocations[food.id] === ANIMAL_ID);

    const animalValidFoods = sessionAnimal ? VALID_FOODS_BY_TYPE[sessionAnimal.type] : [];
    const availableCorrectFoods = sessionFoods.filter(f => animalValidFoods.includes(f.id));
    
    const missingRequired = sessionAnimal ? availableCorrectFoods.some(correctFood => foodLocations[correctFood.id] !== ANIMAL_ID) : false;
    const hasWrong = sessionAnimal ? assignedFood.some(f => !animalValidFoods.includes(f.id)) : false;

    // 1. Inicia el arrastre (la comida es la fuente)
    const handleFoodDragStart = (e, foodId) => {
        if (verified) return;
        e.dataTransfer.setData("foodId", foodId);
        e.currentTarget.classList.add('opacity-50', 'ring-2', 'ring-orange-500');
    };

    // 2. Drop en el animal (el animal es el destino)
    const handleAnimalDrop = (e) => {
        e.preventDefault();
        if (verified) return;

        const foodId = e.dataTransfer.getData("foodId");
        if (!foodId) return;

        setFoodLocations(prev => ({ ...prev, [foodId]: ANIMAL_ID }));
    };

    // 3. Drop en la zona de origen (para corregir)
    const handleSourceDrop = (e) => {
        e.preventDefault();
        if (verified) return;

        const foodId = e.dataTransfer.getData("foodId");

        if (foodId) {
            setFoodLocations(prev => ({ ...prev, [foodId]: 'source' }));
        }
    };

    // Maneja clic en el alimento ASIGNADO para devolverlo al source
    const handleAssignedFoodClick = (foodId) => {
        if (verified) return;
        setFoodLocations(prev => ({ ...prev, [foodId]: 'source' }));
    };

    // Permite el drop
    const handleDragOver = (e) => { e.preventDefault(); };


    // --- LÓGICA DE VERIFICACIÓN ---

    const verify = () => {
        const animal = sessionAnimal;
        const animalValidFoods = VALID_FOODS_BY_TYPE[animal.type] || [];
        
        let isPerfect = true;
        
        const assignedFoods = sessionFoods.filter(food => foodLocations[food.id] === ANIMAL_ID);
        const availableCorrectFoods = sessionFoods.filter(food => animalValidFoods.includes(food.id));
        
        const hasWrongFood = assignedFoods.some(food => !animalValidFoods.includes(food.id));
        
        const missingRequiredFood = availableCorrectFoods.some(correctFood => 
            !assignedFoods.some(food => food.id === correctFood.id)
        );
        
        if (hasWrongFood || missingRequiredFood) {
            isPerfect = false;
        }

        setVerified(true);
        setIsVerificationPerfect(isPerfect);

        if (isPerfect) {
            onComplete(true);
        }
    };

    const handleNewSession = () => {
        loadRandomSession();
    };


    // --- RENDERING ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-xl text-indigo-800">Cargando la cadena alimenticia... 🍽️</div>;
    }

    const animalDropClass = verified
        ? (isVerificationPerfect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
        : 'border-blue-500 hover:border-green-500 hover:bg-blue-50';

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-orange-800 text-center drop-shadow">
                    🍖 ¡Busca los alimentos perfectos del {sessionAnimal.name}!
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-gray-700 mb-8 font-medium">
                ✅ Arrastra la comida que come
            </p>

            {/* --- SECCIÓN PRINCIPAL: Alimentos Izquierda, Animal Derecha --- */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl items-start">

                {/* ⭐ 1. DROP SOURCES & RETURN TARGET: ALIMENTOS (IZQUIERDA) ⭐ */}
                <div
                    onDrop={handleSourceDrop}
                    onDragOver={handleDragOver}
                    className="md:w-1/2 w-full bg-gray-100 p-6 rounded-xl shadow-lg border-4 border-dashed border-gray-400 min-h-[300px]"
                >
                    <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                        Comida Disponible ({unassignedFood.length} / {sessionFoods.length})
                    </h3>

                    <div className="flex flex-wrap justify-center gap-4">
                        {unassignedFood.map(food => (
                            <div
                                key={food.id}
                                draggable={!verified}
                                onDragStart={(e) => handleFoodDragStart(e, food.id)}
                                onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50', 'ring-2', 'ring-orange-500')}
                                className={`
                                    p-4 rounded-lg flex flex-col items-center cursor-grab transition-all duration-200
                                    ${verified ? 'bg-gray-50 opacity-50' : 'bg-white hover:bg-yellow-100'}
                                    border border-gray-300
                                `}
                            >
                                <img
                                    src={food.imageUrl}
                                    alt={food.name}
                                    // ⭐ IMÁGENES DE COMIDA MÁS GRANDES
                                    className="w-20 h-20 object-contain"
                                />
                                <p className="text-base font-semibold mt-1">{food.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ⭐ 2. ANIMAL DROP TARGET (DERECHA) ⭐ */}
                <div className="md:w-1/2 w-full flex flex-col items-center">
                    <div
                        onDrop={handleAnimalDrop}
                        onDragOver={handleDragOver}
                        // ⭐ CONTENEDOR DEL ANIMAL CON TAMAÑO MÁS PEQUEÑO Y CENTRADO
                        className={`
                            w-full md:w-80 p-4 flex flex-col items-center rounded-xl shadow-2xl transition-all duration-300 border-4 border-dashed
                            ${animalDropClass}
                        `}
                    >
                        <img
                            src={sessionAnimal.imageUrl}
                            alt={sessionAnimal.name}
                            // ⭐ IMAGEN DE ANIMAL MÁS GRANDE (tamaño real del png)
                            className="w-64 h-64 object-contain"
                        />
                        <h3 className="mt-4 text-4xl font-extrabold text-orange-700">{sessionAnimal.name}</h3>
                        <p className="text-lg text-gray-500">Tipo: {sessionAnimal.type}</p>
                    </div>

                    {/* ZONA DE ALIMENTOS ASIGNADOS */}
                    <div className="mt-6 p-4 w-full bg-white rounded-xl shadow-inner border border-gray-300 min-h-[150px]">
                        <h4 className="text-lg font-bold text-gray-700 mb-2 text-center">Alimentos asignados:</h4>
                        <div className="flex flex-wrap justify-center gap-3">
                            {assignedFood.map(food => {
                                const isCorrect = VALID_FOODS_BY_TYPE[sessionAnimal.type].includes(food.id);
                                let itemClass = 'bg-blue-100 border-blue-400';

                                if (verified) {
                                    itemClass = isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
                                }

                                return (
                                    <div
                                        key={food.id}
                                        onClick={() => handleAssignedFoodClick(food.id)}
                                        className={`
                                            p-3 rounded-lg flex flex-col items-center text-center text-base font-semibold border-2 cursor-pointer
                                            ${itemClass}
                                        `}
                                    >
                                        <img
                                            src={food.imageUrl}
                                            alt={food.name}
                                            // ⭐ IMÁGENES DE COMIDA ASIGNADA MÁS GRANDES
                                            className="w-16 h-16 object-contain"
                                        />
                                        {food.name}
                                        {verified && <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Botones de Control --- */}
            <div className="mt-10 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified}
                    className={`px-10 py-4 text-white font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    ✅ Verificar Dieta
                </button>

                <button
                    onClick={handleNewSession}
                    className={`px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700`}
                >
                    🔄 Nueva Dieta
                </button>
            </div>

            {/* Mensaje de Feedback */}
            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isVerificationPerfect ? 'text-green-600' : 'text-red-600'}`}>
                    {isVerificationPerfect
                        ? '¡Clasificación de Dieta Perfecta! 🎉'
                        : (hasWrong || missingRequired)
                            ? (hasWrong ? '❌ Tienes alimentos incorrectos asignados. ' : '') + (missingRequired ? '👆 Te faltó asignar comida esencial.' : '')
                            : '¡Clasificación de Dieta Perfecta! 🎉'
                    }
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct5UnirComida;