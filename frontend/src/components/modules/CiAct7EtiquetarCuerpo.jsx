import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

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

// --- Datos de la Actividad ---
const PARTES_CUERPO = [
    { id: "cabeza", name: "Cabeza 🧠", correctTarget: "zona-cabeza" },
    { id: "pulmones", name: "Pulmones 🤲", correctTarget: "zona-pulmones" },
    { id: "estomago", name: "Estómago 🥣", correctTarget: "zona-estomago" },
    { id: "brazos", name: "Brazos 💪", correctTarget: "zona-brazos" },
    { id: "rodilla", name: "Rodilla 🦵", correctTarget: "zona-rodilla" },
];

const TARGET_ZONES = [
    { id: 'zona-cabeza', name: 'Cabeza', top: '12%', left: '50%', width: '12%', height: '8%' },
    { id: 'zona-pulmones', name: 'Pulmones', top: '28%', left: '46%', width: '18%', height: '10%' },
    // ⭐ Estómago: Más abajo (42%), más a la izquierda (48%) y más pequeño
    { id: 'zona-estomago', name: 'Estómago', top: '42%', left: '48%', width: '12%', height: '7%' },
    { id: 'zona-brazos', name: 'Brazos', top: '42%', left: '28%', width: '10%', height: '12%' },
    { id: 'zona-rodilla', name: 'Rodilla', top: '72%', left: '42%', width: '10%', height: '7%' },
];

const CiAct7EtiquetarCuerpo = ({ onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [cuerpoUrl, setCuerpoUrl] = useState(null);
    const [locations, setLocations] = useState({});
    const [verified, setVerified] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isFinalCheckCorrect, setIsFinalCheckCorrect] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Identifica las partes del cuerpo y las etiquetas a la izquierda.' },
        { iconName: 'Hand', colorTheme: 'indigo', title: '2. Arrastra', description: 'Haz clic y mantén presionada una etiqueta para moverla.' },
        { iconName: 'Target', colorTheme: 'purple', title: '3. Suelta', description: 'Lleva la etiqueta hacia el recuadro correspondiente en el cuerpo.' },
        { iconName: 'Check', colorTheme: 'green', title: '4. Verifica', description: 'Verifica tus respuestas usando el botón de verificar.' }
    ];

    useEffect(() => {
        const cargar = async () => {
            const url = await loadImageUrlByName('cuerpo_organos');
            setCuerpoUrl(url);
            setLoading(false);
        };
        cargar();
    }, []);

    const handleDragStart = (e, partId) => {
        if (verified) return;
        e.dataTransfer.setData("partId", partId);
        setDraggingItem(partId);
    };

    const handleDragEnd = () => setDraggingItem(null);

    const handleDrop = (e, targetZoneId) => {
        e.preventDefault();
        if (verified) return;
        const partId = e.dataTransfer.getData("partId");
        if (!partId) return;

        setLocations(prev => {
            const newState = { ...prev };
            const partInZone = Object.keys(locations).find(key => locations[key] === targetZoneId);
            if (partInZone && partInZone !== partId) delete newState[partInZone];
            newState[partId] = targetZoneId;
            return newState;
        });
    };

    const handleDragOver = (e) => e.preventDefault();

    const verify = () => {
        if (Object.keys(locations).length !== PARTES_CUERPO.length) {
            alert("¡Faltan etiquetas!");
            return;
        }
        const allCorrect = PARTES_CUERPO.every(p => locations[p.id] === p.correctTarget);
        setIsFinalCheckCorrect(allCorrect);
        setVerified(true);
        if (allCorrect) setTimeout(() => onComplete?.(true), 2000);
    };

    const handleRestart = () => {
        setLocations({});
        setVerified(false);
        setIsFinalCheckCorrect(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-8">
                <h2 className="text-4xl font-extrabold text-blue-900 text-center">
                    🦴 ¿Qué hay dentro de nuestro cuerpo?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-blue-700 hover:text-blue-900 hover:bg-blue-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-purple-700 mb-8 font-medium">
                ✨ ¡Pon cada órgano en su lugar secreto para que todo funcione genial!
            </p>

            <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">
                {/* LISTA ETIQUETAS */}
                <div className="md:w-1/4 p-6 bg-white rounded-xl shadow-2xl border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-700 mb-6 text-center border-b pb-2">Órganos</h3>
                    <div className="flex flex-col space-y-3">
                        {PARTES_CUERPO.map(parte => {
                            const isPlaced = !!locations[parte.id];
                            if (isPlaced && !verified) return null;
                            return (
                                <div
                                    key={parte.id}
                                    draggable={!verified && !isPlaced}
                                    onDragStart={(e) => handleDragStart(e, parte.id)}
                                    onDragEnd={handleDragEnd}
                                    className="p-2 rounded-lg text-center font-bold text-md border-2 bg-blue-50 border-blue-200 cursor-grab hover:scale-105"
                                >
                                    {parte.name}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ÁREA DE IMAGEN */}
                <div className="md:w-3/4 relative flex justify-center p-6 bg-white rounded-xl shadow-2xl border border-blue-200 min-h-[650px]">
                    <img src={cuerpoUrl} alt="Cuerpo" className="max-h-full max-w-full object-contain" loading="lazy" />

                    {TARGET_ZONES.map(zone => {
                        const partId = Object.keys(locations).find(key => locations[key] === zone.id);
                        const part = partId ? PARTES_CUERPO.find(p => p.id === partId) : null;

                        let zoneStyle = 'border-dashed border-2 border-blue-300 bg-blue-50/20';
                        if (part) {
                            if (verified) {
                                zoneStyle = part.correctTarget === zone.id ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
                            } else {
                                zoneStyle = 'bg-white border-blue-600 shadow-md scale-105';
                            }
                        }

                        return (
                            <div
                                key={zone.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, zone.id)}
                                className={`absolute rounded flex items-center justify-center text-center font-bold text-[10px] transition-all ${zoneStyle}`}
                                style={{
                                    top: zone.top, left: zone.left, width: zone.width, height: zone.height,
                                    transform: 'translate(-50%, -50%)', zIndex: 10
                                }}
                            >
                                {part ? part.name : ''}
                                {part && verified && (
                                    <span className="absolute -top-2 -right-2 text-lg">
                                        {part.correctTarget === zone.id ? '✅' : '❌'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-10 flex gap-6">
                <button onClick={verify} disabled={verified || Object.keys(locations).length < PARTES_CUERPO.length}
                    className={`px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all ${verified || Object.keys(locations).length < PARTES_CUERPO.length ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    ✅ Verificar Respuestas
                </button>

                <button onClick={handleRestart} className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-800">
                    🔄 Reiniciar actividad
                </button>
            </div>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct7EtiquetarCuerpo;