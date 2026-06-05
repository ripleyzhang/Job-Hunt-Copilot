"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  createResume,
  listResumes,
  updateResume,
  type BulletPoint,
  type EducationItem,
  type ProjectItem,
  type Resume,
  type ResumeContacts,
  type ResumePayload,
  type ResumeTemplateId,
  type SkillTag,
  type WorkExperienceItem,
} from "@/lib/resumes-api";

type ResumeForm = ResumePayload;

const EMPTY_FORM: ResumeForm = {
  title: "Untitled Resume",
  templateId: "US",
  contacts: {
    website: "",
    phone: "",
    email: "",
  },
  skills: [],
  education: [],
  workExperiences: [],
  projects: [],
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [form, setForm] = useState<ResumeForm>(EMPTY_FORM);
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadResumes() {
      try {
        const loadedResumes = await listResumes();

        if (isCurrent) {
          setResumes(loadedResumes);

          if (loadedResumes[0]) {
            setSelectedResumeId(loadedResumes[0].id);
            setForm(toForm(loadedResumes[0]));
          }
        }
      } catch {
        if (isCurrent) {
          setError("Could not load resumes from the backend.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadResumes();

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId),
    [resumes, selectedResumeId],
  );

  function handleSelectResume(resume: Resume) {
    setSelectedResumeId(resume.id);
    setForm(toForm(resume));
    setError("");
  }

  async function handleCreateResume() {
    setIsSaving(true);
    setError("");

    try {
      const createdResume = await createResume({
        ...EMPTY_FORM,
        title: nextResumeTitle(resumes.length + 1),
      });

      setResumes((currentResumes) => [createdResume, ...currentResumes]);
      setSelectedResumeId(createdResume.id);
      setForm(toForm(createdResume));
    } catch {
      setError("Could not create resume.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try {
      const payload = cleanResume(form);
      const savedResume = selectedResumeId
        ? await updateResume(selectedResumeId, payload)
        : await createResume(payload);

      setResumes((currentResumes) => {
        const exists = currentResumes.some((resume) => resume.id === savedResume.id);

        if (!exists) {
          return [savedResume, ...currentResumes];
        }

        return currentResumes.map((resume) =>
          resume.id === savedResume.id ? savedResume : resume,
        );
      });
      setSelectedResumeId(savedResume.id);
      setForm(toForm(savedResume));
    } catch {
      setError("Could not save resume.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(field: keyof Pick<ResumeForm, "title" | "templateId">, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updateContacts(field: keyof ResumeContacts, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      contacts: {
        ...currentForm.contacts,
        [field]: value,
      },
    }));
  }

  function addSkill() {
    const label = newSkill.trim();

    if (!label) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      skills: [...currentForm.skills, newSkillTag(label)],
    }));
    setNewSkill("");
  }

  function removeSkill(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      skills: currentForm.skills.filter((skill) => skill.id !== id),
    }));
  }

  function addEducation() {
    setForm((currentForm) => ({
      ...currentForm,
      education: [...currentForm.education, newEducation()],
    }));
  }

  function updateEducation(id: string, field: keyof EducationItem, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      education: currentForm.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeEducation(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      education: currentForm.education.filter((item) => item.id !== id),
    }));
  }

  function addWorkExperience() {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: [...currentForm.workExperiences, newWorkExperience()],
    }));
  }

  function updateWorkExperience(
    id: string,
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateWorkExperienceSkills(id: string, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.map((item) =>
        item.id === id
          ? { ...item, skills: reconcileSkillTags(item.skills, value) }
          : item,
      ),
    }));
  }

  function removeWorkExperience(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.filter((item) => item.id !== id),
    }));
  }

  function addProject() {
    setForm((currentForm) => ({
      ...currentForm,
      projects: [...currentForm.projects, newProject()],
    }));
  }

  function updateProject(
    id: string,
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateProjectSkills(id: string, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.map((item) =>
        item.id === id
          ? { ...item, skills: reconcileSkillTags(item.skills, value) }
          : item,
      ),
    }));
  }

  function removeProject(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.filter((item) => item.id !== id),
    }));
  }

  function addBullet(section: "workExperiences" | "projects", itemId: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? { ...item, bullets: [...item.bullets, newBullet()] }
          : item,
      ),
    }));
  }

  function updateBullet(
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
    text: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? {
              ...item,
              bullets: item.bullets.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : item,
      ),
    }));
  }

  function removeBullet(
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? {
              ...item,
              bullets: item.bullets.filter((bullet) => bullet.id !== bulletId),
            }
          : item,
      ),
    }));
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-700">
            Internship Copilot
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Resume Builder
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Manually create and edit structured resume content.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Resumes</h2>
              <button
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isSaving}
                onClick={handleCreateResume}
                type="button"
              >
                New
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {isLoading ? (
                <p className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-500">
                  Loading resumes...
                </p>
              ) : resumes.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
                  No resumes yet.
                </p>
              ) : (
                resumes.map((resume) => (
                  <button
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      resume.id === selectedResumeId
                        ? "border-teal-700 bg-teal-50 text-teal-900"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                    key={resume.id}
                    onClick={() => handleSelectResume(resume)}
                    type="button"
                  >
                    <span className="block font-medium">{resume.title}</span>
                    <span className="text-xs text-zinc-500">{resume.templateId}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <form className="grid gap-5" onSubmit={handleSave}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <Input
                  label="Resume Title"
                  onChange={(value) => updateField("title", value)}
                  value={form.title}
                />
                <Select
                  label="Template"
                  onChange={(value) => updateField("templateId", value)}
                  options={["US", "China"]}
                  value={form.templateId}
                />
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Contacts" />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Input
                  label="Website"
                  onChange={(value) => updateContacts("website", value)}
                  value={form.contacts.website}
                />
                <Input
                  label="Phone"
                  onChange={(value) => updateContacts("phone", value)}
                  value={form.contacts.phone}
                />
                <Input
                  label="Email"
                  onChange={(value) => updateContacts("email", value)}
                  type="email"
                  value={form.contacts.email}
                />
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Skills" />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setNewSkill(event.target.value)}
                  placeholder="Add a skill tag"
                  value={newSkill}
                />
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                  onClick={addSkill}
                  type="button"
                >
                  Add Skill
                </button>
              </div>
              <SkillList skills={form.skills} onRemove={removeSkill} />
            </section>

            <EditorSection title="Education" onAdd={addEducation}>
              {form.education.map((item) => (
                <div className="rounded-lg border border-zinc-200 p-4" key={item.id}>
                  <EntryHeader onRemove={() => removeEducation(item.id)} />
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Input
                      label="School Name"
                      onChange={(value) =>
                        updateEducation(item.id, "schoolName", value)
                      }
                      value={item.schoolName}
                    />
                    <Input
                      label="Degree"
                      onChange={(value) => updateEducation(item.id, "degree", value)}
                      value={item.degree}
                    />
                    <Input
                      label="Start Date"
                      onChange={(value) =>
                        updateEducation(item.id, "startDate", value)
                      }
                      value={item.startDate}
                    />
                    <Input
                      label="End Date"
                      onChange={(value) => updateEducation(item.id, "endDate", value)}
                      value={item.endDate}
                    />
                    <Input
                      label="Diploma"
                      onChange={(value) => updateEducation(item.id, "diploma", value)}
                      value={item.diploma}
                    />
                  </div>
                </div>
              ))}
            </EditorSection>

            <EditorSection title="Work Experiences" onAdd={addWorkExperience}>
              {form.workExperiences.map((item) => (
                <ExperienceEditor
                  item={item}
                  key={item.id}
                  onAddBullet={() => addBullet("workExperiences", item.id)}
                  onRemove={() => removeWorkExperience(item.id)}
                  onRemoveBullet={(bulletId) =>
                    removeBullet("workExperiences", item.id, bulletId)
                  }
                  onUpdate={(field, value) =>
                    updateWorkExperience(item.id, field, value)
                  }
                  onUpdateBullet={(bulletId, text) =>
                    updateBullet("workExperiences", item.id, bulletId, text)
                  }
                  onUpdateSkills={(value) =>
                    updateWorkExperienceSkills(item.id, value)
                  }
                />
              ))}
            </EditorSection>

            <EditorSection title="Projects" onAdd={addProject}>
              {form.projects.map((item) => (
                <ProjectEditor
                  item={item}
                  key={item.id}
                  onAddBullet={() => addBullet("projects", item.id)}
                  onRemove={() => removeProject(item.id)}
                  onRemoveBullet={(bulletId) =>
                    removeBullet("projects", item.id, bulletId)
                  }
                  onUpdate={(field, value) => updateProject(item.id, field, value)}
                  onUpdateBullet={(bulletId, text) =>
                    updateBullet("projects", item.id, bulletId, text)
                  }
                  onUpdateSkills={(value) => updateProjectSkills(item.id, value)}
                />
              ))}
            </EditorSection>

            <div className="sticky bottom-4 flex justify-end">
              <button
                className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Saving..." : selectedResume ? "Save Resume" : "Create Resume"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold">{title}</h2>;
}

function EditorSection({
  children,
  onAdd,
  title,
}: {
  children: ReactNode;
  onAdd: () => void;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title={title} />
        <button
          aria-label={`Add ${title}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        {children || (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            No entries yet.
          </p>
        )}
      </div>
    </section>
  );
}

function EntryHeader({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        onClick={onRemove}
        type="button"
      >
        Remove
      </button>
    </div>
  );
}

function ExperienceEditor({
  item,
  onAddBullet,
  onRemove,
  onRemoveBullet,
  onUpdate,
  onUpdateBullet,
  onUpdateSkills,
}: {
  item: WorkExperienceItem;
  onAddBullet: () => void;
  onRemove: () => void;
  onRemoveBullet: (bulletId: string) => void;
  onUpdate: (
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  onUpdateBullet: (bulletId: string, text: string) => void;
  onUpdateSkills: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <EntryHeader onRemove={onRemove} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="Company"
          onChange={(value) => onUpdate("company", value)}
          value={item.company}
        />
        <Input
          label="Role"
          onChange={(value) => onUpdate("role", value)}
          value={item.role}
        />
        <Input
          label="Start Date"
          onChange={(value) => onUpdate("startDate", value)}
          value={item.startDate}
        />
        <Input
          label="End Date"
          onChange={(value) => onUpdate("endDate", value)}
          value={item.endDate}
        />
        <Input
          label="Skills"
          onChange={onUpdateSkills}
          value={item.skills.map((skill) => skill.label).join(", ")}
        />
      </div>
      <BulletEditor
        bullets={item.bullets}
        onAdd={onAddBullet}
        onRemove={onRemoveBullet}
        onUpdate={onUpdateBullet}
      />
    </div>
  );
}

function ProjectEditor({
  item,
  onAddBullet,
  onRemove,
  onRemoveBullet,
  onUpdate,
  onUpdateBullet,
  onUpdateSkills,
}: {
  item: ProjectItem;
  onAddBullet: () => void;
  onRemove: () => void;
  onRemoveBullet: (bulletId: string) => void;
  onUpdate: (
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  onUpdateBullet: (bulletId: string, text: string) => void;
  onUpdateSkills: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <EntryHeader onRemove={onRemove} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="Project Name"
          onChange={(value) => onUpdate("projectName", value)}
          value={item.projectName}
        />
        <Input
          label="Start Date"
          onChange={(value) => onUpdate("startDate", value)}
          value={item.startDate}
        />
        <Input
          label="End Date"
          onChange={(value) => onUpdate("endDate", value)}
          value={item.endDate}
        />
        <Input
          label="Skills"
          onChange={onUpdateSkills}
          value={item.skills.map((skill) => skill.label).join(", ")}
        />
      </div>
      <BulletEditor
        bullets={item.bullets}
        onAdd={onAddBullet}
        onRemove={onRemoveBullet}
        onUpdate={onUpdateBullet}
      />
    </div>
  );
}

function BulletEditor({
  bullets,
  onAdd,
  onRemove,
  onUpdate,
}: {
  bullets: BulletPoint[];
  onAdd: () => void;
  onRemove: (bulletId: string) => void;
  onUpdate: (bulletId: string, text: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-700">Bullet Points</h3>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add Bullet
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {bullets.map((bullet) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={bullet.id}>
            <textarea
              className="min-h-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              onChange={(event) => onUpdate(bullet.id, event.target.value)}
              placeholder="Describe impact, scope, and result..."
              value={bullet.text}
            />
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              onClick={() => onRemove(bullet.id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillList({
  onRemove,
  skills,
}: {
  onRemove: (id: string) => void;
  skills: SkillTag[];
}) {
  if (skills.length === 0) {
    return (
      <p className="mt-4 rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
        No skills yet.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {skills.map((skill) => (
        <button
          className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-red-50 hover:text-red-700"
          key={skill.id}
          onClick={() => onRemove(skill.id)}
          type="button"
        >
          {skill.label}
        </button>
      ))}
    </div>
  );
}

function Input({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: ResumeTemplateId) => void;
  options: ResumeTemplateId[];
  value: ResumeTemplateId;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <select
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value as ResumeTemplateId)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function toForm(resume: Resume): ResumeForm {
  return {
    title: resume.title,
    templateId: resume.templateId,
    contacts: resume.contacts,
    skills: resume.skills,
    education: resume.education,
    workExperiences: resume.workExperiences,
    projects: resume.projects,
  };
}

function cleanResume(form: ResumeForm): ResumePayload {
  return {
    ...form,
    title: form.title.trim() || "Untitled Resume",
    skills: form.skills.filter((skill) => skill.label.trim()),
    education: form.education,
    workExperiences: form.workExperiences,
    projects: form.projects,
  };
}

function nextResumeTitle(count: number) {
  return `Resume ${count}`;
}

function newId() {
  return crypto.randomUUID();
}

function newSkillTag(label: string): SkillTag {
  return {
    id: newId(),
    label,
  };
}

function reconcileSkillTags(existingSkills: SkillTag[], value: string): SkillTag[] {
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => {
      const existingSkill = existingSkills.find((skill) => skill.label === label);

      return existingSkill || newSkillTag(label);
    });
}

function newEducation(): EducationItem {
  return {
    id: newId(),
    schoolName: "",
    startDate: "",
    endDate: "",
    degree: "",
    diploma: "",
  };
}

function newWorkExperience(): WorkExperienceItem {
  return {
    id: newId(),
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    skills: [],
    bullets: [newBullet()],
  };
}

function newProject(): ProjectItem {
  return {
    id: newId(),
    projectName: "",
    startDate: "",
    endDate: "",
    skills: [],
    bullets: [newBullet()],
  };
}

function newBullet(): BulletPoint {
  return {
    id: newId(),
    text: "",
  };
}
