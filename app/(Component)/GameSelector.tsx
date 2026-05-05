"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function GameSelector({ onSelect }: any) {
  return (
    <div className="flex flex-col items-center gap-6">

      {/* Title */}
      <h2 className="text-2xl font-bold text-white">
        🎮 Choose Your Game
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Shuffle */}
        <button
          onClick={() => onSelect("shuffle")}
          className="w-44 h-40 rounded-2xl text-white font-bold shadow-xl
          bg-gradient-to-br from-yellow-400 to-orange-500
          hover:scale-105 transition transform duration-300
          flex flex-col items-center justify-center gap-2"
        >
          🎴
          <span>Card</span>
        </button>

        {/* Spinner */}
        <button
          onClick={() => onSelect("spinner")}
          className="w-44 h-40 rounded-2xl text-white font-bold shadow-xl
          bg-gradient-to-br from-blue-500 to-indigo-600
          hover:scale-105 transition transform duration-300
          flex flex-col items-center justify-center gap-2"
        >
          🎡
          <span>Spinner</span>
        </button>

        {/* Scratch */}
        <button
          onClick={() => onSelect("mcq")}
          className="w-44 h-40 rounded-2xl text-white font-bold shadow-xl
          bg-gradient-to-br from-green-400 to-emerald-600
          hover:scale-105 transition transform duration-300
          flex flex-col items-center justify-center gap-2"
        >
          🎟️
          <span>Scratch Card</span>
        </button>


        {/* 🔫 Shooter Game (NEW) */}
        <button
          onClick={() => onSelect("shooter")}
          className="w-44 h-40 rounded-2xl text-white font-bold shadow-xl
          bg-gradient-to-br from-red-500 to-pink-600
          hover:scale-105 transition transform duration-300
          flex flex-col items-center justify-center gap-2"
        >
          🔫
          <span>Shooter</span>
        </button>


         {/* Spinner */}
        <button
          onClick={() => onSelect("card")}
          className="w-44 h-40 rounded-2xl text-white font-bold shadow-xl
          bg-gradient-to-br from-purple-900 to-pink-600
          hover:scale-105 transition transform duration-300
          flex flex-col items-center justify-center gap-2"
        >
          🎡
          <span>Shuffle</span>
        </button>


      </div>


      {/* Hint */}
      <p className="text-sm text-gray-300 mt-2">
        Pick a game & try your luck 🍀
      </p>
    </div>
  );
}