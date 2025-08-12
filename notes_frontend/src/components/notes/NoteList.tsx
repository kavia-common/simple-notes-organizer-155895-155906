import { component$, $ } from "@builder.io/qwik";
import type { Note } from "~/interfaces/api-types";

export interface NoteListProps {
  notes: Note[];
  selectedId?: string;
  onSelect$: (id: string) => void;
  onDelete$: (id: string) => void;
}

/**
 * PUBLIC_INTERFACE
 * Renders a list of notes with title, excerpt, and updated time. Allows selection and deletion.
 */
export const NoteList = component$<NoteListProps>((props) => {
  const onDelete = $((e: Event, id: string) => {
    e.stopPropagation();
    props.onDelete$(id);
  });

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return iso;
    }
  };

  const excerpt = (text: string, len = 120) =>
    text.length > len ? `${text.slice(0, len)}…` : text;

  return (
    <div class="note-list">
      {props.notes.length === 0 && (
        <div class="empty">No notes found. Create one to get started.</div>
      )}

      {props.notes.map((n) => (
        <div
          key={n.id || `${n.title}-${n.createdAt || Math.random()}`}
          class={["note-row", props.selectedId === n.id ? "active" : ""].join(" ")}
          onClick$={() => n.id && props.onSelect$(n.id)}
          role="button"
          aria-pressed={props.selectedId === n.id}
        >
          <div class="row-main">
            <div class="title">{n.title || "(Untitled)"}</div>
            <div class="meta">
              <span class="cat">{n.category || "Uncategorized"}</span>
              <span class="dot">•</span>
              <span class="updated">{formatDate(n.updatedAt)}</span>
            </div>
            <div class="preview">{excerpt(n.content || "")}</div>
          </div>
          {n.id && (
            <div class="row-actions">
              <button
                class="text-btn danger"
                onClick$={(e) => onDelete(e, n.id!)}
                title="Delete note"
                aria-label={`Delete note ${n.title}`}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
