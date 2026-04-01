import { useMemo, useState } from "react";

type BossEntry = {
  name: string;
  titre: string;
  menace: "Moyenne" | "Elevee" | "Mythique";
  pointDeVie: string;
  armure: string;
  difficulte: string;
  zoneApparition: string;
  loots: string[];
};

type MenaceLevel = BossEntry["menace"];
type MenaceFilter = "Tous" | MenaceLevel;
type LootTier = "Critique" | "Majeur" | "Standard";

const MENACE_META: Record<
  MenaceLevel,
  {
    icon: string;
    sigil: string;
    badgeClass: string;
    markerClass: string;
  }
> = {
  Moyenne: {
    icon: "shield",
    sigil: "I",
    badgeClass:
      "menace-badge menace-moyenne bg-emerald-500/15 text-emerald-400 border-emerald-500/35",
    markerClass: "menace-dot menace-dot-moyenne",
  },
  Elevee: {
    icon: "warning",
    sigil: "II",
    badgeClass:
      "menace-badge menace-elevee bg-amber-500/15 text-amber-400 border-amber-500/35",
    markerClass: "menace-dot menace-dot-elevee",
  },
  Mythique: {
    icon: "dangerous",
    sigil: "III",
    badgeClass:
      "menace-badge menace-mythique bg-red-600/16 text-red-400 border-red-600/40",
    markerClass: "menace-dot menace-dot-mythique",
  },
};

