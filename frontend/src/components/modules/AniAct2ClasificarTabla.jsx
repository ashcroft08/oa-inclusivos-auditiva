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

// --- DATOS DE LA ACTIVIDAD ---

// 1. CARACTERÍSTICAS (Emoji al final y Grupos claros)
const CARACTERISTICAS = [
    { id: 'huevo', name: 'Huevo 🥚', group: 'Nacimiento' },
    { id: 'vientre', name: 'Vientre 🤰', group: 'Nacimiento' },
    // ---
    { id: 'pelo', name: 'Pelo 🐾', group: 'Cubierta de Piel' },
    { id: 'plumas', name: 'Plumas 🕊️', group: 'Cubierta de Piel' },
    { id: 'escamas', name: 'Escamas 🐟', group: 'Cubierta de Piel' },
    { id: 'lisa', name: 'Piel Lisa 💧', group: 'Cubierta de Piel' },
    // ---
    { id: 'terrestre', name: 'Terrestre ⛰️', group: 'Medio donde vive' },
    { id: 'acuatico', name: 'Acuático 🌊', group: 'Medio donde vive' },
];

const ANIMALES_POOL = [
    { id: 'goldfish', name: 'Pez Dorado', imageBase: 'goldfish', responses: ['huevo', 'escamas', 'acuatico'] },
    { id: 'perro', name: 'Perro Maltés', imageBase: 'perro_maltes', responses: ['vientre', 'pelo', 'terrestre'] },
    { id: 'canario', name: 'Canario', imageBase: 'canario', responses: ['huevo', 'plumas', 'terrestre'] },
    { id: 'rana', name: 'Rana', imageBase: 'rana', responses: ['huevo', 'lisa', 'acuatico', 'terrestre'] },
    { id: 'vaca', name: 'Vaca', imageBase: 'vaca', responses: ['vientre', 'pelo', 'terrestre'] },
    { id: 'serpiente', name: 'Serpiente', imageBase: 'serpiente', responses: ['huevo', 'escamas', 'terrestre'] },
    { id: 'pato', name: 'Pato', imageBase: 'pato', responses: ['huevo', 'plumas', 'terrestre', 'acuatico'] },
    { id: 'ballena', name: 'Ballena', imageBase: 'ballena', responses: ['vientre', 'lisa', 'acuatico'] },
];

const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const getFeedbackColor = (animalId, charId, isMarked, isVerified, correctResponses) => {
    if (!isVerified) return '';
    const isCorrectMark = correctResponses.includes(charId);

    if (isMarked && isCorrectMark) return 'bg-green-100 border-green-500 text-green-700';
    if (isMarked && !isCorrectMark) return 'bg-red-100 border-red-500 text-red-700';
    if (!isMarked && isCorrectMark) return 'bg-yellow-100 border-yellow-500 opacity-90';
    return 'bg-gray-50 border-gray-200 opacity-50';
};

const GROUP_COLORS = {
    'Nacimiento': 'bg-pink-100 text-pink-700 border-pink-300',
    'Cubierta de Piel': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Medio donde vive': 'bg-blue-100 text-blue-700 border-blue-300'
};

