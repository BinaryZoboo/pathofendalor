import { useEffect, useMemo, useRef, useState } from "react";

import heroClasses from "../assets/herobg/classes.webp";
import PageHero from "../components/PageHero";

type ClassEntry = {
  id: string;
  name: string;
  role: string;
  icon: string;
  difficulty: string;
  strengths: string[];
  weaknesses: string[];
  playstyle: string;
  synergies: string[];
};

type ClassesPayload = {
  updatedAt: string;
  isProvisional: boolean;
  notice: string;
  classes: ClassEntry[];
};

const fallbackClassesData: ClassesPayload = {
  updatedAt: "2026-04-01",
  isProvisional: false,
  notice: "Classes officielles RGP Series.",
  classes: [
    {
      id: "wizards",
      name: "Wizards",
      role: "DPS magique",
      icon: "auto_fix_high",
      difficulty: "Moyenne",
      strengths: ["Burst magique", "Bonne pression de zone"],
      weaknesses: ["Fragile", "Depend de la gestion mana"],
      playstyle:
        "Controle la distance et applique des pics de degats magiques.",
      synergies: ["Paladins", "Priests"],
    },
    {
      id: "paladins",
      name: "Paladins",
      role: "Tank / Support",
      icon: "shield",
      difficulty: "Moyenne",
      strengths: ["Grande survie", "Protection de groupe"],
      weaknesses: ["Mobilite limitee", "Degats moderes"],
      playstyle: "Tient la front line et securise les phases a risques.",
      synergies: ["Wizards", "Archers", "Priests"],
    },
    {
      id: "rogues",
      name: "Rogues",
      role: "Assassin",
      icon: "swords",
      difficulty: "Elevee",
      strengths: ["Tres fort mono-cible", "Grande mobilite"],
      weaknesses: ["Faible defense", "Punissable hors cooldown"],
      playstyle: "Cherche les ouvertures courtes pour executer les cibles cle.",
      synergies: ["Priests", "Paladins"],
    },
    {
      id: "warriors",
      name: "Warriors",
      role: "DPS melee",
      icon: "swords",
      difficulty: "Faible",
      strengths: ["Pression constante", "Gameplay direct"],
      weaknesses: ["Portee courte", "Dependant du placement"],
      playstyle: "Reste au contact pour maintenir un DPS soutenu.",
      synergies: ["Priests", "Paladins"],
    },
    {
      id: "priests",
      name: "Priests",
      role: "Support",
      icon: "healing",
      difficulty: "Moyenne",
      strengths: ["Sustain equipe", "Utilitaire raid"],
      weaknesses: ["Impact solo limite", "Vulnerable si focus"],
      playstyle: "Maintient le groupe stable et optimise la duree des combats.",
      synergies: ["Paladins", "Warriors", "Rogues"],
    },
    {
      id: "archers",
      name: "Archers",
      role: "DPS distance",
      icon: "my_location",
      difficulty: "Moyenne",
      strengths: ["Kite efficace", "Degats constants"],
      weaknesses: ["Fragile au melee", "Demande un bon positionnement"],
      playstyle: "Joue a distance pour eliminer les cibles vulnerables.",
      synergies: ["Paladins", "Priests"],
    },
  ],
};

function parseClassesPayload(payload: unknown): ClassesPayload {
  if (!payload || typeof payload !== "object") {
    return fallbackClassesData;
  }

  const source = payload as Partial<ClassesPayload>;

  if (!Array.isArray(source.classes)) {
    return fallbackClassesData;
  }

  const classes = source.classes.filter(
    (entry): entry is ClassEntry =>
      !!entry &&
      typeof entry.id === "string" &&
      typeof entry.name === "string" &&
      typeof entry.role === "string" &&
      typeof entry.icon === "string" &&
      typeof entry.difficulty === "string" &&
      Array.isArray(entry.strengths) &&
      Array.isArray(entry.weaknesses) &&
      typeof entry.playstyle === "string" &&
      Array.isArray(entry.synergies),
  );

  return {
    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : fallbackClassesData.updatedAt,
    isProvisional:
      typeof source.isProvisional === "boolean"
        ? source.isProvisional
        : fallbackClassesData.isProvisional,
    notice:
      typeof source.notice === "string"
        ? source.notice
        : fallbackClassesData.notice,
    classes: classes.length ? classes : fallbackClassesData.classes,
  };
}

