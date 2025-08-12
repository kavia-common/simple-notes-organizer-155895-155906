//
// API model definitions for the Notes app
//

/**
 * Public models used throughout the app for typing data from/to the REST API.
 */

// PUBLIC_INTERFACE
export interface Note {
  /** Unique identifier for the note (assigned by backend) */
  id?: string;
  /** Title of the note */
  title: string;
  /** Text content of the note */
  content: string;
  /** Optional category for grouping */
  category?: string | null;
  /** ISO string timestamps (optional) */
  createdAt?: string;
  updatedAt?: string;
}

// PUBLIC_INTERFACE
export interface Category {
  /** Unique identifier for the category (if backend provides it) */
  id?: string;
  /** Display name of the category */
  name: string;
  /** Optional count of notes in this category */
  count?: number;
}

// PUBLIC_INTERFACE
export interface ApiError {
  /** A human-readable error message */
  message: string;
  /** Optional error code from backend */
  code?: string | number;
}

// PUBLIC_INTERFACE
export interface CreateNoteInput {
  title: string;
  content: string;
  category?: string | null;
}

// PUBLIC_INTERFACE
export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
  category?: string | null;
}
