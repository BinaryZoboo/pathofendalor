import { useEffect, useState } from "react";

import { type PageKey } from "../types/navigation";

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

function SidePanel({
  activePage,
  onNavigate,
  theme,
  onToggleTheme,
}: {
  activePage: PageKey;
  onNavigate: (nextPage: PageKey) => void;
  theme: "dark" | "light";
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
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "craft", label: "Craft", icon: "handyman" },
    { key: "classes", label: "Classes", icon: "diversity_3" },
    { key: "bestiary", label: "Boss", icon: "skull" },
    { key: "auctionhouse", label: "Hotel des ventes", icon: "storefront" },
    { key: "rules", label: "Règlement", icon: "gavel" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-72 overflow-hidden lg:block">
      <div className="sidepanel-brazier glass-panel relative flex h-full flex-col overflow-hidden border-r border-(--outline-variant)/50 p-4">
        <div className="sidepanel-brazier-fire" aria-hidden="true" />
        <div className="sidepanel-brazier-smoke" aria-hidden="true" />
        <div className="sidepanel-brazier-embers" aria-hidden="true" />
        <div
          className="sidepanel-brazier-embers sidepanel-brazier-embers-alt"
          aria-hidden="true"
        />

        <div className="premium-surface mb-4 rounded-xl p-4">
          <div>
            <p className="font-headline text-2xl font-bold tracking-tight">
              Path Of <span className="text-(--primary)">Endalor</span>
            </p>
            <p className="mt-1 text-sm text-(--muted)">
              Cycle 0 - Path of Endalor 2.0
            </p>
          </div>
        </div>

        <nav className="space-y-3">
          {items.map((item) => {
            const isActive = item.key === activePage;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`premium-lift flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-(--primary) text-(--on-primary)"
                    : "premium-surface text-(--muted) hover:text-(--on-background)"
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

        <div className="premium-surface mt-auto flex items-center justify-between rounded-xl bg-linear-to-r from-(--primary)/18 to-(--secondary)/18 p-4">
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
              className="game-chip grid h-9 w-9 place-items-center rounded-full p-0 text-(--muted) transition hover:text-(--primary)"
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

export default SidePanel;