const AniAct2ClasificarTabla = ({ onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [selectedAnimals, setSelectedAnimals] = useState([]);
    const [marks, setMarks] = useState({});
    const [verified, setVerified] = useState(false);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Revisa de qué animal se trata en las columnas.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Marca', description: 'Haz clic en la fila de características que correspondan a cada animal.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Verifica', description: 'Cuando termines, verifica tus respuestas.' }
    ];

    const loadRandomAnimals = useCallback(async () => {
        setLoading(true);
        setMarks({});
        setVerified(false);
        setIsPerfect(false);

        const shuffledPool = shuffleArray(ANIMALES_POOL);
        const animalsForSession = shuffledPool.slice(0, 3);

        const loadedAnimals = await Promise.all(
            animalsForSession.map(async animal => {
                const imageUrl = await loadImageUrlByName(animal.imageBase);
                return { ...animal, imageUrl };
            })
        );

        setSelectedAnimals(loadedAnimals);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomAnimals();
    }, [loadRandomAnimals]);

    const groupStarts = CARACTERISTICAS.reduce((acc, char, index) => {
        if (!acc[char.group]) acc[char.group] = index;
        return acc;
    }, {});

    const toggleMark = (animalId, charId) => {
        if (verified) return;
        const key = `${animalId}-${charId}`;
        setMarks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleVerify = () => {
        let totalCorrect = 0;
        let totalRequired = 0;
        let errorsFound = false;

        selectedAnimals.forEach(animal => {
            CARACTERISTICAS.forEach(char => {
                const isRequired = animal.responses.includes(char.id);
                const isMarked = !!marks[`${animal.id}-${char.id}`];

                if (isRequired) {
                    totalRequired++;
                    if (isMarked) totalCorrect++;
                    else errorsFound = true;
                } else if (isMarked && !isRequired) {
                    errorsFound = true;
                }
            });
        });

        const allCorrect = !errorsFound && (totalCorrect === totalRequired);
        setIsPerfect(allCorrect);
        setVerified(true);
        if (allCorrect && onComplete) setTimeout(() => onComplete(true), 2500);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-10 text-slate-600 font-bold text-xl">Cargando actividad... 🐾</div>;

    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 min-h-screen font-sans">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-bold text-slate-800 text-center">
                    🕵️‍♂️ ¿Qué poderes tiene cada uno?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-slate-600 mb-8 text-center font-medium">
                ✨ ¡Toca las casillas vacías para poner una ⭐ en lo que hace especial a cada amigo!
            </p>

            <div className="w-full max-w-[1600px] bg-white rounded-xl shadow-lg overflow-x-auto border border-slate-200">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr className="bg-slate-100 border-b-4 border-slate-300 shadow-sm">
                            <th className="w-[300px] p-6 text-center font-extrabold text-2xl text-slate-700 sticky left-0 top-0 bg-slate-100 z-30 border-r-4 border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                🐾 Animales
                            </th>
                            {CARACTERISTICAS.map(char => {
                                const groupColorClass = GROUP_COLORS[char.group] || 'bg-slate-100 text-slate-700';
                                return (
                                    <th key={char.id} className="p-3 text-center w-[140px] min-w-[140px] sticky top-0 bg-white z-20 border-r-2 border-slate-200 last:border-r-0 align-top shadow-[0_2px_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex flex-col h-full min-h-[90px]">
                                            <div className={`text-[11px] font-extrabold mb-1 uppercase tracking-tighter px-2 py-1 rounded-md border-2 ${groupColorClass} inline-block leading-none mx-auto break-words`}>
                                                {char.group}
                                            </div>
                                            <div className="text-sm font-bold text-slate-700 mt-auto pb-1 flex-grow flex items-end justify-center break-words leading-tight">
                                                {char.name}
                                            </div>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className="divide-y-4 divide-slate-200">
                        {selectedAnimals.map(animal => (
                            <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 sticky left-0 bg-white z-10 border-r-4 border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <img
                                            src={animal.imageUrl}
                                            alt={animal.name}
                                            className="w-32 h-32 object-contain mb-2 drop-shadow-md transition-transform hover:scale-105"
                                        />
                                        <span className="text-sm font-extrabold text-slate-700 uppercase tracking-tight text-center">{animal.name}</span>
                                    </div>
                                </td>

                                {CARACTERISTICAS.map(char => {
                                    const key = `${animal.id}-${char.id}`;
                                    const isMarked = !!marks[key];
                                    const feedbackClass = getFeedbackColor(animal.id, char.id, isMarked, verified, animal.responses);

                                    return (
                                        <td key={char.id} className="p-2 text-center relative border-r-2 border-slate-100 last:border-r-0 align-middle">
                                            <button
                                                onClick={() => toggleMark(animal.id, char.id)}
                                                disabled={verified}
                                                className={`
                                                    w-16 h-16 mx-auto flex items-center justify-center text-4xl font-bold rounded-2xl transition-all duration-200
                                                    ${verified
                                                        ? feedbackClass
                                                        : `border-4 shadow-sm ${isMarked
                                                            ? 'bg-blue-500 text-white border-blue-600 shadow-inner scale-95'
                                                            : 'bg-white text-transparent border-slate-300 hover:border-blue-300 hover:scale-105'}`
                                                    }
                                                `}
                                            >
                                                {isMarked ? (verified && !animal.responses.includes(char.id) ? '❌' : '⭐') : ''}
                                            </button>
                                            {verified && !isMarked && animal.responses.includes(char.id) && (
                                                <span className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none opacity-80 drop-shadow-md">
                                                    👆
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 pb-4">
                <div className="flex gap-6">
                    <button
                        onClick={loadRandomAnimals}
                        className="px-10 py-4 bg-indigo-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        🔄 Reiniciar actividad
                    </button>

                    {!verified && (
                        <button
                            onClick={handleVerify}
                            className="px-10 py-4 bg-green-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all active:scale-95"
                        >
                            ✅ Verificar respuestas
                        </button>
                    )}
                </div>

                {verified && (
                    <div className={`text-2xl font-bold px-8 py-3 rounded-full mt-4 shadow-sm ${isPerfect ? 'text-green-700 bg-green-100 border-2 border-green-400' : 'text-red-600 bg-red-50 border-2 border-red-300'}`}>
                        {isPerfect ? '¡Excelente trabajo! Eres un experto. 🏆' : '¡Uy! Hay errores (❌) o te faltaron opciones (👆).'}
                    </div>
                )}
            </div>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct2ClasificarTabla;