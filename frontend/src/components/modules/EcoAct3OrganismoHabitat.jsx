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


// --- ⭐ DATOS DE LA ACTIVIDAD ⭐ ---
const HABITATS = [
    { id: 'oceano', name: 'Océano 🌊', imageBase: 'ocean_habitat' },
    { id: 'desierto', name: 'Desierto 🌵', imageBase: 'desert_habitat' },
    { id: 'bosque', name: 'Bosque 🌲', imageBase: 'forest_habitat' },
];

const ORGANISMOS_POOL = [
    { id: 'camello', name: 'Camello', imageBase: 'camello_icon', habitat: 'desierto' },
    { id: 'tiburon', name: 'Tiburón', imageBase: 'tiburon_icon', habitat: 'oceano' },
    { id: 'mono', name: 'Mono', imageBase: 'mono_icon', habitat: 'bosque' },

    { id: 'ciervo', name: 'Ciervo', imageBase: 'ciervo_icon', habitat: 'bosque' },
    { id: 'ballena', name: 'Ballena', imageBase: 'ballena_icon', habitat: 'oceano' },
    { id: 'lechuza', name: 'Lechuza', imageBase: 'lechuza_icon', habitat: 'bosque' },
    { id: 'serpiente', name: 'Serpiente', imageBase: 'serpiente_icon', habitat: 'desierto' },
    { id: 'pez_payaso', name: 'Pez Payaso', imageBase: 'pez_payaso_icon', habitat: 'oceano' },
];


