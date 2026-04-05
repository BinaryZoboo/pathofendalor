import { Fragment, useEffect, useMemo, useState } from "react";

import heroCraft from "../assets/herobg/hoteldeville.webp";
import PageHero from "../components/PageHero";

type CommandCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

type CommandEntry = {
  id: string;
  title: string;
  command: string;
  description: string;
  categoryId: string;
  access: "Joueur" | "VIP" | "Staff";
  aliases: string[];
  example?: string;
  cooldown?: string;
  usages?: string[];
};

type CommandTip = {
  id: string;
  title: string;
  icon: string;
  description: string;
};

type CommandsPayload = {
  updatedAt: string;
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
  };
  categories: CommandCategory[];
  commands: CommandEntry[];
  tips: CommandTip[];
};

const fallbackCommandsData: CommandsPayload = {
  updatedAt: "2026-04-05",
  hero: {
    eyebrow: "WIKI JOUEURS",
    title: "Commandes utiles",
    highlight: " pour une survie reussie",
  },
  categories: [
    {
      id: "profil",
      label: "Profil",
      icon: "account_circle",
      description: "Infos perso, progression et stats de base.",
    },
    {
      id: "economie",
      label: "Economie",
      icon: "payments",
      description: "Argent, echanges et commandes de marche.",
    },
    {
      id: "teleport",
      label: "Teleport",
      icon: "explore",
      description: "Maison, retour rapide et deplacements utiles.",
    },
    {
      id: "guilde",
      label: "Guilde",
      icon: "groups",
      description: "Outils de groupe, invitations et coordination.",
    },
  ],
  commands: [
    {
      id: "back",
      title: "Retour TP precedent",
      command: "/back",
      description:
        "Retourne a l'emplacement precedent de ta derniere teleportation.",
      categoryId: "teleport",
      access: "Joueur",
      aliases: ["/back"],
      example: "/back",
      usages: ["Erreur de position", "Echapper a une situation dangereuse"],
    },
    {
      id: "delhome",
      title: "Supprimer un home",
      command: "/delhome <nom>",
      description: "Supprime un point de retour personnalise.",
      categoryId: "teleport",
      access: "VIP",
      aliases: [],
      example: "/delhome base",
      usages: ["Supprimer un home inutile", "Reorganiser ses points de retour"],
    },
    {
      id: "eco bal",
      title: "Verifier ta balance",
      command: "/eco bal",
      description: "Consulte ton solde en direct.",
      categoryId: "economie",
      access: "Joueur",
      aliases: ["/eco bal"],
      example: "/eco bal",
      usages: ["Verifier ton budget"],
    },
    {
      id: "pay",
      title: "Payer un joueur",
      command: "/pay <joueur> <montant>",
      description: "Envoie de l'argent a un autre joueur.",
      categoryId: "economie",
      access: "Joueur",
      aliases: [],
      example: "/pay Nathan 2500",
      cooldown: "3s",
      usages: ["Payer un service", "Rembourser un membre de guilde"],
    },
    {
      id: "ah",
      title: "Ouvrir l'hotel des ventes",
      command: "/ah",
      description: "Acces rapide au marche global.",
      categoryId: "economie",
      access: "Joueur",
      aliases: ["/auctionhouse"],
      example: "/ah",
      usages: ["Acheter des ressources", "Lister des items a vendre"],
    },
    {
      id: "sethome",
      title: "Definir un home",
      command: "/sethome <nom>",
      description: "Cree un point de retour personnalise.",
      categoryId: "teleport",
      access: "VIP",
      aliases: [],
      example: "/sethome base",
      usages: ["Poser un point a la base", "Sauvegarder un spot de farm"],
    },
    {
      id: "home",
      title: "Retour a un home",
      command: "/home <nom>",
      description: "Teleportation vers un point sauvegarde.",
      categoryId: "teleport",
      access: "VIP",
      aliases: [],
      example: "/home base",
      cooldown: "10s",
      usages: ["Retour rapide apres raid", "Revenir au stockage"],
    },
    {
      id: "spawn",
      title: "Retour spawn",
      command: "/spawn",
      description: "Retourne au spawn principal du serveur.",
      categoryId: "teleport",
      access: "Joueur",
      aliases: [],
      example: "/spawn",
      cooldown: "5s",
      usages: ["Retrouver les PNJ", "Se replacer en zone safe"],
    },
    {
      id: "guild-create",
      title: "Creer une guilde",
      command: "/guild create <nom>",
      description: "Cree une nouvelle guilde pour ton groupe.",
      categoryId: "guilde",
      access: "Joueur",
      aliases: ["/g create <nom>"],
      example: "/guild create Eclipse",
      usages: ["Lancer une nouvelle team", "Structurer un roster"],
    },
    {
      id: "guild-invite",
      title: "Inviter un joueur",
      command: "/guild invite <joueur>",
      description: "Invite un joueur a rejoindre ta guilde.",
      categoryId: "guilde",
      access: "Joueur",
      aliases: ["/g invite <joueur>"],
      example: "/guild invite Sara",
      usages: ["Recruter un joueur", "Inviter un ami"],
    },
  ],
  tips: [
    {
      id: "quick-copy",
      title: "Copie instantanee",
      icon: "content_copy",
      description:
        "Utilise le bouton copier pour envoyer vite les commandes en jeu.",
    },
    {
      id: "search",
      title: "Recherche rapide",
      icon: "manage_search",
      description:
        "Tape un mot-cle, un alias ou une commande pour filtrer la liste.",
    },
    {
      id: "access",
      title: "Niveau d'acces",
      icon: "verified_user",
      description: "Chaque commande indique son acces: Joueur, VIP ou Staff.",
    },
  ],
};

