import { type CSSProperties, useEffect, useRef, useState } from "react";

import HeaderRainParticles from "./components/HeaderRainParticles";
import MobileBottomNav from "./components/MobileBottomNav";
import SidePanel from "./components/SidePanel";
import { fetchServerStatus } from "./lib/serverStatus";
import {
  AuctionHousePage,
  BestiaryLootdropPage,
  ClassesPage,
  CraftPage,
  DashboardPage,
  RulesPage,
} from "./pages";
import { type PageKey } from "./types/navigation";

type ThemeKey = "dark" | "light";
type PageContext = { subtitle: string; tag: string };

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: "Dashboard",
  craft: "Wiki commandes",
  classes: "Classes",
  bestiary: "Boss & Loots",
  auctionhouse: "Hotel des ventes",
  rules: "Reglement",
};

const PAGE_CONTEXT: Record<PageKey, PageContext> = {
  dashboard: {
    subtitle: "Vue synthese du serveur et des activites en cours.",
    tag: "VUE GLOBALE",
  },
  craft: {
    subtitle:
      "Consulte toutes les commandes utiles aux joueurs avec recherche rapide.",
    tag: "WIKI JOUEURS",
  },
  classes: {
    subtitle: "Compare les roles et synergies pour composer ton equipe.",
    tag: "CLASSES",
  },
  bestiary: {
    subtitle: "Consulte les menaces et les loots avant de lancer un raid.",
    tag: "PREPARATION RAID",
  },
  auctionhouse: {
    subtitle: "Observe les tendances du marche et les meilleures opportunites.",
    tag: "ECONOMIE LIVE",
  },
  rules: {
    subtitle: "Valide les regles et debloque l'onboarding client.",
    tag: "CONFORMITE",
  },
};

function getPageFromHash(): PageKey {
  const cleanHash = window.location.hash.replace("#", "");

  if (
    cleanHash === "dashboard" ||
    cleanHash === "craft" ||
    cleanHash === "classes" ||
    cleanHash === "bestiary" ||
    cleanHash === "auctionhouse" ||
    cleanHash === "rules"
  ) {
    return cleanHash;
  }

  if (cleanHash === "home") return "dashboard";
  if (cleanHash === "commands" || cleanHash === "commandes") return "craft";
  if (cleanHash === "class") return "classes";
  if (cleanHash === "wiki") return "bestiary";
  if (cleanHash === "hotel-des-ventes" || cleanHash === "cityhall") {
    return "auctionhouse";
  }
  if (cleanHash === "reglement") return "rules";

  return "dashboard";
}

function getInitialTheme(): ThemeKey {
  const saved = window.localStorage.getItem("oasis-theme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [page, setPage] = useState<PageKey>(() => getPageFromHash());
  const [theme, setTheme] = useState<ThemeKey>(() => getInitialTheme());
  const [mousePos, setMousePos] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }));
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("oasis-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setMousePos({ x: event.clientX, y: event.clientY });
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timerId: number | null = null;
    let active = true;

    const refreshServerStatus = async () => {
      try {
        const status = await fetchServerStatus();
        if (!active) return;
        setServerOnline(status.online);
      } catch {
        if (!active) return;
        setServerOnline(false);
      } finally {
        timerId = window.setTimeout(refreshServerStatus, 15000);
      }
    };

    refreshServerStatus();

    return () => {
      active = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const pageTitle = PAGE_TITLES[page];
  const pageContext = PAGE_CONTEXT[page];

  const goToPage = (nextPage: PageKey) => {
    window.location.hash = nextPage;
  };

  return (
    <div
      className="relative h-full overflow-hidden bg-(--background) text-(--on-background)"
      style={
        {
          "--mx": `${mousePos.x}px`,
          "--my": `${mousePos.y}px`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none fixed inset-0 opacity-35 hud-grid" />
      <div className="pointer-events-none fixed inset-0 grid-corner-glow" />
      <div className="pointer-events-none fixed -top-40 -right-30 h-120 w-120 rounded-full bg-(--primary)/16 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-45 -left-25 h-105 w-105 rounded-full bg-(--secondary)/20 blur-3xl" />

      <SidePanel
        activePage={page}
        onNavigate={goToPage}
        theme={theme}
        onToggleTheme={() =>
          setTheme((cur) => (cur === "dark" ? "light" : "dark"))
        }
      />

      <main className="relative z-10 h-full overflow-y-auto px-4 pb-24 pt-6 md:px-8 md:pb-12 lg:ml-72 lg:px-10 lg:pt-8">
        <section className="fade-in-up mb-8">
          <header className="premium-surface shimmer-border relative overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="pointer-events-none absolute -right-18 -top-16 h-52 w-52 rounded-full bg-(--primary)/14 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-(--secondary)/12 blur-3xl" />
            <HeaderRainParticles page={page} />

            <span
              className={`server-status-dot absolute right-4 top-4 z-20 ${
                serverOnline
                  ? "server-status-dot-online"
                  : "server-status-dot-offline"
              }`}
              title={serverOnline ? "Serveur en ligne" : "Serveur hors ligne"}
              aria-label={
                serverOnline ? "Serveur en ligne" : "Serveur hors ligne"
              }
            />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-label text-[10px] tracking-[0.22em] text-(--muted)">
                  PATH OF ENDALOR
                </p>
                <span className="game-chip rounded-full px-2.5 py-1 font-label text-[10px] tracking-[0.14em] text-(--muted)">
                  {pageContext.tag}
                </span>
              </div>

              <h1 className="mt-2 font-headline text-3xl font-bold tracking-tight md:text-5xl">
                {pageTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-(--muted)">
                {pageContext.subtitle}
              </p>
            </div>
          </header>
        </section>

        {page === "dashboard" && <DashboardPage onNavigate={goToPage} />}
        {page === "craft" && <CraftPage />}
        {page === "classes" && <ClassesPage />}
        {page === "bestiary" && <BestiaryLootdropPage />}
        {page === "auctionhouse" && <AuctionHousePage />}
        {page === "rules" && <RulesPage />}
      </main>

      <MobileBottomNav activePage={page} onNavigate={goToPage} />
    </div>
  );
}

export default App;
