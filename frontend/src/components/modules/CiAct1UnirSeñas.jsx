import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// Cargar automáticamente todas las imágenes desde las carpetas
const senasImport = import.meta.glob("../../assets/senas/*.{png,jpg,jpeg,webp}");
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}");

// Función auxiliar: agrupa las imágenes por nombre base (ej. "bebe1", "bebe2" → "bebe")
const agruparPorNombre = async (rutas) => {
    const grupos = {};
    const normalizar = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]/g, "");

    for (const path in rutas) {
        const mod = await rutas[path](); // carga diferida
        const nombreArchivo = path.split("/").pop().split(".")[0].toLowerCase();
        const nombreBase = normalizar(nombreArchivo.replace(/[0-9]/g, ""));
        if (!grupos[nombreBase]) grupos[nombreBase] = [];
        grupos[nombreBase].push(mod.default);
    }

    return grupos;
};

const CiAct1UnirSeñas = ({ onComplete }) => {
    // Mantendremos 'matches' para el feedback de éxito/fallo
    const [matches, setMatches] = useState({});
    const [completed, setCompleted] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [personas, setPersonas] = useState([]);
    const [senas, setSenas] = useState([]);
    const [score, setScore] = useState(0);
    const [data, setData] = useState([]);

    // ⭐ NUEVO ESTADO: Rastrea qué seña se ha asociado a qué target.
    // { targetNombre: señaNombre, ... }
    const [associations, setAssociations] = useState({});

    // Estado para el feedback de arrastre (mantener solo el que se arrastra temporalmente)
    const [draggingItem, setDraggingItem] = useState(null);


    useEffect(() => {
        const cargarImagenes = async () => {
            const imgs = await agruparPorNombre(imagenesImport);
            const senasCargadas = await agruparPorNombre(senasImport);

            const nuevaData = [
                { nombre: "Bebé", imagenes: imgs["bebe"], sena: senasCargadas["bebe"]?.[0] },
                { nombre: "Niño", imagenes: imgs["nino"], sena: senasCargadas["nino"]?.[0] },
                { nombre: "Adulto", imagenes: imgs["adulto"], sena: senasCargadas["adulto"]?.[0] },
                { nombre: "Viejo", imagenes: imgs["viejo"], sena: senasCargadas["viejo"]?.[0] },
            ];

            setData(nuevaData);
            generarActividad(nuevaData);
        };

        cargarImagenes();
    }, []);

    const generarActividad = (data) => {
        const seleccionadas = data.map((item) => ({
            nombre: item.nombre,
            imagen: item.imagenes
                ? item.imagenes[Math.floor(Math.random() * item.imagenes.length)]
                : null,
            sena: item.sena, // Guardamos la ruta de la seña aquí también
        }));

        setPersonas(seleccionadas);
        const senasAleatorias = [...seleccionadas].sort(() => Math.random() - 0.5);
        setSenas(senasAleatorias);
    };

    const handleDragStart = (e, nombre) => {
        e.dataTransfer.setData("nombre", nombre);
        setDraggingItem(nombre);
    };

    const handleDragEnd = () => {
        setDraggingItem(null);
    };


    const handleDrop = (e, targetNombre) => {
        const dragged = e.dataTransfer.getData("nombre");
        if (!dragged) return;

        // 1. Registrar la asociación visual
        setAssociations((prev) => ({ ...prev, [targetNombre]: dragged }));

        // 2. Comprobar la corrección
        const correcto = dragged === targetNombre;
        setMatches((prev) => ({ ...prev, [targetNombre]: correcto }));

        // 3. Actualizar el puntaje (solo si es correcto)
        if (correcto) setScore((prev) => prev + 1);

        // 4. Comprobar la finalización
        const nuevosMatches = { ...matches, [targetNombre]: correcto };
        const allCompleted = Object.keys(nuevosMatches).length === data.length;
        const allCorrect = Object.values(nuevosMatches).every(Boolean);

        if (allCompleted && allCorrect) {
            setCompleted(true);
            onComplete?.(true);
        }
    };

    const reiniciar = () => {
        setMatches({});
        setCompleted(false);
        setScore(0);
        setAssociations({}); // ⬅️ Limpiar asociaciones
        generarActividad(data);
    };

    // Función auxiliar para obtener la ruta de la seña
    const getSenaImage = (nombre) => {
        return data.find(item => item.nombre === nombre)?.sena;
    }

    // Obtener la lista de nombres de señas que han sido usadas
    const usedSenas = Object.values(associations);


    return (
        // Se revierte a la estructura original (sin flex-col/lg:flex-row)
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex flex-col items-center justify-center overflow-hidden p-4">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-indigo-800 text-center">
                    🤟 ¡Une cada seña con su imagen correcta!
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors"
                    aria-label="Abrir ayuda de la actividad"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>

            <p className="text-lg text-indigo-800 mb-4 text-center">
                ✅ Arrastra la seña para completar la pareja.
            </p>


            <p className="text-lg text-indigo-700 mb-6">
                Puntaje:{" "}
                <span className="font-bold text-indigo-900">
                    {score} / {data.length}
                </span>
            </p>

            {/* Contenedor horizontal completo (como el original) */}
            <div className="flex flex-col gap-6 w-full max-w-7xl items-center justify-center">

                {/* Fila de señas */}
                <div className="flex justify-center gap-10 flex-wrap">
                    {senas.map((item) => {
                        const isUsed = usedSenas.includes(item.nombre); // ⬅️ Comprueba si la seña fue usada
                        const isDragging = draggingItem === item.nombre; // Feedback táctil

                        return (
                            <div
                                key={item.nombre}
                                draggable={!completed && !isUsed} // ⬅️ Ya no se puede arrastrar si ya se usó
                                onDragStart={(e) => handleDragStart(e, item.nombre)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    bg-white rounded-3xl p-4 shadow-lg transition-all duration-200
                                    ${completed || isUsed
                                        ? "opacity-30 cursor-not-allowed" // ⬅️ ¡Opacidad en el origen!
                                        : "cursor-grab hover:scale-105"
                                    }
                                    ${isDragging ? "ring-4 ring-blue-500 shadow-2xl opacity-80 scale-110 z-50" : ""}
                                `}
                            >
                                <img
                                    src={item.sena}
                                    alt={`Seña ${item.nombre}`}
                                    className="w-36 h-36 object-contain"
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Flechas (separador visual original) */}
                <div className="flex justify-center gap-40 text-5xl text-indigo-500">
                    {data.map((_, i) => (
                        <span key={i}>⬇️</span>
                    ))}
                </div>

                {/* Fila de imágenes (Targets) */}

                <div className="flex justify-center gap-10 flex-wrap">
                    {personas.map((item) => {
                        const senaAsociada = associations[item.nombre];
                        const senaRuta = senaAsociada ? getSenaImage(senaAsociada) : null;

                        return (
                            <div
                                key={item.nombre}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, item.nombre)}
                                className={`rounded-3xl p-2 h-44 w-44 flex items-center justify-center border-4 transition-all relative shadow-md
                                  ${matches[item.nombre] === true ? "border-green-500 bg-green-50" : ""}
                                  ${matches[item.nombre] === false ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}
                              `}
                            >
                                <img
                                    src={item.imagen}
                                    alt={item.nombre}
                                    className="w-full h-full object-cover rounded-2xl"
                                />

                                {/* ⭐ MODIFICACIÓN CLAVE: Ahora es 1/3 del tamaño del contenedor */}
                                {senaRuta && (
                                    <div className="absolute bottom-0 right-0 w-1/3 h-1/3 p-1 bg-white border border-gray-300 rounded-tl-lg rounded-br-2xl shadow-lg flex items-center justify-center z-20">
                                        <img
                                            src={senaRuta}
                                            alt={`Seña asociada a ${item.nombre}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}

                                {/* Indicador de éxito/fallo */}
                                {matches[item.nombre] !== undefined && (
                                    <div
                                        className={`absolute -top-3 -right-3 text-2xl p-1 bg-white rounded-full shadow-lg ${matches[item.nombre] ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {matches[item.nombre] ? "✅" : "❌"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mensaje final y Botón de reinicio... (se mantienen) */}
            {completed && (
                <div className="mt-10 text-center animate-bounce">
                    <div className="text-7xl">🎉</div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        ¡Excelente trabajo! Completaste todas las asociaciones.
                    </p>
                </div>
            )}

            <button
                onClick={reiniciar}
                className="mt-10 px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-xl 
                hover:bg-indigo-700 hover:scale-105 transition-all relative group overflow-hidden"
            >
                <span className="absolute inset-0 bg-indigo-400 opacity-0 group-hover:opacity-30 blur-2xl transition-all"></span>
                <span className="relative z-10">🔄 Reiniciar actividad</span>
            </button>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
    );
};

export default CiAct1UnirSeñas;