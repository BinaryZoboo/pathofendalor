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
    <section className="space-y-6">
      <section className="rounded-2xl border border-(--outline-variant)/45 bg-(--surface-container-low) p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label text-[10px] tracking-[0.2em] text-(--muted)">
              ECONOMYCRAFT
            </p>
            <h2 className="mt-2 font-headline text-3xl font-bold tracking-tight">
              Hotel de ville
            </h2>
            <p className="mt-2 text-sm text-(--muted)">
              Ventes en cours des joueurs, chargees depuis le JSON du serveur.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[330px]">
            <article className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high)/60 p-3">
              <p className="text-xs text-(--muted)">Annonces</p>
              <p className="mt-1 font-headline text-2xl font-bold">
                {totalListings}
              </p>
            </article>
            <article className="rounded-xl border border-(--outline-variant)/45 bg-(--surface-container-high)/60 p-3">
              <p className="text-xs text-(--muted)">Valeur affichee</p>
              <p className="mt-1 font-headline text-2xl font-bold">
                {numberFormatter.format(totalMarketValue)} $
              </p>
            </article>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un objet ou un vendeur"
            className="w-full rounded-xl border border-(--outline-variant)/60 bg-(--surface-container-high) px-4 py-2 text-sm outline-none transition focus:border-(--primary)/60 md:max-w-md"
          />
          <p className="text-xs text-(--muted)">
            Tri actuel: {sortBy} (
            {sortDirection === "asc" ? "croissant" : "decroissant"})
          </p>
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
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted)"
                  >
                    Objet
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort("seller")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted)"
                  >
                    Vendeur
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("quantity")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted)"
                  >
                    Quantite
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("price")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted)"
                  >
                    Prix total
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("listedAt")}
                    className="font-label text-[10px] tracking-[0.13em] text-(--muted)"
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
                  className="hover:bg-(--surface-container-high)/40"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {sale.itemName}
                  </td>
                  <td className="px-4 py-3 text-sm text-(--muted)">
                    {sale.seller}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-(--muted)">
                    {numberFormatter.format(sale.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold">
                    {numberFormatter.format(sale.totalPrice)} {sale.currency}
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