const BOSSES: BossEntry[] = [
  {
    name: "Ender Golem",
    titre: "Colosse de l'Ombre",
    menace: "Moyenne",
    pointDeVie: "300",
    armure: "12",
    difficulte: "10-15",
    zoneApparition: "Ruined Citadel",
    loots: [
      "Enchanted Book, Punch",
      "Enchanted Book, Bane of Arthropods",
      "Enchanted Book, Wind Burst",
    ],
  },
  {
    name: "Ender Guardian",
    titre: "Void Protector",
    menace: "Moyenne",
    pointDeVie: "666",
    armure: "20",
    difficulte: "15-20",
    zoneApparition: "Ruined Citadel",
    loots: [
      "Enchanted Book, Power",
      "Enchanted Book, Infinity",
      "Enchanted Book, Multishot",
      "Enchanted Book, Quick Charge",
      "Enchanted Book, Bane of Arthropods",
    ],
  },
  {
    name: "Netherite Monstrosity",
    titre: "Abomination of the Nether",
    menace: "Moyenne",
    pointDeVie: "1 200",
    armure: "12",
    difficulte: "15-20",
    zoneApparition: "Soul Forge",
    loots: [
      "Enchanted Book, Sharpness",
      "Enchanted Book, Smite",
      "Enchanted Book, Knockback",
      "Enchanted Book, Density",
      "Enchanted Book, Breach",
    ],
  },
  {
    name: "The Prowler",
    titre: "The Slicer Machine",
    menace: "Moyenne",
    pointDeVie: "320",
    armure: "10",
    difficulte: "3-17",
    zoneApparition: "Ancient Factory",
    loots: [
      "Enchanted Book, Swift Sneak",
      "Enchanted Book, Knockback",
      "Enchanted Book, Density",
    ],
  },
  {
    name: "The Harbinger",
    titre: "Deus Ex Machina",
    menace: "Elevee",
    pointDeVie: "800",
    armure: "15",
    difficulte: "20-30",
    zoneApparition: "Ancient Factory",
    loots: [
      "Enchanted Book, Protection",
      "Enchanted Book, Blast Protection",
      "Enchanted Book, Fire Protection",
      "Enchanted Book, Projectile Protection",
      "Enchanted Book, Thorns",
    ],
  },
  {
    name: "Kobelediator",
    titre: "The Ancient Gladiator",
    menace: "Moyenne",
    pointDeVie: "360",
    armure: "10",
    difficulte: "14-18",
    zoneApparition: "Cursed Pyramid",
    loots: [
      "Enchanted Book, Silk Touch",
      "Enchanted Book, Efficiency",
      "Enchanted Book, Smite",
    ],
  },
  {
    name: "Wadjet",
    titre: "The Ancient Sorceress",
    menace: "Moyenne",
    pointDeVie: "350",
    armure: "0",
    difficulte: "11",
    zoneApparition: "Cursed Pyramid",
    loots: [
      "Enchanted Book, Feather Falling",
      "Enchanted Book, Efficiency",
      "Enchanted Book, Smite",
    ],
  },
  {
    name: "The Ancient Remnant",
    titre: "The Tyrex King",
    menace: "Mythique",
    pointDeVie: "900",
    armure: "12",
    difficulte: "18-45",
    zoneApparition: "Cursed Pyramid",
    loots: [
      "Enchanted Book, Fortune",
      "Enchanted Book, Efficiency",
      "Enchanted Book, Smite",
      "Enchanted Book, Bane of Arthropods",
      "Enchanted Book, Lure",
    ],
  },
  {
    name: "Amethyst Crab",
    titre: "The Capethyst Crab",
    menace: "Moyenne",
    pointDeVie: "200",
    armure: "12",
    difficulte: "10-15",
    zoneApparition: "Overgrown Cave",
    loots: [
      "Enchanted Book, Riptide",
      "Enchanted Book, Soul Speed",
      "Enchanted Book, Depth Strider",
    ],
  },
  {
    name: "Leviathan",
    titre: "The Subnautica Terror",
    menace: "Mythique",
    pointDeVie: "800",
    armure: "15",
    difficulte: "5-32",
    zoneApparition: "Sunken City",
    loots: [
      "Enchanted Book, Respiration",
      "Enchanted Book, Aqua Affinity",
      "Enchanted Book, Soul Speed",
      "Enchanted Book, Loyalty",
      "Enchanted Book, Impaling",
    ],
  },
  {
    name: "Clawdian",
    titre: "Larry from Spongebob",
    menace: "Moyenne",
    pointDeVie: "450",
    armure: "12",
    difficulte: "12-22",
    zoneApparition: "Acropolis",
    loots: [
      "Enchanted Book, Quick Charge",
      "Enchanted Book, Impaling",
      "Enchanted Book, Sweeping Edge",
    ],
  },
  {
    name: "Scylla",
    titre: "The Ahmed of the Storm",
    menace: "Mythique",
    pointDeVie: "760",
    armure: "12",
    difficulte: "8-37",
    zoneApparition: "Acropolis",
    loots: [
      "Enchanted Book, Piercing",
      "Enchanted Book, Riptide",
      "Enchanted Book, Looting",
      "Enchanted Book, Channeling",
      "Enchanted Book, Bane of Arthropods",
    ],
  },
  {
    name: "Aptrgangr",
    titre: "APT APT APT Aptrgangr",
    menace: "Elevee",
    pointDeVie: "320",
    armure: "10",
    difficulte: "8-27",
    zoneApparition: "Frost Prison",
    loots: [
      "Enchanted Book, Unbreaking",
      "Enchanted Book, Blast Protection",
      "Enchanted Book, Thorns",
    ],
  },
  {
    name: "Maledictus",
    titre: "The Cursed Butcher",
    menace: "Mythique",
    pointDeVie: "800",
    armure: "15",
    difficulte: "10-42",
    zoneApparition: "Frost Prison",
    loots: [
      "Enchanted Book, Looting",
      "Enchanted Book, Blast Protection",
      "Enchanted Book, Fire Protection",
      "Enchanted Book, Projectile Protection",
      "Enchanted Book, Thorns",
    ],
  },
  {
    name: "Ignited Revenant",
    titre: "The Burning Shielded Stick",
    menace: "Moyenne",
    pointDeVie: "160",
    armure: "12",
    difficulte: "4-6",
    zoneApparition: "Burning Arena",
    loots: [
      "Enchanted Book, Fire Protection",
      "Enchanted Book, Flame",
      "Enchanted Book, Fire Aspect",
    ],
  },
  {
    name: "Ignited Berserker",
    titre: "The Burning Sword Master",
    menace: "Moyenne",
    pointDeVie: "130",
    armure: "10",
    difficulte: "7-48",
    zoneApparition: "Burning Arena",
    loots: [
      "Enchanted Book, Efficiency",
      "Enchanted Book, Density",
      "Enchanted Book, Breach",
      "Enchanted Book, Wind Burst",
    ],
  },
  {
    name: "Ignis",
    titre: "King of the Furnace",
    menace: "Mythique",
    pointDeVie: "900",
    armure: "10",
    difficulte: "8-82",
    zoneApparition: "Burning Arena",
    loots: [
      "Enchanted Book, Mending",
      "Enchanted Book, Fire Protection",
      "Enchanted Book, Lure",
      "Enchanted Book, Luck of the Sea",
      "Enchanted Book, Impaling",
      "Enchanted Book, Frost Walker",
    ],
  },
];

