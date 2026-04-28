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


// --- Datos de la Actividad: Ciclo de Vida de una Planta con Flor ---
const CICLO_VIDA_DATA = [
    // El orden en este array es el ORDEN CORRECTO (1 al 5)
    { id: 'semilla', name: 'Semilla', imageBase: 'semillas_icon', order: 1 },
    { id: 'germinacion', name: 'Brote', imageBase: 'brote_icon', order: 2 },
    { id: 'planta_joven', name: 'Planta Joven', imageBase: 'planta_joven_icon', order: 3 },
    { id: 'flor', name: 'Floración', imageBase: 'flor_icon_1', order: 4 },
    { id: 'fruto', name: 'Fruto', imageBase: 'fruto_icon', order: 5 },
];

const TARGET_ZONES = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' },
    { id: 5, name: '5' },
];


const PlantaAct5CicloVida = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [cycleSteps, setCycleSteps] = useState([]); // Pasos con URLs y barajados
    const [locations, setLocations] = useState({}); // { 'semilla': 1, 'fruto': 5, ... }
    const [verified, setVerified] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Arrastra', description: 'Toma una imagen del ciclo.' },
        { iconName: 'Target', colorTheme: 'green', title: '2. Ordena', description: 'Colócala en la casilla numérica correcta del 1 al 5.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Cuando ordenes todas, verifica tu respuesta.' }
    ];


    // --- Lógica de Carga Inicial y Mezcla ---
    const loadContent = useCallback(async () => {
        setVerified(false);
        setIsPerfect(false);
        setLocations({});

        // 1. Cargar URLs para todos los pasos
        const loadedSteps = await Promise.all(
            CICLO_VIDA_DATA.map(async (item) => {
                const url = await loadImageUrlByName(item.imageBase);
                return { ...item, url };
            })
        );

        // 2. Barajar los pasos para mostrarlos al inicio
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

        // 1. Evitar que la misma zona se ocupe dos veces
        const zoneIsOccupied = Object.values(locations).includes(zoneId);

        // Función para mover la pieza a la nueva zona y liberar la anterior
        const updateLocations = (itemId, zoneId) => {
            setLocations(prev => {
                const newState = { ...prev };
                // Liberar la zona anterior (si la pieza estaba ya colocada en otra zona)
                Object.keys(newState).forEach(key => {
                    if (newState[key] === zoneId) {
                        newState[key] = null; // Liberar la zona que se va a ocupar
                    }
                });
                // Colocar la nueva pieza
                newState[itemId] = zoneId;
                return newState;
            });
        };

        if (zoneIsOccupied) {
            // Permitir el intercambio: si la zona está ocupada, la pieza anterior vuelve al pool (location: null)
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

    // Permite el drop
    const handleDragOver = (e) => { e.preventDefault(); };

    // --- Lógica de Verificación ---

    const verify = () => {
        // 1. Debe haber 5 elementos colocados (la zona ocupada no debe ser null)
        const placedCount = Object.values(locations).filter(loc => loc !== null).length;

        if (placedCount !== CICLO_VIDA_DATA.length) {
            alert("Debes colocar todos los 5 pasos del ciclo.");
            return;
        }

        let totalCorrect = 0;

        CICLO_VIDA_DATA.forEach(step => {
            const placedZoneId = locations[step.id]; // Zona donde se colocó (1, 2, 3, 4, 5)

            // La zona de destino (zoneId) debe coincidir con el 'order' correcto (1, 2, 3, 4, 5)
            if (placedZoneId === step.order) {
                totalCorrect++;
            }
        });

        const isFullyCorrect = totalCorrect === CICLO_VIDA_DATA.length;

        setIsPerfect(isFullyCorrect);
        setVerified(true);

        if (isFullyCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        loadContent(); // Carga un nuevo set de imágenes (aunque sean las mismas, las baraja)
    };

    // --- Renderizado Auxiliar ---

    const getCardClass = (itemId) => {
        const isPlaced = locations[itemId] !== undefined && locations[itemId] !== null;
        const isDraggingThis = draggingItem === itemId;

        let baseStyle = "bg-white shadow-md border-2 border-gray-300 transition-all duration-200 cursor-grab";

        if (verified) {
            const stepData = CICLO_VIDA_DATA.find(s => s.id === itemId);
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

        let baseStyle = 'border-4 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center font-bold text-3xl relative';

        if (verified) {
            // Buscamos el ID del paso que DEBÍA ir en esta zona
            const correctStep = CICLO_VIDA_DATA.find(s => s.order === zoneId);
            // Buscamos el ID del paso que REALMENTE fue colocado
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-green-700 text-xl">Cargando ciclo de vida... 🌱</div>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-lime-50 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-6xl">
                <h2 className="text-4xl font-extrabold text-green-800 text-center drop-shadow-sm flex-grow">
                    ✨ ¿Puedes contar la historia de cómo creció esta planta?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                🎯 ¡Ordena el ciclo y gana tus 5 estrellas de jardinero!
            </p>

            <div className="w-full max-w-6xl p-6 bg-white rounded-2xl shadow-2xl">

                {/* --- 1. ZONAS DE DESTINO (ARRIBA) --- */}
                <div className="flex justify-around mb-12">
                    {TARGET_ZONES.map(zone => {
                        // Buscar si hay un item colocado en esta zona
                        const placedItemId = Object.keys(locations).find(key => locations[key] === zone.id);
                        const placedItem = placedItemId ? cycleSteps.find(s => s.id === placedItemId) : null;

                        return (
                            <div
                                key={zone.id}
                                id={`zone-${zone.id}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, zone.id)}
                                className={`w-36 h-36 rounded-xl ${getZoneClass(zone.id)}`}
                            >
                                {/* Mostrar número de zona si está vacía o verificación */}
                                {!placedItem && zone.name}

                                {/* ⭐ MOSTRAR IMAGEN COLOCADA DENTRO DE LA ZONA ⭐ */}
                                {placedItem && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                        <img
                                            src={placedItem.url}
                                            alt={placedItem.name}
                                            className="w-24 h-24 object-contain drop-shadow-md"
                                        />
                                        {!verified && (
                                            <p className="text-xs font-bold mt-1 bg-white/80 px-2 rounded text-gray-800">{placedItem.name}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- 2. PASOS DESORDENADOS (ABAJO) --- */}
                <div className="flex justify-around pt-6 border-t-2 border-dashed border-lime-300">
                    {cycleSteps.map(step => {
                        const isPlaced = locations[step.id] !== undefined && locations[step.id] !== null;

                        // Si ya está colocado, mostramos un placeholder vacío o transparente para mantener el espacio
                        // pero deshabilitamos el arrastre desde aquí.
                        return (
                            <div
                                key={step.id}
                                id={step.id}
                                draggable={!verified && !isPlaced}
                                onDragStart={(e) => handleDragStart(e, step.id)}
                                onDragEnd={handleDragEnd}
                                // Click para devolver la pieza del destino al pool (location: null)
                                onClick={isPlaced ? () => setLocations(prev => ({ ...prev, [step.id]: null })) : null}
                                className={`
                                    w-32 h-32 p-1 rounded-xl flex flex-col items-center justify-center 
                                    ${getCardClass(step.id)}
                                    ${isPlaced ? 'opacity-40 border-dashed' : ''} 
                                `}
                            >
                                {isPlaced ? (
                                    <span className="text-sm font-semibold text-gray-500">Vacío</span>
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
                    disabled={verified || Object.values(locations).filter(loc => loc !== null).length !== CICLO_VIDA_DATA.length}
                    className={`px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || Object.values(locations).filter(loc => loc !== null).length !== CICLO_VIDA_DATA.length
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                    ✅ Verificar Orden
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar
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

export default PlantaAct5CicloVida;