import React, { useState, useEffect, useCallback } from "react";
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

// Función para desordenar
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- DATOS DE LA ACTIVIDAD ---
const ESTACIONES = [
    { id: 'primavera', name: 'Primavera 🌸', color: '#B3E5FC' },
    { id: 'verano', name: 'Verano ☀️', color: '#FFF9C4' },
    { id: 'otono', name: 'Otoño 🍂', color: '#FFCCBC' },
    { id: 'invierno', name: 'Invierno ☃️', color: '#E0F7FA' },
];

const FENOMENOS_POOL = [
    { id: 'flores', name: 'Flores y Brotes', imageBase: 'flores_icon1', season: 'primavera' },
    { id: 'lluvia_suave', name: 'Lluvias suaves', imageBase: 'lluvia_icon', season: 'primavera' },
    { id: 'pajaros', name: 'Nacimiento de aves', imageBase: 'pollito_icon1', season: 'primavera' },

    { id: 'sol_fuerte', name: 'Calor intenso', imageBase: 'sol_fuerte_icon', season: 'verano' },
    { id: 'frutos_maduros', name: 'Frutos maduros', imageBase: 'fruta_icon1', season: 'verano' },
    { id: 'sequia', name: 'Sequía', imageBase: 'sequia_icon1', season: 'verano' },

    { id: 'hojas_caen', name: 'Caída de hojas', imageBase: 'hojas_caen_icon1', season: 'otono' },
    { id: 'cosecha', name: 'Cosecha de granos', imageBase: 'cosecha_icon1', season: 'otono' },
    { id: 'viento', name: 'Viento frío', imageBase: 'viento_icon', season: 'otono' },

    { id: 'nieve', name: 'Nieve/Heladas', imageBase: 'nieve_icon', season: 'invierno' },
    { id: 'hibernacion', name: 'Animales hibernando', imageBase: 'oso_hibernando_icon1', season: 'invierno' },
    { id: 'frio_extremo', name: 'Frío extremo', imageBase: 'frio_icon1', season: 'invierno' },
];

const NUM_FENOMENOS_TO_SHOW = 8;

