import { type ReactNode } from "react";

type PageHeroProps = {
  badge: string;
  title: string;
  highlight?: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  actions?: ReactNode;
};

function PageHero({
  badge,
  title,
  highlight,
  description,
  imageSrc,
  imageAlt,
  actions,
}: PageHeroProps) {
  return (
    <section className="premium-surface shimmer-border relative overflow-hidden rounded-3xl p-6 md:p-10">
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover opacity-50 brightness-110 contrast-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-(--background) via-(--background)/60 to-transparent" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-(--primary)/16 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-(--secondary)/12 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-r from-(--background) via-(--background)/82 to-transparent" />
        </>
      )}

      <div className="relative z-10 max-w-3xl">
        <p className="font-label text-[10px] tracking-[0.25em] text-(--muted)">
          {badge}
        </p>
        <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-6xl">
          {title}
          {highlight ? (
            <span className="hero-gradient-text block">{highlight}</span>
          ) : null}
        </h2>
        <p className="mt-4 max-w-2xl text-(--muted)">{description}</p>
        {actions ? (
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

export default PageHero;
