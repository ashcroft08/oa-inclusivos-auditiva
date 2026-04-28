import React, { useState, useEffect, useCallback } from "react";
import Xarrow from "react-xarrows";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp,PNG,JPG}", { eager: false });

const loadImageUrlByName = async (nombreBase) => {
    const allImports = imagenesImport;
    const key = Object.keys(allImports).find(path =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );
    if (key) {
        const module = await allImports[key]();
        return module.default;
    }
    console.warn(`Asset no encontrado: ${nombreBase}`);
    return null;
};

// Barajar
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- Pool de Animales (Asegurando 3 de cada tipo) ---
const ANIMAL_POOL_BASE = [
    // Domésticos
    { id: 'perro_an', name: 'Perro', imageBase: 'dog_icon1', habitat: 'domestico' },
    { id: 'gato_an', name: 'Gato', imageBase: 'cat_icon1', habitat: 'domestico' },
    { id: 'vaca_an', name: 'Vaca', imageBase: 'cow_icon1', habitat: 'domestico' },
    { id: 'caballo_an', name: 'Caballo', imageBase: 'horse_icon1', habitat: 'domestico' },
    { id: 'gallina_an', name: 'Gallina', imageBase: 'chicken_icon1', habitat: 'domestico' },
    { id: 'cerdo_an', name: 'Cerdo', imageBase: 'pig_icon1', habitat: 'domestico' },

    // Salvajes
    { id: 'leon_an', name: 'León', imageBase: 'lion_icon1', habitat: 'salvaje' },
    { id: 'tigre_an', name: 'Tigre', imageBase: 'tiger_icon1', habitat: 'salvaje' },
    { id: 'elefante_an', name: 'Elefante', imageBase: 'elephant_icon1', habitat: 'salvaje' },
    { id: 'zorro_an', name: 'Zorro', imageBase: 'fox_icon1', habitat: 'salvaje' },
    { id: 'mono_an', name: 'Mono', imageBase: 'monkey_icon1', habitat: 'salvaje' },
    { id: 'zebra_an', name: 'Zebra', imageBase: 'zebra_icon1', habitat: 'salvaje' },
    { id: 'rinoceronte_an', name: 'Rinoceronte', imageBase: 'rhino_icon1', habitat: 'salvaje' },
];

const TARGET_DATA = [
    { id: 'domestico', name: 'Doméstico 🏡', imageBase: 'house_target' },
    { id: 'salvaje', name: 'Salvaje 🌳', imageBase: 'jungle_target' },
];

const NUM_ANIMALS_TO_SHOW = 6; // 3 a la izquierda, 3 a la derecha

