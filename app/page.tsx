"use client";

import { useState, useEffect } from "react";
import GameSelector from "./(Component)/GameSelector";
import ShufflePick from "./(Component)/ShufflePick";
import Spinner from "./(Component)/Spinner";
import ShooterGame from "./(Component)/Shooter";
import ScratchCard from "./(Component)/ScratchCard";
import CardPick from "./(Component)/CardPick"; 

type Step = "form" | "select" | "game" | "result";
type GameType = "shuffle" | "spinner" | "mcq" | "shooter" | "card" ;

export default function PickAndWinPage() {
  const [step, setStep] = useState<Step>("form");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [game, setGame] = useState<GameType | null>(null);
  const [reward, setReward] = useState("");
  const [scratchReward, setScratchReward] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleChange = (value: string, index: number) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  const addField = () => {
    if (choices.length < 12) {
      setChoices((prev) => [...prev, ""]);
    }
  };

  const validChoices = choices.filter((c) => c.trim() !== "");

  const startScratchGame = () => {
    const random = validChoices[Math.floor(Math.random() * validChoices.length)];
    setScratchReward(random);
    setGame("mcq");
    setStep("game");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background - Responsive blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 bg-purple-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse top-0 -left-16 sm:-left-24 lg:-left-48"></div>
        <div className="absolute w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 bg-blue-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse delay-1000 bottom-0 -right-16 sm:-right-24 lg:-right-48"></div>
        <div className="absolute w-24 sm:w-32 md:w-48 lg:w-64 h-24 sm:h-32 md:h-48 lg:h-64 bg-pink-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse delay-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-40 sm:w-56 md:w-72 lg:w-96 h-40 sm:h-56 md:h-72 lg:h-96 bg-yellow-500/10 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse delay-700 bottom-10 lg:bottom-20 left-1/4 lg:left-1/3"></div>
      </div>

      {/* Main Container - Fully Responsive */}
      <div className="relative bg-black/40 backdrop-blur-md sm:backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-3 sm:p-5 md:p-6 lg:p-8 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl w-full mx-auto animate-fade-in-up">
        
        {/* Header - Responsive Text Sizes */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl animate-bounce mb-1 sm:mb-2">🎁</div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Pick & Win
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
            Choose your path to victory!
          </p>
        </div>

        {/* STEP 1: FORM */}
        {step === "form" && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">🎨 Enter Your Choices</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Add at least 4 items to continue {choices.length >= 12 && "(Max 12)"}</p>
            </div>

            <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 md:max-h-96 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {choices.map((value, index) => (
                <div key={index} className="relative group">
                  <input
                    value={value}
                    onChange={(e) => handleChange(e.target.value, index)}
                    placeholder={`Choice ${index + 1}`}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                    ✏️
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addField}
              disabled={choices.length >= 12}
              className={`w-full font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base ${
                choices.length < 12
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>➕</span>
              <span>{choices.length >= 12 ? "Maximum 12 Choices" : "Add More Choices"}</span>
            </button>

            {validChoices.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-2">Your Choices:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {validChoices.map((c, i) => (
                    <span key={i} className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm text-white border border-purple-500/30 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={validChoices.length < 4}
              onClick={() => setStep("select")}
              className={`w-full font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 transform text-sm sm:text-base ${
                validChoices.length >= 4
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue to Game Selection →
            </button>
          </div>
        )}

        {/* STEP 2: SELECT GAME */}
        {step === "select" && (
          <div className="animate-fade-in">
            <GameSelector
              onSelect={(g: GameType) => {
                setGame(g);
                console.log("GAME SELECTED:", g);
                if (g === "mcq") {
                  startScratchGame();
                } else {
                  setStep("game");
                }
              }}
            />
          </div>
        )}

        {/* STEP 3: GAME - Responsive Containers with horizontal scroll for mobile */}
        {step === "game" && game === "shuffle" && (
          <div className="animate-fade-in overflow-x-auto pb-2">
            <div className="min-w-[280px] sm:min-w-0">
              <ShufflePick
                choices={validChoices}
                onWin={(res: string) => {
                  setReward(res);
                  setStep("result");
                }}
              />
            </div>
          </div>
        )}

        {step === "game" && game === "spinner" && (
          <div className="animate-fade-in overflow-x-auto pb-2">
            <div className="min-w-[280px] sm:min-w-0">
              <Spinner
                choices={validChoices}
                onWin={(res: string) => {
                  setReward(res);
                  setStep("result");
                }}
              />
            </div>
          </div>
        )}

        {step === "game" && game === "card" && (
          <div className="animate-fade-in overflow-x-auto pb-2">
            <div className="min-w-[280px] sm:min-w-0">
              <CardPick
                choices={validChoices}
                onWin={(res: string) => {
                  setReward(res);
                  setStep("result");
                }}
              />
            </div>
          </div>
        )}

        {game === "mcq" && step === "game" && scratchReward && (
          <div className="animate-fade-in overflow-x-auto pb-2">
            <div className="min-w-[280px] sm:min-w-0">
              <ScratchCard
                reward={scratchReward}
                onWin={(res: string) => {
                  setReward(res);
                  setStep("result");
                }}
              />
            </div>
          </div>
        )}

        {step === "game" && game === "shooter" && (
          <div className="animate-fade-in overflow-x-auto pb-2">
            <div className="min-w-[280px] sm:min-w-0">
              <ShooterGame
                choices={validChoices}
                onWin={(res: string) => {
                  setReward(res);
                  setStep("result");
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: RESULT */}
        {step === "result" && (
          <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl md:blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 animate-bounce">🎉</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Congratulations!</h2>
                <p className="text-sm sm:text-base md:text-xl text-white/90">You won:</p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-1 sm:mt-2 animate-pulse break-words px-2">
                  {reward}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
              <button
                onClick={() => {
                  setStep("select");
                  setReward("");
                  setScratchReward("");
                  setGame(null);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>🎮</span>
                <span>Play Again</span>
              </button>
              
              <button
                onClick={() => {
                  setStep("form");
                  setReward("");
                  setScratchReward("");
                  setGame(null);
                  setChoices(["", "", "", ""]);
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>🔄</span>
                <span>Reset All</span>
              </button>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {step !== "result" && (
          <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-white/10">
            <div className="flex justify-center gap-1 sm:gap-2">
              {["form", "select", "game"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`h-1 rounded-full transition-all duration-300 ${
                    step === s ? "w-3 sm:w-4 md:w-6 bg-purple-500" : "w-1 sm:w-1.5 bg-gray-600"
                  }`} />
                  {i < 2 && <div className="w-3 sm:w-4 md:w-8 h-px bg-gray-700" />}
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-2">
              {step === "form" && "Step 1: Add your choices"}
              {step === "select" && "Step 2: Pick your game"}
              {step === "game" && "Step 3: Play & Win!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}