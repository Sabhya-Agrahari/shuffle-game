"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  reward: string;
  onWin: (res: string) => void;
};

export default function ScratchCard({ reward, onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🎨 Silver scratch layer (realistic look)
    const gradient = ctx.createLinearGradient(0, 0, 300, 150);
    gradient.addColorStop(0, "#c0c0c0");
    gradient.addColorStop(0.5, "#e5e5e5");
    gradient.addColorStop(1, "#a8a8a8");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ✨ overlay text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL 🎟️", canvas.width / 2, canvas.height / 2);
  }, []);

  const lastPos = useRef<{ x: number; y: number } | null>(null);

const scratch = (x: number, y: number) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.globalCompositeOperation = "destination-out";

  if (lastPos.current) {
    const { x: lx, y: ly } = lastPos.current;

    ctx.lineWidth = 25;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  lastPos.current = { x, y };

  checkScratchProgress();
};

  // 📊 check how much is scratched
  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    let cleared = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) cleared++;
    }

    const percent = cleared / (imageData.data.length / 4);

    // 🎉 auto reveal
    if (percent > 0.6 && !revealed) {
      setRevealed(true);

      setTimeout(() => {
        onWin(reward);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">

      <h2 className="text-xl font-bold text-white">
        🎟️ Scratch Card
      </h2>

      {/* 🎁 Reward layer */}
      <div className="relative w-72 h-40 rounded-xl overflow-hidden shadow-2xl bg-green-500 flex items-center justify-center">
        <span className="text-2xl font-bold text-white animate-pulse">
          🎉 {reward}
        </span>

        {/* 🧼 Scratch layer */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={288}
            height={160}
            className="absolute top-0 left-0 cursor-pointer"
            onMouseDown={() => (isDrawing.current = true)}
            onMouseUp={() => (isDrawing.current = false)}
            onMouseLeave={() => (isDrawing.current = false)}
            onMouseMove={(e) => {
              if (!isDrawing.current) return;

              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              scratch(x, y);
            }}
            onTouchStart={() => (isDrawing.current = true)}
            onTouchEnd={() => (isDrawing.current = false)}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();

              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;

              scratch(x, y);
            }}
          />
        )}
      </div>

      <p className="text-sm text-gray-300">
        Scratch like a real lottery card 🎟️
      </p>
    </div>
  );
}