const EcoAct6ClasificaEstaciones = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [fenomenosContent, setFenomenosContent] = useState([]);
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [selectedFenomeno, setSelectedFenomeno] = useState(null); // ⭐ Estado para el ítem seleccionado
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Haz clic en un fenómeno de la zona inferior.' },
        { iconName: 'Target', colorTheme: 'green', title: '2. Clasifica', description: 'Haz clic en la estación del año correspondiente.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al clasificar todos, presiona Verificar.' }
    ];

    // --- Carga Inicial ---
    const loadContent = useCallback(async () => {
        setVerified(false);
        setIsPerfect(false);
        setLocations({});
        setSelectedFenomeno(null);

        const fenomenosForSession = shuffleArray(FENOMENOS_POOL).slice(0, NUM_FENOMENOS_TO_SHOW);

        const loadedFenomenos = await Promise.all(
            fenomenosForSession.map(async (item) => {
                const url = await loadImageUrlByName(item.imageBase);
                return { ...item, url };
            })
        );

        const initialLocations = loadedFenomenos.reduce((acc, f) => {
            acc[f.id] = 'source';
            return acc;
        }, {});

        setFenomenosContent(loadedFenomenos.filter(f => f.url));
        setLocations(initialLocations);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    // --- Lógica de Selección y Movimiento (Click) ---

    // 1. Seleccionar un fenómeno (desde source o desde una caja)
    const handleSelectFenomeno = (fenomenoId) => {
        if (verified) return;
        // Si ya está seleccionado, deseleccionar. Si no, seleccionar.
        setSelectedFenomeno(prev => (prev === fenomenoId ? null : fenomenoId));
    };

    // 2. Hacer clic en una estación para mover el fenómeno seleccionado ahí
    const handleStationClick = (targetSeasonId) => {
        if (verified || !selectedFenomeno) return;

        setLocations(prev => ({ ...prev, [selectedFenomeno]: targetSeasonId }));
        setSelectedFenomeno(null); // Limpiar selección después de mover
    };

    // 3. Devolver al source (opcional, si se hace clic en el área de source)
    const handleReturnToSource = () => {
        if (verified || !selectedFenomeno) return;
        setLocations(prev => ({ ...prev, [selectedFenomeno]: 'source' }));
        setSelectedFenomeno(null);
    };

    // --- Verificación ---
    const verify = () => {
        const allPlaced = Object.values(locations).every(loc => loc !== 'source');
        if (!allPlaced) {
            alert(`Debes clasificar los ${fenomenosContent.length} fenómenos antes de verificar.`);
            return;
        }

        let totalCorrect = 0;
        fenomenosContent.forEach(fenomeno => {
            const placedSeasonId = locations[fenomeno.id];
            if (placedSeasonId === fenomeno.season) {
                totalCorrect++;
            }
        });

        const isFullyCorrect = totalCorrect === fenomenosContent.length;
        setIsPerfect(isFullyCorrect);
        setVerified(true);
        setSelectedFenomeno(null);

        if (isFullyCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        loadContent();
    };

    // --- Componentes Auxiliares ---

    const fenomenosInSource = fenomenosContent.filter(f => locations[f.id] === 'source');
    const isAllPlaced = fenomenosInSource.length === 0;

    const FenomenoCard = ({ fenomeno }) => {
        const isSelected = selectedFenomeno === fenomeno.id;
        const isPlaced = locations[fenomeno.id] !== 'source';

        let style = "bg-white shadow-md border-2 border-gray-200 transition-all duration-200 cursor-pointer hover:scale-105";
        let feedbackIcon = null;

        if (verified) {
            const isCorrect = locations[fenomeno.id] === fenomeno.season;
            // Solo mostramos feedback si NO está en source (aunque el verify impide verificar si hay en source)
            if (isPlaced) {
                style = isCorrect
                    ? "bg-green-100 border-green-500 ring-2 ring-green-300 opacity-90"
                    : "bg-red-100 border-red-500 ring-2 ring-red-300 opacity-90";
                feedbackIcon = isCorrect ? "✅" : "❌";
            }
        } else if (isSelected) {
            style = "bg-blue-100 border-blue-500 ring-4 ring-blue-300 scale-110 z-10";
        }

        const sizeClasses = isPlaced 
            ? "w-28 h-28 p-2 rounded-xl" // más pequeño al ubicarse
            : "w-44 h-44 p-3 rounded-2xl"; // gigante en source

        const imgClasses = isPlaced 
            ? "w-16 h-16" 
            : "w-28 h-28 drop-shadow-md";

        const textClasses = isPlaced 
            ? "text-xs font-bold mt-1" 
            : "text-sm font-extrabold mt-2";

        return (
            <div
                onClick={(e) => { e.stopPropagation(); handleSelectFenomeno(fenomeno.id); }}
                className={`flex flex-col items-center justify-center relative ${sizeClasses} ${style}`}
            >
                <img src={fenomeno.url} alt={fenomeno.name} className={`${imgClasses} object-contain pointer-events-none`} />
                <p className={`${textClasses} text-center pointer-events-none text-gray-800 leading-tight`}>{fenomeno.name}</p>
                {verified && feedbackIcon && <span className={`absolute ${isPlaced ? '-top-1 -right-1 text-xl' : '-top-2 -right-2 text-3xl'} bg-white rounded-full leading-none shadow`}>{feedbackIcon}</span>}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-indigo-700 text-xl">Cargando estaciones... ⏳</div>;

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-indigo-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-7xl">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center drop-shadow-sm flex-grow">
                    🔍 ¿Sabes cuándo hibernan los osos o cuándo nacen las flores?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                ✅ ¡Une cada pista con su estación correcta para ganar!
            </p>

            {/* --- CUADRANTES DE CLASIFICACIÓN (ZONAS DE DESTINO) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-7xl min-h-[300px]">
                {ESTACIONES.map(estacion => {
                    const isTarget = selectedFenomeno && !verified; // Si hay algo seleccionado, las cajas son targets

                    return (
                        <div
                            key={estacion.id}
                            onClick={() => handleStationClick(estacion.id)}
                            className={`p-3 rounded-xl shadow-inner border-4 flex flex-col items-center transition-all duration-200 
                                ${isTarget ? 'cursor-pointer hover:ring-4 hover:ring-indigo-300 hover:scale-[1.02]' : ''}
                                ${estacion.color ? '' : 'bg-white'} 
                            `}
                            style={{
                                backgroundColor: estacion.color,
                                borderColor: isTarget ? '#5C6BC0' : '#E0E0E0'
                            }}
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{estacion.name}</h3>
                            <div className="flex flex-wrap justify-center gap-2 w-full min-h-[150px]">
                                {fenomenosContent
                                    .filter(f => locations[f.id] === estacion.id)
                                    .map(f => <FenomenoCard key={f.id} fenomeno={f} />)
                                }
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- ZONA DE FENÓMENOS DISPONIBLES (SOURCE) --- */}
            <div
                onClick={handleReturnToSource} // Clic en el fondo devuelve al source
                className={`w-full max-w-7xl bg-white p-6 rounded-xl shadow-2xl border-4 border-dashed mt-8 transition-colors
                    ${selectedFenomeno && locations[selectedFenomeno] !== 'source' ? 'border-blue-400 bg-blue-50 cursor-pointer' : 'border-gray-300'}
                `}
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                    Fenómenos por Clasificar ({fenomenosInSource.length} / {fenomenosContent.length})
                </h3>

                <div className="flex flex-wrap justify-center gap-3 min-h-[100px]">
                    {fenomenosInSource.map(fenomeno => (
                        <FenomenoCard key={fenomeno.id} fenomeno={fenomeno} />
                    ))}
                    {!verified && isAllPlaced && <p className="text-green-600 font-bold">¡Listo para verificar!</p>}
                </div>
            </div>

            {/* --- Botones de Control --- */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={verify}
                    disabled={verified || !isAllPlaced}
                    className={`px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition-all ${verified || !isAllPlaced ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
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
                <p className={`mt-6 text-2xl font-bold ${isPerfect ? "text-green-600" : "text-red-600"}`}>
                    {isPerfect
                        ? "¡Clasificación Perfecta! 🎉"
                        : "😕 Hay errores. Revisa las tarjetas con ❌ e intenta de nuevo."}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct6ClasificaEstaciones;