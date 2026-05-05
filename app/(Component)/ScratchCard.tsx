"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  reward: string;
  onWin: (res: string) => void;
};

export default function ScratchCard({ reward, onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 288, height: 160 });
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      // Maintain 288:160 ratio (1.8:1)
      const width = Math.min(containerWidth, 500);
      const height = width * (160 / 288);
      
      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Initialize canvas with scratch layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";

    // 🎨 Silver scratch layer (realistic look)
    const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
    gradient.addColorStop(0, "#c0c0c0");
    gradient.addColorStop(0.3, "#e8e8e8");
    gradient.addColorStop(0.6, "#d0d0d0");
    gradient.addColorStop(1, "#a0a0a0");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Add metallic dots pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvasSize.width,
        Math.random() * canvasSize.height,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // ✨ overlay text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(14, canvasSize.width / 16)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL 🎟️", canvasSize.width / 2, canvasSize.height / 2);
    
    // Reset composite operation for scratching
    ctx.globalCompositeOperation = "source-over";
  }, [canvasSize]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";

    if (lastPos.current) {
      const { x: lx, y: ly } = lastPos.current;
      
      // Adjust line width based on canvas size
      const lineWidth = Math.max(20, Math.min(40, canvasSize.width / 10));
      ctx.lineWidth = lineWidth;
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

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    const totalPixels = imageData.data.length / 4;

    // Sample pixels for better performance
    const sampleStep = Math.max(1, Math.floor(totalPixels / 5000));
    
    for (let i = 0; i < imageData.data.length; i += 4 * sampleStep) {
      if (imageData.data[i + 3] === 0) cleared++;
    }

    const percent = cleared / (totalPixels / sampleStep);

    // 🎉 auto reveal
    if (percent > 0.45 && !revealed) {
      setRevealed(true);
      setTimeout(() => {
        onWin(reward);
      }, 500);
    }
  };

  const handleStart = (clientX: number, clientY: number, rect: DOMRect) => {
    isDrawing.current = true;
    lastPos.current = null;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    scratch(x, y);
  };

  const handleMove = (clientX: number, clientY: number, rect: DOMRect) => {
    if (!isDrawing.current) return;
    
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    
    // Clamp coordinates to canvas bounds
    x = Math.max(0, Math.min(canvasSize.width, x));
    y = Math.max(0, Math.min(canvasSize.height, y));
    
    scratch(x, y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const getCanvasStyle = () => ({
    width: canvasSize.width,
    height: canvasSize.height,
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
        🎟️ Scratch Card
      </h2>

      {/* 🎁 Reward layer */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center min-h-[160px]"
        style={{ aspectRatio: "288/160" }}
      >
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-pulse text-center px-2">
          🎉 {reward}
        </span>

        {/* 🧼 Scratch layer */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute top-0 left-0 cursor-pointer w-full h-full"
            style={getCanvasStyle()}
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              handleStart(e.clientX, e.clientY, rect);
            }}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onMouseMove={(e) => {
              if (!isDrawing.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              handleMove(e.clientX, e.clientY, rect);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              handleStart(touch.clientX, touch.clientY, rect);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleEnd();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              handleMove(touch.clientX, touch.clientY, rect);
            }}
          />
        )}
      </div>

      <p className="text-xs sm:text-sm text-gray-300 text-center">
        Scratch like a real lottery card 🎟️
      </p>
    </div>
  );
}