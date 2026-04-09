import { Fragment, useEffect, useMemo, useState } from "react";

import heroCraft from "../assets/herobg/craft.webp";
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
  access: "IOI" | "VIP" | "DEV";
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
  updatedAt: "2026-04-09",
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
      access: "IOI",
      aliases: ["/back"],
      example: "/back",
      usages: ["Erreur de position", "Echapper a une situation dangereuse"],
    },
    {
      id: "eco bal",
      title: "Verifier ta balance",
      command: "/eco bal",
      description: "Consulte ton solde en direct.",
      categoryId: "economie",
      access: "IOI",
      aliases: ["/eco bal"],
      example: "/eco bal",
      usages: ["Verifier ton budget"],
    },
    {
      id: "eco daily",
      title: "Recevoir sa daily",
      command: "/eco daily",
      description: "Recois ton salaire quotidien.",
      categoryId: "economie",
      access: "IOI",
      aliases: [],
      example: "/eco daily",
      usages: ["Recevoir son salaire", "Collecter une recompense quotidienne"],
    },
    {
      id: "eco orders request",
      title: "faire une commande",
      command: "/eco orders request <item> <quantite> <prix>",
      description:
        "Poster une demande d'achat pour un item specifique. IMPORTANT: Le nom de l'item doit etre son nom en anglais",
      categoryId: "economie",
      access: "IOI",
      aliases: ["/eco order request <item> <quantite> <prix>"],
      example: "/eco orders request iron_sword 1 10",
      usages: ["Trouver un item specifique"],
    },
    {
      id: "eco orders claim",
      title: "Reclamer ses commandes",
      command: "/eco orders claim",
      description: "Ouvre le menu et reclame les commandes que tu as poste.",
      categoryId: "economie",
      access: "IOI",
      aliases: [],
      example: "/eco orders claim",
      usages: [
        "Reclamer une commande completee",
        "Suivre ses commandes en cours",
      ],
    },
    {
      id: "/eco sell",
      title: "Vendre un item",
      command: "/eco sell <quantite>",
      description:
        "Vendre l'item en main au serveur au prix marche du serveur.",
      categoryId: "economie",
      access: "IOI",
      aliases: ["/eco sell <quantite>"],
      example: "/eco sell 2",
      usages: ["Vendre un item", "Obtenir de l'argent"],
    },
    {
      id: "/eco pay",
      title: "Payer un joueur",
      command: "/eco pay <joueur> <montant>",
      description: "Envoie de l'argent a un joueur.",
      categoryId: "economie",
      access: "IOI",
      aliases: ["/eco pay <joueur> <montant>"],
      example: "/eco pay Sara 100",
      usages: ["Payer un joueur", "Faire un echange rapide"],
    },
    {
      id: "/eco servershop",
      title: "Ouvrir le shop du serveur",
      command: "/eco servershop",
      description: "Ouvre le menu du shop du serveur.",
      categoryId: "economie",
      access: "IOI",
      aliases: [""],
      example: "/eco servershop",
      usages: ["Acheter des items", "Voir les offres du serveur"],
    },
    {
      id: "/eco shop",
      title: "Ouvrir le shop joueur/marche",
      command: "/eco shop",
      description: "Ouvre le menu du marché des joueurs.",
      categoryId: "economie",
      access: "IOI",
      aliases: [""],
      example: "/eco shop",
      usages: [
        "Acheter des items non disponibles sur le shop du serveur",
        "Acheter des items specifiques a d'autres joueurs",
      ],
    },
    {
      id: "/eco shop list <prix>",
      title: "Mettre un item en vente",
      command: "/eco shop list <prix>",
      description: "Mets un item en vente sur le marché des joueurs.",
      categoryId: "economie",
      access: "IOI",
      aliases: [""],
      example: "/eco shop list 10",
      usages: [
        "Mettre un item en vente",
        "Tirer des profits sur un objets rare ou en demande",
      ],
    },
    {
      id: "/exalt",
      title: "Obtiens un enchantement aleatoire",
      command: "/exalt",
      description:
        "Obtient un enchantement aléatoire pour ton item. Il faut tenir une exalt orb",
      categoryId: "inventaire",
      access: "IOI",
      aliases: [""],
      example: "/exalt",
      usages: ["Améliorer un item de manière imprévisible"],
    },
    {
      id: "home set",
      title: "Definir un home",
      command: "/home set <nom>",
      description: "Cree un point de retour personnalise.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/home set base",
      usages: ["Poser un point a la base", "Sauvegarder un spot de farm"],
    },
    {
      id: "home delete",
      title: "Supprimer un home",
      command: "/home delete <nom>",
      description: "Supprime un point de retour personnalise.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/home delete base",
      usages: ["Supprimer un home inutile", "Reorganiser ses points de retour"],
    },
    {
      id: "home tp",
      title: "Retour a un home",
      command: "/home tp <nom>",
      description: "Teleportation vers un point sauvegarde.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/home tp base",
      cooldown: "10s",
      usages: ["Retour rapide apres raid", "Revenir au stockage"],
    },
    {
      id: "home list",
      title: "Liste des homes",
      command: "/home list",
      description: "Affiche la liste de tous les points de retour sauvegardes.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/home list",
      cooldown: "10s",
      usages: ["Voir tous ses points de retour", "Gérer ses homes"],
    },
    {
      id: "spawn",
      title: "Retour spawn",
      command: "/spawn",
      description: "Retourne au spawn principal du serveur.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/spawn",
      usages: ["Retrouver les PNJ", "Se replacer en zone safe"],
    },
    {
      id: "ps player info",
      title: "Connaitre son niveau de difficulte",
      command: "/ps_player info",
      description:
        "Affiche la difficulte actuelle du joueur et les details de son progression.",
      categoryId: "general",
      access: "IOI",
      aliases: [],
      example: "/ps_player info",
      usages: ["Voir sa difficulte", "Connaitre la difficulte de la zone"],
    },
    {
      id: "tpa",
      title: "Demander a se teleporter",
      command: "/tpa <joueur>",
      description: "Envoie une demande de téléportation à un joueur.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/tpa <joueur>",
      usages: [
        "Demander à un joueur de se téléporter vers lui",
        "Rejoindre un ami rapidement",
      ],
    },
    {
      id: "tpaccept",
      title: "Accepter une demande de téléportation",
      command: "/tpaccept <joueur>",
      description:
        "Accepte une demande de téléportation envoyée par un autre joueur.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/tpaccept <joueur>",
      usages: ["Accepter une demande de téléportation", "Deplacer un joueur"],
    },
    {
      id: "tpdeny",
      title: "Refuser une demande de téléportation",
      command: "/tpdeny <joueur>",
      description:
        "Refuse une demande de téléportation envoyée par un autre joueur.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/tpdeny <joueur>",
      usages: ["Refuser une demande de téléportation"],
    },
    {
      id: "tpahere",
      title: "Demander a se teleporter ici",
      command: "/tpahere <joueur>",
      description:
        "Envoie une demande de téléportation à un joueur, lui demandant de se téléporter vers vous.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/tpahere <joueur>",
      usages: [
        "Demander à un joueur de se téléporter vers vous",
        "Attirer un ami de vous rejoindre",
      ],
    },
    {
      id: "warp tp",
      title: "Se téléporter vers un point de warp",
      command: "/warp tp <nom>",
      description: "Téléporte le joueur vers un point de warp enregistré.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/warp tp event",
      usages: [
        "Se déplacer rapidement entre zones",
        "Accéder à des endroits spécifiques",
      ],
    },
    {
      id: "warp list",
      title: "Liste des warps",
      command: "/warp list",
      description: "Affiche la liste de tous les points de warp enregistrés.",
      categoryId: "teleport",
      access: "IOI",
      aliases: [],
      example: "/warp list",
      usages: ["Voir tous les points de warp disponibles"],
    },
    {
      id: "workbench",
      title: "Ouvrir un établi portable",
      command: "/workbench",
      description: "Ouvre le menu de ton établi portable.",
      categoryId: "general",
      access: "VIP",
      aliases: [],
      example: "/workbench",
      usages: [
        "Craft rapide en déplacement",
        "Accéder à un établi sans en poser un",
      ],
    },
    {
      id: "grindstone",
      title: "Ouvrir un grindstone portable",
      command: "/grindstone",
      description: "Ouvre le menu de ton grindstone portable.",
      categoryId: "general",
      access: "VIP",
      aliases: [],
      example: "/grindstone",
      usages: [
        "Désenchanter des items en déplacement",
        "Accéder à un grindstone sans en poser un",
      ],
    },
    {
      id: "stonecutter",
      title: "Ouvrir un stonecutter portable",
      command: "/stonecutter",
      description: "Ouvre le menu de ton stonecutter portable.",
      categoryId: "general",
      access: "VIP",
      aliases: [],
      example: "/stonecutter",
      usages: [
        "Couper des blocs en déplacement",
        "Accéder à un stonecutter sans en poser un",
      ],
    },
    {
      id: "wastebin",
      title: "Ouvrir une poubelle portable",
      command: "/wastebin",
      description: "Ouvre le menu de ta poubelle portable.",
      categoryId: "general",
      access: "VIP",
      aliases: [],
      example: "/wastebin",
      usages: [
        "Jeter des items en déplacement",
        "Accéder à une poubelle sans en poser une",
      ],
    },
    {
      id: "/enderchest",
      title: "Ouvrir le coffre de l'ender",
      command: "/enderchest",
      description: "Ouvre le menu de ton coffre de l'ender.",
      categoryId: "inventaire",
      access: "IOI",
      aliases: [""],
      example: "/enderchest",
      usages: [
        "Stocker des items de manière sécurisée",
        "Accéder à son inventaire portable",
      ],
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
      description: "Chaque commande indique son acces: IOI ou VIP",
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
        (command.access === "IOI" ||
          command.access === "VIP" ||
          command.access === "DEV") &&
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
  if (access === "DEV") {
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
      commandsData.commands.filter((entry) => entry.access === "IOI").length,
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
