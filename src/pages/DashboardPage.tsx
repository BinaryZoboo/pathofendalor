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
              onClick={() => onNavigate("bestiary")}
              className="rounded-full border border-(--outline-variant) bg-(--surface-container-low) px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:border-(--primary)/40"
            >
              OUVRIR LES BOSS
            </button>
          </div>
        </div>
      </section>

      {statusError && <p className="text-sm text-(--muted)">{statusError}</p>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Joueurs en ligne"
          value={playersLabel}
          icon="groups"
        />
        <MetricCard label="Ping moyen" value={pingLabel} icon="network_ping" />
        <MetricCard label="Quetes quotidiennes" value="8" icon="task_alt" />
        <MetricCard label="EconomyCraft" value={economyLabel} icon="payments" />
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

export default DashboardPage;
