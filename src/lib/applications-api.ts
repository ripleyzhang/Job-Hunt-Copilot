export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type Application = {
  id: string;
  company: string;
  roleTitle: string;
  jobDescription: string;
  applicationDate: string;
  status: ApplicationStatus;
  resumeVersion: string;
  requiredTechStack: string[];
  notes: string;
};

export type ApplicationPayload = Omit<Application, "id">;

type ApiApplication = Omit<Application, "applicationDate"> & {
  applicationDate: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function listApplications(): Promise<Application[]> {
  const applications = await request<ApiApplication[]>("/applications");

  return applications.map(normalizeApplication);
}

export async function createApplication(
  payload: ApplicationPayload,
): Promise<Application> {
  const application = await request<ApiApplication>("/applications", {
    body: JSON.stringify(serializePayload(payload)),
    method: "POST",
  });

  return normalizeApplication(application);
}

export async function updateApplication(
  id: string,
  payload: ApplicationPayload,
): Promise<Application> {
  const application = await request<ApiApplication>(`/applications/${id}`, {
    body: JSON.stringify(serializePayload(payload)),
    method: "PUT",
  });

  return normalizeApplication(application);
}

export async function deleteApplication(id: string): Promise<void> {
  await request<void>(`/applications/${id}`, {
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

function normalizeApplication(application: ApiApplication): Application {
  return {
    ...application,
    applicationDate: application.applicationDate || "",
  };
}

function serializePayload(payload: ApplicationPayload) {
  return {
    ...payload,
    applicationDate: payload.applicationDate || null,
  };
}
