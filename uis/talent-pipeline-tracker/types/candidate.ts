export type CandidateStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export interface Note {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  applied_at: string;
  updated_at: string;
  notes: Note[];
  notes_count: number;
}

export interface CandidatesResponse {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
}

// Datos para registrar (POST) o reemplazar (PUT) una candidatura.
// Obligatorios: full_name, email, phone, position, experience_years.
export interface CandidateInput {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: number;
  linkedin_url?: string | null;
  cv_url?: string | null;
}

// Datos para cambiar solo el estado y/o la etapa (PATCH).
export interface CandidatePatch {
  status?: CandidateStatus;
  stage?: CandidateStage;
}

export interface NoteInput {
  content: string;
}