import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes (Reutilizada) ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });
const senasImport = import.meta.glob("../../assets/senas/*.webp", { eager: false });

// Función auxiliar para encontrar la URL de una imagen por su nombre base
const loadImageUrlByName = async (nombreBase) => {
    const allImports = { ...imagenesImport, ...senasImport };

    const key = Object.keys(allImports).find(path =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );

    if (key) {
        const module = await allImports[key]();
        return module.default;
    }
    return null;
};


// --- Datos de la Actividad ---
const SENTIDOS_DATA_QUIZ = [
    { id: 1, name: 'VISTA', imageBase: 'sena_vista', correct: 'VISTA' },
    { id: 2, name: 'OÍDO', imageBase: 'sena_oido', correct: 'OÍDO' },
    { id: 3, name: 'OLFATO', imageBase: 'sena_olfato', correct: 'OLFATO' },
    { id: 4, name: 'GUSTO', imageBase: 'sena_gusto', correct: 'GUSTO' },
    { id: 5, name: 'TACTO', imageBase: 'sena_tacto', correct: 'TACTO' },
];

const SENTIDOS_EMOJIS = {
    'VISTA': '👁️',
    'OÍDO': '👂',
    'OLFATO': '👃',
    'GUSTO': '👅',
    'TACTO': '🖐️',
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

const CiAct6SenasSentidos = ({ onComplete }) => {

    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Eye', colorTheme: 'blue', title: '1. Observa', description: 'Mira la imagen de la seña que aparece a la izquierda.' },
        { iconName: 'Search', colorTheme: 'indigo', title: '2. Identifica', description: 'Piensa a qué sentido del cuerpo corresponde esta seña.' },
        { iconName: 'MousePointer', colorTheme: 'purple', title: '3. Selecciona', description: 'Haz clic en la opción correcta en la cuadrícula de la derecha.' },
        { iconName: 'Zap', colorTheme: 'green', title: '4. Avanza', description: 'Si es correcto, pasarás automáticamente a la siguiente pregunta.' }
    ];

    // Función para reiniciar el cuestionario
    const reiniciarCuestionario = useCallback(() => {
        const cargar = async () => {
            setLoading(true);
            const loadedQuestions = await Promise.all(
                SENTIDOS_DATA_QUIZ.map(async item => {
                    const url = await loadImageUrlByName(item.imageBase);

                    const incorrectOptions = SENTIDOS_DATA_QUIZ
                        .filter(s => s.correct !== item.correct)
                        .map(s => s.correct);

                    // Aseguramos que solo haya 3 opciones incorrectas + 1 correcta = 4
                    let options = shuffleArray(incorrectOptions).slice(0, 3);
                    options.push(item.correct);

                    return {
                        ...item,
                        imageUrl: url,
                        options: shuffleArray(options)
                    };
                })
            );

            setQuizData(shuffleArray(loadedQuestions));
            setCurrentQuestionIndex(0);
            setScore(0);
            setFeedback(null);
            setSelectedOption(null);
            setIsQuizComplete(false);
            setLoading(false);
        };
        cargar();
    }, []);


    // Carga inicial
    useEffect(() => {
        reiniciarCuestionario();
    }, [reiniciarCuestionario]);


    // --- Pasar a Siguiente Pregunta ---
    const handleNext = useCallback(() => {
        setSelectedOption(null);
        setFeedback(null);

        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // ⭐ CUANDO TERMINA EL QUIZ
            setIsQuizComplete(true);
        }
    }, [currentQuestionIndex, quizData.length]);

    // ⭐ EFECTO DE COMPLETADO: Se activa cuando el quiz termina
    useEffect(() => {
        if (isQuizComplete && score === quizData.length && quizData.length > 0) {
            onComplete(true);
        }
    }, [isQuizComplete, score, quizData.length, onComplete]);


    // --- Manejo de Respuesta ---
    const handleAnswer = (option) => {
        if (feedback) return;

        setSelectedOption(option);
        const currentQuestion = quizData[currentQuestionIndex];

        if (option === currentQuestion.correct) {
            setFeedback('correct');
            setScore(prev => prev + 1);
        } else {
            setFeedback('incorrect');
        }

        // NAVEGACIÓN AUTOMÁTICA
        setTimeout(() => {
            handleNext();
        }, 1500); // 1.5 segundos de retraso para ver el feedback
    };


    // --- Renderizado de la Pregunta Actual ---
    const currentQuestion = quizData[currentQuestionIndex];

    if (loading || !currentQuestion) return <div className="min-h-screen text-center p-10 font-semibold text-xl">Cargando preguntas...</div>;

    if (isQuizComplete) {
        // ⭐ VISTA FINAL: Muestra el resultado y el botón de Reiniciar (AZUL)
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
                <h2 className="text-5xl font-extrabold text-indigo-700 mb-6 drop-shadow">✨ ¡Cuestionario Finalizado!</h2>
                <p className="text-3xl mt-4 text-gray-700">Tu puntuación es: <span className="font-extrabold text-green-600">{score}</span> de <span className="font-extrabold text-indigo-600">{quizData.length}</span></p>

                <button
                    onClick={reiniciarCuestionario}
                    // ⭐ BOTÓN AZUL (bg-blue-600)
                    className="mt-10 px-12 py-4 bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg transition-all hover:bg-blue-700"
                >
                    🔄 Reiniciar actividad
                </button>
            </div>
        );
    }

    // --- VISTA DE QUIZ ACTIVA ---
    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-extrabold text-indigo-800 text-center drop-shadow-sm">
                    ✨ ¿Qué sentido nos está enseñando esta seña?
                </h2>
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                >
                    <HelpCircle className="w-8 h-8" />
                </button>
            </div>
            <p className="text-xl text-purple-700 mb-8 font-medium">
                🏆 ¡Responde las 5 preguntas para completar tu misión! {currentQuestionIndex + 1} de {quizData.length} | Aciertos: {score}
            </p>

            {/* CONTENEDOR DE 2 COLUMNAS */}
            <div className="w-full max-w-5xl p-6 bg-white rounded-3xl shadow-2xl flex">

                {/* 1. Columna Izquierda: IMAGEN DE LA SEÑA */}
                <div className="w-1/2 flex flex-col items-center justify-center p-6 border-r border-gray-200">
                    <p className="text-2xl font-semibold mb-4 text-center text-gray-700">
                        ¿Qué Sentido es esta Seña?
                    </p>
                    <img
                        src={currentQuestion.imageUrl}
                        alt={`Seña de ${currentQuestion.name}`}
                        className="w-64 h-64 object-contain border-4 border-purple-300 rounded-xl shadow-md bg-white"
                        style={{ filter: feedback ? 'grayscale(50%)' : 'none' }}
                    />
                    {/* Feedback de la respuesta actual con animaciones premium */}
                    <div className="h-20 flex items-center justify-center mt-4 w-full">
                        {feedback && (
                            <div className={`
                                flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-2xl shadow-lg border-2
                                transform transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4
                                ${feedback === 'correct' 
                                    ? 'bg-green-100 text-green-700 border-green-300 ring-4 ring-green-100' 
                                    : 'bg-red-100 text-red-700 border-red-300 ring-4 ring-red-100 animate-shake'}
                            `}>
                                <span className="text-3xl">
                                    {feedback === 'correct' ? '✨' : '⚠️'}
                                </span>
                                {feedback === 'correct' ? '¡CORRECTO!' : '¡CASI! INTENTA OTRA'}
                                <span className="text-3xl">
                                    {feedback === 'correct' ? '✅' : '❌'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Columna Derecha: OPCIONES DE RESPUESTA */}
                <div className="w-1/2 flex flex-col justify-center p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correct;
                            const isSelected = selectedOption === option;
                            let style = 'bg-indigo-100 hover:bg-indigo-200 border-indigo-500 text-indigo-800';
                            let emoji = SENTIDOS_EMOJIS[option] || '';

                            if (feedback) {
                                if (isCorrect) {
                                    style = 'bg-green-500 text-white border-green-700';
                                } else if (isSelected) {
                                    style = 'bg-red-500 text-white border-red-700';
                                } else {
                                    style = 'bg-gray-200 border-gray-400 opacity-60';
                                }
                            } else if (isSelected) {
                                style = 'bg-purple-300 border-purple-700 ring-4 ring-purple-400';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!feedback}
                                    className={`
                                        p-4 rounded-xl border-4 font-bold text-xl transition-all duration-100 
                                        flex flex-col items-center justify-center h-28
                                        ${style}
                                    `}
                                >
                                    <span className="text-3xl">{emoji}</span>
                                    <span className="text-base mt-1">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default CiAct6SenasSentidos;