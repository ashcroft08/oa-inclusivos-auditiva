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

// --- Datos de la Actividad (Pool Extendido) ---
const ANIMAL_POOL_BASE = [
    // Vertebrados (V)
    { id: 'goldfish', name: 'Pez Dorado', imageBase: 'goldfish_icon', correctGroup: 'vertebrados' },
    { id: 'bulldog', name: 'Perro', imageBase: 'bulldog_icon', correctGroup: 'vertebrados' },
    { id: 'canary', name: 'Canario', imageBase: 'canary_icon', correctGroup: 'vertebrados' },
    { id: 'turtle', name: 'Tortuga', imageBase: 'turtle_icon', correctGroup: 'vertebrados' },
    { id: 'frog', name: 'Rana', imageBase: 'frog_icon', correctGroup: 'vertebrados' },
    { id: 'whale', name: 'Ballena', imageBase: 'whale_icon', correctGroup: 'vertebrados' },
    { id: 'snake', name: 'Serpiente', imageBase: 'snake_icon', correctGroup: 'vertebrados' },

    // Invertebrados (I)
    { id: 'snail', name: 'Caracol', imageBase: 'snail_icon', correctGroup: 'invertebrados' },
    { id: 'butterfly', name: 'Mariposa', imageBase: 'butterfly_icon', correctGroup: 'invertebrados' },
    { id: 'spider', name: 'Araña', imageBase: 'spider_icon', correctGroup: 'invertebrados' },
    { id: 'worm', name: 'Gusano', imageBase: 'worm_icon', correctGroup: 'invertebrados' },
    { id: 'bee', name: 'Abeja', imageBase: 'bee_icon', correctGroup: 'invertebrados' },
    { id: 'octopus', name: 'Pulpo', imageBase: 'octopus_icon', correctGroup: 'invertebrados' },
];

