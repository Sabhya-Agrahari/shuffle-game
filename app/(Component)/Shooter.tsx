"use client";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: number;
  label: string;
  alive: boolean;
  revealed: boolean;
  x: number;
  y: number;
};

type Bullet = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

type Particle = {
  x: number;
  y: number;
  id: number;
};

type Props = {
  choices: string[];
  onWin: (res: string) => void;
};

const createItems = (choices: string[], canvasSize: number = 350): Item[] =>
  choices.map((c, i) => ({
    id: i,
    label: c,
    alive: true,
    revealed: false,
    x: 20 + Math.random() * (canvasSize - 80),
    y: 20 + Math.random() * (canvasSize - 80),
  }));

export default function PlayerShooter({ choices, onWin }: Props) {
  const [items, setItems] = useState<Item[]>(() => createItems(choices));
  const [bullet, setBullet] = useState<Bullet | null>(null);
  const [hitLabel, setHitLabel] = useState<string | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenshake, setScreenshake] = useState(0);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(350);
  const [isMobile, setIsMobile] = useState(false);
  const particleIdRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const playerPos = { x: canvasSize / 2, y: canvasSize - 20 };
  const hasWonRef = useRef(false);

  // Responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCanvasSize(280);
        setIsMobile(true);
      } else if (width < 768) {
        setCanvasSize(320);
        setIsMobile(false);
      } else {
        setCanvasSize(400);
        setIsMobile(false);
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Reset items when canvas size or choices change
  useEffect(() => {
    // Skip the initial mount to avoid double initialization
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setItems(createItems(choices, canvasSize));
    // Reset game state when canvas size changes
    setBullet(null);
    setIsShooting(false);
    hasWonRef.current = false;
    setHitLabel(null);
    setParticles([]);
  }, [canvasSize, choices]);

  const remainingTargets = items.filter((i) => i.alive).length;
  const hitCount = choices.length - remainingTargets;

  // Handle screenshake animation using requestAnimationFrame
  useEffect(() => {
    if (screenshake > 0) {
      let startTime: number | null = null;
      const duration = 200;
      const startShake = screenshake;

      const animateShake = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          const currentIntensity = startShake * (1 - progress);
          setShakeOffset({
            x: (Math.random() - 0.5) * currentIntensity,
            y: (Math.random() - 0.5) * currentIntensity,
          });
          frameRef.current = requestAnimationFrame(animateShake);
        } else {
          setShakeOffset({ x: 0, y: 0 });
          setScreenshake(0);
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(animateShake);
    }
    
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [screenshake]);

  const addParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < (isMobile ? 5 : 8); i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        id: particleIdRef.current++,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 300);
  };

  const shoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (bullet || isShooting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let targetX = e.clientX - rect.left;
    let targetY = e.clientY - rect.top;

    // Clamp target position within canvas bounds
    targetX = Math.max(0, Math.min(targetX, canvasSize));
    targetY = Math.max(0, Math.min(targetY, canvasSize));

    const dx = targetX - playerPos.x;
    const dy = targetY - playerPos.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);

    setScreenshake(6);

    setIsShooting(true);
    setBullet({
      x: playerPos.x,
      y: playerPos.y,
      dx: (dx / length) * 8,
      dy: (dy / length) * 8,
    });
  };

  useEffect(() => {
    if (!bullet) return;

    const interval = setInterval(() => {
      setBullet((prev) => {
        if (!prev) return null;

        const nextX = prev.x + prev.dx;
        const nextY = prev.y + prev.dy;

        let hit = false;

        setItems((prevItems) =>
          prevItems.map((item) => {
            if (!item.alive) return item;

            const dist = Math.hypot(item.x - nextX, item.y - nextY);

            if (dist < (isMobile ? 20 : 25) && !hit) {
              hit = true;
              setHitLabel(item.label);
              addParticles(item.x, item.y);
              
              setScreenshake(8);
              
              setTimeout(() => setHitLabel(null), 600);
              return {
                ...item,
                alive: false,
                revealed: true,
              };
            }
            return item;
          })
        );

        if (nextX < 0 || nextX > canvasSize || nextY < 0 || nextY > canvasSize) {
          setIsShooting(false);
          return null;
        }

        return {
          x: nextX,
          y: nextY,
          dx: prev.dx,
          dy: prev.dy,
        };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [bullet, canvasSize, isMobile]);

  const aliveItems = items.filter((i) => i.alive);

  useEffect(() => {
    if (aliveItems.length === 1 && !hasWonRef.current) {
      hasWonRef.current = true;
      setTimeout(() => onWin(aliveItems[0].label), 100);
    }
  }, [aliveItems, onWin]);

  const handleReset = () => {
    setItems(createItems(choices, canvasSize));
    setBullet(null);
    setHitLabel(null);
    setIsShooting(false);
    hasWonRef.current = false;
    setParticles([]);
    setScreenshake(0);
    setShakeOffset({ x: 0, y: 0 });
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 relative overflow-hidden">
      {/* Animated Background - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 bg-purple-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse top-0 -left-16 sm:-left-24 lg:-left-48"></div>
        <div className="absolute w-32 sm:w-48 md:w-64 lg:w-96 h-32 sm:h-48 md:h-64 lg:h-96 bg-blue-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse delay-1000 bottom-0 -right-16 sm:-right-24 lg:-right-48"></div>
        <div className="absolute w-24 sm:w-32 md:w-48 lg:w-64 h-24 sm:h-32 md:h-48 lg:h-64 bg-pink-500/20 rounded-full blur-xl sm:blur-2xl lg:blur-3xl animate-pulse delay-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div 
        ref={containerRef}
        className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-5 md:p-6 lg:p-8 bg-black/40 backdrop-blur-md sm:backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transition-all duration-200 w-full max-w-[95%] sm:max-w-[90%] md:max-w-full"
        style={{ transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` }}
      >
        {/* Header Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 border border-white/20 backdrop-blur-sm">
            <span className="text-blue-300 text-[10px] sm:text-xs uppercase tracking-wider">🎯 Targets Left</span>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{remainingTargets}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 border border-white/20 backdrop-blur-sm">
            <span className="text-green-300 text-[10px] sm:text-xs uppercase tracking-wider">💀 Eliminated</span>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{hitCount}</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 border border-white/20 backdrop-blur-sm">
            <span className="text-yellow-300 text-[10px] sm:text-xs uppercase tracking-wider">🎮 Status</span>
            <div className="text-xs sm:text-sm font-bold">
              {isShooting ? (
                <span className="text-red-400 animate-pulse">FIRING!</span>
              ) : (
                <span className="text-green-400">READY</span>
              )}
            </div>
          </div>
        </div>

        {/* Game Area - Responsive */}
        <div className="relative">
          {/* Outer Glow Rings */}
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur-md sm:blur-xl opacity-50 animate-pulse"></div>
          <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur-sm"></div>
          
          <div
            onClick={shoot}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden cursor-crosshair border-2 border-white/20 shadow-2xl transition-all duration-300 hover:shadow-purple-500/30"
            style={{ 
              width: canvasSize,
              height: canvasSize,
              background: "linear-gradient(135deg, rgb(17, 24, 39), rgb(0, 0, 0))"
            }}
          >
            {/* Dynamic Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-5">
              <defs>
                <pattern id="grid" width={isMobile ? "15" : "30"} height={isMobile ? "15" : "30"} patternUnits="userSpaceOnUse">
                  <path d={`M ${isMobile ? "15" : "30"} 0 L 0 0 0 ${isMobile ? "15" : "30"}`} fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Muzzle Flash */}
            {muzzleFlash && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 bg-yellow-400 rounded-full blur-md sm:blur-xl animate-pulse"></div>
            )}

            {/* Targets */}
            {items.map((item) =>
              item.alive ? (
                <div
                  key={item.id}
                  className={`absolute rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer group ${
                    item.revealed 
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 scale-110 ring-1 sm:ring-2 ring-white/50" 
                      : "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 hover:border-purple-500 hover:scale-105"
                  }`}
                  style={{
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 40 : 56,
                    transform: `translate(${item.x}px, ${item.y}px)`,
                    fontSize: isMobile ? "10px" : "14px",
                  }}
                >
                  {item.revealed ? (
                    <span className="text-white font-bold">{item.label}</span>
                  ) : (
                    <span className="text-gray-500 text-base sm:text-xl group-hover:animate-pulse">❓</span>
                  )}
                  {!item.revealed && (
                    <div className="absolute inset-0 rounded-full border border-purple-500/0 group-hover:border-purple-500/50 transition-all duration-300"></div>
                  )}
                </div>
              ) : (
                <div
                  key={item.id}
                  className="absolute bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-xl sm:text-2xl animate-bounce"
                  style={{
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 40 : 56,
                    transform: `translate(${item.x}px, ${item.y}px)`,
                  }}
                >
                  💥
                </div>
              )
            )}

            {/* Particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  transform: `translate(${particle.x}px, ${particle.y}px)`,
                }}
              />
            ))}

            {/* Player */}
            <div className="absolute group" style={{ bottom: 8, left: "50%", transform: "translateX(-50%)" }}>
              <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-8 sm:h-12 bg-yellow-500/20 rounded-full blur-lg sm:blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-2xl transform transition-transform group-hover:scale-110">
                🎯
              </div>
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 text-[8px] sm:text-xs text-yellow-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                SHOOTER
              </div>
            </div>

            {/* Bullet */}
            {bullet && (
              <>
                <div
                  className="absolute w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse"
                  style={{
                    transform: `translate(${bullet.x}px, ${bullet.y}px)`,
                  }}
                />
                <div
                  className="absolute w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400/30 rounded-full blur-sm"
                  style={{
                    transform: `translate(${bullet.x - 2}px, ${bullet.y - 2}px)`,
                  }}
                />
              </>
            )}

            {/* Hit Effect */}
            {hitLabel && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xs sm:text-base md:text-xl px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full shadow-2xl border border-yellow-400 whitespace-nowrap backdrop-blur-sm">
                  💥 {hitLabel} 💥
                </div>
              </div>
            )}

            {/* HUD Overlay */}
            {!bullet && remainingTargets > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[8px] sm:text-xs px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm border border-white/20 animate-pulse whitespace-nowrap">
                🔫 CLICK TO FIRE
              </div>
            )}
          </div>
        </div>

        {/* Winner Celebration - Responsive */}
        {aliveItems.length === 1 && (
          <div className="relative animate-in slide-in-from-bottom-5 duration-500 w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl blur-lg sm:blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-6 shadow-2xl">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 animate-bounce">🏆</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">VICTORY!</div>
                <div className="text-base sm:text-lg md:text-xl text-white/90">Winner: {aliveItems[0].label}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2">Perfect Shot! 🎯</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Responsive */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2">
          {(aliveItems.length === 1 || remainingTargets === 0) && (
            <button
              onClick={handleReset}
              className="px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <span>🔄</span>
              <span>PLAY AGAIN</span>
            </button>
          )}
        </div>

        {/* Game Tips - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-[8px] sm:text-xs text-gray-400 mt-2 pt-2 sm:pt-4 border-t border-white/10 w-full">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-base sm:text-xl">🎯</span>
            <span>Click anywhere to aim & shoot</span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-base sm:text-xl">💨</span>
            <span>One shot, one kill</span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-base sm:text-xl">✨</span>
            <span>Find the last target to win</span>
          </div>
        </div>
      </div>
    </div>
  );
}