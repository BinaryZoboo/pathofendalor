function DataMetric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-4">
      <p className="font-label text-[10px] tracking-[0.15em] text-(--muted)">
        {label}
      </p>
      <p
        className={`mt-1 font-headline text-2xl font-bold ${highlight ? "text-(--primary)" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function LootItem({
  rarity,
  name,
  chance,
}: {
  rarity: string;
  name: string;
  chance: string;
}) {
  return (
    <div className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high) p-4">
      <p className="font-label text-[10px] tracking-[0.16em] text-(--primary)">
        {rarity}
      </p>
      <p className="mt-1 font-headline text-lg font-bold">{name}</p>
      <p className="text-sm text-(--muted)">Chance d obtention: {chance}</p>
    </div>
  );
}

function BestiaryLootdropPage() {
  return (
    <section className="space-y-6">
      <article className="glass-panel relative overflow-hidden rounded-3xl border border-(--outline-variant)/50 p-6 md:p-8">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC91j3VUUumDATiru1CMI_3JioVxSbM2Brp-2uLgkvo88HA7gpSRbxF04vdLXFPKv5V8bbWIyWGmDstySSNMX46lrfPsmh1ZzjgYCZTOU2B9sniVC5mWW0lAShmSomAvZyC4TYyHWxC4DMKQ0FuIvdSGARbeQfIQM97VLF9C16gjJUXQcfyfFw2mZLVGBj6hjZwL0QLJHJW5kuiU8UYzxTlAoF4S9iSpZmF8BuArsOojlWAt9kxPwiajspTfXFPX9ZQop_GN7UcD5k"
          alt="Roi fane"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/40 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex rounded-full bg-(--primary)/15 px-3 py-1 font-label text-[10px] tracking-[0.16em] text-(--primary)">
            BOSS MONDIAL ELITE
          </span>
          <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-6xl">
            Le Roi fane
          </h2>
          <p className="mt-3 text-(--muted)">
            Boss a phases multiples, zone denial et invocation de adds en fin de
            combat.
          </p>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 lg:col-span-7">
          <h3 className="font-headline text-xl font-bold">Donnees de combat</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DataMetric label="Sante" value="1,250,000" />
            <DataMetric label="Armure" value="450 PHY" />
            <DataMetric label="Degats" value="4,500 - 6,200" highlight />
            <DataMetric label="Reapparition" value="06:00:00" />
          </div>
        </article>

        <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-6 lg:col-span-5">
          <h3 className="font-headline text-xl font-bold">Lootdrop notable</h3>
          <div className="mt-4 space-y-3">
            <LootItem
              rarity="LEGENDAIRE"
              name="Couronne fracturee du roi"
              chance="1.2%"
            />
            <LootItem rarity="EPIQUE" name="Epaulieres fanees" chance="8.5%" />
            <LootItem rarity="COMMUN" name="Essence necrotique" chance="75%" />
          </div>
        </article>
      </div>
    </section>
  );
}

export default BestiaryLootdropPage;