// Función para desordenar
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const AniAct3ClasificarDragDrop = ({ onComplete }) => {
    const [allAnimals, setAllAnimals] = useState([]);
    const [loading, setLoading] = useState(true);

    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);

    const [selectedAnimalId, setSelectedAnimalId] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Haz clic en el animal no clasificado.' },
        { iconName: 'Target', colorTheme: 'indigo', title: '2. Mueve', description: 'Haz clic en la caja de Vertebrados o Invertebrados.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Verifica tus respuestas.' }
    ];

    const NUM_ANIMALS_TO_SHOW = 8; // Mostrar 8 animales en total

    // --- Lógica de Carga Inicial y Aleatoria ---
    const loadRandomContent = useCallback(async () => {
        setLoading(true);
        setVerified(false);
        setLocations({});
        setSelectedAnimalId(null);

        // 1. Separar y seleccionar aleatoriamente (ej. 4 vertebrados, 4 invertebrados)
        const vertebrados = shuffleArray(ANIMAL_POOL_BASE.filter(a => a.correctGroup === 'vertebrados'));
        const invertebrados = shuffleArray(ANIMAL_POOL_BASE.filter(a => a.correctGroup === 'invertebrados'));

        const selectedVertebrados = vertebrados.slice(0, Math.floor(NUM_ANIMALS_TO_SHOW / 2));
        const selectedInvertebrados = invertebrados.slice(0, Math.ceil(NUM_ANIMALS_TO_SHOW / 2));

        const sessionAnimalsBase = shuffleArray([...selectedVertebrados, ...selectedInvertebrados]);

        // 2. Cargar las imágenes
        const loadedAnimals = await Promise.all(
            sessionAnimalsBase.map(async (data) => {
                const imageUrl = await loadImageUrlByName(data.imageBase);
                return { ...data, imageUrl };
            })
        );

        // 3. Inicializar ubicaciones en 'source'
        const initialLocations = loadedAnimals.reduce((acc, animal) => {
            acc[animal.id] = 'source';
            return acc;
        }, {});

        setAllAnimals(loadedAnimals);
        setLocations(initialLocations);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomContent();
    }, [loadRandomContent]);

    // --- Lógica de Interacción (Bidireccional) ---

    // ⭐ CLAVE: El animal puede ser seleccionado en cualquier caja (source, vertebrados, invertebrados)
    const handleAnimalClick = (animalId) => {
        if (verified) return;

        // Si ya hay uno seleccionado y se hizo clic en el mismo, deseleccionar
        if (selectedAnimalId === animalId) {
            setSelectedAnimalId(null);
        } else {
            // Seleccionar el nuevo animal
            setSelectedAnimalId(animalId);
        }
    };

    // ⭐ CLAVE: Mueve el animal seleccionado a la nueva caja (source, vertebrados, invertebrados)
    const handleBoxClick = (targetGroup) => {
        if (verified) return;
        if (!selectedAnimalId) return;

        setLocations(prev => ({ ...prev, [selectedAnimalId]: targetGroup }));
        setSelectedAnimalId(null); // Deseleccionar después de mover
    };

    // --- Lógica de Verificación ---

    const verify = () => {
        // Asegurar que todos los animales han sido movidos a una caja de clasificación
        const allMoved = allAnimals.every(a => locations[a.id] !== 'source');
        if (!allMoved) {
            alert("Por favor, clasifica todos los animales antes de verificar.");
            return;
        }

        let allCorrect = true;

        allAnimals.forEach(animal => {
            const currentLocation = locations[animal.id];

            if (currentLocation !== animal.correctGroup) {
                allCorrect = false;
            }
        });

        setVerified(true);
        if (allCorrect) {
            onComplete(true);
        }
    };

    // ⭐ El reinicio ahora carga un nuevo set
    const handleRestart = () => {
        loadRandomContent();
    };

    // --- Renderizado y Estilos ---

    const unclassifiedCount = allAnimals.filter(a => locations[a.id] === 'source').length;
    const isAllClassified = unclassifiedCount === 0;

    if (loading) {
        return <div className="text-center p-10 text-orange-600 font-bold text-xl min-h-screen">Cargando la fauna... 🦒</div>;
    }

    // Componente de la Tarjeta del Animal
    const AnimalCard = ({ animal, isSelected, location }) => {
        const isCorrect = animal.correctGroup === location;
        const isPlaced = location !== 'source';

        let style = 'bg-white shadow-md border-2 border-gray-200 hover:scale-105 hover:shadow-lg';
        let feedbackIcon = null;

        if (verified) {
            if (isCorrect && isPlaced) {
                style = 'bg-green-100 border-green-500 shadow-xl ring-2 ring-green-400 opacity-95';
                feedbackIcon = '✅';
            } else if (!isCorrect && isPlaced) {
                style = 'bg-red-100 border-red-500 shadow-xl ring-2 ring-red-400 opacity-95';
                feedbackIcon = '❌';
            } else if (!isPlaced) {
                // Si está en la fuente al verificar, es un error por omisión, lo marcamos en rojo sutil
                style = 'bg-red-50 border-red-300 opacity-60';
                feedbackIcon = '⚠';
            }
        } else if (isSelected) {
            // ⭐ ESTILO DE SELECCIÓN ACTIVA
            style = 'bg-yellow-200 border-orange-600 ring-4 ring-orange-400 transform scale-110 shadow-xl z-10 font-bold';
        }

        const sizeClasses = isPlaced 
            ? "w-28 h-28 p-2 rounded-xl"
            : "w-48 h-48 p-3 rounded-2xl"; // Giant in source

        const imgClasses = isPlaced 
            ? "w-16 h-16 drop-shadow-sm" 
            : "w-32 h-32 drop-shadow-md";

        const textClasses = isPlaced 
            ? "text-xs mt-1" 
            : "text-base mt-2";

        return (
            <div
                key={animal.id}
                onClick={(e) => { e.stopPropagation(); handleAnimalClick(animal.id); }}
                className={`
                    flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative
                    ${sizeClasses}
                    ${style}
                    ${verified && isPlaced ? 'pointer-events-none' : ''}
                `}
            >
                <img src={animal.imageUrl} alt={animal.name} className={`${imgClasses} object-contain`} />

                <p className={`font-extrabold text-center text-gray-800 leading-tight ${textClasses}`}>{animal.name}</p>
                {feedbackIcon && <span className={`absolute ${isPlaced ? '-top-1 -right-1 text-xl' : '-top-2 -right-2 text-3xl'} bg-white rounded-full leading-none shadow`}>{feedbackIcon}</span>}
            </div>
        );
    };

    // Componente del Contenedor de Clasificación
    const ClassificationBox = ({ groupName, title }) => {
        const animalsInBox = allAnimals.filter(a => locations[a.id] === groupName);
        const isTargeted = selectedAnimalId && !verified;
        const isSelectedAnimalInBox = selectedAnimalId && locations[selectedAnimalId] === groupName;

        let boxStyle = 'bg-gray-50 border-gray-300';

        if (isTargeted) {
            boxStyle = 'bg-blue-50 border-blue-500 ring-4 ring-blue-300 cursor-pointer';
        } else if (verified) {
            boxStyle = 'bg-white border-2 border-gray-400';
        } else if (isSelectedAnimalInBox) {
            boxStyle = 'bg-yellow-100 border-orange-500 shadow-lg';
        }

        return (
            <div
                onClick={() => handleBoxClick(groupName)}
                className={`
                    flex flex-col items-center p-4 rounded-xl shadow-inner min-h-[250px] transition-all duration-300
                    ${boxStyle}
                `}
            >
                <h3 className="text-2xl font-bold text-gray-700 mb-4">{title} ({animalsInBox.length})</h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {animalsInBox.map(animal => (
                        <AnimalCard
                            key={animal.id}
                            animal={animal}
                            location={groupName}
                            isSelected={animal.id === selectedAnimalId}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-orange-800 text-center drop-shadow">
                    🐾 ¿Es Vertebrado o Invertebrado?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-gray-700 mb-8 font-medium">
                🎯 Arrastra los animales a la categoría correcta.
            </p>

            {/* CONTENEDORES DE CLASIFICACIÓN (ARRIBA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mb-8">
                <ClassificationBox groupName="vertebrados" title="Vertebrados" />
                <ClassificationBox groupName="invertebrados" title="Invertebrados" />
            </div>

            {/* --- ÁREA DE ANIMALES DISPONIBLES (SOURCE) --- */}
            <div
                onClick={() => handleBoxClick('source')} // Permite enviar el animal seleccionado de vuelta a 'source'
                className="w-full max-w-6xl bg-gray-100 p-6 rounded-xl shadow-lg border-4 border-dashed border-gray-300 hover:border-blue-400 transition-all cursor-pointer"
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                    Animales Sin Clasificar ({unclassifiedCount} / {allAnimals.length})
                </h3>

                {selectedAnimalId && !verified && (
                    <p className="text-center text-blue-600 font-semibold mb-4 animate-pulse">
                        ¡Mueve a {allAnimals.find(a => a.id === selectedAnimalId)?.name || 'el animal'} a la caja de clasificación correcta!
                    </p>
                )}

                <div className="flex flex-wrap justify-center gap-4 min-h-[100px]">
                    {allAnimals.map(animal => {
                        const isSource = locations[animal.id] === 'source';
                        const isSelected = animal.id === selectedAnimalId;

                        return isSource ? (
                            <AnimalCard
                                key={animal.id}
                                animal={animal}
                                location="source"
                                isSelected={isSelected}
                            />
                        ) : null;
                    })}
                    {unclassifiedCount === 0 && !verified && (
                        <p className="text-center text-green-600 font-bold mt-4 w-full">¡Listo para verificar!</p>
                    )}
                </div>
            </div>

            {/* --- Botones de Control --- */}
            <div className="mt-8 flex gap-6">
                {!verified && (
                    <button
                        onClick={verify}
                        disabled={!isAllClassified}
                        className={`px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition-all 
                            ${!isAllClassified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                    >
                        ✅ Verificar Clasificación
                    </button>
                )}

                <button
                    onClick={handleRestart}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {/* Mensaje de Feedback */}
            {verified && (
                <p className={`mt-6 text-2xl font-bold ${allAnimals.every(a => a.correctGroup === locations[a.id]) ? 'text-green-600' : 'text-red-600'}`}>
                    {allAnimals.every(a => a.correctGroup === locations[a.id])
                        ? '¡Clasificación perfecta! ¡Excelente trabajo! 🎉'
                        : '😕 Hay errores. Revisa los animales marcados con ❌ y muévelos a la caja correcta.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct3ClasificarDragDrop;