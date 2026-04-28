import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}");

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

// --- Datos de la Actividad (Pool Extenso) ---
const FACTOR_DATA_POOL = [
    // Bióticos (Vivos)
    { id: 'bi1', name: 'León', imageBase: 'lion1', type: 'biotico' },
    { id: 'bi2', name: 'Árbol', imageBase: 'pino_planta_11', type: 'biotico' },
    { id: 'bi3', name: 'Flor', imageBase: 'planta_simple1', type: 'biotico' },
    { id: 'bi4', name: 'Gato', imageBase: 'cat_icon11', type: 'biotico' },
    { id: 'bi5', name: 'Perro', imageBase: 'dog_icon11', type: 'biotico' },
    { id: 'bi6', name: 'Pez', imageBase: 'pez_icon1', type: 'biotico' },
    { id: 'bi7', name: 'Hongo', imageBase: 'hongo_icon1', type: 'biotico' },
    { id: 'bi8', name: 'Rana', imageBase: 'frog_icon1', type: 'biotico' },
    { id: 'bi9', name: 'Pájaro', imageBase: 'birrd_11', type: 'biotico' },
    // Abióticos (No Vivos)
    { id: 'ab1', name: 'Roca', imageBase: 'rock_icon', type: 'abiotico' },
    { id: 'ab2', name: 'Agua', imageBase: 'water_icon', type: 'abiotico' },
    { id: 'ab3', name: 'Luz Solar', imageBase: 'sun_icon', type: 'abiotico' },
    { id: 'ab4', name: 'Viento', imageBase: 'viento_icon', type: 'abiotico' },
    { id: 'ab5', name: 'Lluvia', imageBase: 'lluvia_icon', type: 'abiotico' },
    { id: 'ab6', name: 'Fuego', imageBase: 'fuego_icon', type: 'abiotico' },
    { id: 'ab7', name: 'Nieve', imageBase: 'nieve_icon', type: 'abiotico' },
    { id: 'ab8', name: 'Frío', imageBase: 'frio_icon', type: 'abiotico' }
];

const GROUPS = ['biotico', 'abiotico'];

