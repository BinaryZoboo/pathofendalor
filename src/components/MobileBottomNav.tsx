import { type PageKey } from "../types/navigation";

function MobileBottomNav({
  activePage,
  onNavigate,
}: {
  activePage: PageKey;
  onNavigate: (nextPage: PageKey) => void;
}) {
  const items: Array<{ key: PageKey; label: string; icon: string }> = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "craft", label: "Craft", icon: "handyman" },
    { key: "bestiary", label: "Boss", icon: "skull" },
    { key: "rules", label: "Regles", icon: "gavel" },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-(--outline-variant)/50 bg-(--surface-container-low)/95 p-2 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = item.key === activePage;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition ${
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
