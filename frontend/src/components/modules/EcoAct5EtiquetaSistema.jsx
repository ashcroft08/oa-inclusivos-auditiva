import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes ---
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

// --- DATOS: Coordenadas ajustadas al patrón Zig-Zag de la imagen ---
const PLANETAS_DATA = [
    { id: 'mercurio', name: 'MERCURIO', order: 1, top: '65%', left: '23%' }, // Abajo
    { id: 'venus', name: 'VENUS', order: 2, top: '30%', left: '29%' },       // Arriba
    { id: 'tierra', name: 'TIERRA', order: 3, top: '65%', left: '40%' },      // Abajo
    { id: 'marte', name: 'MARTE', order: 4, top: '30%', left: '45%' },        // Arriba
    { id: 'jupiter', name: 'JÚPITER', order: 5, top: '70%', left: '57%' },    // Abajo
    { id: 'saturno', name: 'SATURNO', order: 6, top: '25%', left: '68%' },    // Arriba (Más alto por los anillos)
    { id: 'urano', name: 'URANO', order: 7, top: '65%', left: '78%' },       // Abajo
    { id: 'neptuno', name: 'NEPTUNO', order: 8, top: '30%', left: '82%' },    // Arriba
];

const PLANETAS_NOMBRES = PLANETAS_DATA.map(p => p.name);
const SISTEMA_SOLAR_BASE = 'sistema_solar_diagram_1';

