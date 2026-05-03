import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// 1. Importar todas las imágenes
import describirImg from "../../assets/images/describir.png";
import gatosFamiliaImg from "../../assets/images/gatos_familia.png";
import fogataNinosImg from "../../assets/images/fogata_ninos.png";
import familiaCenaImg from "../../assets/images/familia.png";

// --- UTILIDADES ---

// Función para barajar (shuffle) un array
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- DATOS DE LA ACTIVIDAD ---

const actividadesData = [
    {
        id: 1,
        imagen: describirImg,
        correctas: ["niño", "juega", "pelota"],
        opciones: ["niño", "mesa", "juega", "pelota", "auto", "árbol"],
    },
    {
        id: 2,
        imagen: gatosFamiliaImg,
        correctas: ["gatos", "familia", "jardín", "flores", "mariposa", "casa"],
        opciones: ["perros", "mesa", "ratones", "flores", "mariposa", "casa", "gatos", "familia", "jardín", "sol"],
    },
    {
        id: 3,
        imagen: fogataNinosImg,
        correctas: ["niños", "fogata", "malvaviscos", "invierno", "bufandas"],
        opciones: ["adultos", "playa", "árbol", "cocina", "perros", "bufandas", "niños", "fogata", "malvaviscos", "invierno"],
    },
    {
        id: 5,
        imagen: familiaCenaImg, // Asumiendo que esta es la variable para tu nueva imagen
        correctas: ["familia", "comida", "mesa", "papá", "mamá"],
        opciones: ["playa", "invierno", "baño", "familia", "comida", "árboles", "mesa", "ventanas", "papá", "mamá"],
    },
];

// --- COMPONENTE PRINCIPAL ---

