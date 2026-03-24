import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PageKey = "home" | "wiki" | "rules";
type ThemeKey = "dark" | "light";

function getPageFromHash(): PageKey {
  const cleanHash = window.location.hash.replace("#", "");
  if (cleanHash === "home" || cleanHash === "wiki" || cleanHash === "rules") {
    return cleanHash;
  }
  return "home";
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

function getMsUntilNextMonth(now: Date): number {
  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, nextMonthStart.getTime() - now.getTime());
}

function formatMonthlyCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dayPart = String(days).padStart(2, "0");
  const hourPart = String(hours).padStart(2, "0");
  const minutePart = String(minutes).padStart(2, "0");
  const secondPart = String(seconds).padStart(2, "0");

  return `${dayPart}:${hourPart}:${minutePart}:${secondPart}`;
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

  const pageTitle = useMemo(() => {
    if (page === "home") return "L'Ender's Cataclysm";
    if (page === "wiki") return "Bestiaire";
    return "Directives";
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
      // Ignore clipboard failures silently to keep interaction smooth.
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

      <main className="relative z-10 h-full overflow-y-auto px-4 pb-12 pt-6 md:px-8 lg:ml-72 lg:px-10 lg:pt-8">
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
                {showServerIp ? "play.pathofendalor.net" : "IP du serveur"}
              </button>
              {copyFeedback && (
                <span className="font-label text-[10px] tracking-[0.12em] text-(--muted)">
                  IP copiee dans le presse-papiers
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-(--surface-container-high) px-3 py-1 font-label text-[10px] tracking-[0.15em] text-(--muted)">
                version 2.1
              </span>
              <span className="rounded-full border border-(--primary)/30 bg-(--primary)/10 px-3 py-1 font-label text-[10px] tracking-[0.15em] text-(--primary)">
                en ligne
              </span>
            </div>
          </div>
        </header>

        {page === "home" && <HomePage onNavigate={goToPage} />}
        {page === "wiki" && <WikiPage />}
        {page === "rules" && <RulesPage />}
      </main>
    </div>
  );
}

function SidePanel({
  activePage,
  onNavigate,
  theme,
  onToggleTheme,
}: {
  activePage: PageKey;
  onNavigate: (nextPage: PageKey) => void;
  theme: ThemeKey;
  onToggleTheme: () => void;
}) {
  const [wipeCountdown, setWipeCountdown] = useState(() => {
    return formatMonthlyCountdown(getMsUntilNextMonth(new Date()));
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setWipeCountdown(formatMonthlyCountdown(getMsUntilNextMonth(new Date())));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const items: Array<{ key: PageKey; label: string; icon: string }> = [
    { key: "home", label: "Accueil", icon: "home" },
    { key: "wiki", label: "Wiki", icon: "menu_book" },
    { key: "rules", label: "Regles", icon: "gavel" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 overflow-hidden lg:block">
      <div className="glass-panel flex h-full flex-col overflow-hidden border-r border-(--outline-variant)/50 p-4">
        <div className="mb-4 rounded-xl border border-(--outline-variant)/40 bg-(--surface-container-low) p-4">
          <div>
            <p className="font-headline text-2xl font-bold tracking-tight">
              Path Of <span className="text-(--primary)">Endalor</span>
            </p>
            <p className="mt-1 text-sm text-(--muted)">
              Cycle 30 - Menace en escalation
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const isActive = item.key === activePage;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-(--primary) text-(--on-primary)"
                    : "bg-(--surface-container-low) text-(--muted) hover:text-(--on-background)"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label text-[11px] tracking-[0.13em]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center justify-between rounded-xl bg-linear-to-r from-(--primary)/18 to-(--secondary)/18 p-4">
          <div>
            <p className="font-label text-[10px] tracking-[0.14em] text-(--muted)">
              Prochaine reinitialisation
            </p>
            <p className="mt-1 font-headline text-2xl font-bold">
              {wipeCountdown}
            </p>
            <p className="mt-1 font-label text-[10px] tracking-[0.12em] text-(--muted)">
              format: JJ:HH:MM:SS
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full p-0 text-(--muted) transition hover:text-(--primary)"
              aria-label="Changer le theme"
              title={
                theme === "dark" ? "Activer mode clair" : "Activer mode sombre"
              }
            >
              <span className="material-symbols-outlined block leading-none text-[20px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomePage({ onNavigate }: { onNavigate: (nextPage: PageKey) => void }) {
  return (
    <section className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-(--outline-variant)/50 p-6 md:p-10">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyDfSOO526036zRIGI7vyNLKLDM6cC2Qbpd5_XjXQ-ielHFjoV40pfReigMYoMUxDhNpsP_8XIIhdbiBp1Sk_AHDGdgfddbrtS47zWu4WDXwKvzCknDlL4-rHFP73PLI8XLHT1Ywlk0FOwzA7FYsnr-JxfLZf2fIioGsRQy7KdGwZUrsMQbeZyXzNCNm20NE9CIeaTJWBot6k7XLsgY0CPULpn4EbtI_JYHoGuOng1q0vgr6UWySs_K_KaoQkeIb3S1e89Pge0Jl0"
          alt="Path Of Endalor"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-r from-(--background) via-(--background)/78 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <p className="font-label text-[10px] tracking-[0.25em] text-(--muted)">
            NOUVELLE SAISON EN LIGNE
          </p>
          <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-6xl">
            Un serveur RPG moderne
            <span className="hero-gradient-text block">
              concu pour la competition.
            </span>
          </h2>
          <p className="mt-4 max-w-2xl text-(--muted)">
            Nouveau hub visuel, meilleure lisibilite et navigation rapide. Le
            style est plus premium, plus propre, et adapte a desktop/mobile.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-(--primary) px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-primary) shadow-[0_0_20px_var(--ring-glow)] transition hover:-translate-y-px">
              REJOINDRE
            </button>
            <button
              onClick={() => onNavigate("wiki")}
              className="rounded-full border border-(--outline-variant) bg-(--surface-container-low) px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:border-(--primary)/40"
            >
              OUVRIR LE WIKI
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Joueurs en ligne" value="0" icon="groups" />
        <MetricCard label="Ping moyen" value="23 ms" icon="network_ping" />
        <MetricCard label="Quetes quotidiennes" value="8" icon="task_alt" />
        <MetricCard
          label="Boss actifs"
          value="12"
          icon="local_fire_department"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="glass-panel rounded-2xl border border-(--outline-variant)/45 p-6 xl:col-span-8">
          <h3 className="font-headline text-2xl font-bold">
            Fonctionnalites principales
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FeatureItem
              title="Difficulte dynamique"
              text="Le monde s'adapte en temps reel a la progression des factions."
            />
            <FeatureItem
              title="Economie saisonniere"
              text="Wipes reguliers avec meta marche renouvelee a chaque cycle."
            />
            <FeatureItem
              title="Profondeur des classes"
              text="Archetypes distincts, builds hybrides et loops de progression clairs."
            />
            <FeatureItem
              title="Equilibre PvE & PvP"
              text="Systeme de balancing continu pour garder un gameplay lisible."
            />
          </div>
        </article>

        <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 xl:col-span-4">
          <h3 className="font-headline text-xl font-bold">Etat du cycle</h3>
          <p className="mt-1 text-sm text-(--muted)">
            Reinitialisation totale dans 12 h
          </p>
          <div className="mt-5 space-y-3">
            <Progress label="Saturation economique" value={72} />
            <Progress label="Progression des boss" value={59} />
            <Progress label="Pression des factions" value={81} />
          </div>
        </article>
      </section>
    </section>
  );
}

function WikiPage() {
  return (
    <section className="space-y-6">
      <article className="glass-panel relative overflow-hidden rounded-3xl border border-(--outline-variant)/50 p-6 md:p-8">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC91j3VUUumDATiru1CMI_3JioVxSbM2Brp-2uLgkvo88HA7gpSRbxF04vdLXFPKv5V8bbWIyWGmDstySSNMX46lrfPsmh1ZzjgYCZTOU2B9sniVC5mWW0lAShmSomAvZyC4TYyHWxC4DMKQ0FuIvdSGARbeQfIQM97VLF9C16gjJUXQcfyfFw2mZLVGBj6hjZwL0QLJHJW5kuiU8UYzxTlAoF4S9iSpZmF8BuArsOojlWAt9kxPwiajspTfXFPX9ZQop_GN7UcD5k"
          alt="Roi fane"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/40 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex rounded-full bg-(--primary)/15 px-3 py-1 font-label text-[10px] tracking-[0.16em] text-(--primary)">
            BOSS MONDIAL ELITE
          </span>
          <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-6xl">
            Le Roi fane
          </h2>
          <p className="mt-3 text-(--muted)">
            Boss a phases multiples, zone denial et invocation de adds en fin de
            combat.
          </p>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 lg:col-span-7">
          <h3 className="font-headline text-xl font-bold">Donnees de combat</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DataMetric label="Sante" value="1,250,000" />
            <DataMetric label="Armure" value="450 PHY" />
            <DataMetric label="Degats" value="4,500 - 6,200" highlight />
            <DataMetric label="Reapparition" value="06:00:00" />
          </div>
        </article>

        <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 lg:col-span-5">
          <h3 className="font-headline text-xl font-bold">Butin notable</h3>
          <div className="mt-4 space-y-3">
            <LootItem
              rarity="LEGENDAIRE"
              name="Couronne fracturee du roi"
              chance="1.2%"
            />
            <LootItem rarity="EPIQUE" name="Epaulieres fanees" chance="8.5%" />
            <LootItem rarity="COMMUN" name="Essence necrotique" chance="75%" />
          </div>
        </article>
      </div>
    </section>
  );
}

function RulesPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 md:p-8">
        <p className="font-label text-[10px] tracking-[0.22em] text-(--muted)">
          DIRECTIVES DU SERVEUR
        </p>
        <h2 className="mt-2 font-headline text-4xl font-bold md:text-5xl">
          Un gameplay propre,
          <span className="text-(--primary)"> zero abus.</span>
        </h2>
      </article>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RuleCard
          title="Respect et fair-play"
          points={[
            "Toxicite et harcelement = ban.",
            "Pas de triche client (x-ray, speed, fly).",
            "Exploits a signaler immediatement.",
          ]}
        />
        <RuleCard
          title="Integrite economique"
          points={[
            "Scams et faux listings interdits.",
            "Aucun RMT (real money trading).",
            "Sanctions progressives jusqu'a la liste noire.",
          ]}
        />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--muted)">{label}</p>
        <span className="material-symbols-outlined text-(--primary)">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-headline text-3xl font-bold">{value}</p>
    </article>
  );
}

function FeatureItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-4">
      <h4 className="font-headline text-lg font-bold">{title}</h4>
      <p className="mt-2 text-sm text-(--muted)">{text}</p>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-(--muted)">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-(--surface-container-high)">
        <div
          className="h-2 rounded-full bg-linear-to-r from-(--primary) to-(--secondary)"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DataMetric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-4">
      <p className="font-label text-[10px] tracking-[0.15em] text-(--muted)">
        {label}
      </p>
      <p
        className={`mt-1 font-headline text-2xl font-bold ${highlight ? "text-(--primary)" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function LootItem({
  rarity,
  name,
  chance,
}: {
  rarity: string;
  name: string;
  chance: string;
}) {
  return (
    <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-4">
      <p className="font-label text-[10px] tracking-[0.16em] text-(--primary)">
        {rarity}
      </p>
      <p className="mt-1 font-headline text-lg font-bold">{name}</p>
      <p className="text-sm text-(--muted)">Chance d obtention: {chance}</p>
    </div>
  );
}

function RuleCard({ title, points }: { title: string; points: string[] }) {
  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6">
      <h3 className="font-headline text-2xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-(--muted)">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default App;
