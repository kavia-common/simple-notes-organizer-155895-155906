/**
 * API service utilities for the Notes app.
 * Uses fetch to call backend endpoints, reading API base URL from environment variables.
 *
 * Environment variables:
 * - VITE_API_BASE_URL (recommended for Vite-based projects)
 * - PUBLIC_API_BASE_URL (alternative, also supported)
 *
 * Default fallback: "/api"
 */

import type {
  Category,
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from "~/interfaces/api-types";

/**
 * Resolve API base URL from supported environment variables.
 * Supports both VITE_ and PUBLIC_ prefixes for flexibility.
 */
const RAW_API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  (import.meta as any)?.env?.PUBLIC_API_BASE_URL ||
  "/api";

/** Normalize a base URL by removing trailing slashes. */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const API_BASE = normalizeBaseUrl(RAW_API_BASE);

/** Build a full endpoint path with optional query string */
function url(path: string, query?: Record<string, string | number | boolean>) {
  const u = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!query) return u;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => params.set(k, String(v)));
  return `${u}?${params.toString()}`;
}

/** Handle HTTP response, throwing a descriptive error on non-2xx. */
async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return undefined as unknown as T;
  }
  let detail = "";
  try {
    const data = await res.json();
    detail = data?.message || JSON.stringify(data);
  } catch {
    detail = await res.text();
  }
  throw new Error(`API ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
}

/**
 * PUBLIC_INTERFACE
 * Fetch all notes.
 * GET /notes
 */
export async function getNotes(): Promise<Note[]> {
  const res = await fetch(url("/notes"), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle<Note[]>(res);
}

/**
 * PUBLIC_INTERFACE
 * Fetch all categories.
 * GET /categories
 */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(url("/categories"), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle<Category[]>(res);
}

/**
 * PUBLIC_INTERFACE
 * Create a new note.
 * POST /notes
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await fetch(url("/notes"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  return handle<Note>(res);
}

/**
 * PUBLIC_INTERFACE
 * Update an existing note by id.
 * PUT /notes/:id
 */
export async function updateNote(input: UpdateNoteInput): Promise<Note> {
  if (!input.id) throw new Error("updateNote requires an id");
  const { id, ...payload } = input;
  const res = await fetch(url(`/notes/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Note>(res);
}

/**
 * PUBLIC_INTERFACE
 * Delete a note by id.
 * DELETE /notes/:id
 */
export async function deleteNote(id: string): Promise<{ success: boolean }> {
  const res = await fetch(url(`/notes/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  // Some backends may return 204 with empty body
  if (res.status === 204) return { success: true };
  return handle<{ success: boolean }>(res);
}
