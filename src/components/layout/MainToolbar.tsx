import { Menu } from "@base-ui/react/menu";
import { List, MagnifyingGlass } from "phosphor-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../utils/cn";
import type { NavOption } from "./SidePanel";

export type SearchResult = { id: string; title: string; subtitle?: string; type: string; to: string };

type Props = {
  nav: NavOption[];
  placeholder?: string;
  /** Hook-like search source: receives the debounced query, returns results. */
  useResults: (q: string) => { data?: SearchResult[]; isFetching: boolean };
  actions?: ReactNode;
};

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function MainToolbar({ nav, placeholder = "What are you looking for?", useResults, actions }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const debounced = useDebounced(q);
  const { data, isFetching } = useResults(debounced);

  const pageHits: SearchResult[] = q.trim()
    ? nav
        .filter((n) => n.label.toLowerCase().includes(q.toLowerCase()))
        .map((n) => ({ id: n.path, title: n.label, subtitle: "Go to page", type: "page", to: n.path }))
    : [];
  const results = [...pageHits, ...(data ?? [])];

  const go = (r: SearchResult) => {
    navigate(r.to);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="flex items-center gap-2 pb-2">
      <Menu.Root>
        <Menu.Trigger className="btn btn-ghost btn-square lg:hidden" aria-label="Open navigation">
          <List size={22} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={6} align="start" className="z-50">
            <Menu.Popup className="min-w-56 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
              {nav.map((n) => (
                <Menu.Item
                  key={n.path}
                  onClick={() => navigate(n.path)}
                  className="flex cursor-pointer items-center gap-2 rounded-field px-3 py-2 text-sm outline-none data-highlighted:bg-primary/10"
                >
                  <n.icon size={18} /> {n.label}
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-xl">
          <label className="input input-border input-primary w-full outline-0">
            <MagnifyingGlass />
            <input
              value={q}
              placeholder={placeholder}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
                if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
                if (e.key === "Enter" && results[active]) go(results[active]);
                if (e.key === "Escape") setOpen(false);
              }}
              role="combobox"
              aria-expanded={open && !!q}
              aria-controls="global-search-results"
            />
            {isFetching && <span className="loading loading-spinner loading-xs opacity-50" />}
          </label>
          {open && q.trim().length > 0 && (
            <ul id="global-search-results" role="listbox" className="absolute top-full right-0 left-0 z-40 mt-1 max-h-96 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
              {results.length === 0 && (
                <li className="px-3 py-4 text-center text-sm opacity-60">{isFetching || q !== debounced ? "Searching…" : "No matches"}</li>
              )}
              {results.map((r, i) => (
                <li key={r.type + r.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r)}
                    onMouseEnter={() => setActive(i)}
                    className={cn("flex w-full items-center gap-3 rounded-field px-3 py-2 text-left", i === active && "bg-primary/10")}
                  >
                    <span className="badge badge-ghost badge-sm w-16 justify-center capitalize">{r.type}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-xs opacity-60">{r.subtitle}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">{actions}</div>
    </div>
  );
}