const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const EcoAct1ClasificaFactores = ({ onComplete }) => {
    const [allElements, setAllElements] = useState([]); // Lista completa con URLs
    const [loading, setLoading] = useState(true);

    // ⭐ ESTADO PRINCIPAL: { elementId: 'source' | 'biotico' | 'abiotico' }
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Haz clic en la imagen de un elemento.' },
        { iconName: 'Target', colorTheme: 'purple', title: '2. Clasifica', description: 'Haz clic en la caja de Factores Bióticos o Abióticos.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar, presiona Verificar Clasificación.' }
    ];

    // --- Lógica de Carga Aleatoria ---
    const loadRandomElements = useCallback(async () => {
        setLoading(true);
        // Seleccionamos aleatoriamente 3 de cada
        const bióticos = shuffleArray(FACTOR_DATA_POOL.filter(f => f.type === 'biotico')).slice(0, 3);
        const abióticos = shuffleArray(FACTOR_DATA_POOL.filter(f => f.type === 'abiotico')).slice(0, 3);

        const seleccionados = shuffleArray([...bióticos, ...abióticos]);

        const loadedElements = await Promise.all(
            seleccionados.map(async (data) => {
                const imageUrl = await loadImageUrl(data.imageBase);
                return { ...data, imageUrl };
            })
        );
        setAllElements(loadedElements);

        // Inicializar todas las ubicaciones en 'source'
        const initialLocations = loadedElements.reduce((acc, element) => {
            acc[element.id] = 'source';
            return acc;
        }, {});
        setLocations(initialLocations);
        setVerified(false);
        setSelectedElementId(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomElements();
    }, [loadRandomElements]);

    // --- Lógica de Selección y Movimiento (Click) ---

    // 1. Seleccionar un elemento (desde source o desde una caja)
    const handleSelectElement = (elementId) => {
        if (verified) return;
        // Si ya está seleccionado, deseleccionar. Si no, seleccionar.
        setSelectedElementId(prev => (prev === elementId ? null : elementId));
    };

    // 2. Hacer clic en un grupo para mover el elemento seleccionado ahí
    const handleGroupClick = (targetGroup) => {
        if (verified || !selectedElementId) return;

        setLocations(prev => ({ ...prev, [selectedElementId]: targetGroup }));
        setSelectedElementId(null); // Limpiar selección después de mover
    };

    // 3. Devolver al source (haciendo click en la zona de elementos disponibles)
    const handleReturnToSource = () => {
        if (verified || !selectedElementId) return;
        setLocations(prev => ({ ...prev, [selectedElementId]: 'source' }));
        setSelectedElementId(null);
    };

    // --- Lógica de Verificación y Reinicio ---

    const verify = () => {
        let allCorrect = true;

        allElements.forEach(element => {
            if (locations[element.id] !== element.type) {
                allCorrect = false;
            }
        });

        setVerified(true);
        if (allCorrect) {
            onComplete(true);
        }
    };

    const handleRestart = () => {
        loadRandomElements();
    };

    // --- Renderizado y Componentes ---

    const unclassifiedElements = allElements.filter(a => locations[a.id] === 'source');
    const isAllClassified = unclassifiedElements.length === 0;

    const ElementCard = ({ element, isSelected, location }) => {
        const isCorrect = element.type === location;

        let style = 'bg-white shadow-md border-2 border-gray-200 transition-all duration-200 cursor-pointer hover:scale-105';
        let feedbackIcon = null;

        if (verified && location !== 'source') {
            if (isCorrect) {
                style = 'bg-green-100 border-green-500 shadow-xl ring-2 ring-green-400 opacity-90';
                feedbackIcon = '✅';
            } else {
                style = 'bg-red-100 border-red-500 shadow-xl ring-2 ring-red-400 opacity-90';
                feedbackIcon = '❌';
            }
        } else if (isSelected) {
            style = 'bg-blue-100 border-blue-500 ring-4 ring-blue-300 scale-110 z-10';
        }

        return (
            <div
                key={element.id}
                onClick={!verified ? () => handleSelectElement(element.id) : null}
                className={`
                    w-36 h-36 p-2 rounded-xl flex flex-col items-center justify-center relative
                    ${style}
                    ${verified ? 'cursor-not-allowed pointer-events-none' : ''}
                `}
            >
                <img src={element.imageUrl} alt={element.name} className="w-24 h-24 object-contain pointer-events-none drop-shadow-sm" />
                <p className="text-sm font-bold text-center mt-1 pointer-events-none text-gray-800 leading-tight">{element.name}</p>
                {feedbackIcon && <span className="absolute text-3xl -top-3 -right-3 drop-shadow bg-white rounded-full">{feedbackIcon}</span>}
            </div>
        );
    };

    const ClassificationBox = ({ groupName, title, guideEmoji }) => {
        const elementsInBox = allElements.filter(a => locations[a.id] === groupName);

        let boxStyle = 'bg-gray-50 border-gray-300';
        let feedbackIcon = null;
        const isTarget = selectedElementId && !verified;

        if (verified) {
            const hasWrongElement = elementsInBox.some(a => a.type !== groupName);
            boxStyle = hasWrongElement ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500';
            feedbackIcon = hasWrongElement ? '❌' : '✅';
        } else if (isTarget) {
            boxStyle = 'bg-blue-50 border-blue-500 ring-4 ring-blue-300 cursor-pointer hover:bg-blue-100 hover:scale-[1.02]';
        }

        return (
            <div
                onClick={() => handleGroupClick(groupName)}
                className={`
                    flex flex-col items-center p-4 rounded-xl shadow-inner min-h-[300px] transition-all duration-300 border-4 relative
                    ${boxStyle}
                `}
            >
                <h3 className="text-3xl font-bold text-gray-700 mb-4">{guideEmoji} {title}</h3>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                    {elementsInBox.map(element => (
                        <ElementCard key={element.id} element={element} location={groupName} isSelected={selectedElementId === element.id} />
                    ))}
                </div>
                {elementsInBox.length === 0 && <p className="text-gray-500 mt-12 italic pointer-events-none">{isTarget ? "Haz clic aquí" : "Selecciona un elemento de abajo"}</p>}

                {verified && feedbackIcon && <span className="absolute top-2 right-2 text-3xl">{feedbackIcon}</span>}
            </div>
        );
    };

    if (loading) {
        return <div className="min-h-screen"></div>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-5xl">
                <h2 className="text-4xl font-extrabold text-purple-800 text-center flex-grow">
                    🦊 ¿Tiene corazón o es una roca?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>

            <p className="text-xl text-purple-700 mb-8 font-medium">
                ✅ ¡Separa los elementos para que el ecosistema esté en equilibrio!
            </p>



            {/* ⭐ CONTENEDORES DE CLASIFICACIÓN (BIÓTICO/ABIÓTICO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-8">
                <ClassificationBox groupName="biotico" title="Factores Bióticos (VIVOS)" guideEmoji="🌱" />
                <ClassificationBox groupName="abiotico" title="Factores Abióticos (NO VIVOS)" guideEmoji="💧" />
            </div>

            {/* --- ÁREA DE ELEMENTOS DISPONIBLES (ABAJO) --- */}
            <div
                onClick={handleReturnToSource}
                className={`w-full max-w-5xl bg-gray-100 p-6 rounded-xl shadow-lg border-4 transition-colors
                    ${selectedElementId && locations[selectedElementId] !== 'source' ? 'border-dashed border-blue-400 bg-blue-50 cursor-pointer hover:bg-blue-100' : 'border-transparent'}
                `}
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                    Elementos para Clasificar ({unclassifiedElements.length})
                </h3>

                <div className="flex flex-wrap justify-center gap-4 min-h-[100px]">
                    {unclassifiedElements.map(element => (
                        <ElementCard key={element.id} element={element} location='source' isSelected={selectedElementId === element.id} />
                    ))}
                </div>
            </div>

            {/* --- Botones de Control --- */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || !isAllClassified}
                    className={`px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || !isAllClassified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
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
                <p className={`mt-6 text-2xl font-bold ${allElements.every(a => locations[a.id] === a.type) ? 'text-green-600' : 'text-red-600'}`}>
                    {allElements.every(a => locations[a.id] === a.type)
                        ? '¡Clasificación de Factores Perfecta! 🎉'
                        : '😕 Hay errores. Revisa los elementos mal colocados e intenta de nuevo.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct1ClasificaFactores;