const CiAct4Describir = ({ onComplete }) => {
    const [currentActivity, setCurrentActivity] = useState(null);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [verificado, setVerificado] = useState(false);
    const [aciertos, setAciertos] = useState([]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira atentamente la imagen principal.' },
        { iconName: 'Search', colorTheme: 'indigo', title: '2. Encuentra', description: 'Busca las palabras clave que mejor describan la escena.' },
        { iconName: 'MousePointer', colorTheme: 'purple', title: '3. Selecciona', description: 'Haz clic en las palabras correctas para marcarlas.' },
        { iconName: 'Check', colorTheme: 'green', title: '4. Verifica', description: 'Cuando termines, verifica tus respuestas.' }
    ];

    // Función para seleccionar una actividad aleatoria y barajar sus opciones
    const selectRandomActivity = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * actividadesData.length);
        const selected = actividadesData[randomIndex];

        // Barajar el array de opciones y actualizar el estado
        const shuffledOptions = shuffleArray(selected.opciones);

        setCurrentActivity({
            ...selected,
            opciones: shuffledOptions
        });

        // Reiniciar el estado del juego
        setSeleccionadas([]);
        setVerificado(false);
        setAciertos([]);
    }, []);

    // Cargar la actividad inicial al montar el componente
    useEffect(() => {
        selectRandomActivity();
    }, [selectRandomActivity]);

    // ⭐ FUNCIÓN ÚNICA: Carga nueva imagen y reinicia la actividad
    const reiniciarActividadCompleta = () => {
        selectRandomActivity();
    };

    const toggleSeleccion = (palabra) => {
        if (verificado || !currentActivity) return;
        setSeleccionadas((prev) =>
            prev.includes(palabra)
                ? prev.filter((p) => p !== palabra)
                : [...prev, palabra]
        );
    };

    const verificar = () => {
        if (!currentActivity) return;

        const aciertos = seleccionadas.filter((p) =>
            currentActivity.correctas.includes(p)
        );
        const todoCorrecto =
            aciertos.length === currentActivity.correctas.length &&
            seleccionadas.length === currentActivity.correctas.length;

        setAciertos(aciertos);
        setVerificado(true);

        if (todoCorrecto) onComplete?.(true);
    };


    if (!currentActivity) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-6">
                <p className="text-2xl text-amber-800 font-semibold">Cargando actividad...</p>
            </div>
        );
    }

    const isPerfect = verificado && aciertos.length === currentActivity.correctas.length && seleccionadas.length === currentActivity.correctas.length;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-4xl font-bold text-amber-800 text-center">
                    📸 ¡Mira con ojos de explorador!
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-lg text-amber-700 mb-6 text-center max-w-xl font-semibold">
                🎯 Selecciona las <span className="text-xl text-amber-900 font-extrabold">{currentActivity.correctas.length}</span> palabras que cuentan la historia de la foto.
            </p>

            <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
                <img
                    src={currentActivity.imagen}
                    alt="Imagen para describir"
                    className="w-96 h-72 object-contain rounded-2xl"
                />
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
                {currentActivity.opciones.map((palabra) => {
                    const seleccionada = seleccionadas.includes(palabra);
                    const esCorrecta = currentActivity.correctas.includes(palabra);
                    let color = "bg-white";
                    let icono = null;
                    let bordeAdicional = "border-amber-500";

                    if (verificado) {
                        if (seleccionada && esCorrecta) {
                            color = "bg-green-300";
                            icono = "✅";
                            bordeAdicional = "border-green-600";
                        } else if (seleccionada && !esCorrecta) {
                            color = "bg-red-300";
                            icono = "❌";
                            bordeAdicional = "border-red-600";
                        } else if (!seleccionada && esCorrecta) {
                            color = "bg-white";
                            bordeAdicional = "border-green-500 border-dashed";
                            icono = "👆";
                        }
                    } else if (seleccionada) {
                        color = "bg-amber-200";
                    }

                    return (
                        <button
                            key={palabra}
                            onClick={() => toggleSeleccion(palabra)}
                            disabled={verificado}
                            className={`
                                px-6 py-3 rounded-full shadow-md font-semibold text-lg relative
                                border-2 hover:scale-105 transition-transform 
                                ${color} ${bordeAdicional}
                                ${verificado ? "opacity-80 cursor-not-allowed" : ""}
                            `}
                        >
                            {palabra}
                            {icono && (
                                <span className="absolute -top-1 -right-1 text-base bg-white rounded-full p-1 shadow">
                                    {icono}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ⭐ CONTROL DE BOTONES UNIFICADO */}
            <div className="flex gap-6 mt-10">
                {!verificado && (
                    // 1. Botón de Verificar (Ahora a la izquierda)
                    <button
                        onClick={verificar}
                        disabled={seleccionadas.length === 0}
                        className={`px-10 py-4 text-white font-bold text-lg rounded-full shadow-xl transition-all ${seleccionadas.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 hover:scale-105"
                            }`}
                    >
                        ✅ Verificar
                    </button>
                )}

                {/* 2. Botón Reiniciar Actividad (Ahora a la derecha) */}
                <button
                    onClick={reiniciarActividadCompleta}
                    className={`px-8 py-4 text-white font-bold text-lg rounded-full shadow-xl 
                    hover:scale-105 transition-all ${verificado
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    🔄 Reiniciar actividad
                </button>
            </div>

            {/* Mensaje final */}
            {isPerfect && (
                <div className="mt-10 text-center animate-bounce">
                    <div className="text-6xl">🎉</div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        ¡Muy bien! Presiona **Reiniciar Actividad** para un nuevo reto.
                    </p>
                </div>
            )}

            {/* Mensaje de error (opcional) */}
            {verificado && !isPerfect && (
                <div className="mt-10 text-center">
                    <div className="text-6xl">😕</div>
                    <p className="text-xl font-bold text-red-600 mt-2">
                        Hay errores. Presiona **Reiniciar Actividad** para intentarlo con una nueva imagen.
                    </p>
                </div>
            )}

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct4Describir;