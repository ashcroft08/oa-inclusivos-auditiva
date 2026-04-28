// src/data/activitiesData.js

export const modulesData = [
  {
    id: "ciclo-vida",
    title: "Ciclo de Vida",
    description: "Aprende las etapas clave de la vida: nacer, crecer, reproducirse y morir.",
    color: "bg-blue-600",
    emoji: "🌱",
    activities: [

      // Video: Introducción al Ciclo
      {
        id: "cv-video-intro",
        title: "¡Vamos a Aprender Juntos! 🌟",
        activity: "video",     // <--- TIPO ESPECIAL
        videoKey: "ciclo_intro", // <--- CLAVE PARA BUSCAR EL ARCHIVO
        emoji: "🎥"
      },

      // CiAct1: Unir Señas (Vocabulario del Ciclo: Ej. Semilla, Polluelo, Bebe, etc.)
      { id: "cv-1", title: "🕵️‍♂️ ¡Detectives de Mensajes Secretos!", activity: "senas", emoji: "🔗" },

      // CiAct2: Ordenar Ciclo de Vida
      { id: "cv-2", title: "⏰ ¡El Reloj del Crecimiento!", activity: "ordenar", emoji: "🧩" },

      {
        id: "cv-video-2",
        title: "Ciclo de Vida de las Plantas 🌱",
        activity: "video",
        videoKey: "ciclo_etapas",
        emoji: "🎥"
      },

      // CiAct3: Dibujar Mamífero (Ahora, Dibujar una etapa o ejemplo del ciclo)
      { id: "cv-3", title: "🎨 ¡Galería de Arte de la Vida!", activity: "dibujar", emoji: "🎨" },



      // CiAct4: Describir (Describir una etapa del ciclo o un ser vivo)
      { id: "cv-4", title: "🌟 ¿De qué se trata esta Imagen?", activity: "describir", emoji: "✨" },

      {
        id: "cv-video-3",
        title: "Sentidos y Señas 👂",
        activity: "video",
        videoKey: "ciclo_sentidos",
        emoji: "🎥"
      },


      // CiAct5: Asociar Sentidos con Objetos
      { id: 'ci-5', title: '🌈 ¡Descubriendo el Mundo con mis Sentidos!', activity: 'asociar-sentido-objeto', emoji: '👃' },

      //CiAct6: ¿Qué Seña es?
      { id: 'ci-6', title: '🤫 ¡Adivina el Mensaje de las Manos!', activity: 'señas-sentidos', emoji: '👂' },

      //CiAct7: Etiquetar Partes del Cuerpo
      { id: "ci-7", title: "🗺️ ¡El Mapa Mágico de tu Interior!", activity: "etiquetar-cuerpo", emoji: "🧠" },
    ]
  },

  {
    id: 'animales',
    title: 'Animales',
    description: "Clasificación, hábitats y características de los seres vivos.",
    color: 'bg-orange-600',
    emoji: '🦁',
    activities: [
      // ⭐ NUEVA ACTIVIDAD: AniAct1SeleccionalosAnimales

      {
        id: "an-video-intro",
        title: "🦁 El Reino Animal: ¡Expedición: Vertebrados vs. Invertebrados!",
        activity: "video",
        videoKey: "animales_intro", // <--- Recuerda agregar esta clave en ActivityView
        emoji: "🎥"
      },
      {
        id: 'an-1', title: '🎈 ¡En busca de los Amigos Animales!', activity: 'seleccionar-animales', emoji: '🔍'
      },

      {
        id: 'an-3', title: '🦴 ¡El Misterio de los Huesitos!', activity: 'clasificar-dragdrop', emoji: '📋'
      },
      {
        id: 'an-4', title: '🕵️‍♂️ ¡Safari de Palabras Escondidas!', activity: 'sopa-letras', emoji: '🔎'
      },
      {
        id: "an-video-dieta",
        title: "🍽️ ¡El Gran Menú de la Naturaleza!",
        activity: "video",
        videoKey: "animales_dieta", // <--- Nueva clave
        emoji: "🍖"
      },
      {
        id: 'an-5', title: '🌟 ¡Cada Animal con su Comidita!', activity: 'unir-comida-drag', emoji: '🥩'
      },
      {
        id: 'an-6', title: '🕵️‍♂️ ¡Detectives de Comida Animal!', activity: 'clasificar-dieta-aleatoria', emoji: '🍴'
      },

      {
        id: "an-video-repro",
        title: "🐥 ¡El Misterio del Nacimiento: Ovíparos y Vivíparos!",
        activity: "video",
        videoKey: "animales_repro", // <--- Clave nueva
        emoji: "🐣"
      },

      {
        id: 'an-7', title: '🥚 ¿Huevo o Pancita?', activity: 'clasificar-reproduccion', emoji: '🥚'
      },

      {
        id: 'an-2', title: '📔 ¡El Álbum de los Superanimales!', activity: 'clasificar-tabla', emoji: '📋'
      },

      {
        id: 'an-9', title: '🏠 ¡Buscando el Hogar Perfecto!', activity: 'clasifica-lineas', emoji: '🏠'
      },

    ]
  },

  // 🌿 MÓDULO PLANTAS
  {
    id: 'plantas',
    title: 'Plantas',
    description: 'Partes, funciones y el ciclo de vida de los vegetales.',
    color: 'bg-green-600',
    emoji: '🌿',
    activities: [
      // ⭐ NUEVA ACTIVIDAD 1: Etiquetar Partes de la Planta
      {
        id: 'pl-video-partes',
        title: '🌱 ¡El Despertar de la Semillita Mágica!',
        activity: 'video',
        videoKey: 'plantas_partes', // <--- Clave nueva
        emoji: '🌱'
      },
      { id: 'pl-1', title: '🏗️ ¡Armando mi Planta Súper Fuerte!', activity: 'etiquetar-partes', emoji: '🏷️' },
      { id: 'pl-2', title: '🌳 ¡El Juego de los Tamaños Verdes!', activity: 'clasifica-tipos-tallo', emoji: '🌲' },
      {
        id: 'pl-video-tallos',
        title: '✨ ¿Sabías que algunas plantas son fuertes como la madera y otras bailan con el viento?',
        activity: 'video',
        videoKey: 'plantas_tallos', // <--- Clave nueva
        emoji: '🎋'
      },
      {
        id: 'pl-3',
        title: '🕵️‍♂️ ¡Misión: Detectives de Plantas!',
        activity: 'clasifica-tallo-rigido',
        emoji: '💪'
      },
      {
        id: 'pl-4',
        title: '🪄 ¡La Receta Mágica del Color Verde!',
        activity: 'clasifica-necesidades',
        emoji: '☀️' // Sol/Nutrición
      },
      {
        id: 'pl-5',
        title: '📖 ¡Érase una vez una Semillita!',
        activity: 'ordena-ciclo',
        emoji: '🌱'
      }
    ]
  },

  // 🌎 MÓDULO ECOSISTEMAS
  {
    id: 'ecosistemas',
    title: 'Ecosistemas',
    description: 'Relaciones entre seres vivos y su medio ambiente (hábitats).',
    color: 'bg-purple-600',
    emoji: '🌎',
    activities: [
      // ⭐ NUEVA ACTIVIDAD 1: Clasificar Bióticos vs. Abióticos
      {
        id: 'eco-video-intro',
        title: '🏠 ¡El Gran Vecindario de la Naturaleza!',
        activity: 'video',
        videoKey: 'eco_intro', // <--- Clave nueva
        emoji: '🏞️'
      },
      {
        id: 'ec-1',
        title: '🌟 ¡Vivos vs. No Vivos: El Gran Reto!',
        activity: 'clasifica-factores',
        emoji: '🧪'
      },
      {
        id: 'eco-2',
        title: '⚡ ¡La Carrera de la Energía!',
        activity: 'ordena-cadena',
        emoji: '🔗'
      },
      {
        id: 'eco-3',
        title: '✈️ ¡Pasaporte a la Naturaleza!',
        activity: 'organismo-habitat',
        emoji: '🗺️'
      },
      {
        id: 'eco-4',
        title: '🏆 ¡El Equipo de la Vida!',
        activity: 'niveles-troficos',
        emoji: '🎯'
      },
      {
        id: 'eco-video-solar',
        title: '🚀 ¡Despegue hacia las Estrellas!',
        activity: 'video',
        videoKey: 'eco_solar', // <--- Clave nueva
        emoji: '🪐'
      },
      {
        id: 'eco-5',
        title: '🛰️ ¡Misión: Mapa Estelar!',
        activity: 'etiqueta-planetas',
        emoji: '🪐'
      },
      {
        id: 'eco-video-estaciones',
        title: '📅 ¡Un Viaje por las Cuatro Estaciones!',
        activity: 'video',
        videoKey: 'eco_estaciones', // <--- Clave nueva
        emoji: '🍂'
      },
      {
        // ⭐ NUEVA ACTIVIDAD DE ESTACIONES
        id: 'eco-6',
        title: '📅 ¡El Detective del Tiempo!',
        activity: 'clasifica-estaciones',
        emoji: '📅'
      },
    ]
  },
  // ⭐ Los demás módulos (Animales, Plantas, Ecosistemas) se eliminan por ahora.
];
// Opcional: Función para obtener una actividad específica por su ID, si la necesitas en ActivityView
export const getAllActivities = () => {
  let all = [];
  modulesData.forEach(module => {
    all = all.concat(module.activities.map(act => ({ ...act, moduleId: module.id })));
  });
  return all;
};