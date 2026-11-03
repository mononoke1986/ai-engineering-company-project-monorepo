"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { formatDateTime, getErrorMessage } from "@/lib/format";
import { addNote, deleteNote } from "@/services/api";
import type { Note } from "@/types/candidate";

interface NotesSectionProps {
  candidateId: string;
  notes: Note[] | null;
  onChanged: () => Promise<void>;
}

export function NotesSection({ candidateId, notes, onChanged }: NotesSectionProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (trimmed === "") {
      setMessage(null);
      setError("Escribe el contenido de la nota antes de guardarla.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await addNote(candidateId, { content: trimmed });
      setContent("");
      await onChanged();
      setMessage("Nota añadida correctamente.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(note: Note) {
    if (!window.confirm("¿Eliminar esta nota? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeletingId(note.id);
    setError(null);
    setMessage(null);
    try {
      await deleteNote(candidateId, note.id);
      await onChanged();
      setMessage("Nota eliminada correctamente.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setDeletingId(null);
    }
  }

  // El paracaídas: si notes es null o undefined, usamos un arreglo vacío []
  const newestFirst = [...(notes || [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-1 text-lg font-semibold">Notas internas</h2>
      <p className="mb-4 text-sm text-slate-600">
        Solo las ve el equipo de People. Anota aquí lo que surja tras cada llamada o entrevista.
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="new-note" className="mb-1 block text-sm font-medium text-slate-700">
          Nueva nota
        </label>
        <textarea
          id="new-note"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          disabled={saving}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Añadir nota"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {newestFirst.length === 0 ? (
        <p className="text-sm text-slate-600">Todavía no hay notas para esta candidatura.</p>
      ) : (
        <ul className="space-y-3">
          {newestFirst.map((note) => (
            <li key={note.id} className="rounded-md border border-slate-200 p-3">
              <p className="text-sm text-slate-900">{note.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {formatDateTime(note.created_at)}
                </span>
                <button
                  type="button"
                  onClick={() => void handleDelete(note)}
                  disabled={deletingId === note.id}
                  className="text-xs font-medium text-red-700 hover:underline disabled:opacity-60"
                >
                  {deletingId === note.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}