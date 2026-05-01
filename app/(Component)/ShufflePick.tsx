/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";

function shuffleArray(arr: string[]) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function ShufflePick({ choices, onWin }: any) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffled] = useState(() => shuffleArray(choices));

  return (
    <div className="flex flex-col items-center gap-6">

      {/* 🎯 Title */}
      <h2 className="text-xl font-bold text-white">
        🎁 Pick Your Choice
      </h2>

      {/* 🎴 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {shuffled.map((item: string, i: number) => {
          const isSelected = selected === i;

          return (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => {
                if (selected !== null) return;
                setSelected(i);
                onWin(item);
              }}
              className={`
                relative w-28 h-28 rounded-xl font-bold text-white
                transition-all duration-300
                shadow-lg border-2
                ${
                  isSelected
                    ? "bg-green-500 scale-110 border-white"
                    : "bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-105 border-transparent"
                }
                ${selected !== null && !isSelected ? "opacity-40" : ""}
              `}
            >

              {/* 🎯 Before selection */}
              {!isSelected && (
                <span className="text-sm">PICK</span>
              )}

              {/* 🎉 After selection */}
              {isSelected && (
                <div className="flex flex-col items-center justify-center animate-pulse">
                  <span className="text-xs">YOU GOT</span>
                  <span className="text-sm mt-1">{item}</span>
                </div>
              )}

              {/* ✨ glow effect */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-white opacity-10 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* 🏆 Result hint */}
      {selected !== null && (
        <p className="text-white font-semibold mt-2">
          🎉 Result selected!
        </p>
      )}
    </div>
  );
}