const LOOT_TIER_META: Record<
  LootTier,
  {
    icon: string;
    badgeClass: string;
    hint: string;
  }
> = {
  Critique: {
    icon: "auto_awesome",
    badgeClass:
      "border-fuchsia-400/45 bg-fuchsia-500/14 text-fuchsia-200 shadow-[0_0_16px_rgba(217,70,239,0.2)]",
    hint: "Loot prioritaire pour progression et economie.",
  },
  Majeur: {
    icon: "stars",
    badgeClass:
      "border-amber-400/45 bg-amber-500/14 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.18)]",
    hint: "Loot tres solide pour optimiser ton build.",
  },
  Standard: {
    icon: "menu_book",
    badgeClass:
      "border-(--outline-variant)/60 bg-(--surface-container-high)/70 text-(--muted)",
    hint: "Loot utile pour support et confort.",
  },
};

const CRITICAL_ENCHANTS = new Set([
  "Mending",
  "Infinity",
  "Fortune",
  "Looting",
  "Sharpness",
  "Protection",
]);

const MAJOR_ENCHANTS = new Set([
  "Unbreaking",
  "Efficiency",
  "Power",
  "Thorns",
  "Soul Speed",
  "Smite",
  "Sweeping Edge",
  "Riptide",
  "Respiration",
]);

function getLootMeta(rawLoot: string): {
  title: string;
  enchant: string;
  tier: LootTier;
} {
  const enchant = rawLoot.includes(",")
    ? rawLoot.split(",").slice(1).join(",").trim()
    : rawLoot;

  if (CRITICAL_ENCHANTS.has(enchant)) {
    return { title: rawLoot, enchant, tier: "Critique" };
  }

  if (MAJOR_ENCHANTS.has(enchant)) {
    return { title: rawLoot, enchant, tier: "Majeur" };
  }

  return { title: rawLoot, enchant, tier: "Standard" };
}

function StatLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="game-panel premium-lift rounded-xl p-5 lg:min-h-32">
      <div className="flex items-center justify-between">
        <p className="font-label text-[11px] tracking-[0.15em] text-(--muted)">
          {label}
        </p>
        <span className="material-symbols-outlined text-[20px] text-(--primary)">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-headline text-2xl font-bold">{value}</p>
    </div>
  );
}

