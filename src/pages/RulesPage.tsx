function RuleCard({ title, points }: { title: string; points: string[] }) {
  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6">
      <h3 className="font-headline text-2xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-(--muted)">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--primary)" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RulesPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 md:p-8">
        <p className="font-label text-[10px] tracking-[0.22em] text-(--muted)">
          DIRECTIVES DU SERVEUR
        </p>
        <h2 className="mt-2 font-headline text-4xl font-bold md:text-5xl">
          Un gameplay propre,
          <span className="text-(--primary)"> zero abus.</span>
        </h2>
      </article>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RuleCard
          title="Respect et fair-play"
          points={[
            "Toxicite et harcelement = ban.",
            "Pas de triche client (x-ray, speed, fly).",
            "Exploits a signaler immediatement.",
          ]}
        />
        <RuleCard
          title="Integrite economique"
          points={[
            "Scams et faux listings interdits.",
            "Aucun RMT (real money trading).",
            "Sanctions progressives jusqu'a la liste noire.",
          ]}
        />
      </div>
    </section>
  );
}

export default RulesPage;
