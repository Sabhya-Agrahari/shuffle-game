"use client";
import { useState, useEffect } from "react";

type Props = {
  choices: string[];
  onWin: (res: string) => void;
};

export default function Spinner({ choices, onWin }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [wheelSize, setWheelSize] = useState(320);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setWheelSize(280);
        setIsMobile(true);
        setIsTablet(false);
      } else if (width < 768) {
        setWheelSize(320);
        setIsMobile(false);
        setIsTablet(true);
      } else if (width < 1024) {
        setWheelSize(380);
        setIsMobile(false);
        setIsTablet(false);
      } else {
        setWheelSize(400);
        setIsMobile(false);
        setIsTablet(false);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const segmentAngle = 360 / choices.length;

  const getColor = (i: number) => {
    const shades = [
      "#f97316",
      "#fb923c",
      "#f59e0b",
      "#fbbf24",
      "#ea580c",
      "#f97316cc",
      "#fb923ccc",
      "#f59e0bcc",
      "#fbbf24cc",
      "#ea580ccc",
    ];
    return shades[i % shades.length];
  };

  const spinWheel = () => {
    if (spinning || choices.length === 0) return;

    setSpinning(true);
    setShowResult(false);

    const index = Math.floor(Math.random() * choices.length);
    const pointerOffset = 90;
    const targetAngle = index * segmentAngle + segmentAngle / 2;
    
    // Adjust spins based on device
    const baseSpins = isMobile ? 3 : 4;
    const finalRotation = (baseSpins + multiplier * 3) * 360 + (360 - targetAngle + pointerOffset);
    
    setRotation((prev) => prev + finalRotation);

    const duration = isMobile ? 2 : (2.5 + multiplier * 0.8);

    setTimeout(() => {
      setSpinning(false);
      setWinnerIndex(index);
      setShowResult(true);
      onWin(choices[index]);
    }, duration * 1000);
  };

  const getFontSize = () => {
    if (isMobile) return "8px";
    if (isTablet) return "10px";
    return "12px";
  };

  const getLabelWidth = () => {
    if (isMobile) return "60px";
    if (isTablet) return "70px";
    return "80px";
  };

  const getLabelOffset = () => {
    if (isMobile) return -80;
    if (isTablet) return -100;
    return -120;
  };

  const getCenterSize = () => {
    if (isMobile) return 0.22;
    if (isTablet) return 0.21;
    return 0.2;
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 p-3 sm:p-4 md:p-5 lg:p-6 w-full max-w-full">
      
      {/* 🔘 MULTIPLIER - Responsive */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="text-white text-xs sm:text-sm font-semibold bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          🎲 Spin Multiplier
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              onClick={() => !spinning && setMultiplier(m)}
              disabled={spinning}
              className={`
                px-3 sm:px-4 md:px-5 
                py-1.5 sm:py-2 
                rounded-lg sm:rounded-xl 
                text-xs sm:text-sm md:text-base 
                font-bold transition-all duration-200
                transform hover:scale-105 active:scale-95
                min-h-[36px] sm:min-h-[44px]
                ${multiplier === m
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }
                ${spinning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {m}x
              {multiplier === m && (
                <span className="ml-1 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 🎡 WHEEL - Responsive */}
      <div className="relative flex justify-center items-center w-full py-4 sm:py-6">
        <div 
          className="relative"
          style={{ 
            width: wheelSize, 
            height: wheelSize 
          }}
        >
          {/* 🎯 POINTER - Responsive */}
          <div className="absolute -right-2 sm:-right-3 md:-right-4 top-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div 
                className="w-0 h-0 border-t-[8px] sm:border-t-[10px] md:border-t-[12px] 
                           border-b-[8px] sm:border-b-[10px] md:border-b-[12px] 
                           border-l-[16px] sm:border-l-[20px] md:border-l-[24px] 
                           border-transparent border-l-white drop-shadow-xl" 
              />
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 sm:h-5 md:h-6 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>

          {/* 🎡 SPIN WHEEL */}
          <div
            className="w-full h-full rounded-full shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-orange-500/30"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: `transform ${
                isMobile ? 2 : (2.5 + multiplier * 0.8)
              }s cubic-bezier(0.12, 0.85, 0.1, 1)`,
              background: `conic-gradient(${choices
                .map((_, i) => {
                  const start = i * segmentAngle;
                  const end = start + segmentAngle;
                  return `${getColor(i)} ${start}deg ${end}deg`;
                })
                .join(",")})`,
              border: `3px solid rgba(255,255,255,0.2)`,
              boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)",
            }}
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
            
            {/* 📝 LABELS - Responsive */}
            {choices.map((text, i) => {
              const angle = i * segmentAngle + segmentAngle / 2;
              const isWinner = i === winnerIndex && showResult;

              return (
                <div
                  key={i}
                  className={`
                    absolute left-1/2 top-1/2 
                    font-bold text-white text-center
                    transition-all duration-300
                    whitespace-nowrap
                    drop-shadow-md
                    ${isWinner ? "scale-110 text-yellow-200 drop-shadow-lg animate-pulse" : ""}
                  `}
                  style={{
                    width: getLabelWidth(),
                    transform: `
                      translateX(-50%)
                      rotate(${angle}deg)
                      translateY(${getLabelOffset()}px)
                      rotate(-${angle}deg)
                    `,
                    fontSize: getFontSize(),
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className="truncate max-w-[50px] sm:max-w-[70px] md:max-w-[80px]">
                      {text.length > (isMobile ? 6 : 10)
                        ? text.slice(0, isMobile ? 5 : 9) + "..."
                        : text}
                    </span>
                    {isWinner && (
                      <span className="text-[10px] sm:text-xs mt-0.5 animate-bounce">🏆</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Decorative rings */}
            <div className="absolute inset-[5%] rounded-full border-2 border-white/20 pointer-events-none"></div>
            <div className="absolute inset-[15%] rounded-full border border-white/10 pointer-events-none"></div>

            {/* 🎯 CENTER BUTTON - Responsive */}
            <div
              onClick={spinWheel}
              className={`
                absolute rounded-full 
                flex items-center justify-center 
                shadow-2xl transition-all duration-300
                cursor-pointer hover:scale-105 active:scale-95
                min-h-[44px] min-w-[44px]
                bg-gradient-to-br from-white to-gray-100
                border-4 border-orange-400
                ${spinning ? "cursor-not-allowed opacity-75" : "hover:shadow-xl"}
              `}
              style={{
                width: wheelSize * getCenterSize(),
                height: wheelSize * getCenterSize(),
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="text-center">
                <div className="text-xs sm:text-sm md:text-base font-bold text-orange-500">
                  {spinning ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[8px] sm:text-[10px]">SPIN</span>
                    </div>
                  ) : (
                    <>
                      <span className="block text-sm sm:text-base md:text-lg">{multiplier}x</span>
                      <span className="text-[8px] sm:text-[10px] md:text-xs">SPIN</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 RESULT - Enhanced Responsive */}
      {showResult && winnerIndex !== null && !spinning && (
        <div className="animate-fade-in-up w-full max-w-md mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 border border-purple-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl animate-bounce">🎉</span>
                <p className="text-sm sm:text-base md:text-lg font-bold text-white">
                  Winner:
                </p>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse text-center break-words max-w-[180px] sm:max-w-[250px] md:max-w-none">
                {choices[winnerIndex]}
              </p>
              <span className="text-2xl sm:text-3xl md:text-4xl animate-bounce">🏆</span>
            </div>
            
            {/* Multiplier info */}
            <div className="mt-2 text-center text-xs text-white/60">
              🎲 {multiplier}x Multiplier Spin
            </div>
          </div>
        </div>
      )}

      {/* Game Info - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center items-center text-center mt-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
          <span className="text-base sm:text-lg">🎯</span>
          <span>Total Options: {choices.length}</span>
        </div>
        
        {spinning && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs sm:text-sm animate-pulse">
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Spinning Wheel...</span>
          </div>
        )}

        {!spinning && !showResult && choices.length > 0 && (
          <div className="flex items-center gap-2 text-blue-400 text-xs sm:text-sm">
            <span>💡</span>
            <span>Click center to spin!</span>
          </div>
        )}
      </div>

      {/* Mobile Instructions */}
      {isMobile && !spinning && !showResult && (
        <div className="bg-gray-800/50 rounded-lg p-2 text-center text-gray-400 text-[10px] w-full max-w-[280px] mx-auto animate-fade-in">
          💡 Tap the center button to spin the wheel and win a prize!
        </div>
      )}

      {/* Tablet Instructions */}
      {isTablet && !spinning && !showResult && (
        <div className="bg-gray-800/50 rounded-lg p-2 text-center text-gray-400 text-xs w-full max-w-[400px] mx-auto animate-fade-in">
          💡 Click the center button to spin and win!
        </div>
      )}
    </div>
  );
}