function parseCommandsPayload(payload: unknown): CommandsPayload {
  if (!payload || typeof payload !== "object") {
    return fallbackCommandsData;
  }

  const source = payload as Partial<CommandsPayload>;

  if (
    !source.hero ||
    !Array.isArray(source.categories) ||
    !Array.isArray(source.commands) ||
    !Array.isArray(source.tips)
  ) {
    return fallbackCommandsData;
  }

  return {
    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : fallbackCommandsData.updatedAt,
    hero: {
      eyebrow:
        typeof source.hero.eyebrow === "string"
          ? source.hero.eyebrow
          : fallbackCommandsData.hero.eyebrow,
      title:
        typeof source.hero.title === "string"
          ? source.hero.title
          : fallbackCommandsData.hero.title,
      highlight:
        typeof source.hero.highlight === "string"
          ? source.hero.highlight
          : fallbackCommandsData.hero.highlight,
    },
    categories: source.categories.filter(
      (category): category is CommandCategory =>
        !!category &&
        typeof category.id === "string" &&
        typeof category.label === "string" &&
        typeof category.icon === "string" &&
        typeof category.description === "string",
    ),
    commands: source.commands.filter(
      (command): command is CommandEntry =>
        !!command &&
        typeof command.id === "string" &&
        typeof command.title === "string" &&
        typeof command.command === "string" &&
        typeof command.description === "string" &&
        typeof command.categoryId === "string" &&
        (command.access === "Joueur" ||
          command.access === "VIP" ||
          command.access === "Staff") &&
        Array.isArray(command.aliases) &&
        (typeof command.example === "undefined" ||
          typeof command.example === "string") &&
        (typeof command.cooldown === "undefined" ||
          typeof command.cooldown === "string") &&
        (typeof command.usages === "undefined" ||
          (Array.isArray(command.usages) &&
            command.usages.every((usage) => typeof usage === "string"))),
    ),
    tips: source.tips.filter(
      (tip): tip is CommandTip =>
        !!tip &&
        typeof tip.id === "string" &&
        typeof tip.title === "string" &&
        typeof tip.icon === "string" &&
        typeof tip.description === "string",
    ),
  };
}

