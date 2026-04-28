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


// --- ⭐ POOL DE CADENAS (Datos Fijos) ⭐ ---
const CADENAS_POOL = [
    [
        { id: 'sol', name: 'Sol/Energía', imageBase: 'sun_icon', order: 1 },
        { id: 'pasto', name: 'Pasto', imageBase: 'pasto_icon_1', order: 2 },
        { id: 'conejo', name: 'Conejo', imageBase: 'conejo_icon1', order: 3 },
        { id: 'aguila', name: 'Águila', imageBase: 'aguila_icon1', order: 4 },
    ],
    [
        { id: 'sol', name: 'Sol/Energía', imageBase: 'sun_icon', order: 1 },
        { id: 'alga', name: 'Alga', imageBase: 'alga_icon', order: 2 },
        { id: 'camaron', name: 'Camarón', imageBase: 'camaron_icon', order: 3 },
        { id: 'pez_grande', name: 'Pez Grande', imageBase: 'pez_grande_icon1', order: 4 },
    ],
    [
        { id: 'sol', name: 'Sol/Energía', imageBase: 'sun_icon', order: 1 },
        { id: 'cactus', name: 'Cactus', imageBase: 'cactus_icon', order: 2 },
        { id: 'raton', name: 'Ratón', imageBase: 'raton_icon', order: 3 },
        { id: 'serpiente', name: 'Serpiente', imageBase: 'serpiente_icon1', order: 4 },
    ],
];

const TARGET_ZONES = [
    { id: 1, name: '1. Energía/Productor' },
    { id: 2, name: '2. Consumidor Primario' },
    { id: 3, name: '3. Consumidor Secundario' },
    { id: 4, name: '4. Consumidor Final' },
];
// ---------------------------------------------------------------------