function roleTone(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized.includes("tank")) {
    return "border-cyan-300/45 bg-cyan-500/10 text-cyan-100";
  }
  if (normalized.includes("support")) {
    return "border-emerald-300/45 bg-emerald-500/10 text-emerald-100";
  }
  if (normalized.includes("dps")) {
    return "border-amber-300/45 bg-amber-500/10 text-amber-100";
  }
  return "border-(--outline-variant)/75 bg-(--surface-container-high)/70 text-(--muted)";
}

function ClassCard({
  entry,
  className,
  onSelect,
  isActive,
}: {
  entry: ClassEntry;
  className?: string;
  onSelect?: () => void;
  isActive?: boolean;
}) {
  return (
    <article
      className={`game-panel premium-lift classes-deck-card rounded-2xl p-5 ${className ?? ""}`}
      onClick={onSelect}
      onPointerDown={(event) => {
        if (!isActive) {
          event.stopPropagation();
        }
      }}
      role="button"
      tabIndex={isActive ? -1 : 0}
      aria-label={`Afficher ${entry.name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-(--primary)">
              {entry.icon}
            </span>
            <h3 className="font-headline text-2xl font-bold">{entry.name}</h3>
          </div>
          <p className="mt-1 text-sm text-(--muted)">{entry.playstyle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 font-label text-[10px] tracking-[0.14em] ${roleTone(entry.role)}`}
          >
            {entry.role.toUpperCase()}
          </span>
          <span className="game-chip rounded-full px-2.5 py-1 font-label text-[10px] tracking-[0.14em] text-(--muted)">
            DIFF {entry.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="font-label text-[10px] tracking-[0.14em] text-emerald-200">
            POINTS FORTS
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-(--muted)">
            {entry.strengths.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-label text-[10px] tracking-[0.14em] text-rose-200">
            VIGILANCE
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-(--muted)">
            {entry.weaknesses.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-label text-[10px] tracking-[0.14em] text-(--muted)">
          SYNERGIES
        </span>
        {entry.synergies.map((synergy) => (
          <span
            key={synergy}
            className="rounded-full border border-(--outline-variant)/70 bg-(--surface-container-high)/75 px-2.5 py-1 font-label text-[10px] tracking-[0.12em] text-(--muted)"
          >
            {synergy.toUpperCase()}
          </span>
        ))}
      </div>
    </article>
  );
}

function ClassesPage() {
  const [classesData, setClassesData] =
    useState<ClassesPayload>(fallbackClassesData);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDraggingDeck, setIsDraggingDeck] = useState(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const momentumFrameRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const dragActivatedRef = useRef(false);

  const DRAG_START_THRESHOLD = 14;

  useEffect(() => {
    let active = true;

    const loadClasses = async () => {
      try {
        const response = await fetch("/data/classes.json", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as unknown;
        const parsed = parseClassesPayload(payload);

        if (!active) return;
        setClassesData(parsed);
        setClassesError(null);
      } catch {
        if (!active) return;
        setClassesData(fallbackClassesData);
        setClassesError("Classes chargees en mode local (fallback). ");
      }
    };

    loadClasses();

    return () => {
      active = false;
    };
  }, []);

  const filteredClasses = useMemo(
    () => classesData.classes,
    [classesData.classes],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [filteredClasses.length]);

  useEffect(() => {
    return () => {
      if (momentumFrameRef.current !== null) {
        window.cancelAnimationFrame(momentumFrameRef.current);
      }
    };
  }, []);

  const getWrappedIndex = (index: number) => {
    const length = filteredClasses.length;
    if (!length) return 0;
    return (index + length) % length;
  };

  const goToPrev = () => {
    setActiveIndex((current) => getWrappedIndex(current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => getWrappedIndex(current + 1));
  };

  const consumeDragOffset = () => {
    const stepSize = 70;

    while (dragOffsetRef.current >= stepSize) {
      goToPrev();
      dragOffsetRef.current -= stepSize;
    }

    while (dragOffsetRef.current <= -stepSize) {
      goToNext();
      dragOffsetRef.current += stepSize;
    }
  };

  const stopMomentum = () => {
    if (momentumFrameRef.current !== null) {
      window.cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  };

  const runMomentum = () => {
    const friction = 0.93;
    dragVelocityRef.current *= friction;

    if (Math.abs(dragVelocityRef.current) < 0.04) {
      momentumFrameRef.current = null;
      return;
    }

    dragOffsetRef.current += dragVelocityRef.current * 18;
    consumeDragOffset();
    momentumFrameRef.current = window.requestAnimationFrame(runMomentum);
  };

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (filteredClasses.length <= 1) return;

    stopMomentum();
    setIsDraggingDeck(false);
    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    dragOffsetRef.current = 0;
    dragMovedRef.current = false;
    dragActivatedRef.current = false;
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;

    const totalDrag = event.clientX - dragStartXRef.current;

    if (
      !dragActivatedRef.current &&
      Math.abs(totalDrag) >= DRAG_START_THRESHOLD
    ) {
      dragActivatedRef.current = true;
      dragMovedRef.current = true;
      setIsDraggingDeck(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      dragLastXRef.current = event.clientX;
      dragLastTimeRef.current = performance.now();
      return;
    }

    if (!dragActivatedRef.current) {
      return;
    }

    const now = performance.now();
    const deltaX = event.clientX - dragLastXRef.current;
    const dt = Math.max(1, now - dragLastTimeRef.current);

    dragOffsetRef.current += deltaX;
    dragVelocityRef.current = deltaX / dt;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = now;

    consumeDragOffset();
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;

    if (
      dragActivatedRef.current &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragPointerIdRef.current = null;
    setIsDraggingDeck(false);
    dragActivatedRef.current = false;

    const totalDrag = event.clientX - dragStartXRef.current;
    if (Math.abs(totalDrag) < DRAG_START_THRESHOLD) {
      dragMovedRef.current = false;
      return;
    }

    momentumFrameRef.current = window.requestAnimationFrame(runMomentum);
  };

  const getRelativeOffset = (targetIndex: number) => {
    const length = filteredClasses.length;
    if (!length) return 0;

    const direct = targetIndex - activeIndex;
    const plusLoop = direct + length;
    const minusLoop = direct - length;

    let best = direct;
    if (Math.abs(plusLoop) < Math.abs(best)) best = plusLoop;
    if (Math.abs(minusLoop) < Math.abs(best)) best = minusLoop;
    return best;
  };

  const getPositionClass = (offset: number) => {
    if (offset === 0) return "is-active";
    if (offset === -1) return "is-prev";
    if (offset === 1) return "is-next";
    if (offset === -2) return "is-prev-2";
    if (offset === 2) return "is-next-2";
    return "is-hidden";
  };

  return (
    <section className="space-y-6">
      <PageHero
        badge="CLASSES ET ROLES"
        title="Presentation des classes,"
        highlight="synergies incluses"
        description="Vue pratique des roles pour preparer une composition de groupe adaptee au contenu vise."
        imageSrc={heroClasses}
      />

      {classesData.isProvisional && (
        <div className="game-panel rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {classesData.notice}
        </div>
      )}

      {classesError && (
        <div className="game-panel rounded-2xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {classesError}
        </div>
      )}

      <section
        className={`classes-deck-shell ${isDraggingDeck ? "is-dragging" : ""}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToPrev();
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToNext();
          }
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="classes-deck-controls">
          <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
            GLISSE POUR FAIRE TOURNER LE DECK
          </p>
          <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
            {filteredClasses.length
              ? `${getWrappedIndex(activeIndex) + 1}/${filteredClasses.length}`
              : "0/0"}
          </p>
        </div>

        <div className="classes-deck-stage">
          {filteredClasses.map((entry, index) => {
            const offset = getRelativeOffset(index);
            const positionClass = getPositionClass(offset);
            return (
              <ClassCard
                key={entry.id}
                entry={entry}
                className={positionClass}
                isActive={offset === 0}
                onSelect={() => {
                  if (dragMovedRef.current) return;
                  if (offset !== 0) {
                    setActiveIndex(index);
                  }
                }}
              />
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <article className="game-panel rounded-2xl p-5 text-sm text-(--muted)">
            Aucune classe pour ce filtre.
          </article>
        )}
      </section>
    </section>
  );
}

export default ClassesPage;
