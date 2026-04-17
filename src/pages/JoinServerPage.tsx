import { useState } from "react";

import heroReglement from "../assets/herobg/reglement.webp";
import PageHero from "../components/PageHero";

type ClientSetupStep = {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
};

const INSTALL_TUTORIAL_VIDEO_URL =
  import.meta.env.VITE_INSTALL_TUTORIAL_YOUTUBE_URL ?? "";

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
      "Telecharge le launcher client de Neoforge sur le site officiel pour gerer proprement les mods.",
    details: [
      "voici le lien: https://neoforged.net/",
      "Si tu avais deja un profil neoforge, supprime-le de minecraft avant de continuer",
    ],
  },
  {
    id: "version",
    title: "Version Minecraft cible",
    icon: "tune",
    description:
      "Sur le site de neoforge, selectionne la version minecraft 1.21.1 et la version neoforge la plus recente.",
    details: ["Ne melange pas deux loaders differents"],
  },
  {
    id: "files-1",
    title: "Creation mods et fichiers",
    icon: "folder_zip",
    description: "Creation des fichiers mods, config, resourcepacks etc...",
    details: [
      "Pour creer les fichiers mod dans minecraft lance une premiere fois ton client puis quitte minecraft",
      "Si tu avais deja un profil neoforge auparavant, passe a l'etape suivante",
    ],
  },
  {
    id: "files-2",
    title: "Creation config et kubejs",
    icon: "folder_zip",
    description:
      "Telecharge le modpack ci-dessous, met les mods et lance une premiere fois minecraft",
    details: [
      "Place le contenu du dossier mods du modpack dans le dossier mods de ton profil neoforge",
      "Puis lance minecraft une premiere fois. Cela va creer les dossiers de config, resourcepacks, shaders et kubejs",
      "Une fois le demarrage termine, quitte minecraft pour passer a l'etape suivante",
    ],
  },
  {
    id: "files-3",
    title: "Placement des fichiers au bon endroit et lancement",
    icon: "folder_zip",
    description:
      "On va placer les fichiers du modpack au bon endroit et lancer minecraft.",
    details: [
      "Config : Il y a 2 fichiers, ces fichiers remplacent ceux deja present dans ton dossier config",
      "Kubejs : Il y a 2 dossiers, ces dossiers remplacent ceux deja present dans ton dossier kubejs",
      "Ressourcepacks : Il y a 1 dossier zip, ce dossier va dans ton dossier resourcepacks, il n'y a pas besoin de le dezipper",
      "Shaderpack : Il y a 1 dossier zip et un fichier txt, ils vont dans ton dossier shaderpack, il n'y a pas besoin de dezipper",
    ],
  },
  {
    id: "check",
    title: "Verification finale",
    icon: "verified",
    description: "Installation des shaders et resourcepacks",
    details: [
      "Lance un monde creatif plat en solo.",
      "Applique les shaders et resourcepacks dans les options de minecraft depuis ce monde solo",
    ],
  },
  {
    id: "launcher",
    title: "Rejoindre le serveur",
    icon: "rocket_launch",
    description:
      "Une fois que tout est en place, tu peux rejoindre le serveur avec ton client modde et profiter de l'aventure Path of Endalor.",
    details: [
      "IP serveur: xx.xx.xx.xx:xxxxx",
      "Merci de ne pas partager l'IP en dehors de cette page pour eviter des problemes... Cordialement.",
    ],
  },
];

function JoinServerPage() {
  const [modpackError, setModpackError] = useState<string | null>(null);
  const [isPreparingModpackDownload, setIsPreparingModpackDownload] =
    useState(false);

  const handleModpackDownload = async () => {
    if (isPreparingModpackDownload) return;

    setModpackError(null);
    setIsPreparingModpackDownload(true);

    try {
      const response = await fetch("/api/modpack-download-link", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        url?: string;
      };

      if (!payload.url) {
        throw new Error("Lien de telechargement indisponible");
      }

      window.location.href = payload.url;
    } catch {
      setModpackError(
        "Le telechargement securise est indisponible pour le moment.",
      );
    } finally {
      setIsPreparingModpackDownload(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHero
        badge="INSTALLATION CLIENT"
        title="Rejoindre le serveur"
        highlight="sans erreur."
        description="Suis ce guide officiel pas a pas pour installer correctement ton client modde et rejoindre Path of Endalor."
        imageSrc={heroReglement}
      />

      <article className="premium-surface shimmer-border fade-in-up rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-label text-[10px] tracking-[0.16em] text-(--primary)">
              ONBOARDING DEBLOQUE
            </p>
            <h3 className="mt-1 font-headline text-3xl font-bold tracking-tight">
              Guide d'installation Minecraft
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-(--muted)">
              Suis ces etapes pour installer proprement le client et rejoindre
              le serveur sans conflit de mods.
            </p>
          </div>
        </div>

        <div className="my-5 hud-divider" />

        <article className="game-panel premium-lift rounded-xl border border-(--primary)/25 bg-(--primary)/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-label text-[10px] tracking-[0.14em] text-(--primary)">
                TUTORIEL VIDEO
              </p>
              <h4 className="mt-1 font-headline text-xl font-bold">
                Regarder l'installation pas a pas pour les debutants
              </h4>
              <p className="mt-1 text-sm text-(--muted)">
                Visionne d'abord la video YouTube pour suivre l'installation
                complete avant de rejoindre le serveur.
              </p>
            </div>

            {INSTALL_TUTORIAL_VIDEO_URL ? (
              <a
                href={INSTALL_TUTORIAL_VIDEO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="game-chip game-chip-active inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:-translate-y-px"
              >
                <span className="material-symbols-outlined text-base">
                  play_circle
                </span>
                VOIR LE TUTO YOUTUBE
              </a>
            ) : (
              <span className="text-xs text-(--muted)">
                Ajoute VITE_INSTALL_TUTORIAL_YOUTUBE_URL dans .env pour afficher
                le lien video.
              </span>
            )}
          </div>
        </article>

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
          <button
            type="button"
            onClick={handleModpackDownload}
            disabled={isPreparingModpackDownload}
            className="game-chip game-chip-active inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-label text-[11px] tracking-[0.15em] text-(--on-background) transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-base">
              {isPreparingModpackDownload ? "hourglass_top" : "download"}
            </span>
            {isPreparingModpackDownload
              ? "PREPARATION DU TELECHARGEMENT..."
              : "TELECHARGER LES MODS ET FICHIERS NECESSAIRES"}
          </button>
        </div>

        {modpackError && (
          <p className="mt-3 text-sm text-(--secondary)">{modpackError}</p>
        )}
      </article>
    </section>
  );
}

export default JoinServerPage;
