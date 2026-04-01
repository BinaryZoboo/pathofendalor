import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PageHero from "../components/PageHero";

type RuleSeverity = "info" | "warning" | "strict";
type RuleCategory = "respect" | "economy" | "combat" | "build";

type RuleItem = {
  id: string;
  title: string;
  severity: RuleSeverity;
  category: RuleCategory;
  description: string;
  sanction: string;
  examples: string[];
};

const severityMeta: Record<
  RuleSeverity,
  { label: string; icon: string; ringClass: string; badgeClass: string }
> = {
  info: {
    label: "Info",
    icon: "info",
    ringClass: "border-(--outline-variant)/55",
    badgeClass: "text-(--muted)",
  },
  warning: {
    label: "Avertissement",
    icon: "warning",
    ringClass: "border-(--secondary)/45",
    badgeClass: "text-(--secondary)",
  },
  strict: {
    label: "Interdit",
    icon: "gpp_bad",
    ringClass: "border-(--primary)/55",
    badgeClass: "text-(--primary)",
  },
};

const categoryMeta: Record<RuleCategory, { label: string; icon: string }> = {
  respect: { label: "Respect", icon: "handshake" },
  economy: { label: "Economie", icon: "account_balance_wallet" },
  combat: { label: "Combat", icon: "swords" },
  build: { label: "Build", icon: "construction" },
};

const fallbackRules: RuleItem[] = [
  {
    id: "respect-1",
    title: "Aucune toxicite ou harassment",
    severity: "strict",
    category: "respect",
    description:
      "Le chat et les interactions vocales doivent rester propres, sans insultes, menaces ou acharnement.",
    sanction: "Mute immediate puis ban temporaire en cas de recidive.",
    examples: [
      "Spam d'insultes en pvp",
      "Provocation ciblee repetee",
      "Discrimination explicite",
    ],
  },
  {
    id: "respect-2",
    title: "Signalement clair des abus",
    severity: "info",
    category: "respect",
    description:
      "Utilise les canaux staff avec preuves (capture, heure, pseudo) pour accelerer les actions.",
    sanction: "Aucune sanction si rapport de bonne foi.",
    examples: [
      "Capture chat",
      "Coordonnees de zone",
      "Horodatage de l'incident",
    ],
  },
  {
    id: "economy-1",
    title: "Aucun scam ni faux listing",
    severity: "strict",
    category: "economy",
    description:
      "Toute tentative de tromperie economique est consideree comme fraude serveur.",
    sanction: "Suppression des gains + suspension + blacklist possible.",
    examples: [
      "Prix appat puis retrait rapide",
      "Item non conforme a l'annonce",
      "Manipulation coordonnee de marche",
    ],
  },
  {
    id: "economy-2",
    title: "RMT strictement interdit",
    severity: "strict",
    category: "economy",
    description:
      "Aucun echange argent reel contre ressources, comptes ou avantages en jeu.",
    sanction: "Ban definitif de tous les comptes impliques.",
    examples: [
      "Cash contre monnaie IG",
      "Achat d'objets premium hors boutique",
    ],
  },
  {
    id: "combat-1",
    title: "Clients modifies interdits",
    severity: "strict",
    category: "combat",
    description:
      "Les modules donnant un avantage illegitime (x-ray, fly, speed) ne sont jamais autorises.",
    sanction: "Ban direct selon gravite des preuves.",
    examples: ["Aim assist", "Reach anormal", "Auto potions scripts"],
  },
  {
    id: "combat-2",
    title: "Spawn kill et camp abusif limites",
    severity: "warning",
    category: "combat",
    description:
      "Le pvp reste libre, mais l'acharnement sur zone de spawn est sanctionnable.",
    sanction: "Avertissement puis restriction pvp temporaire.",
    examples: ["Camp de respawn", "Chain kill en boucle"],
  },
  {
    id: "build-1",
    title: "Respect des zones et claims",
    severity: "warning",
    category: "build",
    description:
      "Le grief, meme partiel, est trace et restaure avec sanction adaptee.",
    sanction: "Rollback des degats + sanctions progressives.",
    examples: ["Destruction de facade", "Vol via coffre mal securise"],
  },
  {
    id: "build-2",
    title: "Performance map: constructions controlees",
    severity: "info",
    category: "build",
    description:
      "Les fermes ou machines tres lourdes doivent respecter les limites publiees pour garder un serveur fluide.",
    sanction: "Demande de correction puis desactivation technique si besoin.",
    examples: ["Horloges redstone infinies", "Entites en masse non optimizees"],
  },
];

