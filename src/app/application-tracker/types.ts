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

export type ApplicationFormData = Omit<Application, "id" | "requiredTechStack"> & {
  requiredTechStack: string;
};

export type ApplicationStatusFilter = "All" | ApplicationStatus;

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];
