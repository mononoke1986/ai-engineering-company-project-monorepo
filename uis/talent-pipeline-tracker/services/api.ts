import type {
  Candidate,
  CandidateInput,
  CandidatePatch,
  CandidateStage,
  CandidateStatus,
  CandidatesResponse,
  Note,
  NoteInput,
} from "@/types/candidate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "detail" in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item: unknown) =>
            typeof item === "object" && item !== null && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : ""
          )
          .filter((message) => message !== "");
        if (messages.length > 0) return messages.join(". ");
      }
    }
  } catch {
    // La respuesta no traía JSON: usamos el mensaje genérico de abajo.
  }
  return `La API respondió con un error (código ${response.status})`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("Falta NEXT_PUBLIC_API_URL en el archivo .env.local");
  }

  const headers: HeadersInit | undefined = init?.body
    ? { "Content-Type": "application/json" }
    : undefined;

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// ---------- Candidaturas ----------

export async function getAllCandidates(): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  let page = 1;
  let total = 0;
  let received = 0;

  do {
    const result = await request<CandidatesResponse>(
      `/records?limit=${PAGE_SIZE}&page=${page}`
    );
    candidates.push(...result.data);
    total = result.total;
    received = result.data.length;
    page += 1;
  } while (candidates.length < total && received > 0);

  return candidates;
}

export async function getCandidateById(id: string): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`);
}

export async function createCandidate(input: CandidateInput): Promise<Candidate> {
  return request<Candidate>("/records", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function replaceCandidate(
  id: string,
  input: CandidateInput
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

async function patchCandidate(id: string, patch: CandidatePatch): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<Candidate> {
  return patchCandidate(id, { status });
}

export async function updateCandidateStage(
  id: string,
  stage: CandidateStage
): Promise<Candidate> {
  return patchCandidate(id, { stage });
}

// ---------- Notas internas ----------

export async function addNote(id: string, input: NoteInput): Promise<Note> {
  return request<Note>(`/records/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteNote(id: string, noteId: string): Promise<void> {
  return request<void>(
    `/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" }
  );
}