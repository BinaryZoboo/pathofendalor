import { useEffect, useState } from "react";
import { type PageKey } from "../types/navigation";

import imgend_island from "../assets/dashboard/end_island.webp";
import imgjewelery from "../assets/dashboard/jewelery.webp";
import loot_rpg from "../assets/dashboard/loot_rpg.webp";
import imgLootbeam from "../assets/dashboard/lootbeam.webp";
import imgMonde from "../assets/dashboard/monde.webp";
import imgMonde2 from "../assets/dashboard/monde2.webp";
import shop_png from "../assets/dashboard/shop-png.webp";
import skill_tree from "../assets/dashboard/skill_tree.webp";
import imgSpell from "../assets/dashboard/spell.webp";
import imgTeamup from "../assets/dashboard/teamup.webp";
import heroDashboard from "../assets/herobg/dashboard.webp";
import PageHero from "../components/PageHero";
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

function DashboardPage({
  onNavigate,
}: {
  onNavigate: (nextPage: PageKey) => void;
}) {
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

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

  useEffect(() => {
    if (!expandedImage) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedImage(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [expandedImage]);

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
      <PageHero
        badge="NOUVELLE SAISON EN LIGNE"
        title="Un serveur RPG moderne"
        highlight="concu pour la competition."
        description="Nouveau hub visuel, meilleure lisibilite et navigation rapide. Le style est plus premium, plus propre, et utile pour l'aventure."
        imageSrc={heroDashboard}
        imageAlt="Path Of Endalor"
        actions={
          <>
            <button className="game-chip game-chip-active rounded-full px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) shadow-[0_0_20px_var(--ring-glow)] transition hover:-translate-y-px">
              REJOINDRE
            </button>
            <button
              onClick={() => onNavigate("bestiary")}
              className="game-chip rounded-full px-6 py-3 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:border-(--primary)/40"
            >
              BOSS INFOS
            </button>
          </>
        }
      />

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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-2xl font-bold">Galerie</h3>
            <p className="mt-1 text-sm text-(--muted)">
              Decouvrez les mods, les zones et l'atmosphere unique du serveur
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:auto-rows-[180px] md:grid-cols-4 xl:gap-5">
          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                src: imgMonde,
                alt: "Presentation generale du serveur",
              })
            }
            className="shimmer-border group relative min-h-90 cursor-zoom-in overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-0 text-left md:col-span-2 md:row-span-2 md:min-h-0"
          >
            <img
              src={imgMonde}
              alt="Presentation generale du serveur"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-container-high)/68 via-(--surface-container-high)/18 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-4">
              <div>
                <p className="font-label text-[10px] tracking-[0.15em] text-(--primary)">
                  APERCU
                </p>
                <h4 className="mt-1 font-headline text-sm font-bold">
                  Un monde vivant et dynamique
                </h4>
                <p className="mt-1 text-xs text-(--muted)">
                  La generation du monde est repensee pour creer des
                  environnements variés et immersifs, avec des zones uniques a
                  explorer et des secrets a decouvrir.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                src: imgSpell,
                alt: "Liste des mods installes",
              })
            }
            className="shimmer-border group relative min-h-55 cursor-zoom-in overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-0 text-left md:col-span-1 md:min-h-0"
          >
            <img
              src={imgSpell}
              alt="Liste des mods installes"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-container-high)/68 via-(--surface-container-high)/18 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-4">
              <div>
                <p className="font-label text-[10px] tracking-[0.15em] text-(--primary)">
                  MAGIE
                </p>
                <h4 className="mt-1 font-headline text-sm font-bold">
                  Sortileges et pouvoirs
                </h4>
                <p className="mt-1 text-xs text-(--muted)">
                  Capacités magiques uniques, devenez qui vous voulez !
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                src: imgMonde2,
                alt: "Zones du serveur",
              })
            }
            className="shimmer-border group relative min-h-55 cursor-zoom-in overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-0 text-left md:col-span-1 md:min-h-0"
          >
            <img
              src={imgMonde2}
              alt="Zones du serveur"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-container-high)/68 via-(--surface-container-high)/18 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-4">
              <div>
                <p className="font-label text-[10px] tracking-[0.15em] text-(--primary)">
                  STRUCTURE
                </p>
                <h4 className="mt-1 font-headline text-sm font-bold">
                  Regions et biomes
                </h4>
                <p className="mt-1 text-xs text-(--muted)">
                  Les structures de base ameliores et diversifiees pour
                  encourager l'exploration.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                src: imgTeamup,
                alt: "Hub central du serveur",
              })
            }
            className="shimmer-border group relative min-h-45 cursor-zoom-in overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-0 text-left md:col-span-1 md:min-h-0"
          >
            <img
              src={imgTeamup}
              alt="Hub central du serveur"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-container-high)/68 via-(--surface-container-high)/18 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-3">
              <div>
                <p className="font-label text-[9px] tracking-[0.15em] text-(--primary)">
                  TEAMUP
                </p>
                <h4 className="mt-0.5 font-headline text-xs font-bold">
                  Monde RPG-MMO
                </h4>
                <p className="mt-1 text-xs text-(--muted)">
                  Faites equipe pour affronter des donjons et les arènes de
                  boss.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                src: imgLootbeam,
                alt: "Arenes de boss",
              })
            }
            className="shimmer-border group relative min-h-45 cursor-zoom-in overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-0 text-left md:col-span-1 md:min-h-0"
          >
            <img
              src={imgLootbeam}
              alt="Arenes de boss"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--surface-container-high)/68 via-(--surface-container-high)/18 to-transparent" />
            <div className="relative z-10 flex h-full items-end p-3">
              <div>
                <p className="font-label text-[9px] tracking-[0.15em] text-(--primary)">
                  LOOT - BOSS
                </p>
                <h4 className="mt-0.5 font-headline text-xs font-bold">
                  Dungeon unique
                </h4>
                <p className="mt-1 text-xs text-(--muted)">
                  Des arènes de boss uniques avec des loots exclusifs.
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="glass-panel shimmer-border rounded-2xl border border-(--outline-variant)/45 p-6 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-headline text-2xl font-bold">
                Presentation du serveur
              </h3>
              <p className="mt-1 text-sm text-(--muted)">
                Path of Endalor est un univers RPG-MMO construit pour les
                joueurs qui aiment la progression, le challenge et la
                cooperation.
              </p>
            </div>
            <span className="game-chip rounded-full px-3 py-1 text-[10px] font-label tracking-[0.13em] text-(--muted)">
              SAISON ACTIVE
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="game-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-lg font-bold">
                  Exploration vivante
                </h4>
                <span className="material-symbols-outlined text-(--primary)">
                  explore
                </span>
              </div>
              <p className="mt-2 text-sm text-(--muted)">
                Biomes retravailles, zones narratives et secrets caches forment
                une map evolutive qui pousse a l'exploration.
              </p>
            </article>

            <article className="game-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-lg font-bold">
                  Progression RPG
                </h4>
                <span className="material-symbols-outlined text-(--primary)">
                  emoji_events
                </span>
              </div>
              <p className="mt-2 text-sm text-(--muted)">
                Builds specialises, classes hybrides et objectifs long terme
                pour une vraie sensation de progression.
              </p>
            </article>

            <article className="game-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-lg font-bold">
                  Coop & raids
                </h4>
                <span className="material-symbols-outlined text-(--primary)">
                  groups
                </span>
              </div>
              <p className="mt-2 text-sm text-(--muted)">
                Donjons, arenes de boss et events de groupe encourages par des
                loots exclusifs et des encounters uniques.
              </p>
            </article>

            <article className="game-panel rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-lg font-bold">
                  Economie active
                </h4>
                <span className="material-symbols-outlined text-(--primary)">
                  payments
                </span>
              </div>
              <p className="mt-2 text-sm text-(--muted)">
                Une economie vivante soutenue par le commerce joueur, la rarete
                des ressources et des cycles de saison.
              </p>
            </article>
          </div>
        </article>

        <article className="shimmer-border relative overflow-hidden rounded-2xl p-6 xl:col-span-4">
          <div className="relative z-10">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: shop_png,
                    alt: "Apercu du monde",
                  })
                }
                className="group relative h-28 cursor-zoom-in overflow-hidden rounded-lg border border-(--outline-variant)/45"
              >
                <img
                  src={shop_png}
                  alt="Apercu du monde"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: skill_tree,
                    alt: "Apercu biomes",
                  })
                }
                className="group relative h-28 cursor-zoom-in overflow-hidden rounded-lg border border-(--outline-variant)/45"
              >
                <img
                  src={skill_tree}
                  alt="Apercu biomes"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: loot_rpg,
                    alt: "Apercu magie",
                  })
                }
                className="group relative h-24 cursor-zoom-in overflow-hidden rounded-lg border border-(--outline-variant)/45"
              >
                <img
                  src={loot_rpg}
                  alt="Apercu magie"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: imgjewelery,
                    alt: "Apercu teamup",
                  })
                }
                className="group relative h-24 cursor-zoom-in overflow-hidden rounded-lg border border-(--outline-variant)/45"
              >
                <img
                  src={imgjewelery}
                  alt="Apercu teamup"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: imgend_island,
                    alt: "Apercu boss",
                  })
                }
                className="group relative col-span-2 h-24 cursor-zoom-in overflow-hidden rounded-lg border border-(--outline-variant)/45"
              >
                <img
                  src={imgend_island}
                  alt="Apercu boss"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </button>
            </div>
          </div>
        </article>
      </section>

      {expandedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image en grand"
          onClick={() => setExpandedImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            onClick={() => setExpandedImage(null)}
            aria-label="Fermer l'image"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <img
            src={expandedImage.src}
            alt={expandedImage.alt}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

export default DashboardPage;
