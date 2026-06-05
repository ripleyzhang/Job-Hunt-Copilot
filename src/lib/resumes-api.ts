export type ResumeTemplateId = "China" | "US";

export type ResumeContacts = {
  website: string;
  phone: string;
  email: string;
};

export type SkillTag = {
  id: string;
  label: string;
};

export type BulletPoint = {
  id: string;
  text: string;
};

export type EducationItem = {
  id: string;
  schoolName: string;
  startDate: string;
  endDate: string;
  degree: string;
  diploma: string;
};

export type WorkExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  skills: SkillTag[];
  bullets: BulletPoint[];
};

export type ProjectItem = {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
  skills: SkillTag[];
  bullets: BulletPoint[];
};

export type Resume = {
  id: string;
  title: string;
  templateId: ResumeTemplateId;
  contacts: ResumeContacts;
  skills: SkillTag[];
  education: EducationItem[];
  workExperiences: WorkExperienceItem[];
  projects: ProjectItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type ResumePayload = Omit<Resume, "id" | "createdAt" | "updatedAt">;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function listResumes(): Promise<Resume[]> {
  return request<Resume[]>("/api/resumes");
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
