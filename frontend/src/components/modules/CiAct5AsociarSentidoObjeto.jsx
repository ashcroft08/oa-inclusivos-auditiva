import React, { useState, useEffect, useCallback } from "react";
import Xarrow from "react-xarrows";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp,PNG,JPG}", { eager: true });
const senasImport = import.meta.glob("../../assets/senas/*.{png,jpg,jpeg,webp,PNG,JPG}", { eager: true });

const loadImageUrlByName = (nombreBase) => {
    const allImports = { ...imagenesImport, ...senasImport };
    const key = Object.keys(allImports).find(path =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );
    if (key) {
        return allImports[key].default;
    }
    return null;
};

// --- Datos de la Actividad (Se mantienen fijos aquí, se barajan en el estado) ---
const SENTIDOS_DATA_BASE = [
    { id: 'vista', name: 'Vista', emoji: '👁️' },
    { id: 'oido', name: 'Oído', emoji: '👂' },
    { id: 'olfato', name: 'Olfato', emoji: '👃' },
    { id: 'gusto', name: 'Gusto', emoji: '👅' },
    { id: 'tacto', name: 'Tacto', emoji: '🖐️' },
];

const OBJETOS_POOL = [
    // Vista
    { id: 'libro_icon', name: 'Libro', sense: 'vista' },
    { id: 'arcoiris_icon', name: 'Arcoíris', sense: 'vista' },
    { id: 'telescopio_icon', name: 'Telescopio', sense: 'vista' },
    // Oído
    { id: 'campana_icon', name: 'Campana', sense: 'oido' },
    { id: 'radio_icon', name: 'Música', sense: 'oido' },
    { id: 'reloj_icon', name: 'Reloj', sense: 'oido' },
    // Olfato
    { id: 'flor_icon', name: 'Flor', sense: 'olfato' },
    { id: 'perfume_icon', name: 'Perfume', sense: 'olfato' },
    { id: 'aroma_icon', name: 'Aroma', sense: 'olfato' },
    // Gusto
    { id: 'helado_icon', name: 'Helado', sense: 'gusto' },
    { id: 'manzana_icon', name: 'Manzana', sense: 'gusto' },
    { id: 'limon_icon', name: 'Limón', sense: 'gusto' },
    // Tacto
    { id: 'peluche_icon', name: 'Peluche', sense: 'tacto' },
    { id: 'fuego_icon', name: 'Fuego', sense: 'tacto' },
    { id: 'tijeras_icon', name: 'Tijeras', sense: 'tacto' },
];

// Función de utilidad para barajar un array
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- COMPONENTE PRINCIPAL ---

