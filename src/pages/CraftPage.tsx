import { useEffect, useState } from "react";

import heroCraft from "../assets/herobg/craft.webp";
import PageHero from "../components/PageHero";

type CraftWorkflowStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type PriorityCraft = {
  id: string;
  name: string;
  station: string;
  tier: string;
  icon: string;
  benefit: string;
  ingredients: string[];
  notes: string;
};

type StationTip = {
  station: string;
  icon: string;
  tip: string;
};

type CraftPayload = {
  updatedAt: string;
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
  };
  workflow: CraftWorkflowStep[];
  priorityCrafts: PriorityCraft[];
  stationTips: StationTip[];
};

const fallbackCraftData: CraftPayload = {
  updatedAt: "2026-04-01",
  hero: {
    eyebrow: "ATELIERS ET ARTISANAT",
    title: "Craft prioritaire",
    highlight: " pour progression rapide",
  },
  workflow: [
    {
      id: "farm",
      title: "1. Farm cible",
      description:
        "Concentre la recolte sur les composants qui servent plusieurs recettes de progression.",
      icon: "landscape",
    },
    {
      id: "transform",
      title: "2. Stations",
      description:
        "Enchaine forge, alchimie et enchantement pour convertir tes ressources sans perte.",
      icon: "build",
    },
    {
      id: "optimize",
      title: "3. Optimisation",
      description:
        "Priorise les crafts qui augmentent directement ton DPS, ta survie ou ton utility raid.",
      icon: "bolt",
    },
  ],
  priorityCrafts: [
    {
      id: "blade-endalium",
      name: "Lame d'Endalium",
      station: "Forge",
      tier: "S",
      icon: "swords",
      benefit: "+DPS mono-cible, excellent early raid",
      ingredients: [
        "8x Lingot d'endalium",
        "2x Noyau infernal",
        "1x Catalyseur ancien",
      ],
      notes: "A prioriser avant les premiers boss eleves.",
    },
    {
      id: "awakening-potion",
      name: "Potion d'eveil",
      station: "Alchimie",
      tier: "A",
      icon: "science",
      benefit: "Buff burst sur fenetre courte",
      ingredients: [
        "4x Herbier lunaire",
        "1x Essence necrotique",
        "1x Fiole cristalline",
      ],
      notes: "Tres rentable pour progression boss et speed run donjons.",
    },
  ],
  stationTips: [
    {
      station: "Forge",
      icon: "hardware",
      tip: "Transforme en lot pour limiter les pertes de composants rares.",
    },
    {
      station: "Alchimie",
      icon: "biotech",
      tip: "Reserve les catalysts premium aux combats de progression.",
    },
    {
      station: "Enchantement",
      icon: "flare",
      tip: "Verrouille un objectif de stat principal avant les rerolls.",
    },
  ],
};

function parseCraftPayload(payload: unknown): CraftPayload {
  if (!payload || typeof payload !== "object") {
    return fallbackCraftData;
  }

  const source = payload as Partial<CraftPayload>;

  if (
    !source.hero ||
    !Array.isArray(source.workflow) ||
    !Array.isArray(source.priorityCrafts) ||
    !Array.isArray(source.stationTips)
  ) {
    return fallbackCraftData;
  }

  return {
    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : fallbackCraftData.updatedAt,
    hero: {
      eyebrow:
        typeof source.hero.eyebrow === "string"
          ? source.hero.eyebrow
          : fallbackCraftData.hero.eyebrow,
      title:
        typeof source.hero.title === "string"
          ? source.hero.title
          : fallbackCraftData.hero.title,
      highlight:
        typeof source.hero.highlight === "string"
          ? source.hero.highlight
          : fallbackCraftData.hero.highlight,
    },
    workflow: source.workflow.filter(
      (step): step is CraftWorkflowStep =>
        !!step &&
        typeof step.id === "string" &&
        typeof step.title === "string" &&
        typeof step.description === "string" &&
        typeof step.icon === "string",
    ),
    priorityCrafts: source.priorityCrafts.filter(
      (craft): craft is PriorityCraft =>
        !!craft &&
        typeof craft.id === "string" &&
        typeof craft.name === "string" &&
        typeof craft.station === "string" &&
        typeof craft.tier === "string" &&
        typeof craft.icon === "string" &&
        typeof craft.benefit === "string" &&
        Array.isArray(craft.ingredients) &&
        typeof craft.notes === "string",
    ),
    stationTips: source.stationTips.filter(
      (tip): tip is StationTip =>
        !!tip &&
        typeof tip.station === "string" &&
        typeof tip.icon === "string" &&
        typeof tip.tip === "string",
    ),
  };
}

