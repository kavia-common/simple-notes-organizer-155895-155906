import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { CreateNoteInput, Note, UpdateNoteInput } from "~/interfaces/api-types";

export interface NoteEditorProps {
  note: Note | null;
  categories: string[];
  onSave$: (payload: CreateNoteInput | UpdateNoteInput) => void;
  onNew$: () => void;
  onDelete$?: (id: string) => void;
}

/**
 * PUBLIC_INTERFACE
 * Note editor for creating and updating notes. Displays fields for title, content, and category.
 */
export const NoteEditor = component$<NoteEditorProps>((props) => {
  const draft = useStore<Note>({
    id: undefined,
    title: "",
    content: "",
    category: undefined,
  });

  // Sync incoming note into local draft
  useTask$(({ track }) => {
    track(() => props.note?.id);
    if (props.note) {
      draft.id = props.note.id;
      draft.title = props.note.title || "";
      draft.content = props.note.content || "";
      draft.category = props.note.category || "";
    } else {
      draft.id = undefined;
      draft.title = "";
      draft.content = "";
      draft.category = "";
    }
  });

  const onSubmit = $((e: Event) => {
    e.preventDefault();
    if (draft.id) {
      const payload: UpdateNoteInput = {
        id: draft.id,
        title: draft.title.trim() || "(Untitled)",
        content: draft.content,
        category: (draft.category || "").trim() || null,
      };
      props.onSave$(payload);
    } else {
      const payload: CreateNoteInput = {
        title: draft.title.trim() || "(Untitled)",
        content: draft.content,
        category: (draft.category || "").trim() || null,
      };
      props.onSave$(payload);
    }
  });

  const onDelete = $(() => {
    if (draft.id && props.onDelete$) props.onDelete$(draft.id);
  });

  return (
    <div class="editor">
      <div class="editor-header">
        <div class="title">{draft.id ? "Edit Note" : "New Note"}</div>
        <div class="actions">
          <button class="text-btn" onClick$={props.onNew$}>New</button>
          {draft.id && (
            <button class="text-btn danger" onClick$={onDelete}>
              Delete
            </button>
          )}
          <button class="btn primary" onClick$={onSubmit}>
            Save
          </button>
        </div>
      </div>

      <form class="form" preventdefault:submit onSubmit$={onSubmit}>
        <label class="field">
          <span>Title</span>
          <input
            value={draft.title}
            onInput$={(e) => (draft.title = (e.target as HTMLInputElement).value)}
            placeholder="Note title"
          />
        </label>

        <label class="field">
          <span>Category</span>
          <input
            value={draft.category || ""}
            onInput$={(e) => (draft.category = (e.target as HTMLInputElement).value)}
            placeholder="e.g., Work, Personal"
          />
          <small class="hint">Type to set or create a category</small>
        </label>

        <label class="field">
          <span>Content</span>
          <textarea
            rows={14}
            value={draft.content}
            onInput$={(e) => (draft.content = (e.target as HTMLTextAreaElement).value)}
            placeholder="Write your note here..."
          />
        </label>
      </form>
    </div>
  );
});
