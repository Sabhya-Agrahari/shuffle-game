"use client";
import { useState, useEffect } from "react";

type Props = {
  choices: string[];
  onWin: (res: string) => void;
};

export default function CardPick({ choices, onWin }: Props) {
  const [shuffling, setShuffling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(2); // Mobile: 2 columns
        setIsMobile(true);
        setIsTablet(false);
      } else if (width < 768) {
        setColumns(3); // Tablet: 3 columns
        setIsMobile(false);
        setIsTablet(true);
      } else {
        setColumns(4); // Desktop: 4 columns
        setIsMobile(false);
        setIsTablet(false);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const startShuffle = () => {
    if (shuffling || choices.length === 0) return;

    setShuffling(true);
    setWinnerIndex(null);

    let count = 0;
    let speed = isMobile ? 100 : 80; // Slower on mobile for better visibility

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * choices.length);
      setCurrentIndex(randomIndex);

      count++;

      // slow down effect - adjusted for mobile
      if (count > (isMobile ? 12 : 15)) speed += (isMobile ? 25 : 20);

      // stop condition - fewer iterations on mobile
      if (count > (isMobile ? 22 : 25)) {
        clearInterval(interval);

        const winner = Math.floor(Math.random() * choices.length);
        setCurrentIndex(winner);
        setWinnerIndex(winner);
        setShuffling(false);
        
        // Slight delay before showing win for better UX
        setTimeout(() => {
          onWin(choices[winner]);
        }, 100);
      }
    }, speed);
  };

  // Auto-scroll to winner on mobile
  useEffect(() => {
    if (winnerIndex !== null && isMobile) {
      const winnerElement = document.getElementById(`card-${winnerIndex}`);
      if (winnerElement) {
        setTimeout(() => {
          winnerElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 200);
      }
    }
  }, [winnerIndex, isMobile]);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 p-3 sm:p-4 md:p-5 lg:p-6 w-full max-w-full">
      {/* 🎴 CHOICES GRID - Enhanced Responsive Grid */}
      <div className="w-full overflow-x-auto pb-2 sm:pb-0">
        <div 
          className={`grid gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, choices.length)}, minmax(0, 1fr))`
          }}
        >
          {choices.map((choice, i) => {
            const isActive = i === currentIndex;
            const isWinner = i === winnerIndex;

            return (
              <div
                id={`card-${i}`}
                key={i}
                className={`
                  relative overflow-hidden
                  rounded-lg sm:rounded-xl md:rounded-2xl
                  flex items-center justify-center
                  text-white font-bold
                  transition-all duration-200
                  cursor-pointer
                  transform hover:scale-105
                  min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px]
                  p-1.5 sm:p-2 md:p-2.5 lg:p-3
                  text-[10px] sm:text-xs md:text-sm lg:text-base
                  break-words text-center
                  shadow-md
                  ${isWinner
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 scale-105 ring-2 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-gray-800 shadow-xl"
                    : isActive
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black scale-105 shadow-lg"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                  }
                  ${isMobile && !isWinner && !isActive ? "active:scale-95" : ""}
                `}
              >
                {/* Shine effect on active card */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                
                {/* Winner crown with responsive size */}
                {isWinner && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 md:-top-3 md:-right-3 text-sm sm:text-base md:text-xl lg:text-2xl">
                    👑
                  </div>
                )}

                {/* Active indicator pulse */}
                {isActive && !isWinner && (
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl animate-pulse ring-1 ring-yellow-400/50"></div>
                )}
                
                <span className="relative z-10 font-semibold">
                  {choice}
                </span>

                {/* Card number indicator on mobile */}
                {isMobile && !isWinner && (
                  <div className="absolute bottom-1 right-1 text-[8px] text-white/30">
                    #{i + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      {isMobile && choices.length > 6 && (
        <div className="text-center text-gray-500 text-[10px] sm:text-xs animate-pulse">
          👆 Scroll to see all cards
        </div>
      )}

      {/* 🔘 BUTTON - Enhanced Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
        <button
          onClick={startShuffle}
          disabled={shuffling || choices.length === 0}
          className={`
            px-4 sm:px-6 md:px-8 lg:px-10
            py-2 sm:py-2.5 md:py-3 lg:py-3.5
            rounded-lg sm:rounded-xl md:rounded-2xl
            font-bold text-sm sm:text-base md:text-lg
            transition-all duration-200
            transform hover:scale-105 active:scale-95
            flex items-center justify-center gap-2
            shadow-lg hover:shadow-xl
            touch-target
            w-full sm:w-auto
            min-w-[140px] sm:min-w-[160px] md:min-w-[180px]
            ${shuffling || choices.length === 0
              ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white"
            }
          `}
        >
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl">
            {shuffling ? "🎴" : "🃏"}
          </span>
          <span className="font-bold">
            {shuffling ? "Shuffling..." : "Shuffle Pick"}
          </span>
          {!shuffling && choices.length > 0 && (
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl">🎲</span>
          )}
        </button>

        {/* Reset button for mobile */}
        {winnerIndex !== null && isMobile && (
          <button
            onClick={() => {
              setWinnerIndex(null);
              setCurrentIndex(null);
            }}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-semibold hover:bg-gray-600 transition-all duration-200 touch-target"
          >
            🔄 New Game
          </button>
        )}
      </div>

      {/* 🏆 RESULT - Enhanced Responsive */}
      {winnerIndex !== null && (
        <div className="animate-fade-in-up w-full">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-purple-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-bounce">🎉</span>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">
                  Winner:
                </p>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse text-center break-words max-w-[200px] sm:max-w-none">
                {choices[winnerIndex]}
              </p>
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-bounce">🏆</span>
            </div>
            
            {/* Celebration confetti effect indicator */}
            <div className="mt-2 text-center text-xs text-white/60">
              🎊 Congratulations! 🎊
            </div>
          </div>
        </div>
      )}

      {/* Counter and Stats - Enhanced */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center text-center">
        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
          <span className="text-base sm:text-lg">📊</span>
          <span>Total Cards: {choices.length}</span>
        </div>
        
        {winnerIndex !== null && (
          <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm animate-pulse">
            <span>✅</span>
            <span>Game Complete!</span>
          </div>
        )}

        {shuffling && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs sm:text-sm">
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Selecting winner...</span>
          </div>
        )}
      </div>

      {/* Instruction for mobile users */}
      {!shuffling && winnerIndex === null && isMobile && (
        <div className="bg-gray-800/50 rounded-lg p-2 text-center text-gray-400 text-[10px] sm:text-xs">
          💡 Tap &quot;Shuffle Pick&quot; to randomly select a winner
        </div>
      )}
    </div>
  );
}