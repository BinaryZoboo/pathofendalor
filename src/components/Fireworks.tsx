import { useEffect, useRef } from "react";

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
      alpha: number;
    };

    const particles: Particle[] = [];
    const colors = [
      "#d946ef", // fuchsia-500
      "#3b82f6", // blue-500
      "#10b981", // emerald-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
    ];

    const createFirework = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Réduction du nombre et utilisation de lignes pour éviter trop de calculs complexes
      const numParticles = 40 + Math.random() * 30;
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 3;
        particles.push({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          color,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          alpha: 1,
        });
      }
    };

    let time = 0;
    let animationFrameId = 0;

    // Boucle optimisée
    const loop = () => {
      // Effacement classique très rapide (au lieu de composite operation couteuses)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      time++;
      // Feux d'artifices plus fréquents
      if (time % (Math.floor(Math.random() * 45) + 20) === 0) {
        createFirework(
          canvas.width * 0.1 + Math.random() * (canvas.width * 0.8),
          Math.random() * canvas.height * 0.6,
        );
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (
          p.alpha <= 0 ||
          p.x < 0 ||
          p.x > canvas.width ||
          p.y > canvas.height
        ) {
          particles.splice(i, 1);
          continue;
        }

        // Dessin optimisé via stroke de lignes (pas d'arc = bien plus perf)
        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
