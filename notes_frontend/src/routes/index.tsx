import { component$, useSignal, useStore, useVisibleTask$, $, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import type { Category, CreateNoteInput, Note, UpdateNoteInput } from "~/interfaces/api-types";
import { Header } from "~/components/ui/Header";
import { Sidebar } from "~/components/ui/Sidebar";
import { NoteList } from "~/components/notes/NoteList";
import { NoteEditor } from "~/components/notes/NoteEditor";
import { createNote, deleteNote, getCategories, getNotes, updateNote } from "~/services/api";

/**
 * PUBLIC_INTERFACE
 * Notes app page rendering the full application shell: header, sidebar, list, and editor.
 * Features:
 * - Create, edit, delete notes
 * - Organize by categories
 * - Search filter
 * - Responsive layout with collapsible sidebar on mobile
 */
export default component$(() => {
  const notes = useStore<{ data: Note[] }>({ data: [] });
  const categories = useStore<{ data: Category[] }>({ data: [] });

  const selectedCategory = useSignal<string>("All");
  const search = useSignal<string>("");
  const selectedNoteId = useSignal<string | undefined>(undefined);
  const sidebarOpen = useSignal<boolean>(false);
  const loading = useSignal<boolean>(true);
  const error = useSignal<string | undefined>(undefined);

  // Initial load
  useVisibleTask$(async () => {
    loading.value = true;
    try {
      const [ns, cs] = await Promise.all([getNotes().catch(() => []), getCategories().catch(() => [])]);
      notes.data = ns;
      // If backend doesn't provide categories, derive from notes.
      categories.data =
        cs && cs.length > 0
          ? cs
          : deriveCategories(ns);
      if (!selectedNoteId.value && ns.length > 0) {
        selectedNoteId.value = ns[0]?.id;
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to load data.";
    } finally {
      loading.value = false;
    }
  });

  // Re-derive categories from notes when notes change and no categories provided
  useTask$(({ track }) => {
    track(() => notes.data);
    if (!categories.data || categories.data.length === 0) {
      categories.data = deriveCategories(notes.data);
    }
  });

  const filteredNotes = useStore<{ data: Note[] }>({ data: [] });

  useTask$(({ track }) => {
    track(() => notes.data);
    track(() => search.value);
    track(() => selectedCategory.value);
    const q = search.value.trim().toLowerCase();
    filteredNotes.data = notes.data.filter((n) => {
      const inCat =
        selectedCategory.value === "All"
          ? true
          : selectedCategory.value === "Uncategorized"
          ? !n.category
          : (n.category || "").toLowerCase() === selectedCategory.value.toLowerCase();
      if (!inCat) return false;
      if (!q) return true;
      const hay = `${n.title} ${n.content} ${n.category || ""}`.toLowerCase();
      return hay.includes(q);
    });
  });

  const onSelectNote = $((id: string) => {
    selectedNoteId.value = id;
  });

  const onDelete = $(async (id: string) => {
    try {
      await deleteNote(id);
      notes.data = notes.data.filter((n) => n.id !== id);
      if (selectedNoteId.value === id) {
        selectedNoteId.value = notes.data[0]?.id;
      }
      categories.data = deriveCategories(notes.data);
    } catch (e: any) {
      alert(`Failed to delete: ${e?.message || e}`);
    }
  });

  const onSave = $(async (payload: CreateNoteInput | UpdateNoteInput) => {
    try {
      if ("id" in payload && payload.id) {
        const saved = await updateNote(payload);
        notes.data = notes.data.map((n) => (n.id === saved.id ? saved : n));
        selectedNoteId.value = saved.id;
      } else {
        const saved = await createNote(payload as CreateNoteInput);
        notes.data = [saved, ...notes.data];
        selectedNoteId.value = saved.id;
      }
      categories.data = deriveCategories(notes.data);
    } catch (e: any) {
      alert(`Failed to save: ${e?.message || e}`);
    }
  });

  const onNew = $(() => {
    selectedNoteId.value = undefined;
  });

  const currentNote = () =>
    notes.data.find((n) => n.id === selectedNoteId.value) || null;

  const categoryNames = () => {
    const set = new Set<string>();
    notes.data.forEach((n) => {
      if (n.category && n.category.trim()) set.add(n.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  };

  return (
    <div class="app-shell">
      <Header
        search={search.value}
        onSearchChange$={(v) => (search.value = v)}
        onToggleSidebar$={() => (sidebarOpen.value = !sidebarOpen.value)}
      />

      <div class="app-body">
        <Sidebar
          open={sidebarOpen.value}
          selected={selectedCategory.value}
          categories={[
            // Ensure we include Uncategorized in counts
            { name: "Uncategorized", count: notes.data.filter((n) => !n.category).length },
            ...deriveCategories(notes.data).filter((c) => c.name !== "Uncategorized"),
          ]}
          onSelectCategory$={(name) => (selectedCategory.value = name)}
          onClose$={() => (sidebarOpen.value = false)}
        />

        <main class="content-area">
          {loading.value && <div class="loading">Loading…</div>}
          {error.value && !loading.value && (
            <div class="error-banner">
              <div>Could not load data.</div>
              <div class="muted">{error.value}</div>
            </div>
          )}

          {!loading.value && (
            <div class="content-grid">
              <section class="pane list-pane">
                <div class="pane-header">
                  <div class="pane-title">Notes</div>
                  <button class="btn primary" onClick$={onNew}>New Note</button>
                </div>
                <NoteList
                  notes={filteredNotes.data}
                  selectedId={selectedNoteId.value}
                  onSelect$={onSelectNote}
                  onDelete$={onDelete}
                />
              </section>
              <section class="pane editor-pane">
                <NoteEditor
                  note={currentNote()}
                  categories={categoryNames()}
                  onSave$={onSave}
                  onNew$={onNew}
                  onDelete$={onDelete}
                />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Simple Notes Organizer",
  meta: [
    {
      name: "description",
      content:
        "A simple and intuitive notes application to create, edit, organize, and search notes.",
    },
  ],
};

// Helper to derive categories from notes list.
function deriveCategories(ns: Note[]): Category[] {
  const map = new Map<string, number>();
  let uncategorized = 0;
  for (const n of ns) {
    const c = (n.category || "").trim();
    if (!c) {
      uncategorized++;
      continue;
    }
    map.set(c, (map.get(c) || 0) + 1);
  }
  const out: Category[] = [{ name: "Uncategorized", count: uncategorized }];
  for (const [name, count] of map.entries()) out.push({ name, count });
  out.sort((a, b) => {
    if (a.name === "Uncategorized") return -1;
    if (b.name === "Uncategorized") return 1;
    return a.name.localeCompare(b.name);
  });
  return out;
}