const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const EcoAct5EtiquetaSistema = ({ onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [sistemaSolarUrl, setSistemaSolarUrl] = useState(null);
    const [nombresDesordenados, setNombresDesordenados] = useState([]);
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Arrastra', description: 'Toma la etiqueta con el nombre de un planeta.' },
        { iconName: 'Target', colorTheme: 'green', title: '2. Suelta', description: 'Colócala en el recuadro correspondiente en el Sistema Solar.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar, presiona Verificar.' }
    ];

    useEffect(() => {
        const cargarContenido = async () => {
            const url = await loadImageUrlByName(SISTEMA_SOLAR_BASE);
            setSistemaSolarUrl(url);
            setNombresDesordenados(shuffleArray(PLANETAS_NOMBRES));
            setLoading(false);
        };
        cargarContenido();
    }, []);

    const handleDragStart = (e, name) => {
        if (verified) return;
        e.dataTransfer.setData("name", name);
        setDraggingItem(name);
    };

    const handleDragEnd = () => setDraggingItem(null);

    const handleDrop = (e, planetId) => {
        e.preventDefault();
        if (verified) return;
        const droppedName = e.dataTransfer.getData("name");
        if (!droppedName) return;

        setLocations(prev => {
            const newState = { ...prev };
            // Si la zona estaba ocupada, limpiarla
            const nameInZone = Object.keys(locations).find(key => locations[key] === planetId);
            if (nameInZone) delete newState[nameInZone];

            newState[droppedName] = planetId;
            return newState;
        });
    };

    const handleDragOver = (e) => e.preventDefault();

    const verify = () => {
        if (Object.keys(locations).length !== PLANETAS_DATA.length) {
            alert(`Faltan nombres por colocar.`);
            return;
        }
        let isFullyCorrect = true;
        const correctMap = PLANETAS_DATA.reduce((map, p) => { map[p.id] = p.name; return map; }, {});
        Object.keys(locations).forEach(placedName => {
            if (correctMap[locations[placedName]] !== placedName) isFullyCorrect = false;
        });

        setIsPerfect(isFullyCorrect);
        setVerified(true);
        if (isFullyCorrect) setTimeout(() => onComplete?.(true), 2000);
    };

    const handleRestart = () => {
        setLocations({});
        setVerified(false);
        setDraggingItem(null);
        setIsPerfect(false);
        setNombresDesordenados(shuffleArray(PLANETAS_NOMBRES));
    };

    // --- Estilos ---
    const getCardClass = (name) => {
        const isPlaced = !!locations[name];
        if (verified) {
            const targetId = locations[name];
            const correctId = PLANETAS_DATA.find(p => p.name === name)?.id;
            // Si está verificado, usamos colores fuertes para feedback
            return targetId === correctId
                ? "bg-green-500 border-green-700 text-white shadow-lg scale-110"
                : "bg-red-500 border-red-700 text-white opacity-50";
        }
        if (isPlaced) return "bg-gray-300 text-gray-500 border-gray-400 opacity-40 cursor-not-allowed";

        // Estilo normal de tarjeta arrastrable
        return `bg-white shadow-md border-2 border-orange-400 hover:scale-105 cursor-grab font-bold text-orange-900 ${draggingItem === name ? 'ring-4 ring-orange-200' : ''}`;
    };

    const getTargetZoneClass = (planetId) => {
        const isOccupied = Object.values(locations).includes(planetId);

        if (verified) {
            const placedName = Object.keys(locations).find(name => locations[name] === planetId);
            const correctName = PLANETAS_DATA.find(p => p.id === planetId)?.name;
            return placedName === correctName
                ? 'border-green-400 bg-green-100/90 text-green-900 shadow-[0_0_15px_rgba(74,222,128,0.8)]'
                : 'border-red-500 bg-red-100/90 text-red-900';
        }
        return isOccupied
            ? 'border-orange-400 bg-white/90 text-orange-900 shadow-lg scale-105'
            : 'border-white/30 bg-black/20 text-white hover:bg-white/10 hover:border-white/60';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-white bg-gray-900">Cargando...</div>;

    const availableNames = nombresDesordenados.filter(name => !locations[name]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-7xl">
                <h2 className="text-3xl font-extrabold text-white text-center flex-grow">✨ ¿Puedes poner a cada planeta en su órbita correcta?</h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-white mb-8 font-medium">
                🎯 ¡Arrastra los nombres y completa el vecindario del Sol!
            </p>

            <div className="w-full max-w-7xl p-4 bg-gray-800 rounded-xl shadow-2xl flex flex-col items-center border border-gray-700">

                {/* 1. IMAGEN DEL SISTEMA SOLAR */}
                <div className="relative w-full aspect-[16/7] max-h-[550px] overflow-hidden rounded-lg border border-gray-600 bg-black">
                    {sistemaSolarUrl && (
                        <img src={sistemaSolarUrl} alt="Sistema Solar" className="w-full h-full object-contain" />
                    )}

                    {/* Zonas de Drop */}
                    {PLANETAS_DATA.map(planeta => {
                        const placedName = Object.keys(locations).find(name => locations[name] === planeta.id);
                        return (
                            <div
                                key={planeta.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, planeta.id)}
                                className={`absolute flex items-center justify-center rounded-md border-2 border-dashed text-xs font-bold transition-all ${getTargetZoneClass(planeta.id)}`}
                                style={{
                                    top: planeta.top,
                                    left: planeta.left,
                                    transform: 'translate(-50%, -50%)',
                                    width: '100px',
                                    height: '35px',
                                    zIndex: 20
                                }}
                            >
                                {placedName || (!verified ? 'Aquí' : '')}
                                {verified && placedName && (
                                    <span className="absolute -top-2 -right-2 text-base bg-white rounded-full leading-none p-0.5 shadow-sm">
                                        {locations[placedName] === planeta.id ? '✅' : '❌'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. NOMBRES DISPONIBLES */}
                <div className="w-full mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex flex-wrap justify-center gap-3 min-h-[50px]">
                        {availableNames.map(name => (
                            <div
                                key={name}
                                draggable={!verified}
                                onDragStart={(e) => handleDragStart(e, name)}
                                onDragEnd={handleDragEnd}
                                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-sm transition-all ${getCardClass(name)}`}
                            >
                                {name}
                            </div>
                        ))}
                        {availableNames.length === 0 && !verified && <p className="text-green-400 font-bold animate-pulse">¡Listos para verificar!</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button onClick={verify} disabled={verified || availableNames.length > 0}
                    className={`px-8 py-3 font-bold text-lg rounded-full shadow-lg transition-all ${verified || availableNames.length > 0 ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                    ✅ Verificar
                </button>
                <button onClick={handleRestart} className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-500">
                    🔄 Reiniciar
                </button>
            </div>

            {verified && (
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? 'text-green-400' : 'text-red-400'}`}>
                    {isPerfect ? '🎉 ¡Correcto!' : '😕 Hay errores.'}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct5EtiquetaSistema;