const CiAct5AsociarSentidoObjeto = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [sentidosContent, setSentidosContent] = useState([]); // ⭐ NUEVO ESTADO: Sentidos barajados
    const [objetosContent, setObjetosContent] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [conexiones, setConexiones] = useState([]);
    const [verified, setVerified] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira los sentidos arriba y los objetos abajo.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Selecciona', description: 'Haz clic en un sentido o en un objeto para seleccionarlo.' },
        { iconName: 'Move', colorTheme: 'purple', title: '3. Conecta', description: 'Haz clic en el elemento correspondiente en la otra fila para unirlos.' },
        { iconName: 'Check', colorTheme: 'green', title: '4. Verifica', description: 'Verifica tus respuestas cuando hayas conectado todos.' }
    ];

    // --- LÓGICA DE CARGA Y SELECCIÓN ALEATORIA ---
    const loadRandomActivity = useCallback(() => {
        setLoading(true);
        setVerified(false);
        setConexiones([]);
        setSelectedId(null);
        setFeedbackMessage(null);

        // ⭐ 1. Barajar el orden de los Sentidos
        const shuffledSentidos = shuffleArray(SENTIDOS_DATA_BASE);
        setSentidosContent(shuffledSentidos); // Actualizar estado de Sentidos

        const loadedObjects = [];

        // 2. Seleccionar un Objeto aleatorio por cada sentido (usando la base de datos)
        SENTIDOS_DATA_BASE.forEach(sentido => {
            const pool = OBJETOS_POOL.filter(obj => obj.sense === sentido.id);
            if (pool.length > 0) {
                const randomObj = pool[Math.floor(Math.random() * pool.length)];

                const url = loadImageUrlByName(randomObj.id);
                if (url) {
                    loadedObjects.push({
                        id: randomObj.id,
                        name: randomObj.name,
                        url: url,
                        sense: randomObj.sense
                    });
                }
            }
        });

        // 3. Barajar el orden de los Objetos
        const shuffledObjects = shuffleArray(loadedObjects);
        setObjetosContent(shuffledObjects);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadRandomActivity();
    }, [loadRandomActivity]);

    // --- LÓGICA DE INTERACCIÓN (CLIC) ---

    const handleClick = (id, type) => {
        if (verified) return;

        if (!selectedId) {
            setSelectedId(id);
            setSelectedType(type);
            setFeedbackMessage(null);

        } else if (selectedType !== type) {
            const startId = selectedType === 'sentido' ? selectedId : id;
            const endId = selectedType === 'sentido' ? id : selectedId;

            setConexiones((prev) => prev.filter(c => c.start !== startId && c.end !== endId));

            setConexiones((prev) => [
                ...prev.filter(c => c.start !== startId),
                { start: startId, end: endId },
            ]);

            setFeedbackMessage(null);
            setSelectedId(null);
            setSelectedType(null);

        } else if (selectedId === id) {
            setSelectedId(null);
            setSelectedType(null);
            setFeedbackMessage(null);
        } else {
            if (type === 'sentido') {
                setSelectedId(id);
                setSelectedType(type);
                setFeedbackMessage(null);
            } else {
                setFeedbackMessage({ type: 'error', text: 'Solo puedes conectar un sentido a un objeto.' });
                setSelectedId(null);
                setSelectedType(null);
            }
        }
    };

    // --- LÓGICA DE VERIFICACIÓN ---

    const handleVerificar = () => {
        if (conexiones.length !== SENTIDOS_DATA_BASE.length) {
            setFeedbackMessage({ type: 'error', text: `⚠️ Debes unir los 5 sentidos con un objeto. Faltan ${SENTIDOS_DATA_BASE.length - conexiones.length}.` });
            return;
        }

        let correctMatches = 0;
        let errors = false;

        const objetoMap = objetosContent.reduce((acc, obj) => {
            acc[obj.id] = obj.sense;
            return acc;
        }, {});

        conexiones.forEach((c) => {
            const sentidoID = c.start;
            const objetoID = c.end;

            const targetSenseID = objetoMap[objetoID];

            if (sentidoID === targetSenseID) {
                correctMatches++;
            } else {
                errors = true;
            }
        });

        setVerified(true);

        if (!errors) {
            setFeedbackMessage({ type: 'success', text: `✅ ¡Asociación Perfecta! (${correctMatches}/${SENTIDOS_DATA_BASE.length})` });
            setTimeout(() => onComplete(true), 2000);
        } else {
            setFeedbackMessage({ type: 'error', text: `❌ ${SENTIDOS_DATA_BASE.length - correctMatches} errores. Los pares incorrectos se muestran en rojo.` });
        }
    };

    const handleReiniciar = () => {
        loadRandomActivity();
    };

    // --- ESTILOS DE LÍNEA Y TARJETA ---

    const getLineColor = (connection) => {
        if (!verified) return "#A78BFA";

        const sentidoID = connection.start;
        const objeto = objetosContent.find(o => o.id === connection.end);

        if (objeto && sentidoID === objeto.sense) {
            return "green";
        } else {
            return "red";
        }
    };

    const getCardClass = (id, type) => {
        const base = "p-3 rounded-xl shadow-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center";

        if (verified) {
            const connection = conexiones.find(c => (type === 'sentido' ? c.start === id : c.end === id));
            const isCorrect = getLineColor(connection || {}) === 'green';
            const isWrong = getLineColor(connection || {}) === 'red';

            if (isCorrect) return `${base} bg-green-200 text-green-800`;
            if (isWrong) return `${base} bg-red-200 text-red-800`;

            return `${base} bg-gray-100 text-gray-600 opacity-60`;
        }

        if (selectedId === id) {
            return `${base} bg-purple-200 text-purple-800 ring-4 ring-purple-400 transform scale-110`;
        }

        if (type === 'objeto' && conexiones.some(c => c.end === id)) {
            return `${base} bg-blue-100 text-blue-800`;
        }

        return `${base} bg-white text-gray-800 hover:bg-gray-50 transform hover:scale-105`;
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center text-center p-10 text-xl font-semibold">Cargando la actividad de los Sentidos...</div>;

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-extrabold text-blue-800 text-center drop-shadow-sm">
                    👃 ¿A qué huele? ¿Cómo suena? ¿Qué color es?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-purple-700 mb-8 font-medium">
                ✅ ¡Haz clic en el sentido y luego en el objeto para formar la pareja!
            </p>

            <div className="relative w-full max-w-7xl min-h-[600px] bg-white rounded-3xl shadow-2xl border border-blue-200 p-8 flex flex-col justify-around">

                {/* 1. FILA SUPERIOR: SENTIDOS (usa el estado barajado 'sentidosContent') */}
                <div className="flex justify-around items-center w-full h-1/2">
                    {sentidosContent.map((s) => ( // ⭐ Iterando sobre los sentidos barajados
                        <div
                            key={s.id}
                            id={s.id}
                            onClick={() => handleClick(s.id, "sentido")}
                            className={`${getCardClass(s.id, "sentido")} w-36 h-36`}
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            <div className="text-5xl">{s.emoji}</div>
                            <p className="text-base font-bold mt-1">{s.name}</p>
                        </div>
                    ))}
                </div>

                {/* 2. FILA INFERIOR: OBJETOS (usa el estado barajado 'objetosContent') */}
                <div className="flex justify-around items-center w-full h-1/2">
                    {objetosContent.map((o) => (
                        <div
                            key={o.id}
                            id={o.id}
                            onClick={() => handleClick(o.id, "objeto")}
                            className={`${getCardClass(o.id, "objeto")} w-36 h-36`}
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            <img src={o.url} alt={o.name} className="w-20 h-20 object-contain" />
                            <p className="text-sm font-semibold mt-1">{o.name}</p>
                        </div>
                    ))}
                </div>

                {/* Dibujar líneas con react-xarrows */}
                {conexiones.map((c) => (
                    <Xarrow
                        key={`${c.start}-${c.end}`}
                        start={c.start}
                        end={c.end}
                        color={getLineColor(c)}
                        strokeWidth={4}
                        headSize={0}
                        curveness={0.8}
                        path="smooth"
                        showHead={false}
                        animateDrawing={0.3}
                        zIndex={1}
                        startAnchor="bottom"
                        endAnchor="top"
                    />
                ))}
            </div>

            {/* --- Botones y Mensaje de Feedback --- */}
            <div className="mt-8 flex gap-6 w-full max-w-md justify-center">
                <button
                    onClick={handleVerificar}
                    disabled={verified || conexiones.length !== SENTIDOS_DATA_BASE.length}
                    className={`flex-1 px-10 py-4 font-bold text-lg rounded-full shadow-lg transition-all 
                        ${verified || conexiones.length !== SENTIDOS_DATA_BASE.length ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                    {verified ? '✅ Verificado' : '🔍 Verificar Respuestas'}
                </button>

                <button
                    onClick={handleReiniciar}
                    className="flex-1 px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:bg-blue-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {feedbackMessage && (
                <div className={`mt-4 p-3 rounded-lg shadow-md font-bold text-lg text-center 
                    ${feedbackMessage.type === 'error' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                >
                    {feedbackMessage.text}
                </div>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct5AsociarSentidoObjeto;