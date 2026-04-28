import React, { useState, useEffect } from "react";
import Xarrow from "react-xarrows";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Carga de Imágenes ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp,PNG,JPG}");

const loadImageUrlByName = async (nombreBase) => {
    const key = Object.keys(imagenesImport).find((path) =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );
    if (key) {
        const module = await imagenesImport[key]();
        return module.default;
    }
    return null;
};

// Utilidad para mezclar
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// Datos
const CATEGORIAS_DATA = [
    { id: "arbol", name: "ÁRBOL 🌲" },
    { id: "arbusto", name: "ARBUSTO 🌳" },
    { id: "hierba", name: "HIERBA 🌱" },
];

const PLANTA_DATA = [
    // Árboles
    { id: "manzano", imageBase: "manzano_planta", type: "arbol", name: "Manzano" },
    { id: "pino", imageBase: "pino_planta", type: "arbol", name: "Pino" },
    { id: "roble", imageBase: "roble_planta", type: "arbol", name: "Roble" },
    { id: "naranjo", imageBase: "naranjo_planta", type: "arbol", name: "Naranjo" },
    
    // Arbustos
    { id: "rosa", imageBase: "rosa_planta", type: "arbusto", name: "Rosa" },
    { id: "lavanda", imageBase: "lavanda_arbusto", type: "arbusto", name: "Lavanda" },
    { id: "romero", imageBase: "romero_arbusto", type: "arbusto", name: "Romero" },
    { id: "hortensia", imageBase: "hortensia_arbusto", type: "arbusto", name: "Hortensia" },

    // Hierbas
    { id: "pasto", imageBase: "pasto_hierba", type: "hierba", name: "Pasto" },
    { id: "menta", imageBase: "menta_hierba", type: "hierba", name: "Menta" },
    { id: "manzanilla", imageBase: "manzanilla_hierba", type: "hierba", name: "Manzanilla" },
    { id: "cilantro", imageBase: "cilantro_hierba", type: "hierba", name: "Cilantro" },
];


