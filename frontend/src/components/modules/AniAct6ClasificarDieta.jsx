import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

const loadImageUrl = async (nombreBase) => {
    const key = Object.keys(imagenesImport).find((path) =>
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

// --- Datos Maestros y Configuración ---
const DIET_GROUPS = ["herbivoros", "carnivoros", "omnivoros"];
const NUM_ANIMALS_TO_SHOW = 9; // Mostrar 9 animales en el tablero

const ANIMAL_POOL_BASE = [
    // Herbívoros
    { id: "cow", name: "Vaca", imageBase: "cow_icon", diet: "herbivoros" },
    { id: "hippo", name: "Hipopótamo", imageBase: "hippo_icon", diet: "herbivoros" },
    { id: "zebra", name: "Cebra", imageBase: "zebra_icon", diet: "herbivoros" },
    { id: "jirafa", name: "Jirafa", imageBase: "jirafa_icon", diet: "herbivoros" },
    { id: "conejo", name: "Conejo", imageBase: "conejo_icon", diet: "herbivoros" },

    // Carnívoros
    { id: "wolf_cub", name: "Cachorro de Lobo", imageBase: "wolf_cub_icon", diet: "carnivoros" },
    { id: "wolf", name: "Lobo", imageBase: "wolf_icon", diet: "carnivoros" },
    { id: "tiger", name: "Tigre", imageBase: "tiger_icon", diet: "carnivoros" },
    { id: "leon", name: "León", imageBase: "leon_icon", diet: "carnivoros" },
    { id: "cocodrilo", name: "Cocodrilo", imageBase: "cocodrilo_icon", diet: "carnivoros" },

    // Omnívoros
    { id: "wild_boar", name: "Jabalí", imageBase: "wild_boar_icon", diet: "omnivoros" },
    { id: "bear", name: "Oso", imageBase: "bear_icon", diet: "omnivoros" },
    { id: "chicken", name: "Gallina", imageBase: "chicken_icon", diet: "omnivoros" },
    { id: "cerdo", name: "Cerdo", imageBase: "cerdo_icon", diet: "omnivoros" },
];


const AniAct6ClasificarDietaClick = ({ onComplete }) => {

    const [allAnimals, setAllAnimals] = useState([]); // Animales seleccionados y con URL
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState({}); // { animalId: 'groupName', ... }
    const [verified, setVerified] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState(null); // ID del animal seleccionado
    const [assets, setAssets] = useState({}); // Assets guía
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Haz clic en el animal primero.' },
        { iconName: 'Target', colorTheme: 'indigo', title: '2. Ubica', description: 'Haz clic en la caja de la dieta correspondiente (Herbívoro, Carnívoro, Omnívoro).' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Comprueba que todos estén en su lugar correcto.' }
    ];

    // --- ⭐ LÓGICA ALEATORIA Y DE CARGA ⭐ ---

    // Función para asignar una ubicación inicial aleatoria para mezclar el tablero
    const assignRandomLocations = useCallback((animals) => {
        const newLocations = {};
        animals.forEach((animal) => {
            // Asigna un grupo aleatorio a cada animal para que inicie en un lugar incorrecto (o correcto)
            const randomGroup = DIET_GROUPS[Math.floor(Math.random() * DIET_GROUPS.length)];
            newLocations[animal.id] = randomGroup;
        });
        return newLocations;
    }, []);

    // Carga los assets y selecciona un subconjunto aleatorio de animales
    const loadRandomContent = useCallback(async () => {
        setLoading(true);
        setVerified(false);
        setSelectedAnimal(null);

        // 1. Seleccionar un subconjunto aleatorio (ej: 3 de cada tipo si es posible)
        const shuffledPool = shuffleArray(ANIMAL_POOL_BASE);
        const animalsForSession = shuffledPool.slice(0, NUM_ANIMALS_TO_SHOW);

        // 2. Cargar todas las imágenes necesarias (animales y guías)
        const allImagePaths = [
            ...animalsForSession.map((a) => a.imageBase),
            "hojas_icon", "carne_icon", "omnivoro_icon",
        ];
        const loadedAssets = {};

        await Promise.all(
            allImagePaths.map(async (base) => {
                loadedAssets[base] = await loadImageUrl(base);
            })
        );

        // 3. Preparar los animales con URLs
        const finalAnimals = animalsForSession.map((a) => ({ ...a, imageUrl: loadedAssets[a.imageBase] }));

        // 4. Inicializar las ubicaciones al azar
        setAssets(loadedAssets);
        setAllAnimals(finalAnimals);
        setLocations(assignRandomLocations(finalAnimals));
        setLoading(false);
    }, [assignRandomLocations]);


    useEffect(() => {
        loadRandomContent();
    }, [loadRandomContent]);

    // --- Lógica de Interacción ---

    const handleSelectAnimal = (animalId) => {
        if (verified) return;
        // Permite seleccionar un animal o deseleccionar si se hace clic en el mismo
        setSelectedAnimal((prev) => (prev === animalId ? null : animalId));
    };

    const handleBoxClick = (groupName) => {
        if (!selectedAnimal || verified) return;
        // Mueve el animal seleccionado al nuevo grupo
        setLocations((prev) => ({ ...prev, [selectedAnimal]: groupName }));
        setSelectedAnimal(null); // Deselecciona después de mover
    };

    const verify = () => {
        let allCorrect = true;
        allAnimals.forEach((animal) => {
            if (locations[animal.id] !== animal.diet) {
                allCorrect = false;
            }
        });
        setVerified(true);
        if (allCorrect) {
            setTimeout(() => onComplete?.(true), 2000);
        }
    };

    const handleRestart = useCallback(() => {
        loadRandomContent(); // Cargar nuevo set aleatorio
    }, [loadRandomContent]);

    // --- Componentes y Renderizado ---

    const AnimalCard = ({ animal }) => {
        const isSelected = selectedAnimal === animal.id;
        let style = "bg-white shadow-md border-2 border-gray-200 transition-all duration-300 cursor-pointer";
        let feedbackIcon = null;

        if (verified) {
            const isCorrect = animal.diet === locations[animal.id];
            style = isCorrect
                ? "bg-green-100 border-green-500 shadow-xl ring-2 ring-green-300"
                : "bg-red-100 border-red-500 shadow-xl ring-2 ring-red-300";
            feedbackIcon = isCorrect ? "✅" : "❌";
        } else if (isSelected) {
            style = "bg-yellow-200 border-orange-500 ring-4 ring-orange-300 scale-105 shadow-xl";
        }

        return (
            <div
                key={animal.id}
                onClick={() => handleSelectAnimal(animal.id)}
                className={`w-32 h-36 p-1 rounded-lg flex flex-col items-center justify-center relative ${style}`}
            >
                {/* ⭐ IMAGEN MÁS GRANDE DENTRO DE LA TARJETA */}
                <img src={animal.imageUrl} alt={animal.name} className="w-24 h-24 object-contain" />
                <p className="text-xs font-bold text-center mt-1">{animal.name}</p>
                {verified && feedbackIcon && <span className="absolute top-0 right-0 text-2xl">{feedbackIcon}</span>}
            </div>
        );
    };

    const ClassificationBox = ({ groupName, title, guideImageBase }) => {
        const animalsInBox = allAnimals.filter((a) => locations[a.id] === groupName);
        let boxStyle = "bg-white/70 border-2 border-gray-300";
        let feedbackIcon = null;

        if (verified) {
            const hasWrong = animalsInBox.some((a) => a.diet !== groupName);
            boxStyle = hasWrong ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500";
            feedbackIcon = hasWrong ? "❌" : "✅";
        } else if (selectedAnimal) {
            boxStyle = "bg-blue-50 border-blue-500 ring-4 ring-blue-300 cursor-pointer";
        }

        return (
            <div
                onClick={() => handleBoxClick(groupName)}
                className={`flex flex-col items-center p-4 rounded-xl shadow-inner min-h-[350px] transition-all duration-300 relative ${boxStyle}`}
            >
                {assets[guideImageBase] && (
                    <img
                        src={assets[guideImageBase]}
                        alt={title}
                        className="w-14 h-14 mb-3 object-contain"
                    />
                )}
                <h3 className="text-2xl font-bold text-gray-700 mb-4">{title}</h3>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                    {animalsInBox.map((a) => (
                        // Pasa el animal completo, no solo la tarjeta
                        <AnimalCard key={a.id} animal={a} />
                    ))}
                </div>

                {verified && feedbackIcon && (
                    <span className="absolute top-2 right-2 text-3xl">{feedbackIcon}</span>
                )}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-xl text-indigo-700">Cargando la sabana... 🦁</div>;

    const finalCheck = verified && allAnimals.every((a) => locations[a.id] === a.diet);

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-100 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-extrabold text-orange-800 text-center drop-shadow-sm">
                    🥗 ¿Quién come ensalada y quién prefiere carne?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-gray-700 mb-8">
                ✨ Pon a cada animalito en su mesa favorita
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mb-8">
                {/* ⭐ TABLERO DE CLASIFICACIÓN MODERNO ⭐ */}
                <ClassificationBox
                    groupName="herbivoros"
                    title="Herbívoro 🌿"
                    guideImageBase="hojas_icon"
                />
                <ClassificationBox
                    groupName="carnivoros"
                    title="Carnívoro 🥩"
                    guideImageBase="carne_icon"
                />
                <ClassificationBox
                    groupName="omnivoros"
                    title="Omnívoro 🍎🥩"
                    guideImageBase="omnivoro_icon"
                />
            </div>

            <div className="mt-8 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified}
                    className={`px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition-all ${verified ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                        }`}
                >
                    ✅ Verificar Clasificación
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {verified && (
                <p
                    className={`mt-6 text-2xl font-bold ${finalCheck ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {finalCheck
                        ? "¡Clasificación de Dieta Perfecta! 🎉"
                        : "😕 Hay errores. Revisa las cajas marcadas con ❌ e intenta de nuevo."}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct6ClasificarDietaClick;