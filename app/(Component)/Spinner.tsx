"use client";
import { useState } from "react";

type Props = {
  choices: string[];
  onWin: (res: string) => void;
};

export default function Spinner({ choices, onWin }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1);

  const segmentAngle = 360 / choices.length;

  // 🟠 clean same-family colors
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

    const index = Math.floor(Math.random() * choices.length);

    const pointerOffset = 90;

    const targetAngle =
      index * segmentAngle + segmentAngle / 2;

    const finalRotation =
      (4 + multiplier * 3) * 360 +
      (360 - targetAngle + pointerOffset);

    setRotation((prev) => prev + finalRotation);

    const duration = 2.5 + multiplier * 0.8;

    setTimeout(() => {
      setSpinning(false);
      setWinnerIndex(index);
      onWin(choices[index]);
    }, duration * 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6">

      {/* 🔘 MULTIPLIER */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((m) => (
          <button
            key={m}
            onClick={() => setMultiplier(m)}
            disabled={spinning}
            className={`px-3 py-1 rounded border text-sm font-bold transition ${
              multiplier === m
                ? "bg-orange-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {m}x
          </button>
        ))}
      </div>

      {/* 🎡 WHEEL */}
      <div className="relative w-80 h-80">

        {/* 🎯 POINTER */}
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[20px] border-transparent border-l-white drop-shadow-md" />
        </div>

        {/* 🎡 SPIN WHEEL */}
        <div
          className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${
              2.5 + multiplier * 0.8
            }s cubic-bezier(0.12, 0.85, 0.1, 1)`,
            background: `conic-gradient(${choices
              .map((_, i) => {
                const start = i * segmentAngle;
                const end = start + segmentAngle;

                return `${getColor(i)} ${start}deg ${end}deg`;
              })
              .join(",")})`,
          }}
        >

          {/* 📝 LABELS */}
          {choices.map((text, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            const isWinner = i === winnerIndex;

            return (
              <div
                key={i}
                className={`absolute left-1/2 top-1/2 text-[10px] font-semibold text-white text-center w-20 transition ${
                  isWinner ? "scale-110 text-yellow-200" : ""
                }`}
                style={{
                  transform: `
                    translateX(-50%)
                    rotate(${angle}deg)
                    translateY(-120px)
                    rotate(-${angle}deg)
                  `,
                }}
              >
                {text.length > 10
                  ? text.slice(0, 10) + "..."
                  : text}
              </div>
            );
          })}

          {/* 🎯 CENTER BUTTON */}
          <div
            onClick={spinWheel}
            className="absolute w-20 h-20 bg-white rounded-full border-4 border-orange-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition"
          >
            <span className="text-sm font-bold text-orange-500">
              {spinning ? "..." : `${multiplier}x Spin`}
            </span>
          </div>
        </div>
      </div>

      {/* 🏆 RESULT */}
      {winnerIndex !== null && !spinning && (
        <div className="text-lg font-bold text-white">
          🎉 Winner: {choices[winnerIndex]}
        </div>
      )}
    </div>
  );
}