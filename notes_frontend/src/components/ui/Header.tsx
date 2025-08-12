import { component$, $ } from "@builder.io/qwik";

export interface HeaderProps {
  /** Current search text */
  search: string;
  /** Emit when search text changes */
  onSearchChange$: (value: string) => void;
  /** Called to toggle the sidebar on small screens */
  onToggleSidebar$?: () => void;
}

/**
 * PUBLIC_INTERFACE
 * App Header with brand, search input, and optional sidebar toggle (hamburger) for small screens.
 */
export const Header = component$<HeaderProps>((props) => {
  const onInput = $((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    props.onSearchChange$(value);
  });

  return (
    <header class="app-header">
      <div class="left">
        <button
          aria-label="Toggle sidebar"
          class="icon-btn show-mobile"
          onClick$={props.onToggleSidebar$}
        >
          ☰
        </button>
        <div class="brand">Simple Notes</div>
      </div>
      <div class="search">
        <input
          value={props.search}
          onInput$={onInput}
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>
    </header>
  );
});
