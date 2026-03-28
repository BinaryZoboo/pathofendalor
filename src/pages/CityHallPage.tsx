import { useEffect, useMemo, useState } from "react";

import {
  fetchCityHallSales,
  type CityHallSale,
  type CityHallSalesResponse,
} from "../lib/cityHallSales";

type SortKey = "itemName" | "seller" | "price" | "quantity" | "listedAt";

function sortSales(
  sales: CityHallSale[],
  sortBy: SortKey,
  sortDirection: "asc" | "desc",
) {
  const factor = sortDirection === "asc" ? 1 : -1;

  return [...sales].sort((a, b) => {
    if (sortBy === "price") {
      return (a.totalPrice - b.totalPrice) * factor;
    }

    if (sortBy === "quantity") {
      return (a.quantity - b.quantity) * factor;
    }

    if (sortBy === "listedAt") {
      const aTime = a.listedAt ? Date.parse(a.listedAt) : 0;
      const bTime = b.listedAt ? Date.parse(b.listedAt) : 0;
      return (aTime - bTime) * factor;
    }

    const left = (a[sortBy] ?? "").toString().toLowerCase();
    const right = (b[sortBy] ?? "").toString().toLowerCase();
    return left.localeCompare(right) * factor;
  });
}

function formatDateLabel(value: string | null) {
  if (!value) return "-";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "primary" | "secondary" | "neutral";
}) {
  const toneClass =
    tone === "primary"
      ? "text-(--primary) bg-(--primary)/12 border-(--primary)/25"
      : tone === "secondary"
        ? "text-(--secondary) bg-(--secondary)/12 border-(--secondary)/25"
        : "text-(--muted) bg-(--surface-container-high) border-(--outline-variant)/50";

  return (
    <article className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-(--muted)">{label}</p>
        <span
          className={`material-symbols-outlined rounded-lg border px-2 py-1 text-lg ${toneClass}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-headline text-3xl font-bold tracking-tight">
        {value}
      </p>
    </article>
  );
}

function SortChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 font-label text-[10px] tracking-[0.14em] transition ${
        active
          ? "border-(--primary)/35 bg-(--primary)/14 text-(--primary)"
          : "border-(--outline-variant)/60 bg-(--surface-container-high)/70 text-(--muted) hover:text-(--on-background)"
      }`}
    >
      {label}
    </button>
  );
}

