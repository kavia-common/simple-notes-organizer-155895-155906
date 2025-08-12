import { component$, $ } from "@builder.io/qwik";

export interface SidebarCategory {
  name: string;
  count?: number;
}

export interface SidebarProps {
  /** Whether the sidebar is open (used for mobile overlay) */
  open?: boolean;
  /** Current selected category name (or 'All') */
  selected: string;
  /** Available categories to display */
  categories: SidebarCategory[];
  /** Emit when a category is selected */
  onSelectCategory$: (name: string) => void;
  /** Close the sidebar on mobile */
  onClose$?: () => void;
}

/**
 * PUBLIC_INTERFACE
 * Sidebar with list of categories. On small screens it overlays and can be closed.
 */
export const Sidebar = component$<SidebarProps>((props) => {
  const select = $((name: string) => {
    props.onSelectCategory$(name);
    props.onClose$?.();
  });

  const allCount =
    props.categories.reduce((a, c) => a + (c.count || 0), 0) || undefined;

  const cats = [
    { name: "All", count: allCount },
    { name: "Uncategorized", count: props.categories.find((c) => c.name === "Uncategorized")?.count },
    ...props.categories.filter((c) => c.name !== "Uncategorized"),
  ];

  return (
    <aside class={["sidebar", props.open ? "open" : ""].join(" ")}>
      <div class="sidebar-header">
        <div class="title">Categories</div>
        <button class="icon-btn close show-mobile" onClick$={props.onClose$}>
          ✕
        </button>
      </div>
      <nav class="category-list">
        {cats.map((cat) => (
          <button
            key={cat.name}
            class={["category-item", props.selected === cat.name ? "active" : ""].join(" ")}
            onClick$={() => select(cat.name)}
            aria-pressed={props.selected === cat.name}
          >
            <span>{cat.name}</span>
            {typeof cat.count === "number" && <span class="badge">{cat.count}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
});