function BestiaryLootdropPage() {
  const [menaceFilter, setMenaceFilter] = useState<MenaceFilter>("Tous");
  const [zoneFilter, setZoneFilter] = useState<string>("Toutes");
  const [selectedBossName, setSelectedBossName] = useState<string>(
    BOSSES[0].name,
  );

  const zones = useMemo(
    () => ["Toutes", ...new Set(BOSSES.map((boss) => boss.zoneApparition))],
    [],
  );

  const filteredBosses = useMemo(
    () =>
      BOSSES.filter((boss) => {
        const matchMenace =
          menaceFilter === "Tous" ? true : boss.menace === menaceFilter;
        const matchZone =
          zoneFilter === "Toutes" ? true : boss.zoneApparition === zoneFilter;
        return matchMenace && matchZone;
      }),
    [menaceFilter, zoneFilter],
  );

  const resolvedSelectedBossName = filteredBosses.some(
    (boss) => boss.name === selectedBossName,
  )
    ? selectedBossName
    : (filteredBosses[0]?.name ?? BOSSES[0].name);

  const selectedBoss =
    filteredBosses.find((boss) => boss.name === resolvedSelectedBossName) ??
    filteredBosses[0] ??
    BOSSES[0];

  const selectedMenace = MENACE_META[selectedBoss.menace];
  const selectedLoots = selectedBoss.loots.map(getLootMeta);
  const criticalLoots = selectedLoots.filter(
    (loot) => loot.tier === "Critique",
  ).length;
  const majorLoots = selectedLoots.filter(
    (loot) => loot.tier === "Majeur",
  ).length;
  const totalLoots = selectedLoots.length;

  const filteredCount = filteredBosses.length;
  const mythicBossCount = BOSSES.filter(
    (boss) => boss.menace === "Mythique",
  ).length;

  return (
    <section className="space-y-6">
      <article className="glass-panel shimmer-border relative overflow-hidden rounded-3xl border border-(--outline-variant)/50 p-6 md:p-8">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
          alt="Boss de Path of Endalor"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-r from-(--background) via-(--background)/70 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex rounded-full bg-(--primary)/15 px-3 py-1 font-label text-[10px] tracking-[0.16em] text-(--primary)">
            BESTIAIRE STRATEGIQUE
          </span>
          <h2 className="mt-3 font-headline text-2xl font-bold tracking-tight md:text-4xl">
            Boss, niveaux de menace et table de loots premium
          </h2>
          <p className="mt-3 text-(--muted)">
            Selectionne une zone ou un niveau de menace pour afficher la
            meilleure cible de farm, puis priorise les livres enchantes marques
            critiques.
          </p>
        </div>
      </article>

      <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatLine
          label="Boss disponibles"
          value={String(filteredCount)}
          icon="groups"
        />
        <StatLine
          label="Boss mythiques"
          value={String(mythicBossCount)}
          icon="local_fire_department"
        />
        <StatLine
          label="Loots critiques"
          value={String(criticalLoots)}
          icon="workspace_premium"
        />
        <StatLine
          label="Total loots"
          value={String(totalLoots)}
          icon="inventory_2"
        />
      </article>

      <article className="premium-surface relative overflow-hidden rounded-2xl p-6">
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-(--primary)/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-8 h-48 w-48 rounded-full bg-(--secondary)/15 blur-3xl" />

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="game-panel rounded-xl p-3">
            <p className="font-label text-[10px] tracking-[0.14em] text-(--muted)">
              Filtrer par menace
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                ["Tous", "Moyenne", "Elevee", "Mythique"] as MenaceFilter[]
              ).map((level) => {
                const active = menaceFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setMenaceFilter(level)}
                    className={`game-chip px-3 py-1.5 font-label text-[10px] tracking-[0.14em] transition ${
                      active
                        ? "game-chip-active text-(--on-background)"
                        : "text-(--muted) hover:text-(--on-background)"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="game-panel rounded-xl p-3">
            <p className="font-label text-[10px] tracking-[0.14em] text-(--muted)">
              Filtrer par zone
            </p>
            <select
              value={zoneFilter}
              onChange={(event) => setZoneFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-(--outline-variant)/55 bg-(--surface-container-low) px-3 py-2 text-sm text-(--on-background) outline-none transition focus:border-(--primary)/65"
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredBosses.length === 0 ? (
          <div className="game-panel rounded-xl p-5 text-(--muted)">
            Aucun boss ne correspond a ces filtres. Ajuste la menace ou la zone.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <section className="relative rounded-2xl border border-(--outline-variant)/45 bg-linear-to-b from-(--surface-container-high)/70 to-(--surface-container-low) p-5 shadow-(--soft-shadow) lg:col-span-8 lg:flex lg:min-h-168 lg:h-full lg:flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-label text-[10px] tracking-[0.16em] text-(--primary)">
                  BOSS PRINCIPAL
                </p>
                <h3 className="mt-2 font-headline text-3xl font-bold tracking-tight md:text-4xl">
                  {selectedBoss.name}
                </h3>
                <p className="mt-2 text-sm text-(--muted)">
                  {selectedBoss.titre}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-label text-[10px] tracking-[0.14em] ${selectedMenace.badgeClass}`}
              >
                <span className={selectedMenace.markerClass} />
                <span className="material-symbols-outlined text-[14px]">
                  {selectedMenace.icon}
                </span>
                <span>
                  Menace {selectedBoss.menace} // {selectedMenace.sigil}
                </span>
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatLine
                label="Point de vie"
                value={selectedBoss.pointDeVie}
                icon="favorite"
              />
              <StatLine
                label="Armure"
                value={selectedBoss.armure}
                icon="shield"
              />
              <StatLine
                label="Difficulte moyenne"
                value={selectedBoss.difficulte}
                icon="fitness_center"
              />
              <StatLine
                label="Zone d'apparition"
                value={selectedBoss.zoneApparition}
                icon="map"
              />
            </div>

            <div className="mt-6 game-panel rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-(--primary)">
                    auto_stories
                  </span>
                  <p className="font-label text-[11px] tracking-[0.16em] text-(--primary)">
                    Enchanted book droppables
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-label tracking-[0.14em] text-(--muted)">
                  <span className="game-chip px-2 py-1 text-fuchsia-200">
                    Critique: {criticalLoots}
                  </span>
                  <span className="game-chip px-2 py-1 text-amber-200">
                    Majeur: {majorLoots}
                  </span>
                </div>
              </div>

              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedLoots.map((loot) => {
                  const tierMeta = LOOT_TIER_META[loot.tier];
                  return (
                    <li
                      key={loot.title}
                      className="game-panel premium-lift rounded-lg px-4 py-3 text-base text-(--on-background)"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-(--muted)">
                            Enchanted Book
                          </p>
                          <p className="mt-0.5 font-headline text-lg font-bold leading-tight">
                            {loot.enchant}
                          </p>
                        </div>

                        <span
                          title={tierMeta.hint}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-label text-[9px] tracking-[0.12em] ${tierMeta.badgeClass}`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {tierMeta.icon}
                          </span>
                          {loot.tier}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <aside className="game-panel relative rounded-2xl p-4 lg:col-span-4 lg:flex lg:max-h-172 lg:flex-col lg:h-full">
            <h4 className="font-headline text-xl font-bold">Liste des boss</h4>
            <p className="mt-1 text-sm text-(--muted)">
              Cliquez un nom pour afficher sa fiche principale.
            </p>

            <div className="boss-list-scroll mt-4 space-y-2 overflow-y-auto pr-1 lg:flex-1">
              {filteredBosses.map((boss, index) => {
                const isActive = boss.name === selectedBoss.name;
                return (
                  <button
                    key={boss.name}
                    onClick={() => setSelectedBossName(boss.name)}
                    aria-pressed={isActive}
                    className={`group relative w-full overflow-hidden rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-(--primary)/45 bg-(--primary)/18 text-(--on-background)"
                        : "border-(--outline-variant)/45 bg-(--surface-container-low)/80 text-(--muted) hover:border-(--primary)/30 hover:text-(--on-background)"
                    }`}
                  >
                    <span className="font-label text-[10px] tracking-[0.14em] opacity-75">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 font-headline text-lg font-bold leading-tight">
                      {boss.name}
                    </p>
                    <p className="mt-1 text-xs text-(--muted)">
                      {boss.zoneApparition}
                    </p>
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-(--primary) transition-all ${
                        isActive ? "w-full" : "w-0 group-hover:w-2/3"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
}

export default BestiaryLootdropPage;