function getTierClass(tier: string): string {
  if (tier === "S") {
    return "border-amber-300/55 bg-amber-500/14 text-amber-200";
  }
  if (tier === "A") {
    return "border-cyan-300/55 bg-cyan-500/14 text-cyan-100";
  }
  return "border-(--outline-variant)/70 bg-(--surface-container-high)/75 text-(--muted)";
}

function CraftPage() {
  const [craftData, setCraftData] = useState<CraftPayload>(fallbackCraftData);
  const [loadingCraft, setLoadingCraft] = useState(true);
  const [craftError, setCraftError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCraft = async () => {
      setLoadingCraft(true);

      try {
        const response = await fetch("/data/craft.json", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as unknown;
        const parsed = parseCraftPayload(payload);

        if (!active) return;
        setCraftData(parsed);
        setCraftError(null);
      } catch {
        if (!active) return;
        setCraftData(fallbackCraftData);
        setCraftError("Craft charge en mode local (fallback). ");
      } finally {
        if (active) {
          setLoadingCraft(false);
        }
      }
    };

    loadCraft();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <PageHero
        badge={craftData.hero.eyebrow}
        title={craftData.hero.title}
        highlight={craftData.hero.highlight}
        description="Focus sur les crafts a fort impact pour gagner du temps de progression et optimiser les ressources rares."
        imageSrc={heroCraft}
      />

      {craftError && (
        <div className="game-panel rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {craftError}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {craftData.workflow.map((step) => (
          <article
            key={step.id}
            className="game-panel premium-lift rounded-2xl p-5"
          >
            <span className="material-symbols-outlined text-(--primary)">
              {step.icon}
            </span>
            <h3 className="mt-2 font-headline text-2xl font-bold">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-(--muted)">{step.description}</p>
          </article>
        ))}
      </section>
      <div className="hud-divider" />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold md:text-3xl">
            Crafts importants
          </h3>
          {loadingCraft && (
            <span className="game-chip rounded-full px-2.5 py-1 font-label text-[10px] tracking-[0.14em] text-(--muted)">
              Chargement...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {craftData.priorityCrafts.map((craft) => (
            <article
              key={craft.id}
              className="game-panel premium-lift rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-(--primary)">
                      {craft.icon}
                    </span>
                    <p className="font-label text-[10px] tracking-[0.14em] text-(--primary)">
                      {craft.station.toUpperCase()}
                    </p>
                  </div>
                  <h4 className="mt-1 font-headline text-xl font-bold">
                    {craft.name}
                  </h4>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 font-label text-[10px] tracking-[0.14em] ${getTierClass(craft.tier)}`}
                >
                  TIER {craft.tier}
                </span>
              </div>

              <p className="mt-3 text-sm text-(--on-background)">
                {craft.benefit}
              </p>

              <ul className="mt-3 space-y-1.5 text-sm text-(--muted)">
                {craft.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-(--muted)">{craft.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {craftData.stationTips.map((station) => (
          <article
            key={station.station}
            className="game-panel premium-lift rounded-2xl p-5"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-(--primary)">
                {station.icon}
              </span>
              <h4 className="font-headline text-xl font-bold">
                {station.station}
              </h4>
            </div>
            <p className="mt-2 text-sm text-(--muted)">{station.tip}</p>
          </article>
        ))}
      </section>
    </section>
  );
}

export default CraftPage;
