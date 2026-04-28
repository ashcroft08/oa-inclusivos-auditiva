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
    // ⭐ Importante: Asegúrate de tener una imagen llamada 'planta_completa_outline' en assets/images
    console.warn(`Asset no encontrado: ${nombreBase}. Asegúrate de tener la imagen 'planta_completa_outline' en tus assets.`);
    return null;
};

// --- Datos de la Actividad (5 Partes de la Planta) ---
const PARTES_PLANTA = [
    { id: "flor", name: "Flor 🌸", correctTarget: "zona-flor" },
    { id: "hoja", name: "Hojas 🍃", correctTarget: "zona-hoja" },
    { id: "tallo", name: "Tallo 🌱", correctTarget: "zona-tallo" },
    { id: "raiz", name: "Raíz 🥕", correctTarget: "zona-raiz" },
    { id: "fruto", name: "Frutos 🍎", correctTarget: "zona-fruto" }, // Nueva parte
];

const TARGET_ZONES = [
    // Coordenadas ajustadas para incluir las 5 partes en una planta estándar
    { id: 'zona-flor', name: 'Flor', top: '15%', left: '50%', width: '20%', height: '15%' },
    { id: 'zona-fruto', name: 'Fruto', top: '30%', left: '65%', width: '15%', height: '12%' }, // Nuevo
    { id: 'zona-hoja', name: 'Hoja', top: '45%', left: '25%', width: '18%', height: '15%' },
    { id: 'zona-tallo', name: 'Tallo', top: '55%', left: '50%', width: '10%', height: '30%' },
    { id: 'zona-raiz', name: 'Raíz', top: '85%', left: '50%', width: '25%', height: '15%' },
];


