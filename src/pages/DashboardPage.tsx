import { useEffect, useState } from "react";
import { type PageKey } from "../types/navigation";

import {
  fetchServerStatus,
  type ServerStatusResponse,
} from "../lib/serverStatus";

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
    <article className="game-panel premium-lift rounded-2xl p-5">
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
    <div className="game-panel premium-lift rounded-xl p-4">
      <h4 className="font-headline text-lg font-bold">{title}</h4>
      <p className="mt-2 text-sm text-(--muted)">{text}</p>
    </div>
  );
}

function DashboardPage({
  onNavigate,
}: {
  onNavigate: (nextPage: PageKey) => void;
}) {
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let timerId: number | null = null;
    let active = true;

    const loadStatus = async () => {
      try {
        const payload = await fetchServerStatus();
        if (!active) return;
        setServerStatus(payload);
        setStatusError(null);
      } catch {
        if (!active) return;
        setStatusError("Statut indisponible");
      } finally {
        timerId = window.setTimeout(loadStatus, 15000);
      }
    };

    loadStatus();

    return () => {
      active = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const playersLabel = serverStatus
    ? `${serverStatus.playersOnline}/${serverStatus.playersMax}`
    : "--/--";

  const pingLabel =
    serverStatus?.pingMs !== null && serverStatus?.pingMs !== undefined
      ? `${serverStatus.pingMs} ms`
      : "-- ms";

  const wealthFormatter = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  });

  const economyLabel = serverStatus?.economy?.available
    ? `${wealthFormatter.format(serverStatus.economy.totalBalance)} $`
    : "N/A";

  return (
    <section className="space-y-8">
      <section className="premium-surface shimmer-border relative overflow-hidden rounded-3xl p-6 md:p-10">
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
            style est plus premium, plus propre, et utile pour l'aventure.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="game-chip game-chip-active rounded-full px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) shadow-[0_0_20px_var(--ring-glow)] transition hover:-translate-y-px">
              REJOINDRE
            </button>
            <button
              onClick={() => onNavigate("bestiary")}
              className="game-chip rounded-full px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:border-(--primary)/40"
            >
              BOSS INFOS
            </button>
          </div>
        </div>
      </section>

      <div className="hud-divider" />

      {statusError && <p className="text-sm text-(--muted)">{statusError}</p>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Joueurs en ligne"
          value={playersLabel}
          icon="groups"
        />
        <MetricCard label="Ping moyen" value={pingLabel} icon="network_ping" />
        <MetricCard label="Quetes quotidiennes" value="8" icon="task_alt" />
        <MetricCard
          label="Richesse Globale"
          value={economyLabel}
          icon="payments"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="glass-panel shimmer-border rounded-2xl border border-(--outline-variant)/45 p-6 xl:col-span-8">
          <h3 className="font-headline text-2xl font-bold">
            Fonctionnalites principales
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FeatureItem
              title="Difficulte dynamique"
              text="Le monde s'adapte en temps reel a la progression des joueurs."
            />
            <FeatureItem
              title="Economie saisonniere"
              text="Wipes reguliers avec meta renouvelee a chaque cycle."
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

        <article className="shimmer-border relative overflow-hidden rounded-2xl p-6 xl:col-span-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-(--primary)/16 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-(--secondary)/12 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
                  ROUTE DE SESSION
                </p>
                <h3 className="mt-1 font-headline text-xl font-bold">
                  Parcours rapide
                </h3>
              </div>
              <span className="game-chip rounded-full px-3 py-1 font-label text-[10px] tracking-[0.13em] text-(--muted)">
                3 ETAPES
              </span>
            </div>

            <p className="mt-2 text-sm text-(--muted)">
              Sequence conseillée pour une session utile sans perte de temps.
            </p>

            <div className="my-4 hud-divider" />

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate("craft")}
                className="premium-lift game-chip flex w-full items-center justify-between rounded-xl px-3 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-(--primary)/18 font-label text-[10px] tracking-widest text-(--primary)">
                    01
                  </span>
                  <span className="material-symbols-outlined text-(--primary)">
                    construction
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      Setup du build
                    </span>
                    <span className="block text-xs text-(--muted)">
                      Verifier recettes et materiaux essentiels
                    </span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="game-chip rounded-full px-2 py-0.5 font-label text-[10px] tracking-[0.13em] text-(--muted)">
                    5 MIN
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-(--muted)">
                    arrow_forward
                  </span>
                </span>
              </button>

              <button
                onClick={() => onNavigate("auctionhouse")}
                className="premium-lift game-chip flex w-full items-center justify-between rounded-xl px-3 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-(--primary)/18 font-label text-[10px] tracking-widest text-(--primary)">
                    02
                  </span>
                  <span className="material-symbols-outlined text-(--primary)">
                    storefront
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      Scanner le marche
                    </span>
                    <span className="block text-xs text-(--muted)">
                      Reperez les prix et opportunites rapides
                    </span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="game-chip rounded-full px-2 py-0.5 font-label text-[10px] tracking-[0.13em] text-(--muted)">
                    10 MIN
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-(--muted)">
                    arrow_forward
                  </span>
                </span>
              </button>

              <button
                onClick={() => onNavigate("bestiary")}
                className="premium-lift game-chip flex w-full items-center justify-between rounded-xl px-3 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-(--primary)/18 font-label text-[10px] tracking-widest text-(--primary)">
                    03
                  </span>
                  <span className="material-symbols-outlined text-(--primary)">
                    skull
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      Choisir une cible boss
                    </span>
                    <span className="block text-xs text-(--muted)">
                      Consultez les loots avant de partir en raid
                    </span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="game-chip rounded-full px-2 py-0.5 font-label text-[10px] tracking-[0.13em] text-(--muted)">
                    RAID
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-(--muted)">
                    arrow_forward
                  </span>
                </span>
              </button>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}

export default DashboardPage;
