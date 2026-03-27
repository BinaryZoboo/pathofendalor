function CraftStep({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-5">
      <span className="material-symbols-outlined text-(--primary)">{icon}</span>
      <h3 className="mt-2 font-headline text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-(--muted)">{description}</p>
    </article>
  );
}

function RecipeCard({
  name,
  station,
  ingredients,
}: {
  name: string;
  station: string;
  ingredients: string[];
}) {
  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-5">
      <p className="font-label text-[10px] tracking-[0.14em] text-(--primary)">
        {station}
      </p>
      <h4 className="mt-2 font-headline text-xl font-bold">{name}</h4>
      <ul className="mt-3 space-y-1 text-sm text-(--muted)">
        {ingredients.map((ingredient) => (
          <li key={ingredient}>- {ingredient}</li>
        ))}
      </ul>
    </article>
  );
}

function CraftPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 md:p-8">
        <p className="font-label text-[10px] tracking-[0.22em] text-(--muted)">
          ATELIERS ET ARTISANAT
        </p>
        <h2 className="mt-2 font-headline text-4xl font-bold md:text-5xl">
          Systeme de craft,
          <span className="text-(--primary)"> progression par metier.</span>
        </h2>
      </article>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CraftStep
          icon="construction"
          title="1. Recolte"
          description="Mine, peche et collecte pour recuperer les materiaux de base."
        />
        <CraftStep
          icon="build"
          title="2. Transformation"
          description="Utilise la forge, l'alchimie et l'enchantement pour ameliorer ton equipement."
        />
        <CraftStep
          icon="bolt"
          title="3. Optimisation"
          description="Ajoute des runes et bonus de set pour atteindre les paliers de raid."
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecipeCard
          station="FORGE"
          name="Lame d'endalium"
          ingredients={[
            "8x Lingot d'endalium",
            "2x Noyau infernal",
            "1x Catalyseur ancien",
          ]}
        />
        <RecipeCard
          station="ALCHIMIE"
          name="Potion d'eveil"
          ingredients={[
            "4x Herbier lunaire",
            "1x Essence necrotique",
            "1x Fiole cristalline",
          ]}
        />
      </section>
    </section>
  );
}

export default CraftPage;
