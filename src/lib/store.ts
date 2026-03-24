// Simple local storage for admin stats (in production, use a real database)

export interface FormSubmission {
  id: string;
  timestamp: string;
  firstName: string;
  email: string;
  answers: Record<string, string | string[]>;
}

const STORAGE_KEY = "form_submissions";

export function getSubmissions(): FormSubmission[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSubmission(submission: FormSubmission): void {
  const existing = getSubmissions();
  existing.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteSubmission(id: string): void {
  const existing = getSubmissions();
  const filtered = existing.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
