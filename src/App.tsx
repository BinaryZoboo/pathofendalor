import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import MobileBottomNav from "./components/MobileBottomNav";
import SidePanel from "./components/SidePanel";
import { fetchServerStatus } from "./lib/serverStatus";
import BestiaryLootdropPage from "./pages/BestiaryLootdropPage";
import CraftPage from "./pages/CraftPage";
import DashboardPage from "./pages/DashboardPage";
import RulesPage from "./pages/RulesPage";
import { type PageKey } from "./types/navigation";

type ThemeKey = "dark" | "light";

function getPageFromHash(): PageKey {
  const cleanHash = window.location.hash.replace("#", "");

  if (
    cleanHash === "dashboard" ||
    cleanHash === "craft" ||
    cleanHash === "bestiary" ||
    cleanHash === "rules"
  ) {
    return cleanHash;
  }

  if (cleanHash === "home") return "dashboard";
  if (cleanHash === "wiki") return "bestiary";
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
  const [showServerIp, setShowServerIp] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

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
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
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

  const pageTitle = useMemo(() => {
    if (page === "dashboard") return "Dashboard";
    if (page === "craft") return "Craft";
    if (page === "bestiary") return "Bestiaire & Lootdrop";
    return "Règlement";
  }, [page]);

  const goToPage = (nextPage: PageKey) => {
    window.location.hash = nextPage;
  };

  const handleServerIpClick = async () => {
    const serverIp = "play.pathofendalor.net";
    setShowServerIp(true);

    try {
      await navigator.clipboard.writeText(serverIp);
    } catch {
      // Clipboard errors are non-blocking for this interaction.
    }

    setCopyFeedback(true);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(false);
    }, 1500);
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
        <header className="rounded-3xl glass-panel mb-8 flex flex-col gap-4 border border-(--outline-variant)/40 px-6 py-5 md:flex-row md:items-stretch md:justify-between">
          <div>
            <p className="font-label text-[10px] tracking-[0.26em] text-(--muted)">
              PATH OF ENDALOR // TRANSMISSION EN DIRECT
            </p>
            <h1 className="mt-2 font-headline text-3xl font-bold tracking-tight md:text-5xl">
              {pageTitle}
            </h1>
          </div>
          <div className="flex flex-col items-end md:self-stretch md:justify-between">
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleServerIpClick}
                className="rounded-full border border-(--primary)/35 bg-(--primary)/12 px-3 py-1 font-label text-[10px] tracking-[0.16em] text-(--primary) transition hover:bg-(--primary)/20"
                title="Cliquer pour copier l'IP"
              >
                {showServerIp
                  ? "srv1319801.hstgr.cloud:25565"
                  : "IP du serveur"}
              </button>
              {copyFeedback && (
                <span className="font-label text-[10px] tracking-[0.12em] text-(--muted)">
                  IP copiee dans le presse-papiers
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-(--surface-container-high) px-3 py-1 font-label text-[10px] tracking-[0.15em] text-(--muted)">
                version 1.21.1
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-label text-[10px] tracking-[0.15em] ${
                  serverOnline
                    ? "border-green-600/30 bg-green-600/10 text-green-600"
                    : "border-red-600/30 bg-red-600/10 text-red-600"
                }`}
              >
                {serverOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </header>

        {page === "dashboard" && <DashboardPage onNavigate={goToPage} />}
        {page === "craft" && <CraftPage />}
        {page === "bestiary" && <BestiaryLootdropPage />}
        {page === "rules" && <RulesPage />}
      </main>

      <MobileBottomNav activePage={page} onNavigate={goToPage} />
    </div>
  );
}

export default App;
