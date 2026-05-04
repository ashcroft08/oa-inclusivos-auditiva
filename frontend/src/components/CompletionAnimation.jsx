import React, { useEffect, useState } from "react";

const CompletionAnimation = ({ type }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Web Audio API for premium sound feedback
    const playSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === "success") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } else {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
          osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2); // A2
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        console.warn("Audio feedback not supported or blocked");
      }
    };

    playSound();
    return () => setShow(false);
  }, [type]);

  const particles = type === "success" 
    ? ["🎉", "🎊", "⭐", "✨", "🌟", "🎈", "💖", "🏆", "🌈"]
    : ["💧", "🌧️", "☁️", "💔", "❄️", "❗"];

  const renderParticles = () => {
    return [...Array(40)].map((_, i) => {
      const size = Math.random() * (2.5 - 1) + 1;
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * (3 - 1.5) + 1.5;
      const particle = particles[i % particles.length];

      return (
        <div
          key={`particle-${i}`}
          className="absolute pointer-events-none select-none"
          style={{
            top: "-50px",
            left: `${left}%`,
            fontSize: `${size}rem`,
            animation: `fall-complex ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
            opacity: 0,
            zIndex: 60
          }}
        >
          {particle}
        </div>
      );
    });
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[100] transition-all duration-700 ease-out backdrop-blur-md
        ${show ? 'opacity-100' : 'opacity-0'}
        ${type === "success" ? 'bg-green-500/10' : 'bg-orange-500/10'}
      `}
    >
      <div className="relative flex flex-col items-center">
        {/* Particle Container */}
        <div className="absolute inset-0 w-[100vw] h-[100vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {renderParticles()}
        </div>

        {/* Central Card */}
        <div 
          className={`
            relative p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col items-center
            bg-white/90 backdrop-blur-xl border-4
            transition-all duration-500 transform
            ${show ? 'scale-100 translate-y-0 rotate-0' : 'scale-50 translate-y-20 rotate-12'}
            ${type === "success" ? 'border-green-400' : 'border-orange-400'}
          `}
        >
          {/* Main Icon with Glow */}
          <div className="relative">
            <div className={`
              absolute inset-0 blur-3xl rounded-full opacity-50 animate-pulse
              ${type === "success" ? 'bg-green-400' : 'bg-orange-400'}
            `} />
            <div className="text-[10rem] relative z-10 drop-shadow-2xl animate-bounce-custom">
              {type === "success" ? "🌟" : "💪"}
            </div>
          </div>

          <h2 className={`
            text-6xl font-black mt-8 mb-4 tracking-tight text-center
            ${type === "success" ? 'text-green-600' : 'text-orange-600'}
          `}>
            {type === "success" ? "¡MAGNÍFICO!" : "¡CASI LO TIENES!"}
          </h2>

          <p className="text-2xl font-bold text-gray-700 text-center max-w-md">
            {type === "success" 
              ? "Has completado este desafío con éxito. ¡Sigue así, campeón! 🚀"
              : "No te rindas, cada intento te hace más sabio. ¡Inténtalo una vez más! ✨"}
          </p>

          {/* Decorative Elements */}
          <div className="mt-8 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full animate-ping
                  ${type === "success" ? 'bg-green-400' : 'bg-orange-400'}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall-complex {
          0% { 
            transform: translateY(0) translateX(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(5vh) translateX(20px) rotate(45deg) scale(1);
          }
          100% { 
            transform: translateY(110vh) translateX(-100px) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        .animate-bounce-custom {
          animation: bounce-custom 2s ease-in-out infinite;
        }

        @font-face {
          font-family: 'Outfit';
          src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        }
      `}</style>
    </div>
  );
};

export default CompletionAnimation;
