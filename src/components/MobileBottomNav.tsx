import { type PageKey } from "../types/navigation";

function MobileBottomNav({
  activePage,
  onNavigate,
  hasAcceptedRules,
}: {
  activePage: PageKey;
  onNavigate: (nextPage: PageKey) => void;
  hasAcceptedRules: boolean;
}) {
  const items: Array<{ key: PageKey; label: string; icon: string }> = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "craft", label: "Wiki", icon: "menu_book" },
    { key: "classes", label: "Classes", icon: "diversity_3" },
    { key: "bestiary", label: "Boss", icon: "skull" },
    { key: "auctionhouse", label: "Hotel", icon: "storefront" },
    { key: "rules", label: "Regles", icon: "gavel" },
  ];

  if (hasAcceptedRules) {
    items.push({ key: "join", label: "Guide", icon: "rocket_launch" });
  }

  return (
    <nav className="premium-surface fixed inset-x-3 bottom-3 z-50 rounded-2xl p-2 backdrop-blur-md lg:hidden">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const isActive = item.key === activePage;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`premium-lift flex flex-col items-center justify-center rounded-xl px-2 py-2 transition ${
                isActive
                  ? "bg-(--primary) text-(--on-primary)"
                  : "text-(--muted) hover:bg-(--surface-container-high)"
              }`}
              aria-label={`Aller a ${item.label}`}
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                {item.icon}
              </span>
              <span className="mt-1 font-label text-[10px] tracking-[0.08em]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
