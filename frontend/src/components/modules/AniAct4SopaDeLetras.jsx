import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import InstructionModal from "../shared/InstructionModal";

// --- Lógica de Carga de Imágenes ---
const imagenesImport = import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp}", { eager: false });

const loadImageUrl = async (nombreBase) => {
    const key = Object.keys(imagenesImport).find(path =>
        path.toLowerCase().includes(`/${nombreBase.toLowerCase()}.`)
    );
    if (key) {
        const module = await imagenesImport[key]();
        return module.default;
    }
    return null;
};

// --- CONFIGURACIÓN Y DATOS ---
const GRID_SIZE = 10;
const NUM_WORDS_TO_HIDE = 3;
const RANDOM_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const WORD_POOL_BASE = [
    { name: 'LEON', imageBase: 'leon_icon' },
    { name: 'TIGRE', imageBase: 'tigre_icon' },
    { name: 'OSO', imageBase: 'oso_icon' },
    { name: 'ELEFANTE', imageBase: 'elefante_icon' },
    { name: 'COCODRILO', imageBase: 'cocodrilo_icon' },
    { name: 'JIRAFA', imageBase: 'jirafa_icon' },
    { name: 'DELFIN', imageBase: 'delfin_icon' },
    { name: 'MURCIELAGO', imageBase: 'murcielago_icon' },
    { name: 'ARDILLA', imageBase: 'ardilla_icon' },
    { name: 'CEBRA', imageBase: 'cebra_icon' },
];

const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const randomLetter = () => RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];

const generateGridAndWords = (wordsToPlace) => {
    let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    let placedWords = [];

    for (let wordData of wordsToPlace) {
        const word = wordData.name;
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            attempts++;
            const direction = Math.floor(Math.random() * 2);
            const dRow = direction === 1 ? 1 : 0;
            const dCol = direction === 0 ? 1 : 0;

            const startRow = Math.floor(Math.random() * (GRID_SIZE - (word.length * dRow)));
            const startCol = Math.floor(Math.random() * (GRID_SIZE - (word.length * dCol)));

            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
                const r = startRow + i * dRow;
                const c = startCol + i * dCol;
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) { canPlace = false; break; }
            }

            if (canPlace) {
                for (let i = 0; i < word.length; i++) {
                    grid[startRow + i * dRow][startCol + i * dCol] = word[i];
                }
                placedWords.push(wordData);
                placed = true;
            }
        }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') grid[r][c] = randomLetter();
        }
    }
    return { grid, placedWords };
};

