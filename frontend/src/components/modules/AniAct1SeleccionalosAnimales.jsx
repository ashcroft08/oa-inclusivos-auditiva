import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// 1. Importaciones dinámicas de imágenes
const senasImport = import.meta.glob("../../assets/senas/*.webp", { eager: false });
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

// --- LÓGICA DE AGRUPACIÓN Y CARGA DE IMÁGENES ---
// Función auxiliar: agrupa las imágenes por nombre base (ej. "dog_1", "dog_2" → "dog")
const agruparImagenesPorTipo = async (rutas) => {
    const grupos = {};

    const normalizar = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]/g, "");

    for (const path in rutas) {
        const loader = async () => (await rutas[path]()).default; // Función para carga diferida

        const nombreArchivo = path.split("/").pop().split(".")[0].toLowerCase();

        // Obtener el nombre base (ej. 'dog_1' -> 'dog')
        let nombreBase = nombreArchivo.replace(/_\d+$/, '');
        nombreBase = normalizar(nombreBase.replace(/[0-9]/g, ""));

        if (!grupos[nombreBase]) grupos[nombreBase] = [];
        grupos[nombreBase].push({
            id: nombreArchivo,
            loader: loader,
        });
    }

    return grupos;
};

// --- POOL DE REFERENCIA (Solo nombres base) ---
const ACTIVITY_POOL_BASE = [
    // Animales
    { type: "animal", nombreBase: "dog", nombre: "Perro" },
    { type: "animal", nombreBase: "cat", nombre: "Gato" },
    { type: "animal", nombreBase: "fish", nombre: "Pez" },
    { type: "animal", nombreBase: "bird", nombre: "Pájaro" },
    { type: "animal", nombreBase: "cow", nombre: "Vaca" },
    { type: "animal", nombreBase: "horse", nombre: "Caballo" },

    // Distractores
    { type: "planta", nombreBase: "tree", nombre: "Árbol" },
    { type: "planta", nombreBase: "flower", nombre: "Flor" },
    { type: "objeto", nombreBase: "sun", nombre: "Sol" },
    { type: "objeto", nombreBase: "house", nombre: "Casa" },
    { type: "objeto", nombreBase: "chair", nombre: "Silla" },
    { type: "objeto", nombreBase: "car", nombre: "Auto" },
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


const AniAct1SeleccionalosAnimales = ({ onComplete }) => {

    const [selectedItems, setSelectedItems] = useState([]);
    const [verified, setVerified] = useState(false);
    const [contentData, setContentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionCorrectIds, setSessionCorrectIds] = useState([]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Search', colorTheme: 'blue', title: '1. Busca', description: 'Encuentra las imágenes que corresponden a animales.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Selecciona', description: 'Haz clic en los animales correctos.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Verifica tus respuestas usando el botón.' }
    ];


    // FUNCIÓN CLAVE: SELECCIONA UN SUBCONJUNTO ALEATORIO
    const shuffleAndSelectContent = useCallback(async () => {
        setLoading(true);
        setSelectedItems([]);
        setVerified(false);

        const allImageGroups = await agruparImagenesPorTipo({ ...imagenesImport, ...senasImport });

        let availableItems = [];
        ACTIVITY_POOL_BASE.forEach(baseItem => {
            const variants = allImageGroups[baseItem.nombreBase] || [];

            if (variants.length > 0) {
                const randomVariant = variants[Math.floor(Math.random() * variants.length)];

                availableItems.push({
                    id: randomVariant.id,
                    type: baseItem.type,
                    // ⭐ CAMBIO: Solo usa el nombre base sin el índice
                    nombre: baseItem.nombre,
                    loader: randomVariant.loader,
                });
            }
        });

        const animals = availableItems.filter(item => item.type === "animal");
        const distractors = availableItems.filter(item => item.type !== "animal");

        const NUM_ITEMS_TO_SHOW = 8;
        const TARGET_ANIMALS = Math.min(Math.floor(NUM_ITEMS_TO_SHOW / 2), animals.length);
        const TARGET_DISTRACTORS = Math.min(NUM_ITEMS_TO_SHOW - TARGET_ANIMALS, distractors.length);

        const selectedAnimals = shuffleArray(animals).slice(0, TARGET_ANIMALS);
        const selectedDistractors = shuffleArray(distractors).slice(0, TARGET_DISTRACTORS);

        let finalSet = shuffleArray([...selectedAnimals, ...selectedDistractors]);

        const loadedKeys = await Promise.all(
            finalSet.map(async (item) => {
                const imageUrl = await item.loader();
                return { ...item, imageUrl };
            })
        );

        setSessionCorrectIds(selectedAnimals.map(a => a.id));
        setContentData(loadedKeys);
        setLoading(false);
    }, []);


    useEffect(() => {
        shuffleAndSelectContent();
    }, [shuffleAndSelectContent]);


    const toggleSelection = (itemId) => {
        if (verified) return;
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const verify = () => {
        const correctIds = sessionCorrectIds;
        const correctSelections = selectedItems.filter(id => correctIds.includes(id));

        const allCorrect = (correctSelections.length === correctIds.length) && (selectedItems.length === correctIds.length);

        setVerified(true);
        if (allCorrect) {
            onComplete?.(true);
        }
    };

    const reset = () => {
        shuffleAndSelectContent(); // Carga un nuevo set aleatorio
    };

    const isPerfect = verified && sessionCorrectIds.length === selectedItems.filter(id => sessionCorrectIds.includes(id)).length && sessionCorrectIds.length === selectedItems.length;

    if (loading) {
        return <div className="text-center p-10 text-orange-600 font-semibold text-xl">Cargando nuevo set de imágenes... 🐘</div>;
    }

    return (
        <div className="flex flex-col items-center p-4 w-full">
            <div className="flex items-center gap-4 mb-4">
                <h2
                    className="text-4xl font-bold text-orange-800 text-center drop-shadow"
                    dangerouslySetInnerHTML={{ __html: "🧐 ¿Puedes encontrar los 4 animales escondidos?" }}
                />
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-xl text-orange-700 mb-8">
                ✅ Necesitamos encontrar {sessionCorrectIds.length} animales.
            </p>

            <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
                {contentData.map(item => {
                    const isSelected = selectedItems.includes(item.id);
                    const isCorrect = sessionCorrectIds.includes(item.id);

                    let colorClass = "bg-white";
                    let icon = null;
                    let borderClass = "border-gray-300 border-2";

                    if (verified) {
                        if (isSelected && isCorrect) {
                            colorClass = "bg-green-100";
                            icon = "✅";
                            borderClass = "border-green-600 border-4";
                        } else if (isSelected && !isCorrect) {
                            colorClass = "bg-red-100";
                            icon = "❌";
                            borderClass = "border-red-600 border-4";
                        } else if (!isSelected && isCorrect) {
                            colorClass = "bg-white";
                            borderClass = "border-green-500 border-dashed border-4";
                            icon = "👆";
                        } else {
                            colorClass = "bg-gray-50";
                        }
                    } else if (isSelected) {
                        colorClass = "bg-orange-100";
                        borderClass = "border-orange-500 border-4";
                    }


                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleSelection(item.id)}
                            className={`
                                w-40 h-40 rounded-xl shadow-lg p-3 flex flex-col items-center justify-center relative transition-all duration-200
                                cursor-pointer hover:scale-[1.03]
                                ${colorClass} ${borderClass}
                                ${verified ? "cursor-not-allowed opacity-80" : ""}
                            `}
                        >
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.nombre}
                                    className="w-28 h-28 object-contain mb-1"
                                />
                            )}
                            {/* item.nombre ahora es solo "Perro", "Gato", etc. */}
                            <p className="text-sm font-semibold text-gray-700">{item.nombre}</p>

                            {icon && (
                                <span className="absolute -top-2 -right-2 text-2xl bg-white rounded-full p-1 shadow">
                                    {icon}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Botones de Control */}
            <div className="mt-8 flex gap-6">
                {!verified && (
                    <button
                        onClick={verify}
                        disabled={selectedItems.length === 0}
                        className={`px-8 py-3 font-bold rounded-full shadow-lg transition-all 
                            ${selectedItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                        ✅ Verificar
                    </button>
                )}

                <button
                    onClick={reset}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {/* Mensaje de Feedback */}
            {isPerfect && (
                <p className="mt-6 text-2xl font-bold text-green-600 animate-bounce">
                    ¡Correcto! Todos los animales fueron identificados. 🎉
                </p>
            )}

            {verified && !isPerfect && (
                <p className="mt-6 text-xl font-bold text-red-600">
                    😕 Hay errores. Revisa la retroalimentación visual e intenta de nuevo.
                </p>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct1SeleccionalosAnimales;