// --- Componente Principal ---
const AniAct9ClasificaLineas = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [animalContent, setAnimalContent] = useState([]);
    const [targetImages, setTargetImages] = useState({ domestico: null, salvaje: null });

    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    const [conexiones, setConexiones] = useState([]);
    const [isActivityCompleted, setIsActivityCompleted] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MapPin', colorTheme: 'blue', title: '1. Inicia', description: 'Haz clic primero en un hábitat (Doméstico o Salvaje) para empezar.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Conecta', description: 'Luego, haz clic en un animal para trazar una línea y conectarlo.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Repite hasta conectar todos y verifica tus respuestas.' }
    ];

    // --- Cargar animales aleatorios ---
    const loadRandomActivity = useCallback(async () => {
        setLoading(true);
        setIsActivityCompleted(false);
        setConexiones([]);
        setSelectedId(null);
        setFeedbackMessage(null);
        setCorrectCount(0);

        // Aseguramos 3 domésticos y 3 salvajes
        const domesticos = shuffleArray(ANIMAL_POOL_BASE.filter(a => a.habitat === 'domestico')).slice(0, 3);
        const salvajes = shuffleArray(ANIMAL_POOL_BASE.filter(a => a.habitat === 'salvaje')).slice(0, 3);

        const animalsForSession = shuffleArray([...domesticos, ...salvajes]);

        const loadedAnimals = await Promise.all(
            animalsForSession.map(async item => {
                const url = await loadImageUrlByName(item.imageBase);
                return { ...item, url, type: 'animal' };
            })
        );

        const houseUrl = await loadImageUrlByName("house_target");
        const jungleUrl = await loadImageUrlByName("jungle_target");

        setTargetImages({ domestico: houseUrl, salvaje: jungleUrl });
        setAnimalContent(loadedAnimals.filter(a => a.url));
        setLoading(false);
    }, []);

    useEffect(() => { loadRandomActivity(); }, [loadRandomActivity]);

    // --- Interacción ---
    const handleClick = (id, type) => {
        if (isActivityCompleted) return;

        if (!selectedId) {
            setSelectedId(id);
            setSelectedType(type);
            setFeedbackMessage(null);
        } else if (selectedType !== type) {

            const startId = type === 'habitat' ? id : selectedId;
            const endId = type === 'animal' ? id : selectedId;

            if (startId !== 'domestico' && startId !== 'salvaje') {
                setFeedbackMessage({ type: 'error', text: 'El primer clic debe ser el Hábitat.' });
                setSelectedId(null); setSelectedType(null);
                return;
            }

            setConexiones(prev => prev.filter(c => c.end !== endId));

            setConexiones(prev => [
                ...prev,
                { start: startId, end: endId, verified: false, isCorrect: false },
            ]);

            setSelectedId(null);
            setSelectedType(null);

        } else if (selectedId === id) {
            setSelectedId(null);
            setSelectedType(null);
        } else {
            setSelectedId(id);
        }
    };

    // --- Verificación ---
    const handleVerificar = () => {
        if (conexiones.length === 0) {
            setFeedbackMessage({ type: 'error', text: `⚠️ Conecta al menos un animal.` });
            return;
        }

        let newConexiones = [...conexiones];
        let correctMatches = 0;
        let totalAnimals = animalContent.length;

        const animalMap = animalContent.reduce((acc, obj) => {
            acc[obj.id] = obj.habitat;
            return acc;
        }, {});

        newConexiones = newConexiones.map(c => {
            // Solo verificar si no ha sido verificado antes
            if (c.verified) {
                if (c.isCorrect) correctMatches++;
                return c;
            }

            const isCorrect = c.start === animalMap[c.end];
            if (isCorrect) correctMatches++;

            return { ...c, verified: true, isCorrect };
        });

        setConexiones(newConexiones);
        setCorrectCount(correctMatches);

        // Mensaje de feedback según el estado de la actividad
        if (newConexiones.length === totalAnimals && correctMatches === totalAnimals) {
            setFeedbackMessage({ type: 'success', text: `🎉 ¡Clasificación Perfecta! (${correctMatches}/${totalAnimals})` });
            setIsActivityCompleted(true);
            setTimeout(() => onComplete(true), 2000);
        } else if (newConexiones.length === totalAnimals && correctMatches < totalAnimals) {
            setFeedbackMessage({ type: 'error', text: `❌ Tienes ${totalAnimals - correctMatches} errores. Las líneas incorrectas se muestran en rojo.` });
        } else {
            setFeedbackMessage({ type: 'info', text: `Llevas ${correctMatches}/${newConexiones.length} conexiones correctas. Te faltan ${totalAnimals - newConexiones.length} animales por conectar/verificar.` });
        }
    };

    // --- Reiniciar ---
    const handleReiniciarActividad = () => {
        loadRandomActivity();
    };

    const getLineColor = (connection) => {
        if (!connection.verified) return "#A78BFA";
        return connection.isCorrect ? "green" : "red";
    };

    // --- Estilos de Tarjetas ---
    const getCardClass = (id, type) => {
        const base = "p-3 rounded-xl shadow-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center";
        const baseCardSize = "w-48 h-48"; // Tamaño grande para animales

        // Estilo para Animales después de la verificación
        if (type === 'animal') {
            const c = conexiones.find(x => x.end === id && x.verified);
            if (c) return c.isCorrect ? `${base} ${baseCardSize} bg-green-200 text-green-800` : `${base} ${baseCardSize} bg-red-200 text-red-800`;
        }

        // Estado de Selección
        if (selectedId === id) {
            // Mantener el tamaño de la tarjeta de hábitat si es hábitat
            const sizeClass = type === 'habitat' ? 'w-64 h-44' : baseCardSize;
            return `${base} ${sizeClass} bg-blue-200 ring-4 ring-blue-400 transform scale-105`;
        }

        // Estilo por defecto para Hábitats
        if (type === 'habitat') {
            return `${base} w-64 h-44 bg-yellow-100 border-2 border-yellow-400 hover:scale-105`;
        }

        // Estilo por defecto para Animales
        return `${base} ${baseCardSize} bg-white text-gray-800 hover:scale-105`;
    };

    if (loading) return <div className="text-xl">Cargando animales...</div>;

    // Dividir los 6 animales: 3 izquierda, 3 derecha
    const animalsLeft = animalContent.slice(0, 3);
    const animalsRight = animalContent.slice(3, 6);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">

            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center">
                    🌳 ¿Vive en una casita o en la selva?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-lg text-slate-600 mb-8 text-center">
                ✨ ¡Une a cada animalito con el lugar donde duerme feliz!
            </p>

            <div className="relative w-full max-w-7xl min-h-[700px] bg-white rounded-xl shadow-2xl border-4 border-indigo-300 p-8 flex">

                {/* Columna Izquierda (Animales) */}
                <div className="flex flex-col justify-around w-1/4 h-full py-4">
                    {animalsLeft.map(animal => (
                        <div
                            key={animal.id}
                            id={animal.id}
                            onClick={() => handleClick(animal.id, 'animal')}
                            className={getCardClass(animal.id, 'animal')}
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            <img src={animal.url} alt={animal.name} className="w-32 h-32 object-contain" />
                            <p className="mt-2 font-semibold text-lg">{animal.name}</p>
                        </div>
                    ))}
                </div>

                {/* Targets (DOMÉSTICO y SALVAJE) - Ajuste de margen y padding para centrar más abajo */}
                <div className="flex flex-col justify-center w-2/4 h-full items-center py-20 space-y-28">
                    {TARGET_DATA.map(target => (
                        <div
                            key={target.id}
                            id={target.id}
                            onClick={() => handleClick(target.id, 'habitat')}
                            className={getCardClass(target.id, 'habitat')}
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            <h3 className="text-2xl font-bold mb-2">{target.name}</h3>
                            <img src={targetImages[target.id]} alt={target.name} className="w-28 h-28 object-contain" />
                        </div>
                    ))}
                </div>

                {/* Columna Derecha (Animales) */}
                <div className="flex flex-col justify-around w-1/4 h-full py-4">
                    {animalsRight.map(animal => (
                        <div
                            key={animal.id}
                            id={animal.id}
                            onClick={() => handleClick(animal.id, 'animal')}
                            className={getCardClass(animal.id, 'animal')}
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            <img src={animal.url} alt={animal.name} className="w-32 h-32 object-contain" />
                            <p className="mt-2 font-semibold text-lg">{animal.name}</p>
                        </div>
                    ))}
                </div>

                {/* Líneas */}
                {conexiones.map(c => (
                    <Xarrow
                        key={`${c.start}-${c.end}`}
                        start={c.start}
                        end={c.end}
                        color={getLineColor(c)}
                        strokeWidth={c.verified ? 5 : 4}
                        headSize={0}
                        curveness={0.6}
                        path="smooth"
                        animateDrawing={0.2}
                        zIndex={1}
                        startAnchor="middle"
                        endAnchor="middle"
                    />
                ))}
            </div>

            {/* Botones */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={handleVerificar}
                    disabled={conexiones.length === 0}
                    className="px-8 py-4 bg-green-600 text-white rounded-full text-xl font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    🔍 Verificar
                </button>

                <button
                    onClick={handleReiniciarActividad}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-full text-xl font-bold hover:bg-indigo-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {/* Feedback */}
            {feedbackMessage && (
                <div className={`mt-4 p-4 rounded-full font-bold text-lg text-center ${feedbackMessage.type === 'error' ? 'bg-red-200 text-red-800 border-2 border-red-500' :
                    feedbackMessage.type === 'success' ? 'bg-green-200 text-green-800 border-2 border-green-500' :
                        'bg-blue-100 text-blue-700 border-2 border-blue-400'
                    }`}>
                    {feedbackMessage.text}
                </div>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct9ClasificaLineas;