const AniAct4SopaDeLetras = ({ onComplete }) => {
    const [grid, setGrid] = useState([]);
    const [wordsToFind, setWordsToFind] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animalAssets, setAnimalAssets] = useState({});
    const [currentSelection, setCurrentSelection] = useState([]);
    const [permanentFoundCells, setPermanentFoundCells] = useState([]);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const helpSteps = [
        { iconName: 'Search', colorTheme: 'blue', title: '1. Busca', description: 'Encuentra en la sopa de letras el nombre de los animales.' },
        { iconName: 'MousePointer', colorTheme: 'indigo', title: '2. Selecciona', description: 'Haz clic en cada letra que forme la palabra.' },
        { iconName: 'Check', colorTheme: 'green', title: '3. Repite', description: 'Continúa hasta encontrar a todos animales exóticos.' }
    ];

    const initializeActivity = useCallback(async () => {
        setLoading(true);
        setFoundWords([]);
        setCurrentSelection([]);
        setPermanentFoundCells([]);
        const shuffledPool = shuffleArray(WORD_POOL_BASE);
        const selectedWords = shuffledPool.slice(0, NUM_WORDS_TO_HIDE);
        const { grid: newGrid, placedWords } = generateGridAndWords(selectedWords);

        const animalUrls = {};
        for (const wordData of placedWords) {
            animalUrls[wordData.name] = await loadImageUrl(wordData.imageBase);
        }

        setGrid(newGrid);
        setWordsToFind(placedWords.map(w => ({ ...w, found: false })));
        setAnimalAssets(animalUrls);
        setLoading(false);
    }, []);

    useEffect(() => { initializeActivity(); }, [initializeActivity]);

    const handleCellClick = (r, c, letter) => {
        if (permanentFoundCells.some(cell => cell.r === r && cell.c === c)) return;

        if (currentSelection.some(cell => cell.r === r && cell.c === c)) {
            setCurrentSelection(prev => prev.filter(cell => !(cell.r === r && cell.c === c)));
            return;
        }

        const newSelection = [...currentSelection, { r, c, letter }];
        setCurrentSelection(newSelection);

        const formedWord = newSelection.map(s => s.letter).join('');
        const reversedWord = [...newSelection].reverse().map(s => s.letter).join('');

        const foundWordData = wordsToFind.find(w =>
            !w.found && (w.name === formedWord || w.name === reversedWord)
        );

        if (foundWordData) {
            setFoundWords(prev => [...prev, foundWordData.name]);
            setWordsToFind(prev => prev.map(w => w.name === foundWordData.name ? { ...w, found: true } : w));
            setPermanentFoundCells(prev => [...prev, ...newSelection]);
            setCurrentSelection([]);

            if (foundWords.length + 1 === wordsToFind.length) {
                setTimeout(() => onComplete?.(true), 1500);
            }
        }
    };

    const clearSelection = () => setCurrentSelection([]);

    if (loading) return <div className="text-center p-10 text-indigo-800 font-bold text-xl">Cargando sopa de letras... 🐾</div>;

    const allWordsFound = foundWords.length === wordsToFind.length;

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 min-h-screen">
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-extrabold text-indigo-800 text-center">🌿 ¿Puedes encontrar a los animales exóticos?</h2>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full transition-colors relative z-10"
                    >
                        <HelpCircle className="w-8 h-8" />
                    </button>
                </div>
                <p className="text-gray-600 font-semibold italic">✨ ¡Toca las letras y atrapa el nombre secreto!</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">

                {/* Columna Izquierda */}
                <div className="md:w-1/4 p-4 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">Animales</h3>
                    <div className="flex flex-col gap-4 w-full">
                        {wordsToFind.slice(0, 2).map(word => (
                            <div key={word.name} className={`flex flex-col items-center p-2 transition-opacity duration-300 ${word.found ? 'opacity-30' : 'opacity-100'}`}>
                                <img src={animalAssets[word.name]} alt={word.name} className="w-full h-auto object-contain" />
                                <p className="text-lg font-bold mt-1 text-indigo-600">{word.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Centro: Cuadrícula */}
                <div className="md:w-1/2 p-6 bg-purple-100 rounded-xl shadow-2xl relative select-none">
                    <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: '4px' }}>
                        {grid.map((row, rIdx) => row.map((letter, cIdx) => {
                            const isSelected = currentSelection.some(s => s.r === rIdx && s.c === cIdx);
                            const isFound = permanentFoundCells.some(s => s.r === rIdx && s.c === cIdx);

                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => handleCellClick(rIdx, cIdx, letter)}
                                    className={`flex items-center justify-center text-xl font-bold h-10 rounded-md cursor-pointer transition-all border
                                        ${isFound ? 'bg-green-400 text-white border-green-500 shadow-inner' :
                                            isSelected ? 'bg-yellow-400 text-indigo-900 border-yellow-600 scale-110 z-10' :
                                                'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                                >
                                    {letter}
                                </div>
                            );
                        }))}
                    </div>
                    {allWordsFound && (
                        <p className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold bg-white/90 rounded-xl text-green-700 animate-pulse">¡COMPLETADO! 🎉</p>
                    )}
                </div>

                {/* Columna Derecha */}
                <div className="md:w-1/4 p-4 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">Animales</h3>
                    <div className="flex flex-col gap-4 w-full">
                        {wordsToFind.slice(2).map(word => (
                            <div key={word.name} className={`flex flex-col items-center p-2 transition-opacity duration-300 ${word.found ? 'opacity-30' : 'opacity-100'}`}>
                                <img src={animalAssets[word.name]} alt={word.name} className="w-full h-auto object-contain" />
                                <p className="text-lg font-bold mt-1 text-indigo-600">{word.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                {currentSelection.length > 0 && (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-full shadow-md border border-indigo-200">
                        <span className="font-bold text-indigo-800">Seleccionado: {currentSelection.map(s => s.letter).join('')}</span>
                        <button onClick={clearSelection} className="bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 font-bold transition-colors">Limpiar</button>
                    </div>
                )}
                <button onClick={initializeActivity} className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 transition-all">
                    🔄 Nueva Sopa Aleatoria
                </button>
            </div>

            <InstructionModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} steps={helpSteps} />
        </div>
    );
};

export default AniAct4SopaDeLetras;