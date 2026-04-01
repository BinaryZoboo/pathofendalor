import { type CSSProperties, useMemo } from "react";

import { type PageKey } from "../types/navigation";

type ParticleShape = "round" | "square" | "diamond" | "streak";

type ParticleTheme = {
  colors: string[];
  shapes: ParticleShape[];
};

type Particle = {
  x: number;
  duration: number;
  delay: number;
  size: number;
  drift: number;
  opacity: number;
  rotate: number;
  color: string;
  shape: ParticleShape;
};

const PARTICLE_COUNT = 20;

const PAGE_PARTICLE_THEME: Record<PageKey, ParticleTheme> = {
  dashboard: {
    colors: ["#7dd3fc", "#38bdf8", "#22d3ee", "#34d399"],
    shapes: ["round", "round", "square", "streak"],
  },
  craft: {
    colors: ["#f59e0b", "#fb7185", "#f97316", "#facc15"],
    shapes: ["square", "diamond", "square", "streak"],
  },
  bestiary: {
    colors: ["#f43f5e", "#ef4444", "#f97316", "#f59e0b"],
    shapes: ["diamond", "round", "streak", "diamond"],
  },
  auctionhouse: {
    colors: ["#22c55e", "#4ade80", "#10b981", "#06b6d4"],
    shapes: ["round", "square", "round", "streak"],
  },
  rules: {
    colors: ["#a78bfa", "#8b5cf6", "#60a5fa", "#2dd4bf"],
    shapes: ["diamond", "round", "square", "streak"],
  },
};

function seededRandom(seed: number) {
  return (((Math.sin(seed * 12.9898) * 43758.5453) % 1) + 1) % 1;
}

type HeaderRainParticlesProps = {
  page: PageKey;
};

function HeaderRainParticles({ page }: HeaderRainParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const theme = PAGE_PARTICLE_THEME[page];

    return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const seedBase = index + page.length * 19;
      const x = seededRandom(seedBase + 1) * 100;
      const duration = 5.4 + seededRandom(seedBase + 2) * 5.8;
      const size = 5 + seededRandom(seedBase + 3) * 8;
      const drift = -16 + seededRandom(seedBase + 4) * 32;
      const opacity = 0.26 + seededRandom(seedBase + 5) * 0.54;
      const delay = -seededRandom(seedBase + 6) * duration;
      const rotate = seededRandom(seedBase + 7) * 360;

      const color = theme.colors[index % theme.colors.length];
      const shape = theme.shapes[index % theme.shapes.length];

      return {
        x,
        duration,
        delay,
        size,
        drift,
        opacity,
        rotate,
        color,
        shape,
      };
    });
  }, [page]);

  return (
    <div className={`header-rain-particles header-rain-particles-${page}`}>
      {particles.map((particle, index) => (
        <span
          key={`${page}-${index}`}
          className={`header-rain-particle header-rain-particle-${particle.shape}`}
          style={
            {
              "--hp-x": `${particle.x}%`,
              "--hp-duration": `${particle.duration}s`,
              "--hp-delay": `${particle.delay}s`,
              "--hp-size": `${particle.size}px`,
              "--hp-drift": `${particle.drift}px`,
              "--hp-opacity": particle.opacity.toFixed(2),
              "--hp-rotate": `${particle.rotate.toFixed(2)}deg`,
              "--hp-color": particle.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default HeaderRainParticles;
