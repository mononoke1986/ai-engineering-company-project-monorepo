import type { Candidate, CandidatesResponse } from "@/types/candidate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("Falta NEXT_PUBLIC_API_URL en el archivo .env.local");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`La API respondió con un error (código ${response.status})`);
  }

  return (await response.json()) as T;
}

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
  return request<Candidate>(`/records/${id}`);
}