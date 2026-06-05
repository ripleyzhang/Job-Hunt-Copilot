import type { Resume, ResumePayload } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchResumes(): Promise<Resume[]> {
  return request<Resume[]>("/api/resumes");
}

export async function listResumes(): Promise<Resume[]> {
  return fetchResumes();
}

export async function fetchResumeById(id: string): Promise<Resume> {
  return request<Resume>(`/api/resumes/${id}`);
}

export async function createResume(payload: ResumePayload): Promise<Resume> {
  return request<Resume>("/api/resumes", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export async function updateResume(
  id: string,
  payload: ResumePayload,
): Promise<Resume> {
  return request<Resume>(`/api/resumes/${id}`, {
    body: JSON.stringify(payload),
    method: "PUT",
  });
}

export async function deleteResume(id: string): Promise<void> {
  await request<void>(`/api/resumes/${id}`, {
    method: "DELETE",
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