function CityHallPage() {
  const [payload, setPayload] = useState<CityHallSalesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let timerId: number | null = null;
    let active = true;

    const loadSales = async () => {
      try {
        const result = await fetchCityHallSales();
        if (!active) return;
        setPayload(result);
        setError(null);
      } catch {
        if (!active) return;
        setError("Ventes indisponibles");
      } finally {
        timerId = window.setTimeout(loadSales, 30000);
      }
    };

    loadSales();

    return () => {
      active = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  const filteredAndSortedSales = useMemo(() => {
    const sales = payload?.sales ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? sales.filter((sale) => {
          return (
            sale.itemName.toLowerCase().includes(normalizedQuery) ||
            sale.seller.toLowerCase().includes(normalizedQuery)
          );
        })
      : sales;

    return sortSales(filtered, sortBy, sortDirection);
  }, [payload?.sales, query, sortBy, sortDirection]);

  const totalListings = payload?.count ?? 0;
  const totalMarketValue = useMemo(() => {
    return filteredAndSortedSales.reduce(
      (sum, sale) => sum + sale.totalPrice,
      0,
    );
  }, [filteredAndSortedSales]);
  const uniqueSellers = useMemo(() => {
    return new Set(filteredAndSortedSales.map((sale) => sale.seller)).size;
  }, [filteredAndSortedSales]);
  const latestListingLabel = useMemo(() => {
    if (!filteredAndSortedSales.length) return "-";

    const latest = [...filteredAndSortedSales].sort((a, b) => {
      const aTime = a.listedAt ? Date.parse(a.listedAt) : 0;
      const bTime = b.listedAt ? Date.parse(b.listedAt) : 0;
      return bTime - aTime;
    })[0];

    return formatDateLabel(latest?.listedAt ?? null);
  }, [filteredAndSortedSales]);

  const toggleSort = (nextSort: SortKey) => {
    if (sortBy === nextSort) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSort);
    setSortDirection(
      nextSort === "itemName" || nextSort === "seller" ? "asc" : "desc",
    );
  };

  return (
    <section className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-(--outline-variant)/50 p-6 md:p-10">
        <img
          src="https://images.unsplash.com/photo-1556740722-a3051d60e006?auto=format&fit=crop&w=1400&q=80"
          alt="Hotel de ville marketplace"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-r from-(--background) via-(--background)/84 to-(--background)/45" />

        <div className="relative z-10 max-w-3xl">
          <p className="font-label text-[10px] tracking-[0.24em] text-(--muted)">
            ECONOMYCRAFT // MARKET FEED
          </p>
          <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-6xl">
            Hotel de ville
            <span className="hero-gradient-text block">
              place de marche live
            </span>
          </h2>
          <p className="mt-4 max-w-2xl text-(--muted)">
            Tous les objets en vente des joueurs avec tri instantane, recherche
            rapide et vue claire des prix du serveur.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-(--primary)/35 bg-(--primary)/12 px-4 py-2 font-label text-[10px] tracking-[0.16em] text-(--primary)">
              {numberFormatter.format(totalListings)} ANNONCES
            </span>
            <span className="rounded-full border border-(--outline-variant) bg-(--surface-container-low) px-4 py-2 font-label text-[10px] tracking-[0.16em] text-(--muted)">
              MAJ {formatDateLabel(payload?.updatedAt ?? null)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Valeur du marche"
          value={`${numberFormatter.format(totalMarketValue)} $`}
          icon="payments"
          tone="primary"
        />
        <MetricCard
          label="Vendeurs actifs"
          value={numberFormatter.format(uniqueSellers)}
          icon="groups"
          tone="secondary"
        />
        <MetricCard
          label="Resultats filtres"
          value={numberFormatter.format(filteredAndSortedSales.length)}
          icon="query_stats"
          tone="neutral"
        />
        <MetricCard
          label="Derniere annonce"
          value={latestListingLabel}
          icon="schedule"
          tone="neutral"
        />
      </section>

      <section className="glass-panel rounded-2xl border border-(--outline-variant)/45 p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full xl:max-w-lg">
            <label
              htmlFor="cityhall-search"
              className="mb-2 block font-label text-[10px] tracking-[0.14em] text-(--muted)"
            >
              RECHERCHE RAPIDE
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                search
              </span>
              <input
                id="cityhall-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Objet, vendeur, mot-cle..."
                className="w-full rounded-xl border border-(--outline-variant)/60 bg-(--surface-container-high)/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-(--primary)/60"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 font-label text-[10px] tracking-[0.14em] text-(--muted)">
              TRI
            </p>
            <div className="flex flex-wrap gap-2">
              <SortChip
                active={sortBy === "price"}
                label="Prix"
                onClick={() => toggleSort("price")}
              />
              <SortChip
                active={sortBy === "listedAt"}
                label="Date"
                onClick={() => toggleSort("listedAt")}
              />
              <SortChip
                active={sortBy === "quantity"}
                label="Quantite"
                onClick={() => toggleSort("quantity")}
              />
              <SortChip
                active={sortBy === "seller"}
                label="Vendeur"
                onClick={() => toggleSort("seller")}
              />
            </div>
            <p className="mt-2 text-xs text-(--muted)">
              Ordre: {sortDirection === "asc" ? "croissant" : "decroissant"}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {!error && payload && !payload.available && (
        <p className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-low) px-4 py-3 text-sm text-(--muted)">
          Aucune vente active detectee pour le moment.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low)">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--outline-variant)/45">
            <thead className="bg-(--surface-container-high)/70">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("itemName")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted) hover:text-(--on-background)"
                  >
                    Objet
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("seller")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted) hover:text-(--on-background)"
                  >
                    Vendeur
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("quantity")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted) hover:text-(--on-background)"
                  >
                    Quantite
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("price")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted) hover:text-(--on-background)"
                  >
                    Prix total
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("listedAt")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted) hover:text-(--on-background)"
                  >
                    Mis en vente
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--outline-variant)/30">
              {filteredAndSortedSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="group hover:bg-(--surface-container-high)/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-(--outline-variant)/50 bg-(--surface-container-high)/80 text-(--muted)">
                        <span className="material-symbols-outlined text-[18px]">
                          inventory_2
                        </span>
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{sale.itemName}</p>
                        <p className="text-xs text-(--muted)">ID: {sale.id}</p>
                        {!!sale.enchantments?.length && (
                          <p className="mt-1 text-xs text-(--secondary)">
                            Enchantement: {sale.enchantments.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full border border-(--outline-variant)/55 bg-(--surface-container-high)/75 px-3 py-1 text-xs text-(--on-background)">
                      {sale.seller}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-(--muted)">
                    {numberFormatter.format(sale.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold">
                      {numberFormatter.format(sale.totalPrice)} {sale.currency}
                    </p>
                    <p className="text-xs text-(--muted)">
                      unite: {numberFormatter.format(sale.price)}{" "}
                      {sale.currency}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-(--muted)">
                    {formatDateLabel(sale.listedAt)}
                  </td>
                </tr>
              ))}

              {!filteredAndSortedSales.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-(--muted)"
                  >
                    Aucun resultat pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default CityHallPage;