const EcoAct3OrganismoHabitat = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [organismosContent, setOrganismosContent] = useState([]);
    const [habitatAssets, setHabitatAssets] = useState({});
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Haz clic en la imagen de un animalito.' },
        { iconName: 'Target', colorTheme: 'green', title: '2. Ubica', description: 'Haz clic en el hábitat donde crees que vive.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Cuando termines, verifica tu clasificación.' }
    ];

    const NUM_ORGANISMOS_TO_SHOW = 6;


    // --- Lógica de Carga Inicial y Mezcla ---
    const loadContent = useCallback(async () => {
        setVerified(false);
        setIsPerfect(false);
        setLocations({});

        const shuffledPool = shuffleArray(ORGANISMOS_POOL);
        const organismsForSession = shuffledPool.slice(0, NUM_ORGANISMOS_TO_SHOW);

        const assetsToLoad = [
            ...organismsForSession.map(o => o.imageBase),
            ...HABITATS.map(h => h.imageBase)
        ];

        const loadedAssets = {};
        await Promise.all(assetsToLoad.map(async base => {
            loadedAssets[base] = await loadImageUrlByName(base);
        }));

        const initialLocations = organismsForSession.reduce((acc, o) => {
            acc[o.id] = 'source';
            return acc;
        }, {});

        setOrganismosContent(organismsForSession.map(o => ({ ...o, imageUrl: loadedAssets[o.imageBase] })));
        setHabitatAssets(HABITATS.reduce((acc, h) => ({ ...acc, [h.id]: loadedAssets[h.imageBase] }), {}));
        setLocations(initialLocations);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);


    // --- Lógica de Selección y Movimiento (Click) ---

    // 1. Selecciona/deselecciona un organismo
    const handleSelectElement = (organismId) => {
        if (verified) return;
        setSelectedElementId(prev => (prev === organismId ? null : organismId));
    };

    // 2. Mueve al organismo seleccionado al hábitat clickeado
    const handleHabitatClick = (targetHabitatId) => {
        if (verified || !selectedElementId) return;
        setLocations(prev => ({ ...prev, [selectedElementId]: targetHabitatId }));
        setSelectedElementId(null);
    };

    // 3. Devuelve al source clickeando en el panel inferior
    const handleReturnToSource = () => {
        if (verified || !selectedElementId) return;
        setLocations(prev => ({ ...prev, [selectedElementId]: 'source' }));
        setSelectedElementId(null);
    };

    // --- Lógica de Verificación (CORREGIDA) ---

    const verify = () => {
        const allPlaced = Object.values(locations).every(loc => loc !== 'source');
        if (!allPlaced) {
            alert(`Debes clasificar los ${NUM_ORGANISMOS_TO_SHOW} organismos antes de verificar.`);
            return;
        }

        let totalCorrect = 0;

        organismosContent.forEach(organism => {
            // Verifica si la ubicación actual coincide con el hábitat correcto del organismo
            if (locations[organism.id] === organism.habitat) {
                totalCorrect++;
            }
        });

        const isFullyCorrect = totalCorrect === NUM_ORGANISMOS_TO_SHOW;

        setIsPerfect(isFullyCorrect);
        setVerified(true);

        if (isFullyCorrect) {
            setTimeout(() => onComplete(true), 2000);
        }
    };

    const handleRestart = () => {
        loadContent();
    };

    // --- Renderizado Auxiliar ---

    const getOrganismCardClass = (organismId) => {
        const isSelected = selectedElementId === organismId;
        let baseStyle = "bg-white shadow-md border-2 border-gray-200 transition-all duration-200 cursor-pointer";
        return `${baseStyle} ${isSelected ? 'ring-4 ring-orange-500 scale-105 z-10' : ''}`;
    };

    const HabitatBox = ({ habitat }) => {
        const organismsInBox = organismosContent.filter(o => locations[o.id] === habitat.id);

        let boxStyle = "bg-gray-50 border-2 border-gray-300";
        let feedbackIcon = null;
        const isTarget = selectedElementId && !verified;

        if (verified) {
            const hasWrong = organismsInBox.some(o => o.habitat !== habitat.id);
            boxStyle = hasWrong ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500";
            feedbackIcon = hasWrong ? "❌" : "✅";
        } else if (isTarget) {
            boxStyle = "border-blue-500 ring-4 ring-blue-300 cursor-pointer hover:scale-[1.02]";
        }

        return (
            <div
                onClick={() => handleHabitatClick(habitat.id)}
                className={`flex flex-col items-center p-4 rounded-xl shadow-lg min-h-[300px] transition-all duration-300 relative ${boxStyle}`}
                style={{ backgroundImage: `url(${habitatAssets[habitat.imageBase]})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(255,255,255,0.8)', backgroundBlendMode: 'lighten' }}
            >
                <h3 className="text-2xl font-bold text-gray-800 bg-white/70 px-3 py-1 rounded-full shadow-lg mb-4">{habitat.name}</h3>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                    {organismsInBox.map(o => (
                        <div
                            key={o.id}
                            onClick={(e) => { e.stopPropagation(); !verified && handleSelectElement(o.id); }}
                            className={`w-28 h-28 p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${verified ? (o.habitat === habitat.id ? 'bg-green-200/90 ring-4 ring-green-400' : 'bg-red-200/90 ring-4 ring-red-400') : 'bg-white/80 hover:bg-white hover:scale-105'} ${selectedElementId === o.id ? 'ring-4 ring-orange-500 scale-105 z-10' : ''}`}
                        >
                            <img src={o.imageUrl} alt={o.name} className="w-16 h-16 object-contain drop-shadow-sm" />
                            <p className="text-xs font-bold text-center mt-1 text-gray-800 leading-tight">{o.name}</p>
                        </div>
                    ))}
                </div>

                {verified && feedbackIcon && (
                    <span className="absolute top-2 right-2 text-3xl">{feedbackIcon}</span>
                )}
            </div>
        );
    };


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-10 font-bold text-green-700 text-xl">Cargando ecosistemas... 🌴</div>;
    }

    const organismsInSource = organismosContent.filter(o => locations[o.id] === 'source');
    const isAllPlaced = organismsInSource.length === 0;

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-indigo-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-7xl">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center drop-shadow-sm flex-grow">
                    🗺️ ¿A qué rincón del mundo pertenece cada amigo?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-xl text-gray-600 mb-8">
                ✨ ¡Lleva a cada animalito a su casa para que pueda descansar!
            </p>

            {/* --- ZONAS DE DROP DE HÁBITAT --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mb-8">
                {HABITATS.map(habitat => (
                    <HabitatBox key={habitat.id} habitat={habitat} />
                ))}
            </div>

            {/* --- ZONA DE ORGANISMOS DISPONIBLES (SOURCE) --- */}
            <div
                onClick={handleReturnToSource}
                className={`w-full max-w-7xl bg-white p-6 rounded-xl shadow-2xl border-4 transition-colors ${selectedElementId && locations[selectedElementId] !== 'source' ? 'border-dashed border-blue-400 cursor-pointer hover:bg-blue-50' : 'border-dashed border-gray-300'}`}
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                    Organismos por Clasificar ({organismsInSource.length} / {NUM_ORGANISMOS_TO_SHOW})
                </h3>

                <div className="flex flex-wrap justify-center gap-4 min-h-[100px]">
                    {organismsInSource.map(organism => (
                        <div
                            key={organism.id}
                            onClick={(e) => { e.stopPropagation(); handleSelectElement(organism.id); }}
                            className={`w-48 h-48 p-3 rounded-2xl flex flex-col items-center justify-center hover:scale-105 ${getOrganismCardClass(organism.id)}`}
                        >
                            <img src={organism.imageUrl} alt={organism.name} className="w-32 h-32 object-contain drop-shadow-md" />
                            <p className="text-base font-extrabold text-center mt-2 text-gray-800 leading-tight">{organism.name}</p>
                        </div>
                    ))}
                    {!verified && organismsInSource.length === 0 && <p className="text-green-600 font-bold">¡Listo para verificar!</p>}
                </div>
            </div>

            {/* --- Botones de Control y Feedback --- */}
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
                        : "😕 Hay errores. Revisa la retroalimentación e intenta de nuevo."}
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default EcoAct3OrganismoHabitat;