const PlantaAct1PartesDeLaPlanta = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [plantaUrl, setPlantaUrl] = useState(null);
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isFinalCheckCorrect, setIsFinalCheckCorrect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Arrastra', description: 'Haz clic y mantén presionada la etiqueta de la parte de la planta.' },
        { iconName: 'Target', colorTheme: 'green', title: '2. Suelta', description: 'Suelta la etiqueta en el recuadro correspondiente de la imagen.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Cuando termines, verifica si las ubicaste bien.' }
    ];

    // --- Lógica de Carga Inicial ---
    useEffect(() => {
        const cargar = async () => {
            // ⭐ Cambiamos el nombre de la imagen a 'planta_completa_outline'
            const url = await loadImageUrlByName('planta_completa_outline');
            setPlantaUrl(url);
            setLoading(false);
        };
        cargar();
    }, []);

    // --- Lógica de Drag and Drop ---
    const handleDragStart = (e, partId) => {
        if (verified) return;
        e.dataTransfer.setData("partId", partId);
        setDraggingItem(partId);
    };

    const handleDragEnd = () => {
        setDraggingItem(null);
    };

    const handleDrop = (e, targetZoneId) => {
        e.preventDefault();
        if (verified) return;

        const partId = e.dataTransfer.getData("partId");
        if (!partId) return;

        const zoneIsOccupied = Object.values(locations).includes(targetZoneId);

        setLocations(prev => {
            const newState = { ...prev };
            if (zoneIsOccupied) {
                const partInZone = Object.keys(locations).find(key => locations[key] === targetZoneId);
                if (partInZone && partInZone !== partId) {
                    delete newState[partInZone];
                }
            }
            newState[partId] = targetZoneId;
            return newState;
        });
    };

    const handleDragOver = (e) => { e.preventDefault(); };

    // --- Lógica de Verificación ---
    const verify = () => {
        let allCorrect = true;

        if (Object.keys(locations).length !== PARTES_PLANTA.length) {
            alert(`Debes colocar las ${PARTES_PLANTA.length} etiquetas antes de verificar.`);
            return;
        }

        PARTES_PLANTA.forEach(parte => {
            const currentZone = locations[parte.id];
            if (currentZone !== parte.correctTarget) {
                allCorrect = false;
            }
        });

        setIsFinalCheckCorrect(allCorrect);
        setVerified(true);

        if (allCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        setLocations({});
        setVerified(false);
        setDraggingItem(null);
        setIsFinalCheckCorrect(false);
    };

    // --- Renderizado y Variables ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Cargando actividad de la planta... 🌻</div>;
    }

    const unplacedParts = PARTES_PLANTA.filter(p => !Object.keys(locations).includes(p.id));

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-lime-50 to-green-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-6xl">
                <h2 className="text-4xl font-extrabold text-green-800 text-center drop-shadow-sm flex-grow">
                    🌸 ¡Cada parte tiene un lugar mágico!
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>

            <p className="text-lg text-indigo-800 mb-4 text-center">
                ✨ ¡Pon la raíz, el tallo y las hojas para que crezca feliz!
            </p>


            <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">

                {/* 1. ETIQUETAS (Draggables - Izquierda: LISTA VERTICAL) */}
                <div className="md:w-1/4 p-6 bg-white rounded-xl shadow-2xl flex flex-col items-center border border-lime-300">
                    <h3 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-2 w-full text-center">Partes Disponibles</h3>
                    <div className="flex flex-col space-y-3 w-full items-center">
                        {PARTES_PLANTA.map(parte => {
                            const isPlaced = Object.keys(locations).includes(parte.id);
                            if (isPlaced && !verified) return null;

                            const isDraggingThis = draggingItem === parte.id;

                            const partClass = verified
                                ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                                : (isPlaced
                                    ? 'bg-lime-100 border-lime-400 cursor-not-allowed'
                                    : 'bg-yellow-200 cursor-grab hover:scale-105 border-yellow-400');

                            return (
                                <div
                                    key={parte.id}
                                    draggable={!verified && !isPlaced}
                                    onDragStart={(e) => handleDragStart(e, parte.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                                        w-full p-3 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-200
                                        ${partClass}
                                        ${isDraggingThis ? 'ring-4 ring-green-500 shadow-xl' : ''}
                                    `}
                                >
                                    {parte.name}
                                </div>
                            );
                        })}
                        {unplacedParts.length === 0 && !verified && <p className="text-green-700 font-bold mt-4">¡Todas las partes están en la planta!</p>}
                    </div>
                </div>

                {/* 2. IMAGEN DE LA PLANTA (Drop Targets - Derecha) */}
                <div className="md:w-3/4 relative flex justify-center p-6 bg-white rounded-xl shadow-2xl border border-lime-300">
                    {/* IMPORTANTE: Necesitas una imagen llamada 'planta_completa_outline' en tu carpeta 'assets/images' */}
                    <img
                        src={plantaUrl}
                        alt="Esquema de una Planta Completa"
                        className="max-h-full max-w-full object-contain"
                        style={{ height: '650px', width: 'auto' }}
                    />

                    {/* Zonas de Drop Cuadradas/Rectangulares */}
                    {TARGET_ZONES.map(zone => {
                        const partId = Object.keys(locations).find(key => locations[key] === zone.id);
                        const part = partId ? PARTES_PLANTA.find(p => p.id === partId) : null;

                        let zoneStyle = 'border-dashed border-2 border-gray-400 bg-gray-50 opacity-50';
                        const zoneText = part ? part.name : '';

                        if (part) {
                            const isCorrect = part.correctTarget === zone.id;
                            if (verified) {
                                zoneStyle = isCorrect ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-100 border-red-500 text-red-900';
                            } else {
                                zoneStyle = 'bg-blue-100 border-blue-500 opacity-100 text-gray-800';
                            }
                        }

                        return (
                            <div
                                key={zone.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, zone.id)}
                                className={`
                                    absolute rounded-lg flex items-center justify-center text-center font-semibold text-sm p-1 transition-all duration-200 
                                    ${zoneStyle}
                                `}
                                style={{
                                    top: zone.top,
                                    left: zone.left,
                                    width: zone.width,
                                    height: zone.height,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10
                                }}
                            >
                                {zoneText}
                                {part && verified && (
                                    <span className="absolute top-0 right-0 text-xl transform translate-x-1/4 -translate-y-1/4">
                                        {part.correctTarget === zone.id ? '✅' : '❌'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Botones de Control --- */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || unplacedParts.length > 0}
                    className={`px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || unplacedParts.length > 0 ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                    ✅ Verificar Etiquetas
                </button>

                <button
                    onClick={handleRestart}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-indigo-700"
                >
                    🔄 Reiniciar
                </button>
            </div>

            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isFinalCheckCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isFinalCheckCorrect ? '¡Etiquetado Perfecto! 🎉' : '😕 Hay errores. Observa el feedback y vuelve a intentarlo.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default PlantaAct1PartesDeLaPlanta;