function getAccessClass(access: CommandEntry["access"]): string {
  if (access === "Staff") {
    return "border-rose-300/55 bg-rose-500/16 text-rose-100";
  }
  if (access === "VIP") {
    return "border-cyan-300/55 bg-cyan-500/16 text-cyan-100";
  }
  return "border-emerald-300/55 bg-emerald-500/16 text-emerald-100";
}

function CraftPage() {
  const [commandsData, setCommandsData] =
    useState<CommandsPayload>(fallbackCommandsData);
  const [loadingCommands, setLoadingCommands] = useState(true);
  const [commandsError, setCommandsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCommandId, setExpandedCommandId] = useState<string | null>(
    null,
  );
  const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCommands = async () => {
      setLoadingCommands(true);

      try {
        const response = await fetch("/data/commands.json", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as unknown;
        const parsed = parseCommandsPayload(payload);

        if (!active) return;
        setCommandsData(parsed);
        setCommandsError(null);
      } catch {
        if (!active) return;
        setCommandsData(fallbackCommandsData);
        setCommandsError("Wiki charge en mode local (fallback).");
      } finally {
        if (active) {
          setLoadingCommands(false);
        }
      }
    };

    loadCommands();

    return () => {
      active = false;
    };
  }, []);

  const filteredCommands = useMemo(() => {
    return commandsData.commands.filter((entry) => {
      if (selectedCategory !== "all" && entry.categoryId !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [commandsData.commands, selectedCategory]);

  const playerCommandsCount = useMemo(
    () =>
      commandsData.commands.filter((entry) => entry.access === "Joueur").length,
    [commandsData.commands],
  );

  const copyCommand = async (commandId: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommandId(commandId);
      window.setTimeout(() => setCopiedCommandId(null), 1300);
    } catch {
      setCopiedCommandId(null);
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    return (
      commandsData.categories.find((category) => category.id === categoryId)
        ?.label ?? categoryId
    );
  };

  const toggleCommandDetails = (commandId: string) => {
    setExpandedCommandId((current) =>
      current === commandId ? null : commandId,
    );
  };

  return (
    <section className="space-y-6">
      <PageHero
        badge={commandsData.hero.eyebrow}
        title={commandsData.hero.title}
        highlight={commandsData.hero.highlight}
        description="Toutes les commandes utiles au meme endroit: filtre par categorie, puis copie la bonne commande en un clic."
        imageSrc={heroCraft}
      />

      {commandsError && (
        <div className="game-panel rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {commandsError}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
            COMMANDES TOTAL
          </p>
          <p className="mt-2 font-headline text-4xl font-bold">
            {commandsData.commands.length}
          </p>
        </article>

        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
            COMMANDES JOUEUR
          </p>
          <p className="mt-2 font-headline text-4xl font-bold">
            {playerCommandsCount}
          </p>
        </article>

        <article className="game-panel premium-lift rounded-2xl p-5">
          <p className="font-label text-[10px] tracking-[0.16em] text-(--muted)">
            DERNIERE MAJ
          </p>
          <p className="mt-2 font-headline text-3xl font-bold md:text-4xl">
            {commandsData.updatedAt}
          </p>
        </article>
      </section>

      <section className="rounded-2xl p-5">
        <p className="font-label text-[10px] tracking-[0.18em] text-(--muted) pb-2">
          FILTRE PAR CATEGORIE
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {loadingCommands && (
            <span className="game-chip rounded-full px-2.5 py-1 font-label text-[10px] tracking-[0.14em] text-(--muted)">
              Chargement...
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full border px-3 py-1.5 font-label text-[10px] tracking-[0.14em] transition ${
              selectedCategory === "all"
                ? "border-(--primary) bg-(--primary)/16 text-(--on-background)"
                : "border-(--outline-variant)/70 text-(--muted) hover:text-(--on-background)"
            }`}
          >
            TOUTES
          </button>

          {commandsData.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full border px-3 py-1.5 font-label text-[10px] tracking-[0.14em] transition ${
                selectedCategory === category.id
                  ? "border-(--primary) bg-(--primary)/16 text-(--on-background)"
                  : "border-(--outline-variant)/70 text-(--muted) hover:text-(--on-background)"
              }`}
              title={category.description}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold md:text-3xl">
            Tableau des commandes
          </h3>
          <span className="game-chip rounded-full px-2.5 py-1 font-label text-[10px] tracking-[0.14em] text-(--muted)">
            {filteredCommands.length} resultat(s)
          </span>
        </div>

        {filteredCommands.length === 0 ? (
          <article className="game-panel rounded-2xl p-6 text-sm text-(--muted)">
            Aucune commande ne correspond au filtre actuel.
          </article>
        ) : (
          <div className="game-panel overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-(--surface-container-high)/80 text-left">
                    <th className="px-4 py-3 font-label text-[10px] tracking-[0.14em] text-(--muted)">
                      COMMANDE
                    </th>
                    <th className="px-4 py-3 font-label text-[10px] tracking-[0.14em] text-(--muted)">
                      TITRE
                    </th>
                    <th className="px-4 py-3 font-label text-[10px] tracking-[0.14em] text-(--muted)">
                      CATEGORIE
                    </th>
                    <th className="px-4 py-3 font-label text-[10px] tracking-[0.14em] text-(--muted)">
                      ACCES
                    </th>
                    <th className="px-4 py-3 text-right font-label text-[10px] tracking-[0.14em] text-(--muted)">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCommands.map((entry) => {
                    const isExpanded = expandedCommandId === entry.id;

                    return (
                      <Fragment key={entry.id}>
                        <tr
                          className="cursor-pointer border-t border-(--outline-variant)/60 transition hover:bg-(--surface-container-high)/55"
                          onClick={() => toggleCommandDetails(entry.id)}
                        >
                          <td className="px-4 py-3">
                            <code className="font-mono text-sm text-(--on-background)">
                              {entry.command}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-(--on-background)">
                            {entry.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-(--muted)">
                            {getCategoryLabel(entry.categoryId)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2.5 py-1 font-label text-[10px] tracking-[0.14em] ${getAccessClass(entry.access)}`}
                            >
                              {entry.access}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  copyCommand(entry.id, entry.command);
                                }}
                                className="rounded-lg border border-(--outline-variant)/70 px-2.5 py-1 font-label text-[10px] tracking-[0.12em] text-(--muted) transition hover:text-(--on-background)"
                              >
                                {copiedCommandId === entry.id
                                  ? "COPIE"
                                  : "COPIER"}
                              </button>

                              <span className="material-symbols-outlined text-[18px] text-(--muted)">
                                {isExpanded ? "expand_less" : "expand_more"}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-(--surface-container-high)/35">
                            <td colSpan={5} className="px-4 py-4">
                              <div className="space-y-2 text-sm">
                                <p className="text-(--on-background)">
                                  {entry.description}
                                </p>
                                {entry.example && (
                                  <p className="text-(--muted)">
                                    Utilisation: {entry.example}
                                  </p>
                                )}
                                {entry.aliases.length > 0 && (
                                  <p className="text-(--muted)">
                                    Alias: {entry.aliases.join(" | ")}
                                  </p>
                                )}
                                {entry.cooldown && (
                                  <p className="text-(--muted)">
                                    Cooldown: {entry.cooldown}
                                  </p>
                                )}
                                {(entry.usages ?? []).length > 0 && (
                                  <p className="text-(--muted)">
                                    Utilisations possibles:{" "}
                                    {(entry.usages ?? []).join(" | ")}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default CraftPage;
