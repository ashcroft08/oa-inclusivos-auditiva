import React from "react";

const CompletionAnimation = ({ type }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {type === "success" ? (
        <div className="animate-bounce">
          <div className="relative">
            <div className="text-9xl animate-pulse">😊</div>
            {[...Array(30)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute text-3xl"
                style={{
                  top: "-60px",
                  left: `${(i - 15) * 15}px`,
                  animation: `fall 2s ease-in ${i * 0.0}s`,
                  animationFillMode: "forwards",
                }}
              >
                {["🎉", "🎊", "⭐", "✨", "🌟", "🎈"][i % 6]}
              </div>
            ))}
          </div>
          <p className="text-4xl font-bold text-green-600 mt-6 text-center animate-pulse">
            ¡Excelente trabajo!
          </p>
        </div>
      ) : (
        <div className="animate-bounce">
          <div className="relative">
            <div className="text-9xl animate-pulse">😢</div>
            {[...Array(12)].map((_, i) => (
              <div
                key={`tear-${i}`}
                className="absolute text-3xl"
                style={{
                  top: "100%",
                  left: `${(i - 6) * 20}px`,
                  animation: `fall 1.5s ease-in ${i * 0.1}s infinite`,
                }}
              >
                💧
              </div>
            ))}
          </div>
          <p className="text-4xl font-bold text-orange-600 mt-6 text-center">
            ¡Inténtalo de nuevo!
          </p>
        </div>
      )}

      <style>{`
        @keyframes fall {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CompletionAnimation;