type RulesPayload = {
  rules: RuleItem[];
};

type ClientSetupStep = {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
};

const CLIENT_PACK_URL: string | null = null;
const HOLD_TO_ACCEPT_MS = 2000;

const clientSetupSteps: ClientSetupStep[] = [
  {
    id: "java",
    title: "Installer Java 21",
    icon: "deployed_code",
    description:
      "Installe Java 21 (JDK ou JRE) pour garantir la compatibilite avec le client modde.",
    details: [
      "Verifie la version avec: java -version",
      "Redemarre ton launcher apres installation",
    ],
  },
  {
    id: "launcher",
    title: "Configurer le launcher",
    icon: "rocket_launch",
    description:
      "Utilise un launcher stable (Prism, ATLauncher ou CurseForge) pour gerer proprement les mods.",
    details: [
      "Cree une instance dediee Path of Endalor",
      "Alloue 6 a 8 Go de RAM selon ta machine",
    ],
  },
  {
    id: "version",
    title: "Version Minecraft cible",
    icon: "tune",
    description:
      "Selectionne la version serveur recommandee, puis active le bon loader (Forge/NeoForge/Fabric selon le pack).",
    details: [
      "Ne melange pas deux loaders differents",
      "Conserve un profil propre pour eviter les conflits",
    ],
  },
  {
    id: "files",
    title: "Installer mods et fichiers",
    icon: "folder_zip",
    description:
      "Telecharge le pack client puis importe le profil, ou copie les fichiers mods/config/resourcepacks dans l'instance.",
    details: ["Mods dans le dossier mods", "Configs dans le dossier config"],
  },
  {
    id: "check",
    title: "Verification finale",
    icon: "verified",
    description:
      "Lance une premiere session locale, puis rejoins le serveur pour verifier que tous les assets se chargent sans erreur.",
    details: [
      "IP serveur: srv1319801.hstgr.cloud:25565",
      "Si crash: retire les mods externes non officiels",
    ],
  },
];

function isValidRuleCategory(value: string): value is RuleCategory {
  return (
    value === "respect" ||
    value === "economy" ||
    value === "combat" ||
    value === "build"
  );
}

function isValidRuleSeverity(value: string): value is RuleSeverity {
  return value === "info" || value === "warning" || value === "strict";
}

function parseRulesPayload(input: unknown): RulesPayload {
  if (!input || typeof input !== "object") {
    return { rules: fallbackRules };
  }

  const source = input as {
    rules?: Array<{
      id?: unknown;
      title?: unknown;
      severity?: unknown;
      category?: unknown;
      description?: unknown;
      sanction?: unknown;
      examples?: unknown;
    }>;
  };

  const parsedRules: RuleItem[] = (source.rules ?? [])
    .map((rule) => {
      if (!rule || typeof rule !== "object") return null;

      const id = typeof rule.id === "string" ? rule.id : "";
      const title = typeof rule.title === "string" ? rule.title : "";
      const severity =
        typeof rule.severity === "string" && isValidRuleSeverity(rule.severity)
          ? rule.severity
          : null;
      const category =
        typeof rule.category === "string" && isValidRuleCategory(rule.category)
          ? rule.category
          : null;
      const description =
        typeof rule.description === "string" ? rule.description : "";
      const sanction = typeof rule.sanction === "string" ? rule.sanction : "";
      const examples = Array.isArray(rule.examples)
        ? rule.examples.filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0,
          )
        : [];

      if (
        !id ||
        !title ||
        !severity ||
        !category ||
        !description ||
        !sanction
      ) {
        return null;
      }

      return {
        id,
        title,
        severity,
        category,
        description,
        sanction,
        examples,
      };
    })
    .filter((value): value is RuleItem => value !== null);

  return {
    rules: parsedRules.length > 0 ? parsedRules : fallbackRules,
  };
}