const PlantaAct2ClasificaTipos = ({ onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [plantasContent, setPlantasContent] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [conexiones, setConexiones] = useState([]);
    const [verified, setVerified] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'MousePointer', colorTheme: 'blue', title: '1. Selecciona', description: 'Toca una categoría a la izquierda.' },
        { iconName: 'Target', colorTheme: 'indigo', title: '2. Conecta', description: 'Toca la planta correspondiente a la derecha para unirlas.' },
        { iconName: 'Check', colorTheme: 'emerald', title: '3. Verifica', description: 'Al terminar de conectar todas, verifica tus respuestas.' }
    ];

    const cargarPlantas = async () => {
        setLoading(true);
        // Seleccionar 2 plantas aleatorias de cada tipo para que salgan 6 en total en pantalla
        const arboles = shuffleArray(PLANTA_DATA.filter(p => p.type === 'arbol')).slice(0, 2);
        const arbustos = shuffleArray(PLANTA_DATA.filter(p => p.type === 'arbusto')).slice(0, 2);
        const hierbas = shuffleArray(PLANTA_DATA.filter(p => p.type === 'hierba')).slice(0, 2);
        
        const selectedPlants = [...arboles, ...arbustos, ...hierbas];

        const loaded = await Promise.all(
            selectedPlants.map(async (p) => ({
                ...p,
                url: await loadImageUrlByName(p.imageBase),
            }))
        );
        setPlantasContent(shuffleArray(loaded));
        setLoading(false);
    };

    // Cargar imágenes
    useEffect(() => {
        cargarPlantas();
    }, []);

    // Manejar clics
    const handleClick = (id, type) => {
        if (verified) return;

        // 1. Deseleccionar si tocas el mismo elemento que ya está seleccionado
        if (selectedId === id) {
            setSelectedId(null);
            setSelectedType(null);
            return;
        }

        // 2. Si tocas una planta que ya tiene línea (y no hay nada en selección), se quita la línea
        if (!selectedId && type === "planta" && conexiones.some((c) => c.end === id)) {
            setConexiones(conexiones.filter((c) => c.end !== id));
            setFeedbackMessage(null);
            return;
        }

        // 3. Primer clic en un elemento (seleccionar)
        if (!selectedId) {
            setSelectedId(id);
            setSelectedType(type);
            setFeedbackMessage(null);
            return;
        }

        // 4. Intentar hacer conexión de Categoría a Planta
        if (selectedType === "categoria" && type === "planta") {
            // Si la planta ya tiene línea, la sobreescribimos
            setConexiones([...conexiones.filter((c) => c.end !== id), { start: selectedId, end: id }]);
            setSelectedId(null);
            setSelectedType(null);
            return;
        }

        // 5. Intentar hacer conexión de Planta a Categoría (añadido para mayor flexibilidad)
        if (selectedType === "planta" && type === "categoria") {
            setConexiones([...conexiones.filter((c) => c.end !== selectedId), { start: id, end: selectedId }]);
            setSelectedId(null);
            setSelectedType(null);
            return;
        }

        // 6. Si tocas otro elemento inválido para conectar (ej. categoría a categoría), cambiamos la selección
        setSelectedId(id);
        setSelectedType(type);
    };

    const getLineColor = (c) => {
        if (!verified) return "#008cff";
        const planta = plantasContent.find((p) => p.id === c.end);
        if (!planta) return "red";
        return planta.type === c.start ? "green" : "red";
    };

    // Verificar
    const handleVerificar = () => {
        if (conexiones.length !== plantasContent.length) {
            setFeedbackMessage({
                type: "error",
                text: "Debes clasificar todas las plantas.",
            });
            return;
        }

        let correct = 0;

        conexiones.forEach((c) => {
            const planta = plantasContent.find((p) => p.id === c.end);
            if (planta && planta.type === c.start) correct++;
        });

        setVerified(true);

        if (correct === plantasContent.length) {
            setFeedbackMessage({
                type: "success",
                text: "¡Clasificación perfecta! 🌟",
            });
            setTimeout(() => onComplete(true), 1500);
        } else {
            setFeedbackMessage({
                type: "error",
                text: "Hay errores. Revisa las conexiones rojas.",
            });
        }
    };

    const handleLimpiar = () => {
        setConexiones([]);
        setVerified(false);
        setSelectedId(null);
        setFeedbackMessage(null);
        cargarPlantas(); // Recargar y barajar las plantas nuevamente
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
            <div className="flex items-center justify-center gap-4 mb-3 w-full max-w-6xl">
                <h2 className="text-4xl font-extrabold text-green-800 text-center flex-grow">
                    ✨ ¿Es un gigante, un mediano o un pequeñito?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-10 h-10" />
                </button>
            </div>
            <p className="text-lg text-gray-700 mb-6">
                🎯 ¡Une cada planta con su familia: Árbol, Arbusto o Hierba!
            </p>

            <div className="relative flex justify-center gap-16 w-full max-w-6xl h-[650px]">

                {/* CATEGORÍAS */}
                <div className="flex flex-col justify-between w-1/3">
                    {CATEGORIAS_DATA.map((cat) => (
                        <div
                            key={cat.id}
                            id={cat.id}
                            onClick={() => handleClick(cat.id, "categoria")}
                            className={`
                                w-full px-5 py-6 rounded-xl text-center font-bold border-4 cursor-pointer 
                                shadow-md transition-all 
                                ${selectedId === cat.id ? "border-green-600 bg-green-100 scale-105" : "border-gray-300 bg-white hover:scale-105"}
                            `}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>

                {/* PLANTAS */}
                {/* PLANTAS — ahora en GRID */}
                <div className="grid grid-cols-2 gap-6 w-1/2 place-items-center">
                    {plantasContent.map((p) => {
                        const conn = conexiones.find((c) => c.end === p.id);
                        const color = conn ? getLineColor(conn) : "gray";

                        return (
                            <div
                                key={p.id}
                                id={p.id}
                                onClick={() => handleClick(p.id, "planta")}
                                className={`
                    relative border-4 rounded-xl p-4 flex flex-col items-center 
                    cursor-pointer shadow-md transition-all bg-white
                    ${selectedId === p.id ? "ring-4 ring-blue-400 scale-105" : "hover:scale-105"}
                    ${verified && conn ? (color === "red" ? "border-red-500" : "border-green-500") : "border-gray-300"}
                `}
                                style={{ width: "160px", height: "170px" }}

                            >
                                <img src={p.url} alt={p.name} className="w-28 h-28 object-contain" />

                                <p className="text-lg font-semibold mt-2">{p.name}</p>

                                {verified && conn && (
                                    <span className="absolute top-2 right-2 text-2xl">
                                        {color === "red" ? "❌" : "✅"}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* LÍNEAS */}
                {conexiones.map((c) => (
                    <Xarrow
                        key={`${c.start}-${c.end}`}
                        start={c.start}
                        end={c.end}
                        color={getLineColor(c)}
                        strokeWidth={4}
                        curveness={0.3}
                        showHead={false}
                        animateDrawing={0.3}
                    />
                ))}
            </div>

            {/* BOTONES */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={handleVerificar}
                    disabled={verified}
                    className="px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    🔍 Verificar
                </button>

                <button
                    onClick={handleLimpiar}
                    className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700"
                >
                    🔄 Reiniciar
                </button>
            </div>

            {feedbackMessage && (
                <div
                    className={`mt-4 p-4 rounded-lg font-bold shadow-md text-lg ${feedbackMessage.type === "error"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                        }`}
                >
                    {feedbackMessage.text}
                </div>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default PlantaAct2ClasificaTipos;
