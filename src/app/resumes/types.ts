export type TemplateId = "China" | "US";
export type ResumeTemplateId = TemplateId;
export type ResumeMode = "edit" | "preview" | "empty";

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
  templateId: TemplateId;
  contacts: ResumeContacts;
  skills: SkillTag[];
  education: EducationItem[];
  workExperiences: WorkExperienceItem[];
  projects: ProjectItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type ResumePayload = Omit<Resume, "id" | "createdAt" | "updatedAt">;
export type ResumeForm = ResumePayload;

export type ValidationResult = {
  errors: string[];
  payload?: ResumePayload;
};