const EcoAct2CadenaAlimentaria = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [cycleSteps, setCycleSteps] = useState([]); // Pasos con URLs y barajados
    const [locations, setLocations] = useState({}); // { 'pasto': 2, 'conejo': 3, ... }
    const [verified, setVerified] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Arrastra', description: 'Toma una imagen de los organismos disponibles.' },
        { iconName: 'Target', colorTheme: 'purple', title: '2. Ordena', description: 'Colócala en la casilla correcta del 1 al 4 formando la cadena.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar, presiona Verificar Orden.' }
    ];

    const NUM_PASOS = TARGET_ZONES.length;


    // --- Lógica de Carga Inicial y Mezcla ---
    const loadContent = useCallback(async () => {
        setVerified(false);
        setIsPerfect(false);
        setLocations({});

        // 1. Seleccionar una cadena aleatoria
        const randomChainIndex = Math.floor(Math.random() * CADENAS_POOL.length);
        const selectedChain = CADENAS_POOL[randomChainIndex];

        // 2. Cargar URLs para todos los pasos
        const loadedSteps = await Promise.all(
            selectedChain.map(async (item) => {
                const url = await loadImageUrlByName(item.imageBase);
                return { ...item, url };
            })
        );

        // 3. Barajar los pasos para mostrarlos en la zona de Draggable
        setCycleSteps(shuffleArray(loadedSteps));
        setLoading(false);
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);


    // --- Lógica de Drag and Drop ---

    const handleDragStart = (e, itemId) => {
        if (verified) return;
        e.dataTransfer.setData("itemId", itemId);
        setDraggingItem(itemId);
    };

    const handleDragEnd = () => {
        setDraggingItem(null);
    };

    const handleDrop = (e, zoneId) => {
        e.preventDefault();
        if (verified) return;

        const itemId = e.dataTransfer.getData("itemId");
        if (!itemId) return;

        const zoneIsOccupied = Object.values(locations).includes(zoneId);

        if (zoneIsOccupied) {
            // Permitir el intercambio: la pieza anterior vuelve al pool (location: null)
            const itemInZone = Object.keys(locations).find(key => locations[key] === zoneId);

            setLocations(prev => ({
                ...prev,
                [itemInZone]: null, // Pieza anterior vuelve al pool
                [itemId]: zoneId    // Pieza arrastrada va al destino
            }));

        } else {
            // Colocar la imagen en la nueva zona
            setLocations(prev => ({ ...prev, [itemId]: zoneId }));
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); };

    // --- Lógica de Verificación ---

    const verify = () => {
        const placedCount = Object.values(locations).filter(loc => loc !== null).length;

        if (placedCount !== NUM_PASOS) {
            alert(`Debes colocar todos los ${NUM_PASOS} pasos de la cadena.`);
            return;
        }

        let totalCorrect = 0;

        cycleSteps.forEach(step => {
            const placedZoneId = locations[step.id];

            // La zona de destino (zoneId) debe coincidir con el 'order' correcto 
            if (placedZoneId === step.order) {
                totalCorrect++;
            }
        });

        const isFullyCorrect = totalCorrect === NUM_PASOS;

        setIsPerfect(isFullyCorrect);
        setVerified(true);

        if (isFullyCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        loadContent(); // Carga una nueva cadena aleatoria
    };

    // --- Renderizado Auxiliar ---

    const getCardClass = (itemId) => {
        const isPlaced = locations[itemId] !== undefined && locations[itemId] !== null;
        const isDraggingThis = draggingItem === itemId;

        let baseStyle = "bg-white shadow-md border-2 border-gray-300 transition-all duration-200 cursor-grab";

        if (verified) {
            const stepData = cycleSteps.find(s => s.id === itemId);
            const isCorrect = locations[itemId] === stepData.order;

            baseStyle = isCorrect
                ? "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-300 opacity-80"
                : "bg-red-100 border-red-500 shadow-lg ring-2 ring-red-300 opacity-80";
        } else if (isPlaced) {
            baseStyle = "bg-blue-100 border-blue-500 opacity-50 cursor-not-allowed";
        }

        return `${baseStyle} ${isDraggingThis ? 'ring-4 ring-orange-500' : ''}`;
    };

    const getZoneClass = (zoneId) => {
        const isOccupied = Object.values(locations).includes(zoneId);

        let baseStyle = 'border-4 border-dashed border-gray-400 bg-gray-50 flex flex-col items-center justify-center font-bold text-lg';

        if (verified) {
            const correctStep = cycleSteps.find(s => s.order === zoneId);
            const placedItemId = Object.keys(locations).find(key => locations[key] === zoneId);

            if (placedItemId && placedItemId === correctStep.id) {
                return `${baseStyle} bg-green-200 border-green-600 text-green-800`;
            }
            if (placedItemId) {
                return `${baseStyle} bg-red-200 border-red-600 text-red-800`;
            }
            return `${baseStyle} bg-yellow-100 border-yellow-500 text-gray-700`;
        }

        if (isOccupied) {
            return `${baseStyle} bg-blue-100 border-blue-500 text-blue-800 opacity-50`;
        }
        return `${baseStyle} hover:border-blue-500 hover:bg-blue-50 text-gray-600`;
    };

    // -----------------------------------------------------
    // ## Activity View (JSX)
    // -----------------------------------------------------

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-indigo-700 text-xl">Cargando cadena alimentaria... 🌍</div>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-7xl">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center drop-shadow-sm flex-grow">
                    ✨ ¿Quién le da fuerza a quién?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                ✅ ¡Forma la fila del almuerzo desde el más pequeñito hasta el más grande!
            </p>

            <div className="w-full max-w-7xl p-6 bg-white rounded-2xl shadow-2xl">

                {/* --- 1. ZONAS DE DESTINO (ARRIBA) --- */}
                <div className="flex justify-around gap-4 mb-10">
                    {TARGET_ZONES.map(zone => {
                        const placedItemId = Object.keys(locations).find(key => locations[key] === zone.id);
                        const placedItem = placedItemId ? cycleSteps.find(s => s.id === placedItemId) : null;

                        return (
                            <div
                                key={zone.id}
                                id={`zone-${zone.id}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, zone.id)}
                                className={`w-40 h-40 rounded-xl relative ${getZoneClass(zone.id)}`}
                            >
                                <span className="absolute top-2 left-2 text-sm font-extrabold">{zone.name}</span>
                                {placedItem ? (
                                    <>
                                        <img
                                            src={placedItem.url}
                                            alt={placedItem.name}
                                            className="w-24 h-24 object-contain"
                                        />
                                        <p className="text-sm font-semibold mt-1">{placedItem.name}</p>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-700 pt-6">Arrastra aquí</span>
                                )}

                                {verified && (
                                    <span className="absolute top-1 right-1 text-2xl">
                                        {locations[placedItemId] === placedItem?.order ? '✅' : '❌'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- 2. PASOS DESORDENADOS (ABAJO) --- */}
                <div className="flex justify-center flex-wrap gap-8 pt-6 border-t-2 border-dashed border-purple-300">
                    {cycleSteps.map(step => {
                        const isPlaced = locations[step.id] !== undefined && locations[step.id] !== null;

                        return (
                            <div
                                key={step.id}
                                id={step.id}
                                draggable={!verified && !isPlaced}
                                onDragStart={(e) => handleDragStart(e, step.id)}
                                onDragEnd={handleDragEnd}
                                onClick={isPlaced ? () => setLocations(prev => ({ ...prev, [step.id]: null })) : null} // Click para devolver
                                className={`w-32 h-32 p-1 rounded-xl flex flex-col items-center justify-center ${getCardClass(step.id)}`}
                            >
                                {isPlaced && !verified ? (
                                    <span className="text-sm font-semibold text-gray-700">CLIC para devolver</span>
                                ) : (
                                    <>
                                        <img src={step.url} alt={step.name} className="w-24 h-24 object-contain" />
                                        <p className="text-xs font-semibold mt-1">{step.name}</p>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Botones de Control y Feedback --- */}
            <div className="mt-10 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || Object.values(locations).filter(loc => loc !== null).length !== NUM_PASOS}
                    className={`px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || Object.values(locations).filter(loc => loc !== null).length !== NUM_PASOS
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                    ✅ Verificar Orden
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? 'text-green-600' : 'text-red-600'}`}>
                    {isPerfect
                        ? '🎉 ¡Orden Correcto! Ciclo completado.'
                        : '😕 Hay errores. Revisa la retroalimentación e intenta de nuevo.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct2CadenaAlimentaria;