function RuleCard({ item }: { item: RuleItem }) {
  const severity = severityMeta[item.severity];
  const category = categoryMeta[item.category];

  return (
    <article
      className={`rounded-2xl border bg-(--surface-container-low) p-5 shadow-(--soft-shadow) transition hover:-translate-y-px hover:border-(--primary)/35 ${severity.ringClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-(--primary)">
            {category.icon}
          </span>
          <p className="font-label text-[10px] tracking-[0.15em] text-(--muted)">
            {category.label}
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full border border-current/25 px-2.5 py-1 text-xs ${severity.badgeClass}`}
        >
          <span className="material-symbols-outlined text-sm">
            {severity.icon}
          </span>
          <span>{severity.label}</span>
        </div>
      </div>

      <h3 className="mt-3 font-headline text-2xl font-bold tracking-tight">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-(--muted)">
        {item.description}
      </p>

      <div className="mt-4 rounded-xl border border-(--outline-variant)/45 bg-(--surface)/75 p-3">
        <p className="font-label text-[10px] tracking-[0.15em] text-(--muted)">
          SANCTION INDICATIVE
        </p>
        <p className="mt-1 text-sm">{item.sanction}</p>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-(--muted)">
        {item.examples.map((example) => (
          <li key={example} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
            <span>{example}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RulesPage() {
  const [rulesData, setRulesData] = useState<RuleItem[]>(fallbackRules);
  const [loadingRules, setLoadingRules] = useState(true);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<RuleCategory | "all">(
    "all",
  );
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  const [isHoldingAccept, setIsHoldingAccept] = useState(false);
  const [acceptHoldProgress, setAcceptHoldProgress] = useState(0);
  const acceptFrameRef = useRef<number | null>(null);
  const acceptStartTimeRef = useRef<number | null>(null);
  const acceptedRef = useRef(false);
  const acceptPointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadRules = async () => {
      setLoadingRules(true);
      try {
        const response = await fetch("/data/rules.json", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as unknown;
        const parsed = parseRulesPayload(payload);
        if (!active) return;
        setRulesData(parsed.rules);
        setRulesError(null);
      } catch {
        if (!active) return;
        setRulesData(fallbackRules);
        setRulesError("Regles chargees en mode local (fallback). ");
      } finally {
        if (active) {
          setLoadingRules(false);
        }
      }
    };

    loadRules();

    return () => {
      active = false;
    };
  }, []);

  const filteredRules = useMemo(() => {
    return rulesData.filter((rule) => {
      return activeCategory === "all" || rule.category === activeCategory;
    });
  }, [activeCategory, rulesData]);

  const categoryCounts = useMemo(() => {
    return {
      all: rulesData.length,
      respect: rulesData.filter((rule) => rule.category === "respect").length,
      economy: rulesData.filter((rule) => rule.category === "economy").length,
      combat: rulesData.filter((rule) => rule.category === "combat").length,
      build: rulesData.filter((rule) => rule.category === "build").length,
    };
  }, [rulesData]);

  const strictCount = rulesData.filter(
    (rule) => rule.severity === "strict",
  ).length;
  const warningCount = rulesData.filter(
    (rule) => rule.severity === "warning",
  ).length;

  useEffect(() => {
    acceptedRef.current = hasAcceptedRules;
  }, [hasAcceptedRules]);

  useEffect(() => {
    return () => {
      if (acceptFrameRef.current !== null) {
        window.cancelAnimationFrame(acceptFrameRef.current);
      }
    };
  }, []);

  const stopAcceptHold = (
    resetProgress: boolean,
    target?: EventTarget | null,
  ) => {
    if (acceptFrameRef.current !== null) {
      window.cancelAnimationFrame(acceptFrameRef.current);
      acceptFrameRef.current = null;
    }

    if (
      target instanceof Element &&
      acceptPointerIdRef.current !== null &&
      target.hasPointerCapture(acceptPointerIdRef.current)
    ) {
      target.releasePointerCapture(acceptPointerIdRef.current);
    }

    acceptPointerIdRef.current = null;

    acceptStartTimeRef.current = null;
    setIsHoldingAccept(false);

    if (resetProgress && !acceptedRef.current) {
      setAcceptHoldProgress(0);
    }
  };

  const runAcceptHoldFrame = (timestamp: number) => {
    if (acceptStartTimeRef.current === null) {
      acceptStartTimeRef.current = timestamp;
    }

    const elapsed = timestamp - acceptStartTimeRef.current;
    const nextProgress = Math.min(1, elapsed / HOLD_TO_ACCEPT_MS);
    setAcceptHoldProgress(nextProgress);

    if (nextProgress >= 1) {
      acceptedRef.current = true;
      setHasAcceptedRules(true);
      setIsHoldingAccept(false);
      acceptFrameRef.current = null;
      return;
    }

    acceptFrameRef.current = window.requestAnimationFrame(runAcceptHoldFrame);
  };

  const startAcceptHold = () => {
    if (acceptedRef.current || isHoldingAccept) return;

    if (acceptFrameRef.current !== null) {
      window.cancelAnimationFrame(acceptFrameRef.current);
    }

    setAcceptHoldProgress(0);
    setIsHoldingAccept(true);
    acceptStartTimeRef.current = null;
    acceptFrameRef.current = window.requestAnimationFrame(runAcceptHoldFrame);
  };

  return (
    <section className="space-y-6">
      <PageHero
        badge="REGLEMENT OFFICIEL"
        title="Un gameplay propre,"
        highlight="zero abus."
        description="Ces regles maintiennent un serveur stable, juste et competitif. Respecte-les pour proteger l'experience de toute la communaute."
        actions={
          <>
            <a
              href="#liste-regles"
              className="game-chip game-chip-active rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:-translate-y-px"
            >
              VOIR LES REGLES
            </a>
            <a
              href="#barre-filtres"
              className="game-chip rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] transition hover:border-(--primary)/50"
            >
              FILTRES
            </a>
          </>
        }
      />

      <div className="hud-divider" />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="text-sm text-(--muted)">Total de regles</p>
          <p className="mt-1 font-headline text-3xl font-bold">
            {rulesData.length}
          </p>
        </article>
        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="text-sm text-(--muted)">Interdictions strictes</p>
          <p className="mt-1 font-headline text-3xl font-bold text-(--primary)">
            {strictCount}
          </p>
        </article>
        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="text-sm text-(--muted)">Avertissements actifs</p>
          <p className="mt-1 font-headline text-3xl font-bold text-(--secondary)">
            {warningCount}
          </p>
        </article>
      </section>

      <section id="barre-filtres">
        <article className="premium-surface shimmer-border sticky top-3 z-20 rounded-2xl p-5 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
                  FILTRAGE DES REGLES
                </p>
                <p className="mt-1 text-sm text-(--muted)">
                  {filteredRules.length} resultat(s) affiches sur{" "}
                  {rulesData.length}
                </p>
              </div>

              <button
                onClick={() => setActiveCategory("all")}
                className="rounded-full border border-(--outline-variant)/45 bg-(--surface)/75 px-4 py-2 font-label text-[10px] tracking-[0.14em] text-(--muted) transition hover:border-(--primary)/45 hover:text-(--on-background)"
              >
                REINITIALISER
              </button>
            </div>

            <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface)/70 p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`premium-lift inline-flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${activeCategory === "all" ? "border-(--primary)/60 bg-(--primary)/12 text-(--on-background)" : "border-(--outline-variant)/45 bg-(--surface) text-(--muted) hover:border-(--primary)/35"}`}
                >
                  <span className="font-medium">Toutes</span>
                  <span className="rounded-full bg-(--surface-container-high) px-2 py-0.5 text-xs">
                    {categoryCounts.all}
                  </span>
                </button>
                {(Object.keys(categoryMeta) as RuleCategory[]).map(
                  (categoryKey) => (
                    <button
                      key={categoryKey}
                      onClick={() => setActiveCategory(categoryKey)}
                      className={`premium-lift inline-flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${activeCategory === categoryKey ? "border-(--primary)/60 bg-(--primary)/12 text-(--on-background)" : "border-(--outline-variant)/45 bg-(--surface) text-(--muted) hover:border-(--primary)/35"}`}
                    >
                      <span className="inline-flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-base text-(--primary)">
                          {categoryMeta[categoryKey].icon}
                        </span>
                        {categoryMeta[categoryKey].label}
                      </span>
                      <span className="rounded-full bg-(--surface-container-high) px-2 py-0.5 text-xs">
                        {categoryCounts[categoryKey]}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </article>
      </section>

      {(loadingRules || rulesError) && (
        <section className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) px-4 py-3 text-sm text-(--muted)">
          {loadingRules ? "Chargement des regles JSON..." : rulesError}
        </section>
      )}

      <section id="liste-regles" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold">
            Regles detaillees
          </h3>
          <p className="text-sm text-(--muted)">
            {filteredRules.length} regle(s) affichee(s)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredRules.map((item) => (
            <RuleCard key={item.id} item={item} />
          ))}
        </div>

        {filteredRules.length === 0 && (
          <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 text-center">
            <p className="font-headline text-xl font-bold">
              Aucune regle trouvee
            </p>
            <p className="mt-2 text-sm text-(--muted)">
              Ajuste les filtres pour afficher une categorie ou une severite
              differente.
            </p>
          </article>
        )}
      </section>

      <section className="space-y-4">
        <article className="premium-surface shimmer-border rounded-2xl p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
                CONFIRMATION JOUEUR
              </p>
              <h3 className="mt-1 font-headline text-2xl font-bold">
                Pret a rejoindre Path of Endalor
              </h3>
              <p className="mt-2 text-sm text-(--muted)">
                Confirme ton acceptation du reglement pour debloquer le guide
                d'installation client.
              </p>
            </div>

            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                acceptPointerIdRef.current = event.pointerId;
                event.currentTarget.setPointerCapture(event.pointerId);
                startAcceptHold();
              }}
              onPointerUp={(event) => stopAcceptHold(true, event.currentTarget)}
              onPointerCancel={(event) =>
                stopAcceptHold(true, event.currentTarget)
              }
              onLostPointerCapture={(event) =>
                stopAcceptHold(true, event.currentTarget)
              }
              onKeyDown={(event) => {
                if (
                  (event.key === " " || event.key === "Enter") &&
                  !event.repeat
                ) {
                  event.preventDefault();
                  startAcceptHold();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  stopAcceptHold(true);
                }
              }}
              style={
                {
                  "--accept-progress": `${Math.round(acceptHoldProgress * 100)}%`,
                } as CSSProperties
              }
              className={`rules-accept-btn game-chip rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] transition ${
                hasAcceptedRules
                  ? "game-chip-active text-(--on-background)"
                  : "hover:border-(--primary)/55 hover:text-(--on-background)"
              }`}
            >
              <span className="rules-accept-btn-progress" aria-hidden="true" />
              <span
                className={`rules-accept-btn-loader ${isHoldingAccept ? "is-active" : ""}`}
                aria-hidden="true"
              />
              <span className="relative z-1">
                {hasAcceptedRules
                  ? "REGLEMENT ACCEPTE"
                  : isHoldingAccept
                    ? `MAINTIENS... ${Math.max(1, Math.round(acceptHoldProgress * 100))}%`
                    : "MAINTENIR 2S POUR ACCEPTER LE REGLEMENT"}
              </span>
            </button>
          </div>

          {!hasAcceptedRules && (
            <p className="text-xs text-(--muted)">
              Maintiens le bouton enfonce pendant 2 secondes pour debloquer le
              guide d'installation.
            </p>
          )}
        </article>

        {hasAcceptedRules && (
          <article className="premium-surface shimmer-border fade-in-up rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-label text-[10px] tracking-[0.16em] text-(--primary)">
                  INSTALLATION CLIENT
                </p>
                <h3 className="mt-1 font-headline text-3xl font-bold tracking-tight">
                  Guide d'installation Minecraft
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-(--muted)">
                  Suis ces etapes pour installer proprement le client et
                  rejoindre le serveur sans conflit de mods.
                </p>
              </div>

              <span className="game-chip game-chip-active rounded-full px-3 py-1 font-label text-[10px] tracking-[0.14em] text-(--on-background)">
                ONBOARDING DEBLOQUE
              </span>
            </div>

            <div className="my-5 hud-divider" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {clientSetupSteps.map((step, index) => (
                <article
                  key={step.id}
                  className="game-panel premium-lift rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--primary)/16 font-label text-[10px] tracking-[0.14em] text-(--primary)">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="material-symbols-outlined text-(--primary)">
                          {step.icon}
                        </span>
                        <h4 className="font-headline text-xl font-bold">
                          {step.title}
                        </h4>
                      </div>

                      <p className="mt-2 text-sm text-(--muted)">
                        {step.description}
                      </p>

                      <ul className="mt-3 space-y-1.5 text-sm text-(--muted)">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {CLIENT_PACK_URL ? (
                <a
                  href={CLIENT_PACK_URL}
                  className="game-chip game-chip-active inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:-translate-y-px"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  TELECHARGER LES MODS ET FICHIERS NECESSAIRES
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="game-chip inline-flex cursor-not-allowed items-center gap-2 rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] text-(--muted) opacity-75"
                >
                  <span className="material-symbols-outlined text-base">
                    hourglass_top
                  </span>
                  PACK CLIENT BIENTOT DISPONIBLE
                </button>
              )}

              <span className="text-xs text-(--muted)">
                Le bouton de telechargement sera actif des que le pack officiel
                sera configure.
              </span>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}

export default RulesPage;
